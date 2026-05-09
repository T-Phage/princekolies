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
import { RouterLink, Router } from '@angular/router';
import { DatabaleService } from '../../services/datatable/databale.service';

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
  branches$! : Observable<any>;

  role:string = '';

  constructor(
    private httpservice: HttpService,
    public currency: CurrencyPipe,
    public valservice: ValidationService,
    private zone: NgZone,
    public sharedservice: SharedService,
    private formBuilder: FormBuilder,
    private datableservice: DatabaleService,
    private router: Router,
  ) { }

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  branchChange() {
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.dataexp').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservice.getBranchProductsExpiring(this.branch.value.id)
      .subscribe({
        next: data => {
          this.products = data
          // Initialize DataTable after data loads
          setTimeout(() => {
            this.datableservice.initiateDataTable('.dataexp', 25);
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 200);
        },
        error: _error => {
          console.log(_error);
          // this.initDataTable();
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

    if(this.role != 'Business_Owner') {
      this.httpservice.getProductsExpiring(0,0)
      .subscribe({
        next: data => {
          this.products = data
          // console.log(data)
          this.datableservice.initiateDataTable('.dataexp', 25);
          setTimeout(() =>{
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 2000);
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
      return
    }
    this.branches$ = this.httpservice.getbranches()

    if (this.branch.value.id == null || this.branch.value.id == '0') {
      setTimeout(() => {
        this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
      }, 4500);

      return
    }

    this.httpservice.getBranchProductsExpiring(this.branch.value.id)
      .subscribe({
        next: data => {
          this.products = data
          // console.log(data)
          this.datableservice.initiateDataTable('.dataexp', 25);
          setTimeout(() =>{
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 2000);
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
    this.saveAsExcelFile(excelBuffer, 'expiry_table_'+(new Date().toDateString().split('T')[0]));
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
    this.sharedservice.refreshComponentFunc(this.router.url);
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
            $('.dataexp').DataTable().destroy()
            this.ngOnInit();
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
      this.httpservice.updateProduct(this.productId, this.branch.value.id, this.updateProductFrm.value)
      .subscribe({
        next: data => {
          $('.dataexp').DataTable().destroy()
          // this.ngOnInit()
          this.sharedservice.refreshComponentFunc(this.router.url); 
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

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.dataexp').DataTable().destroy();
    this.sharedservice.infoFunc('', '', false, false, false)
  }


}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

