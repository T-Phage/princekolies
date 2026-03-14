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
  }

  selectedCategoryId:any;
  
  categories: any[] = [

  ];
  categories$!: Observable<any>;

  role:string = '';

  constructor(
    private formBuilder: FormBuilder,
    public sharedservices: SharedService,
    private httpservices: HttpService,
    private zone: NgZone,
  ) { }

  createCategoryFrm = this.formBuilder.group({
    'name': ['', Validators.required],
    'status': [true, Validators.required],
    'createdby': [parseInt(`${sessionStorage.getItem('id')}`),],
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

    // console.log(this.updateCategoryFrm.value)
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
          this.categories$ = this.httpservices.getCategories(1, 10)
          this.httpservices.getCategories(1, 10)
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

  createCategoryFunc(evt: Event) {
    evt.preventDefault()
    // console.log(this.createCategoryFrm.value)

    if (this.createCategoryFrm.valid) {
      this.httpservices.createCategory(this.createCategoryFrm.value)
      .subscribe({
        next : data => {
          this.sharedservices.infoFunc('alert alert-success', 'category created', false, false, false)
          // console.log(data)
          $('.datanewcat').DataTable().destroy()
          this.categories$ = this.httpservices.getCategories(1, 10)
          this.httpservices.getCategories(1, 10)
            .subscribe({
              next: data => {
                this.categories = data
              },
              error: error => {}
            })
          // this.users$.
          this.sharedservices.infoFunc('alert alert-success', 'category created', false, false, false)
          setTimeout(()=>{
            this.sharedservices.infoFunc('', '', false, false, false)
            $('.datanewcat').DataTable({
            "bFilter": true,
          // "sDom": 'fBtlpi',
            "dom": 'pftil',
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
          })
        }, 2000)
        },
        error: error => {
          let msg = error.error.message
        console.error('error :', error)
        this.sharedservices.infoFunc('alert alert-danger', error.message, false, false, false)
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
                  next: ' <i class="fa fa-angle-right"></i>',
                  previous: '<i class="fa fa-angle-left"></i> '
                },
              },
              initComplete: (_settings: any, _json: any) => {
                $('.dataTables_filter').appendTo('#tableSearch');
                $('.dataTables_filter').appendTo('.search-input');
                $('#info').appendTo('#info')
              },
            
            })
            
          }, 1000)
          // });
          this.hide = false;
          // setTimeout(()=>this.sharedservice.refreshComponentFunc('dashboard/users'), 2000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservices.infoFunc('alert alert-danger', msg, false, false, false)
          setTimeout(()=>this.sharedservices.infoFunc('', '', false, false, false))
        }
      })

  }


  loadCategories() {
    this.httpservices.getCategories(1, 10).subscribe({
      next: (data) => {
        this.categories = data;
        // console.log(data)
      },
      error: (error) => {
        console.error('error:', error);
      }
    });
  }

  ngOnInit() {
    this.role = sessionStorage.getItem('role') || '';
    // this.loadCategories()
    this.categories$ = this.httpservices.getCategories(1, 10);

    this.httpservices.getCategories(1, 10)
    .subscribe({
      next: data => {
        this.categories = data
      },
      error: error => {}
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
    this.categories$ = this.httpservices.getCategories(1, 10)
    $('.datanewcat').DataTable().destroy();
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
    },3000)
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
          $('.datanewcat').DataTable({
            "bFilter": true,
            // "sDom": 'fBtlpi',
            "dom": 'pftil',
            "ordering": true,
            "language": {
              emptyTable: "No data available ",
              infoEmpty: "",
              search: ' ',
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
          });  // Initialize jQuery DataTable outside Angular’s zone
        }, 2000)
      }
      );
    
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanewcat').DataTable().destroy();
  }

}


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
