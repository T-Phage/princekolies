import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NgZone } from '@angular/core';
// import FileSaver from 'file-saver';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { ValidationService } from '../../services/validationservices/validation.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SharedService } from '../../services/sharedservices/shared.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expiry',
  standalone: true,
  imports: [CommonModule, ErrormodalComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './expiry.component.html',
  styleUrl: './expiry.component.css',
  providers:[CurrencyPipe] 
})
export class ExpiryComponent {

  products: any[] = [];
  currentPage = 1;
  perPage = 10;
  totalProducts = 0;

  products$!: Observable<any>;
  categories$! : Observable<any>;

  constructor(
    private httpservice: HttpService,
    public currency: CurrencyPipe,
    public valservice: ValidationService,
    private zone: NgZone,
    public sharedservice: SharedService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.products$ = this.httpservice.getProductsExpiring(this.currentPage, this.perPage);
    this.categories$ = this.httpservice.getCategories(1, 10)

    this.httpservice.getProductsExpiring(this.currentPage, this.perPage)
      .subscribe({
        next: data => {
          this.products = data
          // console.log(data)
        },
        error: _error => {

        }
      })
  }


  printTable() {
    const printWindow = window.open('', '_blank');  // Open a new window
    if (printWindow) {
      const tableHtml = this.generateTableHtml();  // Generate the table HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Product Expiry Table</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h2>Exp Product Table</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      printWindow.document.close();  // Close the document to finish loading
    }
  }

  // Generate the HTML for the table
  private generateTableHtml(): string {
    console.log(this.products)
    let tableHtml = '<table><thead><tr><th>Product Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Expiry Date</th><th>Uploaded_by</th></tr></thead><tbody>';
    this.products.forEach(product => {
      tableHtml += `<tr>
                      <td>${product.name}</td>
                      <td>${product.category_id}</td>
                      <td>${product.quantity}</td>
                      <td>${product.price}</td>
                      <td>${new Date(product.expiry_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</td>
                      <td>${product.createdby}</td>
                    </tr>`;
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  // Method to export the product table to Excel
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.products);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Expired Products': worksheet },
      SheetNames: ['Expired Products']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'expiry_table');
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
    doc.save('expiry.pdf');
  }

  refreshData(){
    this.products$ = this.httpservice.getProductsExpiring(1, 10);
    this.categories$ = this.httpservice.getCategories(1, 10)
    this.httpservice.getProductsExpiring(this.currentPage, this.perPage)
      .subscribe({
        next: data => {
          this.products = data
          // console.log(data)
        },
        error: _error => {

        }
      })
    $('.datanew').DataTable().destroy();
    setTimeout(()=> {
      $('.datanew').DataTable({
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

  date = new Date(); // or any Date value
  formattedDate = this.date.toISOString().split('T')[0]; // Convert to 'yyyy-MM-dd' format

  updateProductFrm = this.formBuilder.group({
    'name': ['', Validators.required],
    'description': [''],
    'barcode': [''],
    'price': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'category_id': [parseInt(''), Validators.required],
    'quantity': ['', Validators.compose([Validators.required, Validators.min(0), this.valservice.positiveIntegerValidator()])],
    'quantity_alert': ['', Validators.compose([Validators.required, Validators.min(0), this.valservice.positiveIntegerValidator()])],
    'manufactured_date': [this.formattedDate],
    'expiry_date': [this.formattedDate],
    'updatedby': [parseInt(`${sessionStorage.getItem('id')}`)]
  })
  productId:any;

  productClicked(id:any,name:any,description:string,barcode:string,price:any,category_id:any,quantity:any,quantity_alert:any,manufactured_date:any,expiry_date:any){
    if(expiry_date != undefined){
      const date = new Date(expiry_date); // or any Date value
      const formattedDate = date.toISOString().split('T')[0]; // Convert to 'yyyy-MM-dd' format
      this.updateProductFrm.controls.expiry_date.setValue(formattedDate)
    } else {
      this.updateProductFrm.controls.expiry_date.reset()
    }

    if (manufactured_date != undefined){
      const date2 = new Date(manufactured_date); // or any Date value
      const formattedDate2 = date2.toISOString().split('T')[0]; // Convert to 'yyyy-MM-dd' format
      this.updateProductFrm.controls.manufactured_date.setValue(formattedDate2)
    } else {
      this.updateProductFrm.controls.manufactured_date.reset()
    }

    this.updateProductFrm.controls.name.patchValue(name)
    this.updateProductFrm.controls.description.setValue(description)
    this.updateProductFrm.controls.barcode.setValue(barcode)
    this.updateProductFrm.controls.price.setValue(price)
    this.updateProductFrm.controls.category_id.setValue(category_id)
    this.updateProductFrm.controls.quantity.setValue(quantity)
    this.updateProductFrm.controls.quantity_alert.setValue(quantity_alert)
    this.updateProductFrm.controls.updatedby.setValue(parseInt(`${sessionStorage.getItem('id')}`))
    this.productId = id

    // console.log(this.updateProductFrm.value)
  }

  hide:boolean = true;
  deleteProduct(){
      this.httpservice.deleteProduct(this.productId)
        .subscribe({
          next: data => {
            this.sharedservice.infoFunc('alert alert-success', 'product deleted', false, false, false)
            // console.log(data)
            $('.datanew').DataTable().destroy()
            this.products$ = this.httpservice.getProductsExpiring(1, 10);
            this.categories$ = this.httpservice.getCategories(1, 10);
            this.httpservice.getProductsExpiring(this.currentPage, this.perPage)
              .subscribe({
                next: data => {
                  this.products = data
                  // console.log(data)
                },
                error: _error => {

                }
              })
            // this.users$.
            setTimeout(() =>{ 
              this.sharedservice.infoFunc('', '', false, false, false)

              $('.datanew').DataTable({
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
              // $('#delete-units').modal('hide')
              // $('#delete-units').modal('hide').on('hidden.bs.modal', function () {
              //   $('body').removeClass('modal-open'); // Ensure body scroll is enabled
              //   $('body').css('overflow', 'auto');
              //   $('.modal-backdrop').remove(); // Remove leftover backdrop
              // });
            }, 1000)
            // });
            this.hide = false;
            // setTimeout(()=>this.sharedservice.refreshComponentFunc('dashboard/users'), 2000)
          },
          error: error => {
            let msg = error.error.message
            console.error('error :', error)
            this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
            setTimeout(()=> this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false), 4000)

          }
        })
  
  }

  submitUpdateFrm(event:Event){
    event.preventDefault();

    // console.log(this.updateProductFrm.value)
    // console.log(this.updateProductFrm.valid)
    if(this.updateProductFrm.valid){
      this.httpservice.updateProduct(this.productId, this.updateProductFrm.value)
      .subscribe({
        next: data => {
          $('.datanew').DataTable().destroy()
          // $('.datanew ').empty()
          this.sharedservice.infoFunc('alert alert-success', 'product updated', false, false, false) 
          this.products$ = this.httpservice.getProductsExpiring(this.currentPage, this.perPage);
          this.categories$ = this.httpservice.getCategories(1, 10)
          this.httpservice.getProductsExpiring(this.currentPage, this.perPage)
            .subscribe({
              next: data => {
                this.products = data
                // console.log(data)
              },
              error: _error => {

              }
            })

          setTimeout(()=> this.sharedservice.infoFunc('','', false,false,false), 3500)
          

          // window.location.reload() 
          setTimeout(()=> {
            $('.datanew').DataTable({
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
          // console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          let fume = this.sharedservice.infoFunc

          setTimeout(()=>{
            fume('', '', false, false, false) 
          }, 4000)
        }
      })
    }
  }



  ngAfterViewInit(): void {
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
        $('.datanew').DataTable({
          "bFilter": true,
          // "sDom": 'fBtlpi',
          "dom": 'pftil',
          "ordering": true,
          "language": {
            emptyTable: " ",
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
      }, 1000)
    }
    );
    // }
    // });
    // });
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanew').DataTable().destroy();
  }


}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

