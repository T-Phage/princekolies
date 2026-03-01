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

  products$!: Observable<any>;

  products: any[] = []

  selectedProduct: any;
  username:any;

  errorLoading: boolean= false;

  constructor(
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private printservice: PrintService,
    public loadingService: LoadingService,
    public router: Router,
  ) {
    this.username = sessionStorage.getItem('username')
   }

  refresh(){
    let url = this.router.url;
    this.sharedservice.refreshComponentFunc(url)
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

  ngOnInit(): void {
    // console.log(this.newSalesFrm.value)
    this.loadingService.show()
    this.httpservice.getProducts(1, 10)
      .subscribe({
        next: data => {
          // console.log(data)
          this.products = data
        },
        error: error => {
          this.errorLoading = true;
          console.error('error :', error)
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
      // console.log(this.isProductExists(barcode))
      // if(!this.isProductExists(barcode)){
        this.items.push(this.formBuilder.group({
          'product': [product, Validators.required],
          'product_id': [product_id, Validators.required],
          'quantity': [quantity, Validators.compose([Validators.min(1)])],
          'barcode': [barcode, Validators.required],
          'purchase_price': [parseFloat(purchase_price), Validators.compose([Validators.required])],
          'unit_cost': [parseFloat(unit_cost)],
        }));
        // this.calculateTotal(this.items.length-1)
        this.calculateGrandTotal()
      // }
  }

  newSalesFrm = this.formBuilder.group({
    'customer_name': ['_'],
    'reference': [''],
    'status': [{ value: 'Completed', disabled: true }, Validators.required],
    'grand_total': ['', Validators.required],
    // 'amount_paid': [0.0, Validators.required],
    'payment_status': [{ value: 'Paid', disabled: true }, Validators.required],
    'payment_method':[{ value: 'Cash'}, Validators.required],
    'biller': [sessionStorage.getItem('id')],
    'items': this.formBuilder.array([]),
  })

  submitted = false

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

    let inp = parseFloat((e.target as HTMLInputElement).value)
    let res = inp - parseFloat(`${this.newSalesFrm.get('grand_total')?.value}`)

    let sel = document.getElementById('balance') as HTMLInputElement

    sel.value = res.toFixed(2);
  }

  // Function to calculate the grand total
  calculateGrandTotal(): void {
    let grandTotal = this.items.controls.reduce((acc, item) => {
      const itemTotal = item.get('purchase_price')?.value || 0;  // Get total for each item or 0 if null
      return acc + itemTotal;  // Sum up all totals
    }, 0);

    // Update the grand_total form control if necessary
    this.newSalesFrm.get('grand_total')?.setValue(grandTotal.toFixed(2));
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
        this.selectedProduct.barcode,
      );
    } else {
      this.selectedProduct = null;
      return
    }
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
  isProductExists(name: string): boolean {
    return this.items.controls.some(control => control.value.name === name);
  }

  currentDate = new Date()
  submitSalesFrm(evt: Event){
    evt.preventDefault()

    this.newSalesFrm.get('status')?.enable();
    this.newSalesFrm.get('payment_status')?.enable();
    console.log(this.newSalesFrm)

    this.submitted = true

    if (this.newSalesFrm.valid && this.newSalesFrm.controls.items.length >= 1){
      // console.log(this.newSalesFrm.value)
      this.httpservice.addNewSale(this.newSalesFrm.value, this.receiptContent)
      .subscribe({
        next: data => {
          this.newSalesFrm.get('status')?.disable();
          this.newSalesFrm.get('payment_status')?.disable();
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
          }, 4000)

          setTimeout(() => {
            this.newSalesFrm.controls.items.clear();
          }, 6000);
          
          
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false),4000)
          this.newSalesFrm.get('status')?.disable();
          this.newSalesFrm.get('payment_status')?.disable();
        }
      })
      // this.printReceipt();
    }
  }

  
}
