import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import * as XLSX from 'xlsx';
import FileSaver, { saveAs } from 'file-saver';
import { ValidationService } from '../../services/validationservices/validation.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// import $ from 'jquery'; 

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class ProductsComponent {

  products: any[] = [];
  currentPage = 1;
  perPage = 15;
  totalProducts = 0;
  categories$!: Observable<any>
  branches$!: Observable<any>;

  role:string = '';

  constructor(
    private httpservice: HttpService,
    public currency: CurrencyPipe,
    public valservice: ValidationService,
    private zone: NgZone,
    private formBuilder: FormBuilder,
    public sharedservice: SharedService,
  ) { 
  }

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  branchChange() {
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.datanew').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservice.getByBranchProducts(this.branch.value.id)
      .subscribe({
        next: data => {
          this.products = data
          // Initialize DataTable after data loads
          setTimeout(() => {
            this.initDataTable();
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 200);
        },
        error: _error => {
          console.log(_error);
          this.initDataTable();
          if(_error.error.staus === 401){
            this.httpservice.httpLogout()
          }
        }
      })
  }
  
  ngOnInit() {
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    this.role = sessionStorage.getItem('role') || '';
    this.categories$ = this.httpservice.getCategories(1, 10)
    this.branches$ = this.httpservice.getbranches()

    this.role = this.httpservice.getUserRole();
    if(this.httpservice.getUserRole() !== 'Business_Owner'){
      this.httpservice.getProducts(0,0)
        .subscribe({
          next: data => {
            this.products = data
            this.sharedservice.infoFunc('', '', false, false, false);
              if (data.length > 0){
                setTimeout(() => {
                  this.sharedservice.infoFunc('', '', false, false, false);
                  this.initDataTable();
                }, 170);
                return;
              } 
          },
          error: _error => {
            this.sharedservice.infoFunc('', '', false, false, false);
            console.log(_error);
            // this.initDataTable();
            if(_error.error.staus === 401){
              this.httpservice.httpLogout()
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

    this.httpservice.getByBranchProducts(this.branch.value.id)
      .subscribe({
        next: data => {
          this.products = data
          this.sharedservice.infoFunc('', '', false, false, false);
            if (data.length > 0){
              setTimeout(() => {
                this.sharedservice.infoFunc('', '', false, false, false);
                this.initDataTable();
              }, 170);
              return;
            } 
        },
        error: _error => {
          this.sharedservice.infoFunc('', '', false, false, false);
          console.log(_error);
          // this.initDataTable();
          if(_error.error.staus === 401){
            this.httpservice.httpLogout()
          }
        }
      })
  }

  date = new Date(); // or any Date value
  formattedDate = this.date.toISOString().split('T')[0]; // Convert to 'yyyy-MM-dd' format

  updateProductFrm = this.formBuilder.group({
    'name': ['', Validators.required],
    'description': [''],
    'barcode': [''],
    'price': ['', Validators.compose([Validators.required, Validators.pattern(this.sharedservice.amount)])],
    'category_id': [parseInt(''), Validators.required],
    'quantity': ['', Validators.compose([Validators.required, Validators.min(0)])], //, this.valservice.positiveIntegerValidator()])],
    'quantity_alert': ['', Validators.compose([Validators.required, Validators.min(0)])], //, this.valservice.positiveIntegerValidator()])],
    'manufactured_date': [this.formattedDate],
    'expiry_date': [this.formattedDate],
    'updatedby': [parseInt(`${sessionStorage.getItem('id')}`)]
  })
  productId:any;

  productClicked(id:any,name:any,description:string,barcode:string,price:any,category_id:any,quantity:any,quantity_alert:any,manufactured_date:any,expiry_date:any){
    // Reset the product ID first
    this.productId = null;

    console.log('clicked',id, name, description, barcode, price, category_id, quantity, quantity_alert, manufactured_date, expiry_date)
    
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

    this.updateProductFrm.controls.name.setValue(name)
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
            this.categories$ = this.httpservice.getCategories(1, 10);
            // this.users$.
            setTimeout(()=>this.sharedservice.infoFunc('', '', false, false, false),4000)
            setTimeout(() =>{ 
                this.initDataTable();
            }, 2000)
            this.hide = false;
            // setTimeout(()=>this.sharedservice.refreshComponentFunc('dashboard/users'), 2000)
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

    console.log(this.updateProductFrm.value)
    console.log(this.updateProductFrm)
    if(this.updateProductFrm.valid){
      this.httpservice.updateProduct(this.productId, this.updateProductFrm.value)
      .subscribe({
        next: data => {
          $('.datanew').DataTable().destroy()
          // $('.datanew ').empty()
          this.sharedservice.infoFunc('alert alert-success', 'product updated', false, false, false) 
          this.categories$ = this.httpservice.getCategories(1, 10)
          
          // Reset form and product ID
          // this.resetForm();
          
          setTimeout(()=> {
            this.sharedservice.infoFunc('','', false,false,false)
            // Close the modal and clean up backdrop
            this.closeModalAndRefresh();
          }, 2000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
          let fume = this.sharedservice.infoFunc

          setTimeout(()=>{
            fume('', '', false, false, false) 
          }, 5000)
        }
      })
    }
  }

  resetForm() {
    this.productId = null;
    this.updateProductFrm.reset({
      'name': '',
      'description': '',
      'barcode': '',
      'price': '',
      'category_id': parseInt(''),
      'quantity': '',
      'quantity_alert': '',
      'manufactured_date': this.formattedDate,
      'expiry_date': this.formattedDate,
      'updatedby': parseInt(`${sessionStorage.getItem('id')}`)
    });
  }

  closeModalAndRefresh() {
    // Get the modal element
    const modalElement = document.getElementById('update-product');
    if (modalElement) {
      // Get Bootstrap modal instance and hide it
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Remove modal backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Restore body scroll
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    // Refresh the component
    this.refreshData();
  }

  // Method to export the product table to Excel
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.products);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Product Table': worksheet },
      SheetNames: ['Product Table']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'product_table');
  }

  // Save the Excel file
  saveAsExcelFile(buffer: any, fileName: string) {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
  }

  exportTableToPDF() {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    var data = this.products

    // Add table content using autoTable

    const columns = [
        { header: "Product", dataKey: "name" },
        { header: "Category", dataKey: "category_id" },
        { header: "Price", dataKey: "price" },
        { header: "Quantity", dataKey: "quantity" }
    ];
    autoTable(doc, {
        columns: columns,
        body: data,
        foot: [[
          { content: `Total Items: ${this.products.length}`, colSpan: 1, styles: { fontStyle: 'bold' } },
          { content: `Feed: `, styles: { fontStyle: 'bold', halign: 'right' } },
          { content: `Others: `, styles: { fontStyle: 'bold', halign: 'right' } }
        ]],
        theme: 'grid'
    });

    // Save the generated PDF
    doc.save('products_table_'+(new Date().toDateString().split('T')[0].replace(' ', '_'))+'.pdf');
  }

  printTable() {
    const printWindow = window.open('', '_blank');  // Open a new window
    if (printWindow) {
      const tableHtml = this.generateTableHtml();  // Generate the table HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Product Table</title>
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
    let tableHtml = '<table><thead><tr><th>Product Name</th><th>Category</th><th>Quantity</th><th>Price</th></tr></thead><tbody>';
    this.products.forEach(product => {
      tableHtml += `<tr>
                      <td>${product.name}</td>
                      <td>${product.category_id}</td>
                      <td>${product.quantity}</td>
                      <td>${product.price}</td>
                    </tr>`;
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  }
  
  refreshData(){
    // location.reload();
    this.sharedservice.refreshComponentFunc('dashboard/products');
  }

  initDataTable() {
    this.zone.runOutsideAngular(() => {

      const preloader = document.getElementById('global-loader') as HTMLDivElement;
      if (preloader) {
        preloader.style.display = 'none';
      }

      $('.datanew').DataTable({
        "pageLength": 20,
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "bLengthChange": true,
        bFilter: true,
        // dom: 'pftil',
        "sDom": 'fBtlpi',
        ordering: true,
        language: {
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

    });
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanew').DataTable().destroy();
    this.sharedservice.infoFunc('', '', false, false, false);
  }

}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
