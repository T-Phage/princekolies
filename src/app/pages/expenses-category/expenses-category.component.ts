import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { SharedService } from '../../services/sharedservices/shared.service';


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
  ){}

  createCategoryFrm = this.formBuilder.group({
      'expense_name': ['', Validators.required],
      'status': [true, Validators.required],
      'createdby': [parseInt(`${sessionStorage.getItem('id')}`),],
    });
  
    updateCategoryFrm = this.formBuilder.group({
      'expense_name': ['', Validators.required],
      'status': [true, Validators.required],
      'updatedby': [parseInt(`${sessionStorage.getItem('id')}`),],
    });

    categoryClicked(id:string, expense_name:string, status:boolean){
    // console.log(name)
    // console.log(status)

    this.selectedCategoryId = id

    this.updateCategoryFrm.controls.expense_name.setValue(expense_name)
    this.updateCategoryFrm.controls.status.setValue(status)

    // console.log(this.updateCategoryFrm.value)
  }

   submitUpdateFrm(event:Event){
    event.preventDefault();

    // console.log(this.updateCategoryFrm.value)
    if(this.updateCategoryFrm.valid){
      this.httpservice.updateCategory(this.selectedCategoryId, this.updateCategoryFrm.value)
      .subscribe({
        next: data => {
          $('.datanewcat').DataTable().destroy()
          // $('.datanewcat ').empty()
          this.sharedservices.infoFunc('alert alert-success', 'category updated', false, false, false) 
          this.httpservice.getExpenseCategory()
            .subscribe({
              next: data => {
                this.categories = data
              },
              error: error => {
                const msg = error.error.message
                // setTimeout(()=> this.sharedservices.infoFunc('alert alert-danger',msg, false,false,false), 3000)
              }
            })

          setTimeout(()=> this.sharedservices.infoFunc('','', false,false,false), 3000)

          // window.location.reload() 
          setTimeout(()=> {
            $('.datanewcat').DataTable({
              "bFilter": true,
              // "sDom": 'fBtlpi',
              "dom": 'pftil',
              "ordering": true,
              "language": {
                search: ' ',
                emptyTable: "No data available in table",
                infoEmpty: "",
                sLengthMenu: '_MENU_',
                searchPlaceholder: "Search",
                info: "_START_ - _END_ of _TOTAL_ items",
                paginate: {
                  next: ' <i class=" fa fa-angle-right"></i>',
                  previous: '<i class="fa fa-angle-left"></i> '
                },
              },
              initComplete: (_settings: any, _json: any) => {
                $('.dataTables_filter').appendTo('#tableSearch');
                $('.dataTables_filter').appendTo('.search-input');
              },
            }); 
          },1000)  
              
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservices.infoFunc('alert alert-danger', msg, false, false, false)
          let fume = this.sharedservices.infoFunc

          setTimeout(()=>{
            fume('', '', false, false, false) 
          }, 3000)
        }
      })
    }
  }

  refreshData(){}

  deleteCategory(){}

  createCategoryFunc(evt:Event){}

  ngOnInit(): void {
    this.httpservice.getExpenseCategory().subscribe({
      next: data =>{ 
        console.log(data)
        this.categories = data
      },
      error: error => {
        console.log(error)
      },
      complete: () => {
        // console.log(vrr)
      }
    });
  }
}
