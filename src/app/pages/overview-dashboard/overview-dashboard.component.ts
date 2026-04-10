import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import  Chart from 'chart.js/auto';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-dashboard.component.html',
  styleUrl: './overview-dashboard.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe,]
})
export class OverviewDashboardComponent {

  public chart:any;
  constructor(
    private httpservice: HttpService,
    private sharedservice: SharedService,
    private router: Router,
  ){  }

  loading: boolean = true;
  errorLoading:boolean = false;

  productsLen: number = 0;
  expiryLen: number = 0;
  salesLen: number = 0;
  low_stock:number = 0;
  unpaidsales: number = 0;
  paidsales: number = 0;
  totalQuantity: number = 0;
  out_of_stock: number = 0;
  userscount: number = 0;
  totalPaidSalesForWeek:number = 0
  totalSalesAmountForWeek:number = 0
  totalSalesAmountForMonth:number = 0
  totalPaidSalesForMonth:number = 0
  recentProducts:any[] = [];
  expiringproducts:any[] = [];
  monthlyCashSales:any;
  totalPaidSalesCash:number = 0;

  session_off:boolean = false;

  salesa:any;
  year = new Date().getFullYear();
  years$!: Observable<any>;
  products:any[] = [];
  totalPrice: number = 0;
  branches: any[] = [];

  username = '';

  refresh(){
    const existingChart = Chart.getChart("MyChart"); // canvas ID
    if (existingChart) {
      existingChart.destroy();
    }
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  ngOnInit(): void {
    this.loading = false;
    this.username = sessionStorage.getItem('username') || '';
    this.httpservice.getProducts(1, 10).subscribe((products) => {
      this.totalPrice = this.calculateTotal(products);
      // console.log(this.totalPrice)
    });
    // this.httpservice.httpself();
    this.years$ = this.httpservice.getallyears()
    // this.sharedservice.loadScripts();
    this.httpservice.getAnalytics().subscribe({
      next: data => {
        // console.log(data)      
        this.productsLen = data.productLen
        this.salesLen = data.salesLen
        this.expiryLen = data.expiryLen
        this.low_stock = data.low_stock
        this.unpaidsales = data.unpaidsales
        this.paidsales = data.paidsales
        this.totalQuantity = data.totalQuantity
        this.out_of_stock = data.out_of_stock
        this.userscount = data.totalusers
        this.totalPaidSalesForWeek = data.totalPaidSalesForWeek
        this.recentProducts = data.recentProducts
        this.expiringproducts = data.products_expired
        this.monthlyCashSales = data.monthlyCashSales
        this.totalSalesAmountForWeek = data.totalSalesAmountForWeek
        this.totalSalesAmountForMonth = data.totalSalesAmountForMonth
        this.totalPaidSalesForMonth = data.totalPaidSalesForMonth
        this.totalPaidSalesCash = data.totalPaidSalesCash
        this.branches = data.branches

        this.createChart()
      },
      error: error => {
        let msg = error.error.message
        // console.error('error :', error)
        // console.log(msg)
        if (msg == 'Unauthenticated.' || error.status == 401 || msg == 'Token has expired' || msg == 'Invalid token') {
          this.session_off = true;
          setTimeout(()=>{
            this.session_off = true;
            this.httpservice.httpLogout()
          },300)
          // this.sharedservice.infoFunc('alert alert-danger', 'Session expired. Please login again.', false, false, false)
        }
      }
    })

    this.httpservice.getAnalytics().subscribe({
      next: data => {
        // console.log(data)  
        this.salesa = data    
        
      },
      error: error => {
        let msg = error.error.message
        // console.error('error :', error)
      }
    })
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
        this.monthlyCashSales = data.monthlyCashSales
        this.createChart()
      },
      error: error => {
        let msg = error.error.message
        // console.error('error :', error)
      }
    })
  }

  calculateTotal(products: any[]): number {
    return products.reduce((sum, product) => {
      const price = product.price || 0;
      const quantity = product.quantity || 0;
      return sum + price * quantity;
    }, 0);
  }

  createChart(){

    const data = {// values on X-Axis
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'August', 'Sep', 'Oct', 'Nov', 'Dec'], 
       datasets: [
        {
          label: "Monthly Cash Sales",
          data: [this.monthlyCashSales['1'].toString(), this.monthlyCashSales['2'].toString(), this.monthlyCashSales['3'].toString(), this.monthlyCashSales['4'].toString(), this.monthlyCashSales['5'].toString(), this.monthlyCashSales['6'].toString(), this.monthlyCashSales['7'].toString(), this.monthlyCashSales['8'].toString(), this.monthlyCashSales['9'].toString(), this.monthlyCashSales['10'].toString(), this.monthlyCashSales['11'].toString(), this.monthlyCashSales['12'].toString()],
          backgroundColor: '#5078F2',
          borderColor: '#FF4D4D',
          tension: 0.1
        },
        // {
        //   label: "Withdrawals",
        //   data: [this.analyticservice.stat[0].withdrawal.toString(), `${this.analyticservice.stat[1].withdrawal}`, `${this.analyticservice.stat[2].withdrawal}`, `${this.analyticservice.stat[3].withdrawal}`, `${this.analyticservice.stat[4].withdrawal}`, `${this.analyticservice.stat[5].withdrawal}`, `${this.analyticservice.stat[6].withdrawal}`, `${this.analyticservice.stat[7].withdrawal}`, `${this.analyticservice.stat[8].withdrawal}`, `${this.analyticservice.stat[9].withdrawal}`, `${this.analyticservice.stat[10].withdrawal}`, `${this.analyticservice.stat[11].withdrawal}`],
        //   backgroundColor: '#FF7878',
        //   borderColor: '#FF7878',
        //   tension: 0.1
        // },
        // {
        //   label: "Deposits",
        //   data: [`${this.analyticservice.stat[0].deposit}`, `${this.analyticservice.stat[1].deposit}`, `${this.analyticservice.stat[2].deposit}`, `${this.analyticservice.stat[3].deposit}`, `${this.analyticservice.stat[4].deposit}`, `${this.analyticservice.stat[5].deposit}`, `${this.analyticservice.stat[6].deposit}`, `${this.analyticservice.stat[7].deposit}`, `${this.analyticservice.stat[8].deposit}`, `${this.analyticservice.stat[9].deposit}`, `${this.analyticservice.stat[10].deposit}`, `${this.analyticservice.stat[11].deposit}`],
        //   backgroundColor: '#dbf26e',
        //   borderColor: '#dbf26e',
        //   tension: 0.1
        // } 
      ]
    }

    this.chart = new Chart("MyChart", {
      type: 'bar', //this denotes tha type of chart

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
            display: false
          },
        }
        // aspectRatio:2.5
      }
      
    });

  }

  selectedBranch:any = '';
  branchChange(evt: Event) {
    const existingChart = Chart.getChart("MyChart"); // Use your canvas ID
    if (existingChart) {
        existingChart.destroy();
    }
    // Now create your new chart
  // new Chart(document.getElementById("MyChart"), config);
    var branch = (evt.target as HTMLSelectElement).value
    // console.log((evt.target as HTMLSelectElement).value)
    if (parseInt(branch) == 0){
      // this.ngOnInit();
      return
    }

    this.loading = true;
    
    this.httpservice.getBranchAnalytics(branch).subscribe({
      next: data => {
        // console.log(data)  
        this.loading = false;   
        this.productsLen = data.productLen
        this.salesLen = data.salesLen
        this.expiryLen = data.expiryLen
        this.low_stock = data.low_stock
        this.unpaidsales = data.unpaidsales
        this.paidsales = data.paidsales
        this.totalQuantity = data.totalQuantity
        this.out_of_stock = data.out_of_stock
        this.userscount = data.totalusers
        this.totalPaidSalesForWeek = data.totalPaidSalesForWeek
        this.recentProducts = data.recentProducts
        this.expiringproducts = data.products_expired
        this.monthlyCashSales = data.monthlyCashSales
        this.totalSalesAmountForWeek = data.totalSalesAmountForWeek
        this.totalSalesAmountForMonth = data.totalSalesAmountForMonth
        this.totalPaidSalesForMonth = data.totalPaidSalesForMonth
        this.totalPaidSalesCash = data.totalPaidSalesCash
        this.totalPrice = this.calculateTotal(data.products)
        // this.branches = data.branches

        this.createChart()
      },
      error: error => {
        this.loading = false;
        let msg = error.error.message
        // console.error('error :', error)
        // console.log(msg)
        if (msg == 'Unauthenticated.' || error.status == 401 || msg == 'Token has expired' || msg == 'Invalid token') {
          this.session_off = true;
          setTimeout(()=>{
            this.session_off = true;
            this.httpservice.httpLogout()
          },300)
          return
          // this.sharedservice.infoFunc('alert alert-danger', 'Session expired. Please login again.', false, false, false)
        }
        this.errorLoading = true;
      }
    })
  }
}
