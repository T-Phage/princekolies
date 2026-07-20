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
    public sharedservice: SharedService,
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

    this.editPaymentFrm.get('branch_id')?.setValue(`${this.branch.value.id}`)  

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.debtorsnew').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpService.getBranchDebtors(`${this.branch.value.id}`)
      .subscribe({
        next: (res) => {
          // console.log('heeyy', res)
          this.debtors = res
          this.datatableService.initiateDataTable('.debtorsnew', 15)
          this.sharedservice.infoFunc('', '', false, false, false);
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 6000);
          if(err.error.staus === 401 || err.error.staus === 403){
            this.httpService.httpLogout(err.error.message)
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

  debtorClicked(debtor:any){
    console.log(debtor)
    this.clickedDebtor.customer_id = debtor.customer_id
    // this.clickedDebtor.sale_id = sale_id
    this.clickedDebtor.customer_name = debtor.customer.name
    // this.clickedDebtor.reference = reference
    // this.clickedDebtor.status = status
    this.clickedDebtor.grand_total = debtor.grand_total
    this.clickedDebtor.amount_paid = debtor.amount_paid
    this.clickedDebtor.payment_status = debtor.payment_status
    // this.clickedDebtor.biller = biller
    this.clickedDebtor.phone = debtor.customer.phone
    this.clickedDebtor.identity_type = debtor.customer.identification_type
    this.clickedDebtor.identity_number = debtor.customer.identity_number
    this.clickedDebtor.items = debtor.items;

    // console.log(this.clickedDebtor)
    this.editPaymentFrm.get('customer_id')?.setValue(this.clickedDebtor.customer_id)
    // this.editPaymentFrm.get('sale_id')?.setValue(this.clickedDebtor.sale_id);
    // this.editPaymentFrm.get('reference')?.setValue(this.clickedDebtor.reference);
  }

  editPaymentFrm = this.fb.group({
    'branch_id': [this.branch.value.id == null || this.branch.value.id == '0' ? sessionStorage.getItem('selected_branch') : this.branch.value.id],
    'customer_id': ['', Validators.required],
    'payment_date': [''],
    'amount_paid': [0.0], 
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

    // console.log(this.editPaymentFrm.value)
    // console.log(this.editPaymentFrm)

    this.httpService.payDebt(this.editPaymentFrm.value)
    .subscribe({
      next: data => { 
        this.sharedservice.infoFunc('', '', false, false, false);
        this.swalService.fireSuccess("Payment updated Successfully")
        this.editPaymentFrm.get('customer_id')?.setValue('');
        this.editPaymentFrm.get('payment_date')?.setValue('');
        this.editPaymentFrm.get('amount_paid')?.setValue(0.0); 
        this.editPaymentFrm.get('bank')?.setValue(0.0);
        this.editPaymentFrm.get('momo')?.setValue(0.0);
        this.editPaymentFrm.get('cash')?.setValue(0.0);
        this.submitted = false
        this.ngOnDestroy()
        this.ngOnInit();
        // console.log(data)
      },
      error: (err) => {
        console.log(err)
        this.swalService.fireError(err.error.message)
        this.sharedservice.infoFunc('', '', false, false, false);
      }
    });
    // this.httpService.makeSalePayment(this.editPaymentFrm.value)
    // .subscribe({
    //   next: data => { 
    //     this.sharedservice.infoFunc('', '', false, false, false);
    //     this.swalService.fireSuccess("Payment successful")
    //     // this.editPaymentFrm.reset()
    //     this.submitted = false
    //     this.ngOnDestroy()
    //     this.ngOnInit();
    //     // this.refreshData();
    //     // this.sharedservice.refreshComponentFunc(this.router.url)
    //   },
    //   error: (err) => {
    //     this.swalService.fireError(err.error.message)
    //     this.sharedservice.infoFunc('', '', false, false, false);
    //     if(err.error.staus === 401){
    //       this.httpService.httpLogout()
    //     }
    //   },
    //   complete: () => {
    //     this.submitted = false
    //     this.sharedservice.infoFunc('', '', false, false, false);
    //     this.editPaymentFrm.get('bank')?.setValue(0.0)
    //     this.editPaymentFrm.get('cash')?.setValue(0.0)
    //     this.editPaymentFrm.get('momo')?.setValue(0.0)
    //     this.editPaymentFrm.get('amount_paid')?.setValue(0.0)
    //   }
    // })
  }

  calculateTotal(){
    var amount = parseFloat(`${this.editPaymentFrm.get('bank')?.value}`) + parseFloat(`${this.editPaymentFrm.get('momo')?.value}`) + parseFloat(`${this.editPaymentFrm.get('cash')?.value}`)
    this.editPaymentFrm.get('amount_paid')?.setValue(amount);
    return amount
  }

  updateCustomerCreditWorthiness(customer:any, is_credit_allowed:any){
    // console.log(customer, is_credit_allowed)
    this.sharedservice.infoFunc('alert alert-info', 'Updating customer credit worthiness...', true, true, true)
    this.httpService.updateCustomerCreditWorthiness(customer.id, {is_credit_allowed: is_credit_allowed})
    .subscribe({
      next: data => {
        this.sharedservice.infoFunc('', '', false, false, false);
        this.swalService.fireSuccess("Customer credit worthiness updated Successfully")
        this.ngOnDestroy()
        this.ngOnInit();
      },
      error: (err) => {
        console.log(err)
        this.swalService.fireError(err.error.message)
        this.sharedservice.infoFunc('', '', false, false, false);
      }
    })
  }

  ngOnInit(): void {
    // console.log(this.currentDate)
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch debtors...  ', true, true, true);
    this.role = sessionStorage.getItem('role') || '';
    this.categories$ = this.httpService.getCategories(1, 10)
    this.branches$ = this.httpService.getbranches();
    
    if(this.httpService.getUserRole() != 'Business_Owner' && this.httpService.getUserRole() != 'Account_Officer') {
      this.httpService.getBranchDebtors('0')
      .subscribe({
        next: (res) => {
          console.log(res)
          this.debtors = res
          this.datatableService.initiateDataTable('.debtorsnew', 15)
          this.sharedservice.infoFunc('', '', false, false, false);
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          if(err.error.staus === 401 || err.error.staus === 403){
            this.httpService.httpLogout(err.error.message)
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

    this.httpService.getBranchDebtors(this.branch.value.id)
      .subscribe({
        next: (res) => {
          // console.log('heeyy', res)
          this.debtors = res
          this.datatableService.initiateDataTable('.debtorsnew', 15)
          this.sharedservice.infoFunc('', '', false, false, false);
        },
        error: (err) => {
          // console.log(err)
          this.sharedservice.infoFunc('alert alert-danger', 'Error fetching branch debtors...  ' + err.error.message, false, false, false);
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 6000);
          if(err.error.staus === 401 || err.error.staus === 403){
            this.httpService.httpLogout(err.error.message)
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
