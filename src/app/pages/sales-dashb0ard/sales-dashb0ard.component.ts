import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import  Chart from 'chart.js/auto';

declare var $: any;

@Component({
  selector: 'app-sales-dashb0ard',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './sales-dashb0ard.component.html',
  styleUrl: './sales-dashb0ard.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class SalesDashb0ardComponent {
  $sales!: Observable<any>;

  salesa:any;
  public chart: any;
  recentSales:any[] = [];
  productSold:any[] = [];
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
  userrole = `${sessionStorage.getItem('role')}`

  loading: boolean = true;

  constructor(
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private router: Router,
  ){
    let role = `${sessionStorage.getItem('role')}`
    if(role == 'Manager'){
        this.manager = true;
    }
    let user = sessionStorage.getItem('user')
    if (user != null || user != undefined){
      let jsonUser = JSON.parse(user)
      this.username = jsonUser.name
    } else {
      router.navigate(['/auth/login'])
    }

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
    // this.httpservice.getUserSalesDateAnalytics(sessionStorage.getItem('id'), new Date(this.selectedDate).toISOString().split('T')[0]).subscribe({
    this.httpservice.getUserSalesDateAnalyticsAsAdmin(new Date(this.selectedDate).toISOString().split('T')[0]).subscribe({
      next: data => {
        console.log(data)
        // console.log(data.salesCount)
        // console.log(data.cashSalesTotal)
        // console.log(data.momo)
        // console.log(data.cash)
        // console.log(data.bank)
        this.salescount = data.salesCount
        this.todayCashAmount = data.cashSalesTotal
        this.momo = data.momo;
        this.cashIn = data.cash;
        this.bankCashIn = data.bank;
        this.percentageIncrease = data.percentage_increase
        this.productSold = data.productsSold;
      },
      error: error => {
        let msg = error.error.message
        console.log('error :', error)
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
    console.log('selected date:',this.selectedDate);

    this.years$ = this.httpservice.getallyears()
    this.httpservice.getSalesAnalytics(sessionStorage.getItem('id'), this.year, sessionStorage.getItem('role')).subscribe({
      next: data => {
        // this.loading = false;
        console.log(data)
        this.salesa = data.monthlySales
        this.recentSales = data.recentSales 
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

        console.log(data.recentSales)
        // console.log(dara)
         if(this.manager){this.createChart()}
      },
      error: error => {
        let msg = error.error.message
        console.error('error :', error)
      },
      complete: (() => {
        this.loading = false;
      })
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

}
