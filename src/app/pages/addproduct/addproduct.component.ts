import { Component, HostListener, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ValidationService } from '../../services/validationservices/validation.service';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { RouterLink, RouterOutlet } from '@angular/router';

// import { ZXingScannerModule } from '@zxing/ngx-scanner';
// import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ErrormodalComponent, RouterLink],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.css',
  schemas: [NO_ERRORS_SCHEMA,]
})
export class AddproductComponent {

  submitted = false;
  constructor(
    public sharedservice: SharedService,
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    private validationservice: ValidationService,
  ) {

  }

  // formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.UPC_A];
  scannedCode: string | null = null;
  hasTorch: boolean = false;
  isScannerVisible: boolean = true;

  barcodeData: string = '';
  inputBuffer: string = '';
  scanTimeout: any;

  @HostListener('window:keypress', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission
      this.barcodeData = this.inputBuffer; // Finalize barcode data
      this.inputBuffer = ''; // Clear the buffer
      this.onBarcodeScanned(this.barcodeData);
    } else {
      this.inputBuffer += event.key; // Capture the scanned key
    }
  }

  onBarcodeScanned(barcode: string) {
    console.log('Scanned barcode:', barcode);
    // Add logic to process the barcode here
  }

  categories$!: Observable<any>;

  newProductForm = this.formBuilder.group({
    'name': ['', Validators.required],
    'description': [''],
    'barcode': [{ value: '', disabled: false }, Validators.required],
    'price': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'category_id': [parseInt(''), Validators.required],
    'quantity': ['', Validators.compose([Validators.required, Validators.min(0), this.validationservice.positiveIntegerValidator()])],
    'quantity_alert': ['', Validators.compose([Validators.required, Validators.min(0), this.validationservice.positiveIntegerValidator()])],
    'manufactured_date': [''],
    'expiry_date': [''],
    'createdby': [parseInt(`${sessionStorage.getItem('id')}`)]
  })

  catChange(e: Event) {

  }

  createNewProduct(evt: Event) {
    evt.preventDefault()
    this.newProductForm.controls.barcode.enable()
    this.submitted = true;

    if (this.newProductForm.valid) {
      this.httpservice.createProduct(this.newProductForm.value).subscribe({
        next: data => {
          this.sharedservice.infoFunc('alert alert-success', 'product added successfully', false, false, false)
  
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false)
            this.newProductForm.reset();
            this.newProductForm.controls.createdby.setValue(parseInt(`${sessionStorage.getItem('id')}`))
            this.submitted = false;
          }, 4000)
          
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false), 8000)
        }
      })
    }
  }

  ngOnInit() {
    // this.startCamera()
    this.categories$ = this.httpservice.getCategories(1, 10);
  }
}
