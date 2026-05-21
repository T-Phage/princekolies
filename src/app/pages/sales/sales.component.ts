import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { PrintService } from '../../services/print/print.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import * as XLSX from 'xlsx';
import FileSaver, { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [ReactiveFormsModule, ErrormodalComponent, CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  providers: [CurrencyPipe]
})
export class SalesComponent implements OnInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;  

  products$!: Observable<any>;
  branches$!: Observable<any>;

  sales$!: Observable<any>;

  sales: any[] = []
  products: any[] = []

  selectedProduct: any;

  role = this.httpservice.getUserRole();

  constructor(
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private printservice: PrintService,
    private datableservice: DatabaleService,
    private router: Router,
  ) { 
    
  }

  branch = this.formBuilder.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  clickedSale = {
    customer_name: '',
    reference: '',
    status: '',
    grand_total: 0.0,
    amount_paid: 0.0,
    payment_status: '',
    biller: '',
    items: [],
    returns: [],
    extra_services:[],
    discount: 0.0,
  }

  branchChange(){
    if (Number(`${this.branch.value.id}`) == 0){
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.datasales').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)

    this.httpservice.getBranchSales(this.branch.value.id)
      .subscribe({
        next: data => {
          // console.log(data)
          this.sales = data
            
          this.sharedservice.infoFunc('', '', false, false, false);
          this.datableservice.initiateDataTable('.datasales', 50);
        
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

  saleClicked(customer_name:any,reference:any,status:any,grand_total:any,payment_status:any,amount_paid:any,biller:any,items:any, returns:any, sale:any){
    this.clickedSale.customer_name = customer_name
    this.clickedSale.reference = reference
    this.clickedSale.status = status
    this.clickedSale.grand_total = Number(grand_total)
    this.clickedSale.amount_paid = amount_paid
    this.clickedSale.payment_status = payment_status
    this.clickedSale.biller = biller
    this.clickedSale.items = items
    this.clickedSale.returns = returns || []
    this.clickedSale.extra_services = JSON.parse(sale.extra_services) || []
    this.clickedSale.discount = Number(sale.discount) || 0.0

    console.log(this.clickedSale)
  }

  ngOnInit(): void {
    this.sharedservice.infoFunc('alert alert-info', 'fetching branch sales...  ', true, true, true);
    this.products$ = this.httpservice.getProducts(1, 10)
    this.branches$ = this.httpservice.getbranches()

    if (this.role != 'Business_Owner' && this.role != 'Account_Officer') {
      
      this.httpservice.getSales(1, 10)
      .subscribe({
        next: data => {
          this.sales = data;
          // console.log(data)
          this.datableservice.initiateDataTable('.datasales', 50);
          
          this.sharedservice.infoFunc('', '', false, false, false);
          
        },
        error: _err => {
          this.sharedservice.infoFunc('', '', false, false, false);
          if(_err.error.staus === 401){
            this.httpservice.httpLogout()
          }
        }
      })
      return
    }

    if (this.branch.value.id == null || this.branch.value.id == '0') {
      setTimeout(() => {
          this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
      }, 4500);

        return
    }

    this.httpservice.getBranchSales(this.branch.value.id)
      .subscribe({
        next: data => {
          // console.log(data)
          this.sales = data

          this.sharedservice.infoFunc('', '', false, false, false);
          this.datableservice.initiateDataTable('.datasales', 50);
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

  // Function to calculate the grand total


  currentDate = new Date()

  printTable() {
    const printWindow = window.open('', '_blank');  // Open a new window
    if (printWindow) {
      const tableHtml = this.generateTableHtml();  // Generate the table HTML
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Sales Table</title>
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h2>Sales Table</h2>
            ${tableHtml}
          </body>
        </html>
      `);
      printWindow.document.close();  // Close the document to finish loading
    }
  }

  // Generate the HTML for the table
  private generateTableHtml(): string {
    let tableHtml = '<table><thead><tr><th>Customer Name</th><th>Reference</th><th>Date Created</th><th>Status</th><th>Grand Total</th><th>Biller</th><th>Payment Status</th></tr></thead><tbody>';
    this.sales.forEach(sale => {
      tableHtml += `<tr>
                      <td>${sale.customer_name}</td>
                      <td>${sale.reference}</td>
                      <td>${new Date(sale.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</td>
                      <td>${sale.status}</td>
                      <td>${sale.grand_total}</td>
                      <td>${sale.biller}</td>
                      <td>${sale.payment_status}</td>
                    </tr>`;
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  // Method to export the product table to Excel
  exportToExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.sales);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Sales Table': worksheet },
      SheetNames: ['Sales Table']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'sales_table');
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
    doc.save('sales_table.pdf');
  }

  // deleteSale(){
  //   this.httpservice.deleteSale(this.clickedSale.reference)
  //   .subscribe({
  //     next: data => {
  //       this.sharedservice.infoFunc('alert alert-success', 'record deleted', false, false, false)
      
  //       this.products$ = this.httpservice.getProducts(1, 10);
  //       $('.datasales').DataTable().destroy()
  //       this.httpservice.getSales(1, 10)
  //       .subscribe({})
  //       setTimeout(() =>{ 
  //         this.sharedservice.infoFunc('', '', false, false, false)
  //         this.datableservice.initiateDataTable('.datasales', 25);
  //       }, 100)
  //       this.hide = false
  //       // $('#delete-sale-units').modal('hide').on('hidden.bs.modal', function () {
  //       //   $('body').removeClass('modal-open'); // Ensure body scroll is enabled
  //       //   $('body').css('overflow', 'auto');
  //       //   $('.modal-backdrop').remove(); // Remove leftover backdrop
  //       // });
  //     },
  //     error: error => {
  //       let msg = error.error.message
  //       console.error('error :', error)
  //       this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
  //       setTimeout(()=>{
  //         this.sharedservice.infoFunc('', '', false, false, false)
          
  //       }, 5000)
  //     }
  //   })
  // }
  hide:boolean = true;
  refreshData(){
    $('.datasales').DataTable().destroy();
    this.sharedservice.refreshComponentFunc(this.router.url)
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datasales').DataTable().destroy();
  }

}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
