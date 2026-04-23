import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import  Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SwalservicesService } from '../../services/swal/swalservices.service';

declare var $: any;

@Component({
  selector: 'app-sales-dashb0ard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './sales-dashb0ard.component.html',
  styleUrl: './sales-dashb0ard.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class SalesDashb0ardComponent {
  $sales!: Observable<any>;
  branches$!: Observable<any>;

  branches:any[] = [];

  errorLoading:boolean = false;

  salesa:any;
  public chart: any;
  recentSales:any[] = [];
  productSold:any[] = [];
  productsReceipts:any[] = [];
  username = ''
  salescount: any;
  todayCashAmount:any;
  percentageIncrease:number = 0;
  lowStock:number = 0;
  out_of_stock:number = 0;
  expiryStock:number = 0;
  products_expiryLen:number = 0;
  momo:number = 0;
  cashIn:number = 0;
  bankCashIn:number = 0;  

  years$!: Observable<any>;

  today = new Date();
  formattedDate = this.today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  year = new Date().getFullYear();

  selectedDate:any = this.today.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input[type="date"]
  
  manager:boolean = false;
  owner:boolean = false;
  userrole = this.httpservice.getUserRole()

  loading: boolean = false;

  rolemain = '';

  constructor(
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private router: Router,
    private formbuilder: FormBuilder,
    private swalservice: SwalservicesService,
  ){
    // let role = `${sessionStorage.getItem('role')}`
    let role = this.httpservice.getUserRole();
    if(role == 'Manager'){
        this.manager = true;
    }
    if(role == 'Business_Owner'){
      this.owner = true;
    }
    let user = sessionStorage.getItem('user')
    if (user != null || user != undefined){
      let jsonUser = JSON.parse(user)
      this.username = jsonUser.name
    } else {
      router.navigate(['/auth/login'])
    }

  }

  branch = this.formbuilder.group({
    'id': [sessionStorage.getItem('selected_branch')]
  })

  branchChange(){
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.loadPageByBranch()
  }

  todayDateChange(e: Event){
    this.loading = true;
    // getUserSalesDateAnalyticsAsAdmin
    this.selectedDate = (e.target as HTMLInputElement).value
    // console.log('date',new Date(this.selectedDate).toISOString().split('T')[0])
    this.salescount = 0
    this.todayCashAmount = 0
    this.momo = 0;
    this.cashIn = 0;
    this.bankCashIn = 0;
    this.productSold = []
    this.productsReceipts = [];
    // this.httpservice.getUserSalesDateAnalytics(sessionStorage.getItem('id'), new Date(this.selectedDate).toISOString().split('T')[0]).subscribe({
    if (this.userrole != "Business_Owner" && this.userrole != "Account_Officer"){ // if user is not business Owner
      this.httpservice.getUserSalesDateAnalyticsAsAdmin(new Date(this.selectedDate).toISOString().split('T')[0]).subscribe({
        next: data => {
          // console.log(data)
          this.salescount = data.salesCount
          this.todayCashAmount = data.cashSalesTotal
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.percentageIncrease = data.percentage_increase
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts
          this.loading = false;
        },
        error: error => {
          let msg = error.error.message
          console.log('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (()=>{
          this.loading = false;
        }),
      })
      return
    } 

    if (this.branch.value.id == null || this.branch.value.id == '0') {
      this.httpservice.getUserSalesDateAnalyticsAsAdmin(new Date(this.selectedDate).toISOString().split('T')[0]).subscribe({
        next: data => {
          // console.log(data)
          this.salescount = data.salesCount
          this.todayCashAmount = data.cashSalesTotal
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.percentageIncrease = data.percentage_increase
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts
          this.loading = false;
        },
        error: error => {
          let msg = error.error.message
          console.log('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (()=>{
          this.loading = false;
        }),
      })
      return
    }

    this.httpservice.getBranchSalesDateAnalyticsAsAdmin(new Date(this.selectedDate).toISOString().split('T')[0], this.branch.value.id).subscribe({
        next: data => {
          // console.log(data)
          this.salescount = data.salesCount
          this.todayCashAmount = data.cashSalesTotal
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.percentageIncrease = data.percentage_increase
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts
          this.loading = false;
        },
        error: error => {
          let msg = error.error.message
          console.log('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (()=>{
          this.loading = false;
        }),
      })
    
  }

  loadPageByBranch() {
    this.loading = true;
    this.httpservice.getBranchSalesAnalytics(this.branch.value.id).subscribe({
        next: data => {
          console.log(data)
          this.salescount = data.salesCount
          this.todayCashAmount = data.todayCashAmount
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.percentageIncrease = data.percentage_increase
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts
          this.loading = false;
        },
        error: error => {
          let msg = error.error.message
          console.log('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (()=>{
          this.loading = false;
        }),
      })
  }

  refresh(){
    let url = this.router.url;
    this.sharedservice.refreshComponentFunc(url)
  }

  ngOnInit(){
    // console.log('selected date:',this.selectedDate);

    if (this.userrole != 'Business_Owner' && this.userrole != 'Account_Officer')
    {
      this.loading = true;
      this.years$ = this.httpservice.getallyears()
      this.httpservice.getSalesAnalytics().subscribe({
        next: data => {
          // this.loading = false;
          // console.log(data)
          this.salesa = data.monthlySales
          this.salescount = data.todaySales
          this.todayCashAmount = data.todayCashAmount
          this.percentageIncrease = data.percentage_increase
          this.products_expiryLen = data.products_expiryLen
          this.lowStock = data.low_stock
          this.out_of_stock = data.out_of_stock
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts;
          this.loading = false;
          // console.log(data.recentSales)
          // console.log(dara)
          //  if(this.manager){this.createChart()}
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (() => {
          this.loading = false;
        })
      })

      return
    }

    if(parseInt(`${sessionStorage.getItem('selected_branch')}`) != 0){
      this.branch.get('id')?.setValue(`${sessionStorage.getItem('selected_branch')}`)
    } else {
      this.loading = true;
      this.years$ = this.httpservice.getallyears()
      this.httpservice.getSalesAnalytics().subscribe({
        next: data => {
          // this.loading = false;
          // console.log(data)
          // this.todayCashAmount = data.todayCashAmount
          this.salesa = data.monthlySales
          this.salescount = data.todaySales
          this.todayCashAmount = data.todayCashAmount
          this.percentageIncrease = data.percentage_increase
          this.products_expiryLen = data.products_expiryLen
          this.lowStock = data.low_stock
          this.out_of_stock = data.out_of_stock
          this.momo = data.momo;
          this.cashIn = data.cash;
          this.bankCashIn = data.bank;
          this.productSold = data.productsSold;
          this.productsReceipts = data.productsReceipts;
          this.loading = false;
          // console.log(data.recentSales)
          console.log(data)
          //  if(this.manager){this.createChart()}
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.loading = false;
          this.errorLoading = true;
        },
        complete: (() => {
          this.loading = false;
        })
      })
      return
    }

    this.branches$ = this.httpservice.getbranches();

    this.loadPageByBranch()

  }

  createChart(){
    const data = {// values on X-Axis
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'August', 'Sep', 'Oct', 'Nov', 'Dec'], 
       datasets: [
        {
          label: "Monthly Sales",
          data: [this.salesa['1'].toString(), this.salesa['2'].toString(), this.salesa['3'].toString(), this.salesa['4'].toString(), this.salesa['5'].toString(), this.salesa['6'].toString(), this.salesa['7'].toString(), this.salesa['8'].toString(), this.salesa['9'].toString(), this.salesa['10'].toString(), this.salesa['11'].toString(), this.salesa['12'].toString()],
          backgroundColor: '#5078F2',
          borderColor: '#5078F2',
          tension: 0.1
        },
      ]
    }

    this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart

      data: data,
      options: {
        scales: {
          x: {
            grid: {
              display: false
            }
          },
        },
        plugins: {
          legend: {
            display: true
          },
        }
        // aspectRatio:2.5
      }
      
    });

  }

  yearChange(e: Event){
    var chartExist = Chart.getChart("MyChart"); // <canvas> id
    if (chartExist != undefined) { 
      chartExist.destroy(); 
    }
    this.year = parseInt(`${(e.target as HTMLAnchorElement).textContent}`)
    this.httpservice.getAnalytics().subscribe({
      next: data => {
        // console.log(data)
        this.salesa = data.monthlyCashSales
        this.createChart()
      },
      error: error => {
        let msg = error.error.message
        console.error('error :', error)
      }
    })
  }

  ngOnDestroy(){
    var chartExist = Chart.getChart("MyChart"); // <canvas> id
    if (chartExist != undefined) { 
      chartExist.destroy(); 
    }
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
                      <td>${this.todayCashAmount}</td>
                  </tr>`;
    tableHtml += `<tr>
                      <td colspan="5"></td>
                      <td>Cash</td>
                      <td>${this.cashIn}</td>
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
        { header: "Sale Cost", dataKey: "grand_total"}
    ];
    autoTable(doc, {
        columns: columns,
        body: data,
        foot: [[
          { content: `Total Items: ${this.productsReceipts.length}`, colSpan: 1, styles: { fontStyle: 'bold' } },
          { content: `Total Price: ${this.todayCashAmount}`, colSpan:1, styles: {fontStyle: 'bold'} },
          { content: `Momo: ${this.momo}`, colSpan:1, styles: {fontStyle: 'bold'} },
          { content: `Cash: ${this.cashIn}`, colSpan:1, styles: {fontStyle: 'bold'} },
          // { content: `Feed: `, styles: { fontStyle: 'bold', halign: 'right' } },
          // { content: `Others: `, styles: { fontStyle: 'bold', halign: 'right' } }
        ]],
        theme: 'grid'
    });

    // Save the generated PDF
    doc.save('princekolies_sales'+(this.selectedDate)+'.pdf');
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
