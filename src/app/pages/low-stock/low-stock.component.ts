import { Component, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import FileSaver from 'file-saver';
import * as FileSaver from 'file-saver';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validationservices/validation.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, ErrormodalComponent, ReactiveFormsModule],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.css'
})
export class LowStockComponent {
  products_out$!: Observable<any[]>;
  products_low$!: Observable<any[]>;
  categories$!: Observable<any[]>;
  products_out:any[] = []
  products_low:any[] = []
  currentPage = 1;
  perPage = 15;

  branches$!: Observable<any>;

  low:boolean = true;
  
  role:string = '';

  constructor(
    private httpservice: HttpService,
    private zone: NgZone,
    public sharedservice: SharedService,
    private formBuilder: FormBuilder,
    private valservice: ValidationService,
    private datatableservice: DatabaleService,
    private router: Router,
  ){}

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')],
  })

  branchChange() {
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.datanew_1').DataTable().destroy()
    $('.datanew_2').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservice.getProductsAlert(this.branch.value.id)
      .subscribe({
        next: data => {
        // console.log(data);
        this.products_low = data.low_stock
        this.products_out = data.out_of_stock
        this.sharedservice.infoFunc('', '', false, false, false);
        
          // Initialize DataTable after data loads
          setTimeout(() => {
            this.datatableservice.initiateDataTable('datanew_1',20)
            this.datatableservice.initiateDataTable('datanew_2',20)
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 200);
        },
        error: _error => {
          console.log(_error);
          if(_error.error.staus === 401){
            this.httpservice.httpLogout()
          }
        }
      })
  }

  ngOnInit(): void{
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    this.role = sessionStorage.getItem('role') || '';
    this.categories$ = this.httpservice.getCategories(this.currentPage, this.perPage);

    if(this.role != 'Business_Owner'){
      this.httpservice.getStockedOutProducts(this.currentPage, this.perPage).subscribe({
        next: data=> {
          this.products_out = data
          this.sharedservice.infoFunc('', '', false,false,false);
          setTimeout(()=>{
            this.datatableservice.initiateDataTable('.datanew_2',20)
          }, 100)
        },
        error: error => {
          console.log(error)
          this.sharedservice.infoFunc('alert alert-danger', 'out of stock products could not be fetched', false,false,false);
        }
      })
      this.httpservice.getLowStockedProducts(this.currentPage, this.perPage).subscribe({
        next: data=> {
          this.products_low = data
          setTimeout(()=>{
            this.datatableservice.initiateDataTable('.datanew_1',20)
          },100)
        },
        error: error => {
          console.log(error)
          this.sharedservice.infoFunc('alert alert-danger', 'low stocked products could not be fetched', false,false,false);
        }
      })

      return
    }
    this.branches$ = this.httpservice.getbranches()
     if (this.branch.value.id == null || this.branch.value.id == '0') {
      setTimeout(() => {
          this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
      }, 4500);

        return
    }
 
    this.httpservice.getProductsAlert(this.branch.value.id)
    .subscribe({
      next: data=> {
        // console.log(data)
        this.products_low = data.low_stock
        this.products_out = data.out_of_stock
        this.sharedservice.infoFunc('', '', false, false, false);
        // setTimeout(()=>{
        //   this.data1TableInit()
        // },900)
          setTimeout(() => {

            this.sharedservice.infoFunc('', '', false, false, false);
            // this.data2TableInit();
            // this.data1TableInit();
            this.datatableservice.initiateDataTable('.datanew_1',20)
            this.datatableservice.initiateDataTable('.datanew_2',20)
          }, 900);
            
      },
      error: error => {
        this.sharedservice.infoFunc('', '', false, false, false);
        if(error.error.staus === 401){
          this.httpservice.httpLogout()
        }
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
            <h2>Product Table</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      printWindow.document.close();  // Close the document to finish loading
    }
  }

  // Generate the HTML for the table
  private generateTableHtml(): string {
    // console.log(this.products)
    if(this.low){
      let tableHtml = '<table><thead><tr><th>Product Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Expiry Date</th><th>Uploaded By</th><th>Updated By</th></tr></thead><tbody>';
      this.products_low.forEach(product => {
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
                        <td>${product.updatedby}</td>
                      </tr>`;
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    } else {
      let tableHtml = '<table><thead><tr><th>Product Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Expiry Date</th><th>Uploaded By</th><th>Updated By</th></tr></thead><tbody>';
      this.products_out.forEach(product => {
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
                        <td>${product.updatedby}</td>
                      </tr>`;
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
  }

  // Method to export the product table to Excel
  exportToExcel() {
    if(this.low){
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.products_low);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Low Stocked Products': worksheet },
        SheetNames: ['Low Stocked Products']
      };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'low_stock_table');
    } else {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.products_out);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Out of Stock': worksheet },
        SheetNames: ['Out of Stock']
      };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'out_of_stock_table');
    }

  }

  // Save the Excel file
  saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }

  exportTableToPDF() {
    if(this.low){
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
      doc.save('low_in_stock.pdf');
    } else {
      // Create a new jsPDF instance
      const doc = new jsPDF();
  
      // Add table content using autoTable
      autoTable(doc, { 
        html: '#table1',
        startY: 10,
        theme: 'grid', // Optional: Customize theme and layout as needed
        styles: { fontSize: 8 }
      });
  
      // Save the generated PDF
      doc.save('out_of_stock.pdf');
    }
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
            $('.datanew_1').DataTable().destroy()
            $('.datanew_2').DataTable().destroy()
            this.products_out$ = this.httpservice.getStockedOutProducts(this.currentPage, this.perPage);
            this.products_low$ = this.httpservice.getLowStockedProducts(this.currentPage, this.perPage);
            this.categories$ = this.httpservice.getCategories(this.currentPage, this.perPage);
            this.httpservice.getStockedOutProducts(this.currentPage, this.perPage).subscribe({
              next: data=> {
                this.products_out = data
              },
              error: error => {
        
              }
            })
            this.httpservice.getLowStockedProducts(this.currentPage, this.perPage).subscribe({
              next: data=> {
                this.products_low = data
              },
              error: error => {
        
              }
            })
            
            // this.users$.
            setTimeout(() =>{ 
              this.sharedservice.infoFunc('', '', false, false, false)
              // $('#delete-units').modal('hide')
              // $('#delete-units').modal('hide').on('hidden.bs.modal', function () {
              //   $('body').removeClass('modal-open'); // Ensure body scroll is enabled
              //   $('body').css('overflow', 'auto');
              //   $('.modal-backdrop').remove(); // Remove leftover backdrop
              // });
            }, 1000)
            this.hide = false;
            // this.sharedservice.infoFunc('', '', false, false, false)
            // setTimeout(()=>this.sharedservice.refreshComponentFunc(), 2000)
          },
          error: error => {
            let msg = error.error.message
            console.error('error :', error)
            this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)

          }
        })
  
  }

  submitUpdateFrm(event:Event){
    event.preventDefault();

    // console.log(this.updateProductFrm.value)
    if(this.updateProductFrm.valid){
      this.httpservice.updateProduct(this.productId, this.branch.value.id, this.updateProductFrm.value)
      .subscribe({
        next: data => {
          $('.datanew_1').DataTable().destroy()
          $('.datanew_2').DataTable().destroy()

          this.sharedservice.refreshComponentFunc(this.router.url)
          // $('.datanew ').empty()
          // this.sharedservice.infoFunc('alert alert-success', 'product updated', false, false, false) 
          // this.products_out$ = this.httpservice.getStockedOutProducts(this.currentPage, this.perPage);
          // this.products_low$ = this.httpservice.getLowStockedProducts(this.currentPage, this.perPage);
          // this.categories$ = this.httpservice.getCategories(this.currentPage, this.perPage);
          // this.httpservice.getStockedOutProducts(this.currentPage, this.perPage).subscribe({
          //   next: data=> {
          //     this.products_out = data
          //   },
          //   error: error => {
      
          //   }
          // })
          // this.httpservice.getLowStockedProducts(this.currentPage, this.perPage).subscribe({
          //   next: data=> {
          //     this.products_low = data
          //   },
          //   error: error => {
      
          //   }
          // })
          
          // setTimeout(()=> this.sharedservice.infoFunc('','', false,false,false), 3500)
           
          // // window.location.reload() 
          // setTimeout(()=> {
          //   $('.datanew').DataTable({
          //     "bFilter": true,
          //     // "sDom": 'fBtlpi',
          //     "dom": 'pftil',
          //     "ordering": true,
          //     "language": {
          //       search: ' ',
          //       emptyTable: "No data available in table",
          //       infoEmpty: "",
          //       sLengthMenu: '_MENU_',
          //       searchPlaceholder: "Search",
          //       info: "_START_ - _END_ of _TOTAL_ items",
          //       paginate: {
          //         next: ' <i class=" fa fa-angle-right"></i>',
          //         previous: '<i class="fa fa-angle-left"></i> '
          //       },
          //     },
          //     initComplete: (_settings: any, _json: any) => {
          //       $('.dataTables_filter').appendTo('#tableSearch');
          //       $('.dataTables_filter').appendTo('.search-input');
          //     },
          //   }); 
          // },1000)  

        
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          let fume = this.sharedservice.infoFunc

          setTimeout(()=>{
            fume('', '', false, false, false) 
          }, 4000)
        }
      })
    }
  }

  refreshData(){
    $('.datanew_1').DataTable().destroy();
    $('.datanew_2').DataTable().destroy();
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  ngAfterViewInit(){
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const preloader = document.getElementById('global-loader') as HTMLDivElement;
        if (preloader) {
          preloader.style.display = 'none';
        }
        // if ($('.datanew').length > 0){
          
          
        // }
      }, 1000)
    }
    );
  }

  data1TableInit(){
    $('.datanew-1').DataTable({
      "bFilter": true,
      // "sDom": 'fBtlpi',
      "dom": 'pftil',
      "ordering": true,
      "language": {
        emptyTable: "No data available in table",
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
    }); 
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanew_1').DataTable().destroy();
    $('.datanew_2').DataTable().destroy();
    this.sharedservice.infoFunc('','', false,false,false)
  }
}


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
