import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Chart } from 'chart.js';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../services/sharedservices/shared.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-staff-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-sales.component.html',
  styleUrl: './staff-sales.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class StaffSalesComponent {
  loading:boolean = false
  $sales!: Observable<any>;

  salesa:any;
  public chart: any;
  recentSales:any[] = [];
  productSold:any[] = [];
  productsReceipts:any[] = [];
  username = '';
  salescount: any;
  todayCashAmount:any;
  percentageIncrease:number = 0;
  categorySales:any[] = [];

  momo:number = 0;
  cashIn:number = 0;
  bankCashIn:number = 0;
  productsSold:any = [];

  years$!: Observable<any>;

  today = new Date();
  formattedDate = this.today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // selectedDate: string = '2024-11-29';

  year = new Date().getFullYear();
  
  selectedDate = this.formattedDate
  onDateChange(event: any) {
    this.loading = true;
    this.selectedDate = event.target.value;
    this.httpservice.getUserSalesDateAnalytics(this.id, event.target.value).subscribe({
      next: data => {
        // console.log("woow",data)
        // console.log("woow",data.cashSalesTotal)
        // this.salesa = data.monthlySales
        // this.recentSales = data.recentSales
        this.salescount = data.salesCount
        this.todayCashAmount = data.cashSalesTotal
        this.momo = data.momo;
        this.cashIn = data.cash;
        this.bankCashIn = data.bank;
        this.percentageIncrease = data.percentage_increase
        this.productSold = data.productsSold;
        this.productsReceipts = data.productsReceipts
        this.categorySales = data.categorySales;
        // console.log(data.recentSales)
      },
      error: error => {
        let msg = error.error.message
        console.log('error :', error)
      },
      complete: ()=>{
        this.loading = false
      }
    })
  }

  manager:boolean = false;
  userrole = `${sessionStorage.getItem('role')}`

  constructor(
    private httpservice: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private sharedservice: SharedService,
  ){
    let role = `${sessionStorage.getItem('role')}`
    if(role == 'Manager'){
        this.manager = true;
    }
    let user = sessionStorage.getItem('user')
    if (user != null || user != undefined){
      let jsonUser = JSON.parse(user)
      this.username = jsonUser.name
    }    
  }
  refresh() {
    this.sharedservice.refreshComponentFunc(this.router.url);
  }
  id:any;
  name: any;

  ngOnInit(){
    this.loading = true;
    // Get the 'id' parameter from the route
    this.id = this.route.snapshot.paramMap.get('id');
    this.name = this.route.snapshot.paramMap.get('name');
    // console.log('Route ID:', this.id);

    // If the parameter can change while on the same component, subscribe to it:
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      this.name = params.get('name');
      console.log('Updated Route ID:', this.id);
    });

    // let date = new Date()[]
    this.years$ = this.httpservice.getallyears()
    this.httpservice.getUserSalesDateAnalytics(this.id, this.today.toISOString().split('T')[0]).subscribe({
      next: data => {
        console.log(data)
        this.salescount = data.salesCount
        this.todayCashAmount = data.cashSalesTotal
        this.momo = data.momo;
        this.cashIn = data.cash;
        this.bankCashIn = data.bank;
        this.percentageIncrease = data.percentage_increase
        this.productSold = data.productsSold;
        this.productsReceipts = data.productsReceipts
        this.loading = false
        this.categorySales = data.categorySales;
        // console.log(data.recentSales)
        //  if(this.manager){this.createChart()}
      },
      error: error => {
        let msg = error.error.message
        console.error('error :', error)
        this.loading = false
      },
      complete: ()=>{
        this.loading = false
      }
    })
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

    this.chart = new Chart("staffChart", {
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

  ngDestroy(){
     var chartExist = Chart.getChart("staffChart"); // <canvas> id
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
                          <td> ${index+1} </td>
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

     exportProductSoldTableToPDF() {
      // Create a new jsPDF instance
      const doc = new jsPDF();
  
      var data = this.productsReceipts
  
      const columns = [
          { header: "Product", dataKey:"product"},
          { header: "Unit Cost", dataKey: "unit_cost"},
          { header: "Quantity", dataKey: "quantity"},
          { header: "Total Cost", dataKey: ""},
          { header: "Sale Cost", dataKey: "grand_total"},
          { header: "Quantity At date", dataKey: "quantity_at_date"},
      ];
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
      doc.save('princekolies_sales_'+(this.username)+'_'+(this.selectedDate)+'.pdf');
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
