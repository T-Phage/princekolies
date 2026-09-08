import { Component,AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { LoadingService } from '../../services/loadingservice/loading.service';
import { Router } from '@angular/router';
import { SwalservicesService } from '../../services/swal/swalservices.service';
import { PrintService } from '../../services/print/print.service';
import { FormBuilder, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { ValidationService } from '../../services/validationservices/validation.service';

declare var $: any;
@Component({
  selector: 'app-pos-2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './pos-2.component.html',
  styleUrl: './pos-2.component.css'
})
export class Pos2Component implements AfterViewInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  public categories: any[] = [];
  public products: any[] = [];
  public filteredProducts: any[] = [];
  public selectedCategory = 'all';
  public customers:any = [];
  public role = this.httpservice.getUserRole();
  public submitted:boolean = false;
  public oncredit: boolean = false;
  public selectedCustomer: any;
  public branches$!:Observable<any>;
  public username:any;
  public services$!:Observable<any>;

  public baseUrl = this.httpservice.baseDomain;

  constructor(
    private elementRef: ElementRef,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    public loadingService: LoadingService,
    public router: Router,
    private swalService: SwalservicesService,
    private formBuilder: FormBuilder,
    private printservice: PrintService,
    private location: Location,
    public valservices: ValidationService,
  ) { 
    this.username = sessionStorage.getItem('username')
  }

  refresh(){
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  alertExpired(){
    Swal.fire({
      title: 'This product expired',
      icon: 'warning', // Use 'icon' instead of 'type'
      showCancelButton: true,
      showConfirmButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonClass: "btn btn-danger ml-1",
      buttonsStyling: false,
    })
  }

  statusChange(){
    if (this.newSalesFrm.controls.status.value == 'Completed'){
      this.newSalesFrm.get('amount_paid')?.setValidators([])
      this.newSalesFrm.get('amount_paid')?.updateValueAndValidity()
    } else {
      this.newSalesFrm.get('amount_paid')?.setValidators([Validators.required])
      this.newSalesFrm.get('amount_paid')?.updateValueAndValidity()
      // console.log('other')
    }
  }

  currentDate = new Date();
    newSalesFrm = this.formBuilder.group({
      'customer_id': [''],
      'first_name': ['', Validators.compose([Validators.required])],
      'last_name': ['', Validators.compose([])],
      'customer_address': [''],
      'customer_phone': [''],
      'customer_business_name': [''],
      'identity_number': ['', Validators.compose([])],
      'identification_type': [''],
      'customer_email': ['',],
      'reference': [''],
      'status': ['Completed'],
      'grand_total': ['0.00', Validators.required],
      'amount_paid': [0.0, Validators.required],
      'payment_status': ['Paid',],
      'payment_method':[''],
      'balance': [0.0, Validators.compose([Validators.required])], // Validators.pattern(this.sharedservice.amount)])],
      'cash': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
      'momo': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
      'bank':[0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
      'biller': [sessionStorage.getItem('id')],
      'items': this.formBuilder.array([]),
      'extra_services': this.formBuilder.array([]),
      'branch_id': [this.role == 'Business_Owner' ? sessionStorage.getItem('selected_branch'): sessionStorage.getItem('user_branch')],
      'discount': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
      'sale_date': [this.currentDate.toISOString().split('T')[0]]
    })

  get items() {
    return this.newSalesFrm.get('items') as FormArray;
  }

  get extra_services() {
    return this.newSalesFrm.get('extra_services') as FormArray;
  }
  remove_extra(index: number) {
    this.extra_services.removeAt(index);
    this.calculateGrandTotal()
  }

  isServiceExists(serviceId: any): boolean {
    return this.extra_services.controls.some(control => control.value.id === serviceId);
  }

  // Function to add a service (called when a user selects one)
  addService(service: any) {
    // console.log(service)

    if(this.isServiceExists(service.id)) {
      return
    }
    const serviceGroup = this.formBuilder.group({
      id: [service.id],
      name: [service.name],
      cost: [service.min_price] 
    });
    this.extra_services.push(serviceGroup);
    this.calculateGrandTotal()
  }
  
  addAlias(product:any) {
        // 
      console.log(product.name, product.product_id, product.quantity, product.price, product.barcode)
      if(!this.isProductExists(product.product_id)){
        this.items.push(this.formBuilder.group({
          'product': [product.name, Validators.required],
          'product_id': [product.product_id, Validators.required],
          'quantity': [1, Validators.compose([Validators.min(0.5), Validators.required])],
          'barcode': [product.barcode,],
          'purchase_price': [parseFloat(product.price), Validators.compose([Validators.required])],
          'unit_cost': [parseFloat(product.price)],
        }));
        // this.calculateTotal(this.items.length-1)
        this.calculateGrandTotal()
      } else {
        const index = this.items.controls.findIndex(item => item.value.product_id === product.product_id);
         if (index !== -1) {
          this.items.removeAt(index);
          this.calculateGrandTotal()
        }
      }
  }

  // Custom validation to check if a product already exists in the array
  isProductExists(productId: any): boolean {
    return this.items.controls.some(control => control.value.product_id === productId);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateGrandTotal()
  }

  onDiscountChange(e: Event){
    this.calculateGrandTotal()
  }

  // Calculate total for a specific item when quantity or price changes
  calculateTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value;
    const price = item.get('unit_cost')?.value;

    const total = quantity * price;
    item.get('purchase_price')?.setValue(total);
    this.calculateGrandTotal()
  }

  // calculate balance
  calcBalance(e: Event){

    // this.newSalesFrm.value.balance = parseFloat(res.toFixed(2));
    
    var bank = parseFloat(`${this.newSalesFrm.value.bank}`)
    var momo = parseFloat(`${this.newSalesFrm.value.momo}`)
    var cash = parseFloat(`${this.newSalesFrm.value.cash}`)
    var amount = momo + bank + cash

    // console.log(momo, bank, cash)

    let inp = parseFloat((e.target as HTMLInputElement).value)
    // let res = inp - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)
    let res = amount - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)    
    
    this.newSalesFrm.get('balance')?.setValue(parseFloat(res.toFixed(2)))
    this.newSalesFrm.get('amount_paid')?.setValue(parseFloat(amount.toFixed(2)))
    if (parseFloat(`${res.toFixed(2)}`) >= 0){
      this.newSalesFrm.get('status')?.setValue('Completed');
      this.newSalesFrm.get('payment_status')?.setValue('Paid');
    } else {
      this.newSalesFrm.get('status')?.setValue('Pending');
      this.newSalesFrm.get('payment_status')?.setValue('Unpaid');
    }
  }
  subtotal = 0.00;

  // Function to calculate the grand total
  calculateGrandTotal(): void {
    let grandTotal = this.items.controls.reduce((acc, item) => {
      const itemTotal = item.get('purchase_price')?.value || 0;
      console.log(itemTotal);  // Get total for each item or 0 if null
      return acc + itemTotal;  // Sum up all totals
    }, 0);
    // Calculate the total cost of extra services
    let extraServicesTotal = this.extra_services.controls.reduce((acc, service) => {  
      const serviceCost = service.get('cost')?.value || 0;  // Get cost for each service or 0 if null
      return Number(acc) + Number(serviceCost);  // Sum up all service costs
    }, 0);

    
    let subtotal = grandTotal + extraServicesTotal
    this.subtotal = subtotal;
    // console.log(total);

    let total = subtotal - Number(`${this.newSalesFrm.get('discount')?.value}`)
    
    // Update the grand_total form control if necessary
    this.newSalesFrm.get('grand_total')?.setValue(total.toFixed(2));

    var bank = parseFloat(`${this.newSalesFrm.value.bank}`)
    var momo = parseFloat(`${this.newSalesFrm.value.momo}`)
    var cash = parseFloat(`${this.newSalesFrm.value.cash}`)
    var amount = momo + bank + cash
    // console.log(momo, bank, cash)
    // console.log(amount)
    // console.log(parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`))
    var balance = amount - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)
    this.newSalesFrm.get('balance')?.setValue(parseFloat(balance.toFixed(2)));
  }

  public filterProducts(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product.category_id === category
      );
    }
    // Trigger a refresh on the carousel after a short delay
    setTimeout(() => {
      const owl = $(this.elementRef.nativeElement).find('.pos-category');
      owl.trigger('refresh.owl.carousel');
    }, 100);
  }
  public filterbyText(evt: any): void {
    console.log('filtering by name:', evt.target.value);
    if (!evt.target.value) {
      this.filteredProducts = this.products;
      return;
    }
    this.filteredProducts = this.products.filter(
      (product) => product.name.toLowerCase().includes(evt.target.value.toLowerCase())
    );
  }
  private getUniqueCategories(): any[] {
    const categories = this.products.map((product) => product.category_id);
    return [...new Set(categories)];
  }

  // clearCustomer

  creditChange(checked: boolean){
    // var customerInfo = document.getElementsByClassName('customer-info') as HTMLCollection
    // let checked = (e.target as HTMLInputElement).checked
    // console.log(checked)
    this.oncredit = checked;
    console.log(checked)
    if(checked){
      this.newSalesFrm.get('payment_status')?.setValue('Unpaid');
      // this.newSalesFrm
      this.newSalesFrm.get('first_name')?.setValidators([Validators.required]);
      this.newSalesFrm.get('first_name')?.updateValueAndValidity();

      this.newSalesFrm.get('last_name')?.setValidators([Validators.required]);
      this.newSalesFrm.get('last_name')?.updateValueAndValidity();

      this.newSalesFrm.get('customer_email')?.setValidators([Validators.email, Validators.required]);
      this.newSalesFrm.get('customer_email')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('customer_phone')?.setValidators([Validators.required]);
      this.newSalesFrm.get('customer_phone')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('customer_business_name')?.setValidators([Validators.required]);
      this.newSalesFrm.get('customer_business_name')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('customer_address')?.setValidators([Validators.required]);
      this.newSalesFrm.get('customer_address')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('identification_type')?.setValidators([Validators.required]);
      this.newSalesFrm.get('identification_type')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('identity_number')?.setValidators([Validators.required]);
      this.newSalesFrm.get('identity_number')?.updateValueAndValidity();
      
      // customerInfo[0].classList.add('show')
    }else{
      this.newSalesFrm.get('payment_status')?.setValue('Paid');
      
      // this.newSalesFrm.get('cus_name')?.setValidators([])
      this.newSalesFrm.get('first_name')?.setValue('')
      this.newSalesFrm.get('first_name')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('last_name')?.setValidators([])
      this.newSalesFrm.get('last_name')?.setValue('')
      this.newSalesFrm.get('last_name')?.updateValueAndValidity();

      this.newSalesFrm.get('customer_email')?.setValidators([])
      this.newSalesFrm.get('customer_email')?.setValue('')
      this.newSalesFrm.get('customer_email')?.updateValueAndValidity();
      //
      this.newSalesFrm.get('customer_phone')?.setValidators([])
      this.newSalesFrm.get('customer_phone')?.setValue('')
      this.newSalesFrm.get('customer_phone')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('customer_business_name')?.setValidators([])
      this.newSalesFrm.get('customer_business_name')?.setValue('');
      this.newSalesFrm.get('customer_business_name')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('customer_address')?.setValidators([]);
      this.newSalesFrm.get('customer_address')?.setValue('');
      this.newSalesFrm.get('customer_address')?.updateValueAndValidity();
      //
      this.newSalesFrm.get('identification_type')?.setValidators([]);
      this.newSalesFrm.get('identification_type')?.setValue('');
      this.newSalesFrm.get('identification_type')?.updateValueAndValidity();
      // 
      this.newSalesFrm.get('identity_number')?.setValidators([]);
      this.newSalesFrm.get('identity_number')?.setValue('');
      this.newSalesFrm.get('identity_number')?.updateValueAndValidity();

      // customerInfo[0].classList.remove('show')
    }
  } 

  clearItems(){
    this.newSalesFrm.controls.items.clear();
    this.newSalesFrm.controls.extra_services.clear();
  }

  selectCustomer(evt: any){
    console.log('click')
    // console.log(this.customers)
    const inputValue = evt.target.value;
    // console.log(inputValue)
    // console.log(inputValue.toString().split(' | ')[0])
    this.selectedCustomer = this.customers.find((customer:any) => customer.first_name === inputValue || customer.last_name === inputValue);
    
    // console.log(this.selectedCustomer)

    // this.newSalesFrm.get('cus_name')?.setValue(this.selectedCustomer.name)
    this.newSalesFrm.get('last_name')?.setValue(this.selectedCustomer.last_name)
    this.newSalesFrm.get('customer_phone')?.setValue(this.selectedCustomer.phone)
    this.newSalesFrm.get('customer_email')?.setValue(this.selectedCustomer.email)
    this.newSalesFrm.get('customer_business_name')?.setValue(this.selectedCustomer.business_name)
    this.newSalesFrm.get('customer_address')?.setValue(this.selectedCustomer.address)
    this.newSalesFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
    this.newSalesFrm.get('identification_type')?.setValue(this.selectedCustomer.identification_type)
    this.newSalesFrm.get('identity_number')?.setValue(this.selectedCustomer.identity_number)
    this.newSalesFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
  }

  productClicked(product:any){
    console.log(product)
    this.addAlias(product);
  }

  idTypeChange(evt: Event) {
    console.log((evt.target as HTMLSelectElement).value)

    if((evt.target as HTMLSelectElement).value == 'National ID Card'){
      this.newSalesFrm.get('identity_number')?.setValidators([this.valservices.ghanaCardValidator(), Validators.required]);
      this.newSalesFrm.get('identity_number')?.updateValueAndValidity();
    }
  }

  printReceipt(){
    this.printservice.printReceipt(this.receiptContent)
    setTimeout(() => {
        this.newSalesFrm.controls.items.clear();
        this.newSalesFrm.controls.extra_services.clear();
        this.newSalesFrm.reset();
        this.submitted = false;
        this.oncredit = false;
        // customerInfo[0].classList.remove('show')
        this.newSalesFrm.get('sale_date')?.setValue(this.currentDate.toISOString().split('T')[0]);
        this.newSalesFrm.get('biller')?.setValue(sessionStorage.getItem('id'))
        this.newSalesFrm.get('bank')?.setValue(0.0)
        this.newSalesFrm.get('cash')?.setValue(0.0)
        this.newSalesFrm.get('momo')?.setValue(0.0)
        this.newSalesFrm.get('amount_paid')?.setValue(0.0)
        this.newSalesFrm.get('discount')?.setValue(0.0);
        this.newSalesFrm.get('status')?.setValue('Completed');
        if(this.httpservice.getUserRole() == 'Business_Owner'){
          this.newSalesFrm.get('branch_id')?.setValue(`${sessionStorage.getItem('selected_branch')}`)
        } else {
          this.newSalesFrm.get('branch_id')?.setValue(sessionStorage.getItem('branch_id'));
        }
        this.ngOnInit();
        // this.refresh();
      }, 1700);
  }

  submitSaleFrm(evt: Event){ 
    evt.preventDefault();

    console.log('form value submitted', this.newSalesFrm)
    console.log('form submitted', this.newSalesFrm.value)

    this.submitted = true

    // console.log(this.newSalesFrm.get('balance')!.value)
    // console.log(this.oncredit)
    if((this.newSalesFrm.get('balance')!.value ?? 0) < 0 && !this.oncredit ){
      this.swalService.fireWarning('Customer details are required for credit buys')
      return
    }
    if((this.newSalesFrm.get('balance')!.value ?? 0) > 0 ){
      // let amount_received = Number(`${this.newSalesFrm.get('grand_total')!.value}`) - Number(`${this.newSalesFrm.get('balance')!.value}`)
      // this.newSalesFrm.get('amount_paid')?.setValue(Number(`${this.newSalesFrm.get('grand_total')!.value}`));
      this.swalService.fireWarning('Amount received should not be greater than grand total')
      return
    }
    if(parseFloat(`${this.newSalesFrm.get('grand_total')!.value}`) < 0 && (!this.oncredit)) {
      this.swalService.fireWarning('Amount paid by customer is less the grand total. \n Kindly get customer details')
    }

    // console.log(this.newSalesFrm.value) 
    // $('#print-receipt').modal('show');

    if (this.newSalesFrm.valid && this.newSalesFrm.controls.items.length >= 1){
      // console.log(this.newSalesFrm.value)
      this.httpservice.addNewSale(this.newSalesFrm.value, this.receiptContent)
      .subscribe({
        next: data => {
          // $('#payment-completed').modal('show');
          var customerInfo = document.getElementsByClassName('customer-info') as HTMLCollection
          this.newSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
          this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false) 
          this.newSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
          // $('#print-receipt').modal('show');
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false), 3000)
          
          $('#print-receipt').modal('show');
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.swalService.fireError(msg);
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false),4000)
          if (error.status == 401){
            this.swalService.fireError('Your session has expired, you will be redirected to log in')
            this.router.navigate(['/auth/login'])
          }
        }
      })
      // this.printReceipt();
    }

  }
  
  ngOnInit():void {
    const user = sessionStorage.getItem('user')
    let userObj = JSON.parse(user || '{}'); 
    console.log('user object',userObj)

    this.services$ = this.httpservice.getServices()

    if (this.httpservice.getUserRole() != "Business_Owner" && this.httpservice.getUserRole() != "Account_Officer") {
      this.httpservice.getAllCustomers()
        .subscribe({
          next: data => {
            this.customers = data
          },
          error: error => {
            
          }
        });
  
      this.httpservice.getProducts(1, 10)
        .subscribe({
          next: data => {
            console.log(data)
            this.products = data
            this.filteredProducts = this.products;
            this.categories = this.getUniqueCategories();
            setTimeout(()=>this.initialiseCarousel(), 500);
          },
          error: error => {
            this.loadingService.hide();
            // this.errorLoading = true;
  
            console.log('error :', error)
            if (error.status == 401){
              // alert('Your session has expired, you will be redirected to log in');
              this.swalService.fireError('Your session has expired, you will be redirected to log in')
              this.router.navigate(['/auth/login'])
            }
          },
          complete: () => {
            this.loadingService.hide();
          }
        });

        this.newSalesFrm.get('branch_id')?.setValue(userObj.branch_id);
       return
    }
    
    this.branches$ = this.httpservice.getbranches()
    if (this.newSalesFrm.value.branch_id == null || this.newSalesFrm.value.branch_id == '0') {
      this.loadingService.hide()
      this.newSalesFrm.get('branch_id')?.setValue(userObj.branch_id);
      setTimeout(() => {
        // this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
        this.swalService.fireWarning('User branch has been selected')
      }, 500);
      // return
    }
  
    this.httpservice.getByBranchProducts(userObj.branch_id)
      .subscribe({
        next: data => {
          console.log(data)
          this.products = data
          this.filteredProducts = this.products;
          this.categories = this.getUniqueCategories();
          setTimeout(()=>this.initialiseCarousel(), 500);
        },
        error: error => {
          this.loadingService.hide();
          // this.errorLoading = true;
          
          console.log('error :', error)
          if (error.status == 401){
            // alert('Your session has expired, you will be redirected to log in');
            this.swalService.fireError('Your session has expired, you will be redirected to log in')
            this.router.navigate(['/auth/login'])
          } else {
            this.swalService.fireError('Failed to fetch branch products')
          }
        },
        complete: () => {
          this.loadingService.hide();
        }
      });

      this.httpservice.getAllCustomers()
      .subscribe({
        next: data => {
          this.customers = data
        },
        error: error => {
        
        }
      });
  }
  ngAfterViewInit(): void {
    
  }

  initialiseCarousel() {
    if ($().owlCarousel) {
      const owl = $(this.elementRef.nativeElement).find('.pos-category');
      owl.owlCarousel({
        items: 6,
        loop: false,
        margin: 8,
        nav: true,
        dots: false,
        navText: [
          '<i class="fas fa-chevron-left"></i>',
          '<i class="fas fa-chevron-right"></i>',
        ],
        responsive: {
          0: {
            items: 2,
          },
          600: {
            items: 4,
          },
          1000: {
            items: 6,
          },
        },
      });
    }
  }

  goBack(): void {
    // this.location.back(); // Navigates one step backward in browser history
    // Explicitly navigate to your landing page, erasing the messy history stack
    this.router.navigate(['/dashboard/sales-dashboard'], { replaceUrl: true }); 
  }

}
