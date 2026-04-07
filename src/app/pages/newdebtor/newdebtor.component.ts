import { CommonModule } from '@angular/common';
import { Component, ElementRef, viewChild, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpService } from '../../services/httpservices/http.service';
import { SwalservicesService } from '../../services/swal/swalservices.service';
import { PrintService } from '../../services/print/print.service';

@Component({
  selector: 'app-newdebtor',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './newdebtor.component.html',
  styleUrl: './newdebtor.component.css'
})
export class NewdebtorComponent {

  @ViewChild('debtoreceipt', {read: ElementRef}) debtoreceipt!: ElementRef; 
  // debtoreceipt = viewChild<ElementRef>('debtoreceipt');

  submitted: boolean = false;
  products: any[] = [];
  selectedProduct: any = null;
  username:any;
  currentDate = new Date();
  customers:any[] = [];
  selectedCustomer:any = null;

  constructor(
    private formbuilder: FormBuilder,
    public sharedservice: SharedService,
    private httpservice: HttpService,
    private swalservices: SwalservicesService,
    private printservice: PrintService,
    private cdr: ChangeDetectorRef,
  ) {
    this.username = sessionStorage.getItem('username') || '';
  }

  newdebtorFrm = this.formbuilder.group({
    'customer_id': [''],
    'customer_name': ['', Validators.required],
    'customer_address': ['', Validators.required],
    'customer_phone': ['', Validators.required],
    'customer_business_name': ['', Validators.required],
    'customer_email': ['', Validators.compose([Validators.email])],
    'identity_number': ['', Validators.required],
    'identification_type': ['', Validators.required],
    'reference': [''],
    'payment_method':[''],
    'items': this.formbuilder.array([]),
    'momo': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'cash': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'bank': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'amount_paid': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'balance': [0.0, Validators.compose([Validators.required,])],
    'grand_total': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'status': ['Completed', Validators.required],
    'payment_status': ['Unpaid'],
    'sale_date': [this.currentDate.toISOString().split('T')[0]],
  })

  get items() {
    return this.newdebtorFrm.get('items') as FormArray;
  }

  addAlias(product:string, product_id: number, quantity: number, purchase_price: any, unit_cost:any, barcode: string) {
      // console.log(this.isProductExists(barcode))
      // if(!this.isProductExists(barcode)){
        this.items.push(this.formbuilder.group({
          'product': [product, Validators.required],
          'product_id': [product_id, Validators.required],
          'quantity': [quantity, Validators.compose([Validators.min(1)])],
          'barcode': [barcode,],
          'purchase_price': [parseFloat(purchase_price), Validators.compose([Validators.required])],
          'unit_cost': [parseFloat(unit_cost)],
        }));
        this.calculateTotal(this.items.length-1)
        this.calculateGrandTotal()
      // }
  }

  calcBalance(e: Event){
    var bank = parseFloat(`${this.newdebtorFrm.value.bank}`)
    var momo = parseFloat(`${this.newdebtorFrm.value.momo}`)
    var cash = parseFloat(`${this.newdebtorFrm.value.cash}`)
    var amount = momo + bank + cash

    console.log(momo, bank, cash)
    let inp = parseFloat((e.target as HTMLInputElement).value)
    // let res = inp - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)
    let res = amount - parseFloat(`${this.newdebtorFrm.get('grand_total')?.value}`)    
    
    this.newdebtorFrm.get('balance')?.setValue(parseFloat(res.toFixed(2)))
    this.newdebtorFrm.get('amount_paid')?.setValue(parseFloat(amount.toFixed(2)))
    if (parseFloat(`${res.toFixed(2)}`) >= 0){
      this.newdebtorFrm.get('status')?.setValue('Completed');
      this.newdebtorFrm.get('payment_status')?.setValue('Paid');
    } else {
      this.newdebtorFrm.get('status')?.setValue('Pending');
      this.newdebtorFrm.get('payment_status')?.setValue('Unpaid');
    }
  }

  calculateTotal(index: number): void {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value;
    const price = item.get('unit_cost')?.value;

    const total = quantity * price;
    item.get('purchase_price')?.setValue(total);
    this.calculateGrandTotal()
  }

  // Function to calculate the grand total
  calculateGrandTotal(): void {
    let grandTotal = this.items.controls.reduce((acc, item) => {
      const itemTotal = item.get('purchase_price')?.value || 0;  // Get total for each item or 0 if null
      return acc + itemTotal;  // Sum up all totals
    }, 0);

    // Update the grand_total form control if necessary
    this.newdebtorFrm.get('grand_total')?.setValue(grandTotal.toFixed(2));

    var bank = parseFloat(`${this.newdebtorFrm.value.bank}`)
    var momo = parseFloat(`${this.newdebtorFrm.value.momo}`)
    var cash = parseFloat(`${this.newdebtorFrm.value.cash}`)
    var amount = momo + bank + cash

    // console.log(parseFloat(`${this.newdebtorFrm.get('grand_total')?.value}`))
    var balance = amount - parseFloat(`${this.newdebtorFrm.get('grand_total')?.value}`)
    this.newdebtorFrm.get('balance')?.setValue(parseFloat(balance.toFixed(2)));
  }

  inpProductNameChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const value = input.value;

    this.selectedProduct = this.products.find(product => product.name === value);
    
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

  submitDebtor(evt: Event){
    evt.preventDefault();

    this.submitted = true;

    // console.log(this.newdebtorFrm)
    // console.log(this.newdebtorFrm.value)

    if(this.newdebtorFrm.controls.items.length < 1){
      this.swalservices.fireWarning('Please add at least one product to the sale.');
      return
    }
    if(!this.newdebtorFrm.valid){
      this.swalservices.fireWarning('Please fill in all required fields.');
      return
    }

    if(parseFloat(`${this.newdebtorFrm.value.amount_paid}`) >= parseFloat(`${this.newdebtorFrm.value.grand_total}`)){
      this.newdebtorFrm.get('status')?.setValue('Completed');
      this.newdebtorFrm.get('payment_status')?.setValue('Paid');
    }

    this.httpservice.addNewSale(this.newdebtorFrm.value, this.debtoreceipt!.nativeElement)
    .subscribe({
      next: (res) => {
        this.newdebtorFrm.get('reference')?.setValue(`${res.sale.reference}`)
        // console.log(res.sale.reference);
        this.sharedservice.infoFunc('', '', false, false, false)
        this.swalservices.fireSuccess('Debtor added successfully.');
        this.submitted = false;
        
        // Trigger change detection to update form control values in template
        this.cdr.detectChanges();
        
        // setTimeout(()=>{
          let printIt = this.printservice.printReceipt //(this.receiptContent);
          let ctn = this.debtoreceipt;
          printIt(ctn);
        // }, 100);
        // Clear items array and reset form
        this.newdebtorFrm.controls.items.clear();
        this.newdebtorFrm.reset();
        this.newdebtorFrm.get('status')?.setValue('Completed');
        this.newdebtorFrm.get('payment_status')?.setValue('Unpaid');
        this.newdebtorFrm.get('bank')?.setValue(0.0)
        this.newdebtorFrm.get('cash')?.setValue(0.0)
        this.newdebtorFrm.get('momo')?.setValue(0.0)
        this.newdebtorFrm.get('amount_paid')?.setValue(0.0)
        this.newdebtorFrm.get('sale_date')?.setValue(this.currentDate.toISOString().split('T')[0])
      },
      error: (err) => {
        this.sharedservice.infoFunc('', '', false, false, false)
        // console.log(err);
        this.swalservices.fireError('Failed to add debtor.\n'+ err.message);
      }
    });
  }

  selectCustomer(evt: any){
    // console.log('click')
    // console.log(this.customers)
    const inputValue = evt.target.value;
    // console.log(inputValue)
    // console.log(inputValue.toString().split(' | ')[0])
    this.selectedCustomer = this.customers.find(customer => customer.name === inputValue);
    
    console.log(this.selectedCustomer)

    // this.newSalesFrm.get('customer_name')?.setValue(this.selectedCustomer.name)
    this.newdebtorFrm.get('customer_phone')?.setValue(this.selectedCustomer.phone)
    this.newdebtorFrm.get('customer_business_name')?.setValue(this.selectedCustomer.business_name)
    this.newdebtorFrm.get('customer_address')?.setValue(this.selectedCustomer.address)
    this.newdebtorFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
    this.newdebtorFrm.get('identification_type')?.setValue(this.selectedCustomer.identification_type)
    this.newdebtorFrm.get('identity_number')?.setValue(this.selectedCustomer.identity_number)
    this.newdebtorFrm.get('customer_id')?.setValue(this.selectedCustomer.id)
    this.newdebtorFrm.get('customer_email')?.setValue(this.selectedCustomer.email)
  }

  ngOnInit() {
    this.httpservice.getAllCustomers()
      .subscribe({
        next: data => {
          this.customers = data;
        }
      });

    this.httpservice.getProducts(1, 10)
      .subscribe({
        next: (res) => {
          this.products = res;
        },
        error: (err) => {
          console.log(err);
        }
    })
  }

}
