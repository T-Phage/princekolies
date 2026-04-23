import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { PrintService } from '../../services/print/print.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
// import { BarcodeFormat } from '@zxing/library';
import { LoadingService } from '../../services/loadingservice/loading.service';
import { Router } from '@angular/router';
import { SwalservicesService } from '../../services/swal/swalservices.service';

declare const window: any;

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ErrormodalComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css',
  providers: [CurrencyPipe]
})
export class PosComponent {

  @ViewChild('receiptContent') receiptContent!: ElementRef;  

  // products$!: Observable<any>;

  products: any[] = []
  customers: any[] = [];
  branches$!: Observable<any>;

  selectedProduct: any;
  selectedCustomer: any;
  username:any;

  errorLoading: boolean= false;

  oncredit: boolean = false;

  role = this.httpservice.getUserRole();

  constructor(
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private printservice: PrintService,
    public loadingService: LoadingService,
    public router: Router,
    private swalService: SwalservicesService,
  ) {
    this.username = sessionStorage.getItem('username')
   }

  refresh(){
    let url = this.router.url;
    this.sharedservice.refreshComponentFunc(url)
  }

  creditChange(e: Event){
    var customerInfo = document.getElementsByClassName('customer-info') as HTMLCollection
    let checked = (e.target as HTMLInputElement).checked
    console.log(checked)
    this.oncredit = checked;
    if(checked){
      this.newSalesFrm.get('payment_status')?.setValue('Unpaid');
      // this.newSalesFrm
      this.newSalesFrm.get('customer_name')?.setValidators([Validators.required]);
      this.newSalesFrm.get('customer_name')?.updateValueAndValidity();
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
      
      customerInfo[0].classList.add('show')
    }else{
      this.newSalesFrm.get('payment_status')?.setValue('Paid');
      
      this.newSalesFrm.get('customer_name')?.setValidators([])
      this.newSalesFrm.get('customer_name')?.setValue('')
      this.newSalesFrm.get('customer_name')?.updateValueAndValidity();
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

      customerInfo[0].classList.remove('show')
    }
  } 

  // formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.UPC_A];
  // scannedCode: string | null = null;
  // hasTorch: boolean = false;
  // isScannerVisible: boolean = true;

  // barcodeData: string = '';
  // inputBuffer: string = '';
  // scanTimeout: any;

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

  // @HostListener('window:keypress', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   if (event.key === 'Enter') {
  //     event.preventDefault(); // Prevent form submission
  //     this.barcodeData = this.inputBuffer; // Finalize barcode data
  //     this.inputBuffer = ''; // Clear the buffer
  //     // this.onBarcodeScanned(this.barcodeData);
  //   } else {
  //     this.inputBuffer += event.key; // Capture the scanned key
  //   }
  // }

  ngOnDestroy(): void {
    this.sharedservice.infoFunc('', '', false, false, false);
  }

  branchChange(){
    if (this.newSalesFrm.value.branch_id == null || this.newSalesFrm.value.branch_id == '0') {
      this.loadingService.hide()
      setTimeout(() => {
        this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
        this.swalService.fireError('No branch has been selected')
      }, 4500);
      return
    }

    sessionStorage.setItem('selected_branch', `${this.newSalesFrm.value.branch_id}`)

    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  ngOnInit(): void {
    
    this.loadingService.show()
    if (this.httpservice.getUserRole() != "Business_Owner") {
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
            // console.log(data)
            this.products = data
          },
          error: error => {
            this.loadingService.hide();
            this.errorLoading = true;
  
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
       return
    }

    
    this.branches$ = this.httpservice.getbranches()
    if (this.newSalesFrm.value.branch_id == null || this.newSalesFrm.value.branch_id == '0') {
      this.loadingService.hide()
      setTimeout(() => {
        this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
        this.swalService.fireError('No branch has been selected')
      }, 500);
      return
    }
    
    this.newSalesFrm.get('branch_id')?.setValue(`${sessionStorage.getItem('selected_branch')}`)
    this.httpservice.getAllCustomers()
      .subscribe({
        next: data => {
          this.customers = data
        },
        error: error => {
        
        }
      });
  
    this.httpservice.getByBranchProducts(this.newSalesFrm.value.branch_id)
        .subscribe({
          next: data => {
            // console.log(data)
            this.products = data
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

  }

  get items() {
    return this.newSalesFrm.get('items') as FormArray;
  }

  addAlias(product:string, product_id: number, quantity: number, purchase_price: any, unit_cost:any, barcode: string) {
      // 
      if(!this.isProductExists(product_id)){
        this.items.push(this.formBuilder.group({
          'product': [product, Validators.required],
          'product_id': [product_id, Validators.required],
          'quantity': [quantity, Validators.compose([Validators.min(1)])],
          'barcode': [barcode,],
          'purchase_price': [parseFloat(purchase_price), Validators.compose([Validators.required])],
          'unit_cost': [parseFloat(unit_cost)],
        }));
        // this.calculateTotal(this.items.length-1)
        this.calculateGrandTotal()
      } else {}
  }

  newSalesFrm = this.formBuilder.group({
    'customer_id': [''],
    'customer_name': [''],
    'customer_address': [''],
    'customer_phone': [''],
    'customer_business_name': [''],
    'identity_number': [''],
    'identification_type': [''],
    'customer_email': ['', Validators.email],
    'reference': [''],
    'status': ['Completed', Validators.required],
    'grand_total': ['', Validators.required],
    'amount_paid': [0.0, Validators.required],
    'payment_status': ['Paid',],
    'payment_method':[''],
    'balance': [0.0, Validators.compose([Validators.required])], // Validators.pattern(this.sharedservice.amount)])],
    'cash': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'momo': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'bank':[0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'biller': [sessionStorage.getItem('id')],
    'items': this.formBuilder.array([]),
    'branch_id': [this.role == 'Business_Owner' ? sessionStorage.getItem('selected_branch'): ''],
  })

  submitted = false

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

  // Remove an item at the given index from the FormArray
  removeItem(index: number): void {
    this.items.removeAt(index);
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

    console.log(momo, bank, cash)


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

  // Function to calculate the grand total
  calculateGrandTotal(): void {
    let grandTotal = this.items.controls.reduce((acc, item) => {
      const itemTotal = item.get('purchase_price')?.value || 0;  // Get total for each item or 0 if null
      return acc + itemTotal;  // Sum up all totals
    }, 0);

    // Update the grand_total form control if necessary
    this.newSalesFrm.get('grand_total')?.setValue(grandTotal.toFixed(2));

    var bank = parseFloat(`${this.newSalesFrm.value.bank}`)
    var momo = parseFloat(`${this.newSalesFrm.value.momo}`)
    var cash = parseFloat(`${this.newSalesFrm.value.cash}`)
    var amount = momo + bank + cash
    // console.log(momo, bank, cash)
    // console.log(amount)
    console.log(parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`))
    var balance = amount - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)
    this.newSalesFrm.get('balance')?.setValue(parseFloat(balance.toFixed(2)));
  }


  inpProductNameChange(evt: any){
    const inputValue = evt.target.value;
    // console.log(inputValue)
    this.selectedProduct = this.products.find(product => product.name === inputValue);
    // console.log(this.isProductExpired(this.selectedProduct.expiry_date))
    
    console.log(this.selectedProduct)
    if(this.isProductExpired(this.selectedProduct.expiry_date)){
      this.alertExpired()
      return
    }
    if (this.selectedProduct) {
      this.addAlias(
        this.selectedProduct.name, 
        this.selectedProduct.id, 
        1,
        this.selectedProduct.price,
        this.selectedProduct.price,
        this.selectedProduct.barcode || '',
      );
    } else {
      this.selectedProduct = null;
      return
    }
  }

  selectCustomer(evt: any){
    console.log('click')
    console.log(this.customers)
    const inputValue = evt.target.value;
    console.log(inputValue)
    console.log(inputValue.toString().split(' | ')[0])
    this.selectedCustomer = this.customers.find(customer => customer.name === inputValue);
    
    console.log(this.selectedCustomer)

    // this.newSalesFrm.get('customer_name')?.setValue(this.selectedCustomer.name)
    this.newSalesFrm.get('customer_phone')?.setValue(this.selectedCustomer.phone)
    this.newSalesFrm.get('customer_business_name')?.setValue(this.selectedCustomer.business_name)
    this.newSalesFrm.get('customer_address')?.setValue(this.selectedCustomer.address)
    this.newSalesFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
    this.newSalesFrm.get('identification_type')?.setValue(this.selectedCustomer.identification_type)
    this.newSalesFrm.get('identity_number')?.setValue(this.selectedCustomer.identity_number)
    this.newSalesFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
  }

  isProductExpired(expiryDate:Date) {
    if (expiryDate == null || undefined){
      return false
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    const expiration = new Date(expiryDate);
    expiration.setHours(0, 0, 0, 0); // Reset time to midnight
    return expiration < today;
  }

  // Custom validation to check if a product already exists in the array
  isProductExists(productId: any): boolean {
    return this.items.controls.some(control => control.value.product_id === productId);
  }

  currentDate = new Date()
  submitSalesFrm(evt: Event){
    evt.preventDefault()

    // this.newSalesFrm.get('status')?.enable();
    // this.newSalesFrm.get('payment_status')?.enable();
    // console.log(this.newSalesFrm)
    // console.log(this.newSalesFrm.value)

    this.submitted = true

    console.log(this.newSalesFrm.get('balance')!.value)
    console.log(this.oncredit)
    if((this.newSalesFrm.get('balance')!.value ?? 0) < 0 && !this.oncredit ){
      this.swalService.fireWarning('Customer details are required for credit buys')
      return
    }
    if(parseFloat(`${this.newSalesFrm.get('grand_total')!.value}`) < 0 && (!this.oncredit)) {
      this.swalService.fireWarning('Amount paid by customer is less the grand total. \n Kindly get customer details')
    }

    if (this.newSalesFrm.valid && this.newSalesFrm.controls.items.length >= 1){
      // console.log(this.newSalesFrm.value)
      this.httpservice.addNewSale(this.newSalesFrm.value, this.receiptContent)
      .subscribe({
        next: data => {
          
          // 
          this.newSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
          this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false) 
          this.newSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
          let printIt = this.printservice.printReceipt //(this.receiptContent);
          let ctn = this.receiptContent
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false), 3000)
          setTimeout(()=>{
            // console.log(this.newSalesFrm.controls.reference)
            printIt(ctn)
          }, 1000)

          setTimeout(() => {
            this.newSalesFrm.controls.items.clear();
            this.newSalesFrm.reset();
            this.submitted = false;
            this.newSalesFrm.get('bank')?.setValue(0.0)
            this.newSalesFrm.get('cash')?.setValue(0.0)
            this.newSalesFrm.get('momo')?.setValue(0.0)
            this.newSalesFrm.get('amount_paid')?.setValue(0.0)
            if(this.httpservice.getUserRole() == 'Business_Owner'){
              this.newSalesFrm.get('branch_id')?.setValue(`${sessionStorage.getItem('selected_branch')}`)
            }
          }, 2000);
          
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false),4000)
          
        }
      })
      // this.printReceipt();
    }
  }

}
