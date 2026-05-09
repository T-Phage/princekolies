import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { SharedService } from '../../services/sharedservices/shared.service';
import { SwalservicesService } from '../../services/swal/swalservices.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expenses-category',
  standalone: true,
  imports: [ReactiveFormsModule, ErrormodalComponent, CommonModule],
  templateUrl: './expenses-category.component.html',
  styleUrl: './expenses-category.component.css'
})
export class ExpensesCategoryComponent {

  selectedCategory = {
    id: '',
    'name': '',
    'status': false,
  }

  selectedCategoryId:any;

  categories: any[] = [];
  hide:boolean = true;
  role:string = '';
  constructor(
    private formBuilder: FormBuilder,
    public sharedservices: SharedService,
    private httpservice: HttpService,
    private datatableService: DatabaleService,
    private swalService: SwalservicesService,
    private router: Router,
  ){}

    createCategoryFrm = this.formBuilder.group({
      'expense_name': ['', Validators.required],
      'status': [true, Validators.required],
      'description': [''],
    });
  
    updateCategoryFrm = this.formBuilder.group({
      'expense_name': ['', Validators.required],
      'status': [true, Validators.required],
    });

    categoryClicked(id:string, expense_name:string, status:boolean){

      this.selectedCategoryId = id

      this.updateCategoryFrm.controls.expense_name.setValue(expense_name)
      this.updateCategoryFrm.controls.status.setValue(status)

      // console.log(this.updateCategoryFrm.value)
      // console.log(id)
    }

   submitUpdateFrm(event:Event){
    event.preventDefault();
    this.sharedservices.infoFunc('alert alert-info', 'updating category', true, true, true) 

    // console.log(this.updateCategoryFrm.value)
    if(this.updateCategoryFrm.valid){
      this.httpservice.patchExpenseCategory(this.selectedCategoryId, this.updateCategoryFrm.value)
      .subscribe({
        next: data => {
          $('.dataexpcat').DataTable().destroy()
          this.sharedservices.infoFunc('alert alert-success', 'category updated', false, false, false) 
            // this.categories = data
          this.ngOnInit();
          setTimeout(()=> this.sharedservices.infoFunc('','', false,false,false), 250)
        },  
        error: error => {
          const msg = error.error.message
          this.sharedservices.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(()=> this.sharedservices.infoFunc('', '', false, false, false), 8000)
        }
      })
    }
  }

  refresh(){
    $('.dataexpcat').DataTable().destroy()
    this.sharedservices.infoFunc('', '', true, true, true)
    this.sharedservices.refreshComponentFunc(this.router.url);
  }

  deleteCategory(){}

  createCategoryFunc(evt:Event){
    this.sharedservices.infoFunc('alert alert-info', 'adding new category', true, true, true) 
    
    evt.preventDefault();

    if(!this.createCategoryFrm.valid){
      return
    }
    
    this.httpservice.postExpenseCategory(this.createCategoryFrm.value)
    .subscribe({
      next: data => {
        $('.dataexpcat').DataTable().destroy()
        // console.log(data)
        this.sharedservices.infoFunc('alert alert-success', 'new category added', false, false, false) 
        this.ngOnInit()
      },
      error: err => {
        this.sharedservices.infoFunc('alert alert-danger', 'new category not added', false, false, false) 
        console.log(err)
      }
    })
  }

  ngOnInit(): void {
    this.sharedservices.infoFunc('alert alert-info', 'fetching data...', true, true, true)
    this.httpservice.getExpenseCategory().subscribe({
      next: data => { 
        // console.log(data)
        this.categories = data
        this.datatableService.initiateDataTable('.dataexpcat', 20)
        setTimeout(() => {
          this.sharedservices.infoFunc('', '', false, false, false)
        }, 250)
      },
      error: error => {
        console.log(error)
        this.datatableService.initiateDataTable('.dataexpcat', 20)
      },
      complete: () => {
        // console.log(vrr)
      }
    });
  }

  ngOnDestroy() {
    $('.dataexpcat').DataTable().destroy()
    this.sharedservices.infoFunc('', '', false, false, false)
  }
}
