import { Component, HostListener, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ValidationService } from '../../services/validationservices/validation.service';
import { SwalservicesService } from '../../services/swal/swalservices.service';
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
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  no_of_branches = Number(sessionStorage.getItem('number_of_branches'));

  constructor(
    public sharedservice: SharedService,
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    private validationservice: ValidationService,
    private swalservices: SwalservicesService,
  ) {

  }

  // formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.UPC_A];
  scannedCode: string | null = null;
  hasTorch: boolean = false;
  isScannerVisible: boolean = true;

  barcodeData: string = '';
  inputBuffer: string = '';
  scanTimeout: any;
  selectedImageBase64: string | null = null;
  imageName: string = '';

  // @HostListener('window:keypress', ['$event'])
  // handleKeyDown(event: KeyboardEvent) {
  //   if (event.key === 'Enter') {
  //     event.preventDefault(); // Prevent form submission
  //     this.barcodeData = this.inputBuffer; // Finalize barcode data
  //     this.inputBuffer = ''; // Clear the buffer
  //     this.onBarcodeScanned(this.barcodeData);
  //   } else {
  //     this.inputBuffer += event.key; // Capture the scanned key
  //   }
  // }

  onBarcodeScanned(barcode: string) {
    console.log('Scanned barcode:', barcode);
    // Add logic to process the barcode here
  }

  // Handle file selection change
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.imageName = this.selectedFile.name;

      // Optional: Create a local image preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.selectedImageBase64 = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  categories$!: Observable<any>;
  branches$!: Observable<any>;
  categories:any[] = [];
  filteredCategories:any[] = [];

  newProductForm = this.formBuilder.group({
    'name': ['', Validators.required],
    'description': [''],
    'barcode': ['',],
    'branch': [this.no_of_branches == 1 ? sessionStorage.getItem('user_branch') : '0', Validators.required ],
    'price': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'cost_price': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'category_id': [null, Validators.compose([Validators.required])],
    'quantity': ['', Validators.compose([Validators.required, Validators.min(0),])],// this.validationservice.positiveIntegerValidator()])],
    'quantity_alert': ['', Validators.compose([Validators.required, Validators.min(0), ])],//this.validationservice.positiveIntegerValidator()])],
    'manufactured_date': [''],
    'expiry_date': [''],
    'image_data': [''],
    'image_name': [''],
    // 'createdby': [parseInt(`${sessionStorage.getItem('id')}`)]
  })

  catChange(e: Event) {

  }

  createNewProduct(evt: Event) {
    evt.preventDefault()

    // console.log(this.newProductForm)
    // console.log(this.newProductForm.value)
    this.newProductForm.controls.barcode.enable()
    this.newProductForm.get('image_data')?.setValue(this.selectedImageBase64);
    this.newProductForm.get('image_name')?.setValue(this.imageName);
    this.submitted = true;

    if (this.newProductForm.valid) {

      this.httpservice.createProduct(this.newProductForm.value).subscribe({
      // this.httpservice.createProduct(formData).subscribe({
        next: data => {
          this.sharedservice.infoFunc('alert alert-success', 'product added successfully', false, false, false)
          this.swalservices.fireSuccess('Product added successfully');
          
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false)
            // this.newProductForm.reset({
              this.newProductForm.get('name')?.setValue('');
              this.newProductForm.get('description')?.setValue('');
              this.newProductForm.get('barcode')?.setValue('');
              this.newProductForm.get('price')?.setValue('');
              this.newProductForm.get('quantity')?.setValue('');
              this.newProductForm.get('quantity_alert')?.setValue('')
            // this.newProductForm.controls.createdby.setValue(parseInt(`${sessionStorage.getItem('id')}`))
            // this.newProductForm.controls.branch.setValue(`${sessionStorage.getItem('selected_branch')}`)
            this.submitted = false;
          }, 4000)
        },
        error: error => {
          this.swalservices.fireError('An error occured. Try again...');
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false), 8000)
        }, 
        complete: () => {
          this.sharedservice.infoFunc('', '', false, false, false);
        }
      })
    }
  }

  async ngOnInit() {
    if(this.no_of_branches == 1){
      this.newProductForm.get('branch')?.setValue(sessionStorage.getItem('user_branch'));
    } else {
      this.newProductForm.get('branch')?.setValue(sessionStorage.getItem('selected_branch'));
    }
    // console.log(this.newProductForm.value)
    // this.startCamera()
    this.categories$ = this.httpservice.getCategories(1, 10);
    this.branches$ = this.httpservice.getbranches();

    this.categories$.subscribe({
      next: data => {
        console.log('categories ', data)
        this.categories = data
      },
      error: _err => {}
    })

    if(this.no_of_branches == 1) {
      this.newProductForm.get('branch')?.setValue(sessionStorage.getItem('user_branch'));
    }

    this.newProductForm.get('branch')?.valueChanges.subscribe(branch_id => {
      // console.log(branch_id)
      sessionStorage.setItem('selected_branch', `${branch_id}`)
      this.newProductForm.get('category_id')?.setValue(null);
       if (this.newProductForm.get('category_id')?.value == null){
        this.newProductForm.get('category_id')?.setErrors({required: true})
       }
      // if(branch_id) {
      //   this.filteredCategories = this.categories.filter(c => c.branch_id == branch_id);
      // } else {
      //   this.filteredCategories = [];
      // }
    })

    setTimeout(() => {
      // this.newProductForm.get('branch')?.setValue(`${sessionStorage.getItem('selected_branch')}`, {emitEvent: true});
    }, 1000);
  }

  ngOnDestroy() {
    this.sharedservice.infoFunc('', '', false, false, false)
  }
}
