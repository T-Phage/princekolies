import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { Observable } from 'rxjs';
import { SwalservicesService } from '../../services/swal/swalservices.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent {
  constructor(
    private httpservice: HttpService,
    private formBuilder: FormBuilder,
    private datatableService: DatabaleService,
    private swalService: SwalservicesService,
    public sharedservice: SharedService,
    private router: Router,
  ){}

  expCategory$!:Observable<any>;

  role = this.httpservice.getUserRole();
  expenses: any[] = [];
  branches$!: Observable<any>;
  currentDate = new Date();

  clickedExpense = {}

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  new_expenditureFrm = this.formBuilder.group({
    expense_category: ['', Validators.required],
    expense_date: [this.currentDate.toISOString().split('T')[0], Validators.required],
    amount: ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    reference: ['', Validators.required],
    expense_for: ['', Validators.required],
    description: [''],
    branch_id: [this.role == 'Business_Owner' ? sessionStorage.getItem('selected_branch') : ''],
  })

  branchChange() {
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    $('.expensedata').DataTable().destroy()
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservice.getExpensesByBranch(this.branch.value.id)
      .subscribe({
        next: data => {
          console.log(data)
          this.expenses = data
          this.sharedservice.infoFunc('', '', false, false, false)
          this.datatableService.initiateDataTable('.expensedata', 20)
        },
        error: err => {
          console.log(err)
        },
      })
  }

  refresh() {
    $('.expensedata').DataTable().destroy()
    this.sharedservice.infoFunc('', '', true, true, true)
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  submitExpenditure(evt: Event) {
    evt.preventDefault();

    // console.log(this.new_expenditureFrm.value)
    // console.log(this.new_expenditureFrm.valid)
    if(!this.new_expenditureFrm.valid){
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'saving expenditure details', true, true, true)

    this.httpservice.postExpenses(this.new_expenditureFrm.value)
    .subscribe({
      next: data => {
        $('.expensedata').DataTable().destroy()
        console.log(data)
        this.sharedservice.infoFunc('alert alert-success', 'expenditure details saved', false, false, false)
        this.ngOnInit()

        setTimeout(()=> this.sharedservice.infoFunc('', '', false, false, false),5000)
      },
      error: err => {
        console.log(err)
        this.sharedservice.infoFunc('alert alert-danger', 'an error occured', false, false, false)

        setTimeout(()=> this.sharedservice.infoFunc('', '', false, false, false), 8000)
      }
    })
  }

  ngOnInit(): void {
    this.sharedservice.infoFunc('alert alert-info', 'fetching expenses...', true, true, true)
    this.expCategory$ = this.httpservice.getExpenseCategory();
    // this.branches$ = this.httpservice.getbranches();
    if (this.role != 'Business_Owner' && this.role != 'Account_Officer'){
      this.httpservice.getExpenses().subscribe({
        next: data => {
          console.log(data)
          this.expenses = data
          this.datatableService.initiateDataTable('.expensedata', 20)
        },
        error: error => {
          console.log(error)
        },
        complete: () => {
          // console.log(vrr)
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false)
          }, 2000);
        }
      })
      return
    }
    
    this.branches$ = this.httpservice.getbranches();
    if (this.branch.value.id == null || this.branch.value.id == '0') {
      setTimeout(() => {
          this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
      }, 4500);

        return
    }

    this.httpservice.getExpensesByBranch(this.branch.value.id).subscribe({
        next: data => {
          console.log(data)
          this.expenses = data
          this.datatableService.initiateDataTable('.expensedata', 20)
        },
        error: error => {
          console.log(error)
        },
        complete: () => {
          // console.log(vrr)
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false)
          }, 2000);
        }
      })
  }

  ngOnDestroy(): void{
    $('.expensedata').DataTable().destroy()
    this.sharedservice.infoFunc('', '', false, false, false);
  }
}
