import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../services/httpservices/http.service';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import { SharedService } from '../../../services/sharedservices/shared.service';
import { RouterLink } from '@angular/router';
import { DatabaleService } from '../../../services/datatable/databale.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent, RouterLink],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class CustomersComponent {
  branches$!: Observable<any>;
  customers$!: Observable<any>;

  customers:any[] = [];

  role = this.httpservice.getUserRole();

  hide:boolean = false;

  // customerClicked:any = {}

  submitted:boolean = false;

  constructor(
    private httpservice: HttpService,
    private formbuilder: FormBuilder,
    public sharedservice: SharedService,
    private datatableservice: DatabaleService,
    private router: Router,
  ) { }


  customerClicked(customer:any){
    console.log(customer)
    this.updatecustomerFrm.patchValue({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      business_name: customer.business_name,
      identification_type: customer.identification_type,
      identity_number: customer.identity_number,
      is_credit_allowed: customer.is_credit_allowed,
    })

  }

  updateCustomer(evt: Event){
    evt.preventDefault();

    this.sharedservice.infoFunc('alert alert-info', 'Updating customer...', true, true, true)

    this.submitted = true
    
    // console.log(this.updatecustomerFrm)

    if(!this.updatecustomerFrm.valid){
      this.sharedservice.infoFunc('', '', false, false, false)
      // console.log('errpr')
      return
    }

    this.httpservice.updateCustomer(this.updatecustomerFrm.value.id, this.updatecustomerFrm.value)
    .subscribe({
      next: data => {
        // console.log(data)
        this.sharedservice.infoFunc('alert alert-success', 'Customer updated successfully', false, false, false)

        // this.submitted = true
        // this.sharedservice.refreshComponentFunc(this.router.url);
        $('.datacustomer').DataTable().destroy()
        this.ngOnInit()
      },
      error: err => {
        console.log(err)
        this.sharedservice.infoFunc('alert alert-danger', 'Failed to update Customer...', false, false, false)
        
        setTimeout(()=> {
          this.sharedservice.infoFunc('', '', false, false, false)
        }, 6000)
        // if () {}
      }
    })
  }

  updatecustomerFrm = this.formbuilder.group({
    id: ['', Validators.required],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', Validators.compose([Validators.email])],
    address: ['', Validators.required],
    identification_type: ['', Validators.required],
    identity_number: ['', Validators.required],
    business_name: ['', Validators.required],
    is_credit_allowed: ['', Validators.required],
  })

  ngOnInit() {

    this.branches$ = this.httpservice.getbranches()

    this.customers$ = this.httpservice.getAllCustomers()
    this.sharedservice.infoFunc('alert alert-info', 'loading customers...', false, false, false)

    this.httpservice.getAllCustomers()
    .subscribe({
      next: data => {
        console.log(data)
        this.customers = data
        this.datatableservice.initiateDataTable('.datacustomer', 20)

        // console.log(data)
        this.sharedservice.infoFunc('', '', false, false, false)
      },
      error: err => {
        console.log(err)
        this.sharedservice.infoFunc('alert alert-danger', 'Failed to load customers...', false, false, false)
      }
    })
  }

  ngOnDestroy(){
    $('.datacustomer').DataTable().destroy()
    this.sharedservice.infoFunc('', '', false, false, false)
  }
}
