import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpService } from '../../../services/httpservices/http.service';
import { SharedService } from '../../../services/sharedservices/shared.service';
import { DatabaleService } from '../../../services/datatable/databale.service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-saleanalytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './saleanalytics.component.html',
  styleUrl: './saleanalytics.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class SaleanalyticsComponent {

  errorLoading:boolean = false;

  salesa:any;
  public chart: any;
  recentSales:any[] = [];
  productSold:any[] = [];
  productsReceipts:any[] = [];
  username = ''
  salescount: any;
  cashAmount:any;

  loading = false;
  branches:any[] = [];

  submitted = true;
  no_of_branches = Number(sessionStorage.getItem('number_of_branches'));

  constructor(
    private httpservice: HttpService,
    private sharedservice: SharedService,
    private router: Router,
    private formbuilder: FormBuilder,
    private datableservice: DatabaleService,
  ) {}

  queryFrm = this.formbuilder.group({
    'startDate': ['', Validators.required],
    'endDate': ['', Validators.required],
    'branch_id': [0, Validators.required],
  })

  branchChange() {
    sessionStorage.setItem('selected_branch', `${this.queryFrm.get('branch_id')?.value}`)
  }

  refresh(){
    this.sharedservice.refreshComponentFunc(this.router.url)
  }

  submitQueryFrm(evt: Event){
    evt.preventDefault()

    // console.log("clicked")

    if(!this.queryFrm.valid){
      return
    }
    this.sharedservice.infoFunc('alert alert-info', 'Fetching report. Please wait...', true, true, true)
    this.httpservice.getSalesReport(this.queryFrm.value)
    .subscribe({
      next: data => {
        console.log(data);
        $('.products_receipts').DataTable().destroy()
        this.productSold = data.productsSold;
        this.productsReceipts = data.productsReceipts;
        this.cashAmount = data.cashAmount;
        this.salescount = data.salescount;
        this.sharedservice.infoFunc('alert alert-success', 'Report generated successfully. Close modal', false, false, false)
        this.datableservice.initiateDataTable('.products_receipts', 25)
        setTimeout(() => {
          this.sharedservice.infoFunc('', '', false, false, false) 
        }, 6000);
      },
      error: err => {
        console.log(err)
        setTimeout(() => {
          this.sharedservice.infoFunc('alert alert-danger', 'internal error', false, false, false) 
        }, 6000);
      },
    })
  }

  ngOnInit ():void {
    if(this.no_of_branches == 1){
      this.queryFrm.get('branch_id')?.setValue(parseInt(`${sessionStorage.getItem('user_branch')}`) || 0)
    }
    if(parseInt(`${sessionStorage.getItem('selected_branch')}`) != 0){
      this.queryFrm.get('branch_id')?.setValue(parseInt(`${sessionStorage.getItem('selected_branch')}`) || 0)
    }
    this.httpservice.getbranches()
    .subscribe({
      next: (res) => {
        this.branches = res
        // console.log(res);
        this.loading = false;
      },
      error: (err) => {
        this.errorLoading = true;
      }
    })
  }

  private generateTableHtml(): string {
    let tableHtml = '<table>\
                            <thead>\
                                <tr>\
                                    <th>#</th>\
                                    <th>Invoice No.</th>\
                                    <th>Product</th>\
                                    <th>Unit Cost (GHc)</th>\
                                    <th>Quantity</th>\
                                    <th>Purchase Price (GHc)</th>\
                                    <th>Amount Received (GHc)</th>\
                                    <th>Sale Cost (GHc)</th>\
                                </tr>\
                            </thead>\
                            <tbody>';
    this.productsReceipts.forEach((product, index) => {
      tableHtml += `<tr>
                        <td> ${index+1}
                        <td> ${product.receipt_no}</td>
                        <td> ${product.product}</td>
                        <td> ${product.unit_cost}</td>
                        <td> ${product.quantity}</td>
                        <td> ${product.purchase_price}</td>
                        <td> ${product.amount_received}</td>
                        <td> ${product.grand_total }</td>
                    </tr>`;
    });
    tableHtml += `<tr>
                      <td colspan="5"></td>
                      <td>Total</td>
                      <td>${this.cashAmount}</td>
                  </tr>`;
    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  exportTableToPDF() {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    var data = this.productsReceipts

    const columns = [
        { header: "Invoice No.", dataKey: "receipt_no"},
        { header: "Product", dataKey:"product"},
        { header: "Unit Cost", dataKey: "unit_cost"},
        { header: "Quantity", dataKey: "quantity"},
        { header: "Purchase Price", dataKey: "purchase_price"},
        { header: "Amount Received", dataKey: "amount_received"},
        { header: "Sale Cost", dataKey: "grand_total"},
        { header: "Date", dataKey: "created_at"}
    ];
    autoTable(doc, {
        columns: columns,
        body: data,
        foot: [[
          { content: `Total Items: ${this.productsReceipts.length}`, colSpan: 1, styles: { fontStyle: 'bold' } },
          { content: `Total Price: ${this.cashAmount}`, colSpan:1, styles: {fontStyle: 'bold'} },
          // { content: `Momo: ${this.momo}`, colSpan:1, styles: {fontStyle: 'bold'} },
          // { content: `Cash: ${this.cashIn}`, colSpan:1, styles: {fontStyle: 'bold'} },
          // { content: `Feed: `, styles: { fontStyle: 'bold', halign: 'right' } },
          // { content: `Others: `, styles: { fontStyle: 'bold', halign: 'right' } }
        ]],
        theme: 'grid'
    });

    // Save the generated PDF
    doc.save('princekolies_sales_from'+this.queryFrm.value.startDate+'_to_'+this.queryFrm.value.endDate+'.pdf');
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

}
