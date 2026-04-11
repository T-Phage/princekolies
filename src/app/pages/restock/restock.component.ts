import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loadingservice/loading.service';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { SharedService } from '../../services/sharedservices/shared.service';
import { SwalservicesService } from '../../services/swal/swalservices.service';

@Component({
  selector: 'app-restock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent ],
  templateUrl: './restock.component.html',
  styleUrl: './restock.component.css'
})
export class RestockComponent {

  products$!: Observable<any>;
  errorLoading: boolean= false;
  selectedProduct: any;
  products:any[] = [];
  submitted: boolean = false;

  constructor(
    private httpservice: HttpService,
    private formBuilder: FormBuilder,
    public loadingService: LoadingService,
    private sharedservice: SharedService,
    private swalservices: SwalservicesService,
  ) {}

  restockForm = this.formBuilder.group({
    'items': this.formBuilder.array([
      this.formBuilder.group({
        product_id: ['', Validators.required],
        product_name: ['', Validators.required],
        quantity: ['', Validators.required],
        price: ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
      }),
    ]),
  });

  get items() {
    return this.restockForm.get('items') as FormArray;
  }

  // Add this to your component.ts
  addItem(evt:any) {
    console.log((evt.target as HTMLButtonElement));
    // console.log(this.items)
    // Check if the current form array is valid
    if (this.items.invalid) {
      this.submitted = true; // Trigger error messages for the user
      this.swalservices.fireWarning("Please fill in all required fields before adding a new row.")
      return;
    }

    if (this.items.length === 10){
      return
    }

    // If valid, reset submitted for the new row and push the new group
    this.submitted = false;
  
    this.items.push(this.formBuilder.group({
      product_id: ['', Validators.required],
      product_name: ['', Validators.required],
      quantity: ['', Validators.required],
      price: ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    }));

    // (evt.target as HTMLButtonElement).classList.add('hide')
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  frmSubmit(evt: Event) {
    evt.preventDefault();
    this.submitted = true;
    // console.log(this.restockForm.value)

    if (!this.restockForm.valid){
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'updating stocks', true, true, true) 
    
    this.httpservice.postRestock(this.restockForm.value)
    .subscribe({
      next: data =>{
        console.log(data)
        this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false)
        this.swalservices.fireSuccess(data.message)
        // Reset the form after submission
        this.resetToFirstItem();
        this.submitted = false; 
      },
      error: err => {
        console.log(err);
        console.log(err.error);
        console.log(err.error.error);
        this.swalservices.fireError(err.error.error)
        this.sharedservice.infoFunc('alert alert-danger', err.error.error, false, false, false) 
        setTimeout(() => {
          this.sharedservice.infoFunc('', '', false, false, false) 
        }, 4500);
      },
      complete: ()=> {
        setTimeout(() => {
          this.sharedservice.infoFunc('', '', false, false, false) 
        }, 3000);
      }
    })
  }

  resetToFirstItem() {
    while (this.restockForm.controls.items.length > 1) {
      this.restockForm.controls.items.removeAt(1); // Continually removes the "new" second item until only index 0 remains
    }
    this.items.at(0).reset(); // Optional: reset the values of the first item
  }

  ngOnInit(): void {
    // console.log(this.items.get('product_name')?.hasError('required'))
    this.httpservice.getProducts(1, 10).subscribe({
      next: (res) => {
        this.products = res;
        console.log(res)
      },
      error: (err) => {
        this.errorLoading = true;
      }
    })
  }

  inpProductNameChange(evt: any, index: number){
    const inputValue = evt.target.value;
    // console.log(inputValue)
    this.selectedProduct = this.products.find(product => product.name === inputValue);
    // console.log(this.selectedProduct)

    if (this.selectedProduct) {
      // Get the specific FormGroup at this index
      const row = this.items.at(index);

      // Patch the values into the form
      row.patchValue({
        product_id: this.selectedProduct.id,
        price: this.selectedProduct.price,
      });

      // console.log(`Row ${index} updated with Product ID: ${this.selectedProduct.id}`);
    }
    
  }

  refresh() {}

}
