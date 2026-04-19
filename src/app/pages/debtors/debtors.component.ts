import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { Router } from '@angular/router';
import { SwalservicesService } from '../../services/swal/swalservices.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './debtors.component.html',
  styleUrl: './debtors.component.css',
  providers: [CurrencyPipe],
})
export class DebtorsComponent {

  debtors:any[] = []

  submitted : boolean = false;

  branches$!: Observable<any>;
  categories$!: Observable<any>;
  role:string = '';

  // currentDate = new Date().toLocaleDateString().split('T')[0];

  clickedDebtor = {
    sale_id: '',
    customer_id: '',
    customer_name: '',
    reference: '',
    status: '',
    grand_total: 0.0,
    amount_paid: 0.0,
    payment_status: '',
    biller: '',
    identity_type: '',
    identity_number: '',
    phone: '',
    items: [],
  }
  canAddBedtor: boolean = false;

  userrole = this.httpService.getUserRole()

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private datatableService: DatabaleService,
    private swalService: SwalservicesService,
    private sharedservice: SharedService,
    private router: Router,
  ) { 
    let role = sessionStorage.getItem('role');
    if(role == 'Business_Owner' || role == 'Manager'){
      this.canAddBedtor = true;
    }
  }

  branch = this.fb.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  branchChange(){
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.debtorsnew').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpService.getAllBranchDebtors(this.branch.value.id)
      .subscribe({
        next: (res) => {
          console.log('heeyy', res)
          this.debtors = res.unpaidSales
          this.datatableService.initiateDataTable('.debtorsnew', 15)
          this.sharedservice.infoFunc('', '', false, false, false);
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 6000);
          if(err.error.staus === 401){
            this.httpService.httpLogout()
          }
        }
      })
  }

  refreshData() {
    const table = document.querySelector('.debtorsnew') as HTMLElement;
    if (table) {
      $(table).DataTable().destroy();
    }
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  debtorClicked(customer_id:any,sale_id:any,customer_name:any,reference:any,status:any,grand_total:any,payment_status:any,amount_paid:any,biller:any,items:any,phone:any,identity_type:any,identity_number:any){
    this.clickedDebtor.customer_id = customer_id
    this.clickedDebtor.sale_id = sale_id
    this.clickedDebtor.customer_name = customer_name
    this.clickedDebtor.reference = reference
    this.clickedDebtor.status = status
    this.clickedDebtor.grand_total = grand_total
    this.clickedDebtor.amount_paid = amount_paid
    this.clickedDebtor.payment_status = payment_status
    this.clickedDebtor.biller = biller
    this.clickedDebtor.phone = phone
    this.clickedDebtor.identity_type = identity_type
    this.clickedDebtor.identity_number = identity_number
    this.clickedDebtor.items = JSON.parse(items);

    // console.log(this.clickedDebtor)
    this.editPaymentFrm.get('customer_id')?.setValue(this.clickedDebtor.customer_id)
    this.editPaymentFrm.get('sale_id')?.setValue(this.clickedDebtor.sale_id);
    this.editPaymentFrm.get('reference')?.setValue(this.clickedDebtor.reference);
  }

  editPaymentFrm = this.fb.group({
    'customer_id': ['', Validators.required],
    'sale_id': ['', Validators.required],
    'reference': ['', Validators.required],
    'payment_date': [''],
    'amount': [0.0], 
    'bank': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'momo': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'cash': [0.0, Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
  })

  editPayment(evt: Event){
    evt.preventDefault();
    this.sharedservice.infoFunc('alert alert-info', 'Processing payment...', true, true, true);
    this.submitted = true;
    if(!this.editPaymentFrm.valid){
      this.swalService.fireWarning("Please fill all required fields with valid values")
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    if(this.editPaymentFrm.value.bank == 0 && this.editPaymentFrm.value.momo == 0 && this.editPaymentFrm.value.cash == 0){
      this.swalService.fireWarning("Please enter a payment amount")
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.httpService.makeSalePayment(this.editPaymentFrm.value)
    .subscribe({
      next: data => { 
        // this.sharedservice.infoFunc('alert alert-success', 'Payment successful', true, true, true);
        this.swalService.fireSuccess("Payment successful")
        // this.editPaymentFrm.reset()
        this.submitted = false
        this.ngOnDestroy()
        this.ngOnInit();
        // this.refreshData();
        // this.sharedservice.refreshComponentFunc(this.router.url)
      },
      error: (err) => {
        this.swalService.fireError(err.error.message)
        this.sharedservice.infoFunc('', '', false, false, false);
        if(err.error.staus === 401){
          this.httpService.httpLogout()
        }
      },
      complete: () => {
        this.submitted = false
        this.sharedservice.infoFunc('', '', false, false, false);
        this.editPaymentFrm.get('bank')?.setValue(0.0)
        this.editPaymentFrm.get('cash')?.setValue(0.0)
        this.editPaymentFrm.get('momo')?.setValue(0.0)
        this.editPaymentFrm.get('amount')?.setValue(0.0)
      }
    })
  }

  calculateTotal(){
    var amount = parseFloat(`${this.editPaymentFrm.get('bank')?.value}`) + parseFloat(`${this.editPaymentFrm.get('momo')?.value}`) + parseFloat(`${this.editPaymentFrm.get('cash')?.value}`)
    this.editPaymentFrm.get('amount')?.setValue(amount);
    return amount
  }

  ngOnInit(): void {
    // console.log(this.currentDate)
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch debtors...  ', true, true, true);
    this.role = sessionStorage.getItem('role') || '';
    this.categories$ = this.httpService.getCategories(1, 10)
    this.branches$ = this.httpService.getbranches();

    if(this.httpService.getUserRole() != 'Business_Owner') {
      this.httpService.getAllDebtors()
      .subscribe({
        next: (res) => {
          // console.log(res.unpaidSales)
          this.debtors = res.unpaidSales
          this.sharedservice.infoFunc('', '', false, false, false);
          this.datatableService.initiateDataTable('.debtorsnew', 15)
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          if(err.error.staus === 401){
            this.httpService.httpLogout()
          }
        }
      })

      return;
    }

    if (this.branch.value.id == null || this.branch.value.id == '0') {
      setTimeout(() => {
          this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
      }, 4500);

        return
    }

    this.httpService.getAllBranchDebtors(this.branch.value.id)
      .subscribe({
        next: (res) => {
          // console.log('heeyy', res)
          this.debtors = res.unpaidSales
          this.datatableService.initiateDataTable('.debtorsnew', 15)
          this.sharedservice.infoFunc('', '', false, false, false);
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 6000);
          if(err.error.staus === 401){
            this.httpService.httpLogout()
          }
        }
      })
  }

  ngOnDestroy(): void {
    // Destroy the DataTable instance when the component is destroyed
    const table = document.querySelector('.debtorsnew') as HTMLElement;
    if (table) {
      $(table).DataTable().destroy();
    }
    this.sharedservice.infoFunc('', '', false, false, false);
  }
}
