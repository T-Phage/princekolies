import { Component, NgZone } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import FileSaver from 'file-saver';
import * as FileSaver from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [ReactiveFormsModule, ErrormodalComponent, CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {

  selectedCategory = {
    id: '',
    'name': '',
    'status': false,
    'branch': '',
  }

  selectedCategoryId:any;
  
  categories: any[] = [];
  branches: any[] = [];
  categories$!: Observable<any>;
  branches$!: Observable<any>;

  role:string = '';
  owner:boolean = false;
  submitted:boolean = false;
  no_of_branches = Number(sessionStorage.getItem('number_of_branches'));

  constructor(
    private formBuilder: FormBuilder,
    public sharedservices: SharedService,
    private httpservices: HttpService,
    private zone: NgZone,
    private router: Router,
  ) {
    // const letRole = sessionStorage.getItem('role'); 
  }

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')],
  })

  createCategoryFrm = this.formBuilder.group({
    'name': ['', Validators.required],
    'status': [true, Validators.required],
    'createdby': [parseInt(`${sessionStorage.getItem('id')}`),],
    'branch': [this.no_of_branches == 1 ? null : sessionStorage.getItem('selected_branch')],
  });

  updateCategoryFrm = this.formBuilder.group({
    'name': ['', Validators.required],
    'status': [true, Validators.required],
    'updatedby': [parseInt(`${sessionStorage.getItem('id')}`),],
  });

  categoryClicked(id:string, name:string, status:boolean){
    // console.log(name)
    // console.log(status)

    this.selectedCategoryId = id

    this.updateCategoryFrm.controls.name.setValue(name)
    this.updateCategoryFrm.controls.status.setValue(status)

  }

  submitUpdateFrm(event:Event){
    event.preventDefault();

    // console.log(this.updateCategoryFrm.value)
    if(this.updateCategoryFrm.valid){
      this.httpservices.updateCategory(this.selectedCategoryId, this.updateCategoryFrm.value)
      .subscribe({
        next: data => {
          $('.datanewcat').DataTable().destroy()
          // $('.datanewcat ').empty()
          this.sharedservices.infoFunc('alert alert-success', 'category updated', false, false, false)
          this.httpservices.getCategoriesByBranch(this.branch.value.id)
            .subscribe({
              next: data => {
                this.categories = data
                setTimeout(() => {
                  this.dataTableInit();
                }, 150);
              },
              error: error => {
                const msg = error.error.message
                // setTimeout(()=> this.sharedservices.infoFunc('alert alert-danger',msg, false,false,false), 3000)
              }
            })

          setTimeout(()=> this.sharedservices.infoFunc('','', false,false,false), 3000)              
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

  createCategoryFunc(evt: Event) {
    evt.preventDefault()
    this.sharedservices.infoFunc('alert alert-info', 'creating category... ', false, false, false)
    console.log(this.createCategoryFrm.value)
    console.log(this.createCategoryFrm)
    this.submitted = true;
    if (this.createCategoryFrm.valid) {
      this.httpservices.createCategory(this.createCategoryFrm.value)
      .subscribe({
        next : data => {
          this.sharedservices.infoFunc('alert alert-success', 'category created', false, false, false)
          // console.log(data)
          $('.datanewcat').DataTable().destroy()
          this.sharedservices.infoFunc('alert alert-success', 'category created', false, false, false)
          $('.datanewcat').DataTable().destroy();
          setTimeout(()=>{
            this.sharedservices.infoFunc('', '', false, false, false)
            this.ngOnInit()
            // this.sharedservices.refreshComponentFunc(this.router.url)
          }, 1000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservices.infoFunc('alert alert-danger', error.error.message, false, false, false)
          setTimeout(() => this.sharedservices.infoFunc('', '', false, false, false), 3000)
        }
      })
    }
  }

  hide:boolean = true;
  deleteCategory(){
    this.httpservices.deleteCategory(this.selectedCategoryId)
      .subscribe({
        next: data => {
          this.sharedservices.infoFunc('alert alert-success', 'category deleted', false, false, false)
          // console.log(data)
          $('.datanewcat').DataTable().destroy()
          this.categories$ = this.httpservices.getCategories(1, 10);
          this.httpservices.getCategories(1, 10)
            .subscribe({
              next: data => {
                this.categories = data
              },
              error: error => {}
            })
          // this.users$.
          setTimeout(() =>{ 
            this.sharedservices.infoFunc('', '', false, false, false)
            this.dataTableInit();
            
          }, 1000)
          // });
          this.hide = false;
          // setTimeout(()=>this.sharedservicse.refreshComponentFunc('dashboard/users'), 2000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservices.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(()=>this.sharedservices.infoFunc('', '', false, false, false))
        }
      })

  }

  branchChange() {
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservices.infoFunc('', '', false, false, false);
      return
    }

    $('.datanewcat').DataTable().destroy()
    this.sharedservices.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservices.getCategoriesByBranch(this.branch.value.id)
      .subscribe({
        next: data => {
          this.categories = data
          // Initialize DataTable after data loads
          setTimeout(() => {
            this.dataTableInit();
            this.sharedservices.infoFunc('', '', false, false, false);
          }, 200);
        },
        error: _error => {
          console.log(_error);
          // this.dataTableInit(); 
          if(_error.error.staus === 401 || _error.error.staus === 403){
            this.httpservices.httpLogout(_error.error.message)
          }
        }
      })
  
  }

  ngOnInit() {
    this.sharedservices.infoFunc('alert alert-info', 'fetching branch product category...  ', true, true, true);
    this.role = sessionStorage.getItem('role') || '';
    this.branches$ = this.httpservices.getbranches();
 
    if(this.role != 'Business_Owner'){
      this.httpservices.getCategories(0, 0)
      .subscribe({
        next: data => {
          // console.log(data)
          this.sharedservices.infoFunc('', '', false, false, false);
          this.categories = data

          setTimeout(()=>{
            this.dataTableInit();
          }, 250)
        },
        error: error => {
          this.sharedservices.infoFunc('alert alert-danger', '', false, false, false);
          if (error.status === 401 || error.status === 403){
            this.httpservices.httpLogout(error.error.message)
          }
        }
      })

      return
    }
    
    this.httpservices.getCategoriesByBranch(this.branch.value.id)
    .subscribe({
      next: data => {
        // console.log(data)
        this.sharedservices.infoFunc('', '', false, false, false);
        this.categories = data

        setTimeout(()=>{
          this.dataTableInit();
        }, 250)
      },
      error: error => {
        if (error.status === 401 || error.status === 403){
          this.httpservices.httpLogout(error.error.message)
        }
      }
    })
  }

  formatDate(dateString:string) {
    // Create a new Date object from the string
    const date = new Date(dateString);

    // Format the date as "25 May 2023"
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  printTable() {
    const printWindow = window.open('', '_blank');  // Open a new window
    if (printWindow) {
      const tableHtml = this.generateTableHtml();  // Generate the table HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Categories Table</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h2>Product Category Table</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      printWindow.document.close();  // Close the document to finish loading
    }
  }

  // Generate the HTML for the table
  private generateTableHtml(): string {
    // console.log(this.categories)
    let tableHtml = '<table><thead><tr><th>Category Name</th><th>Status</th><th>Created On</th><th>Created By</th></thead><tbody>';
    this.categories.forEach(category => {
      tableHtml += `<tr>
                      <td>${category.name}</td>
                      <td>${category.status == 1?'Active':'Inactive'}</td>
                       <td>${new Date(category.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</td> 
                      <td>${category.createdby}</td>
                    </tr>`;
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  // Method to export the Categories table to Excel
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.categories);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Products Categories': worksheet },
      SheetNames: ['Products Categories']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'category_table');
  }

  // Save the Excel file
  saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }

  exportTableToPDF() {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add table content using autoTable
    autoTable(doc, { 
      html: '#table',
      startY: 10,
        theme: 'grid', // Optional: Customize theme and layout as needed
        styles: { fontSize: 8 }
    });

    // Save the generated PDF
    doc.save('category.pdf');
  }

  refreshData(){
    $('.datanewcat').DataTable().destroy();
    this.sharedservices.refreshComponentFunc(this.router.url)
  }

  ngAfterViewInit() {


      // Hide preloader once the view is fully initialized
  
      // this.products$.subscribe({
      //   next: data => {
      //     if(data){
      this.zone.runOutsideAngular(() => {
        setTimeout(() => {
          const preloader = document.getElementById('global-loader') as HTMLDivElement;
          if (preloader) {
            preloader.style.display = 'none';
          }
        }, 2000)
      }
      );
    
  }

  dataTableInit(){
    $('.datanewcat').DataTable({
            "bFilter": true,
            "sDom": 'fBtlpi',
            // "dom": 'pftil',
            "ordering": true,
            "language": {
              search: ' ',
              sLengthMenu: '_MENU_',
              searchPlaceholder: "Search",
              info: "_START_ - _END_ of _TOTAL_ items",
              paginate: {
                next: ' <i class="fa fa-angle-right"></i>',
                previous: '<i class="fa fa-angle-left"></i> '
              },
            },
            initComplete: (_settings: any, _json: any) => {
              $('.dataTables_filter').appendTo('#tableSearch');
              $('.dataTables_filter').appendTo('.search-input');
              $('#info').appendTo('#info')
            },
    });
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanewcat').DataTable().destroy();
    this.sharedservices.infoFunc('', '', false, false, false);
  }

}


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
