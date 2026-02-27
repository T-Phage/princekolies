import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';
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
  username = ''
  salescount: any;
  todayCashAmount:any;
  percentageIncrease:number = 0;

  years$!: Observable<any>;

  today = new Date();
  formattedDate = this.today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  year = new Date().getFullYear();

  
  manager:boolean = false;
  userrole = `${sessionStorage.getItem('role')}`

  constructor(
    private httpservice: HttpService,
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

  ngOnInit(){
    this.years$ = this.httpservice.getallyears()
    this.httpservice.getSalesAnalytics(sessionStorage.getItem('id'), this.year, sessionStorage.getItem('role')).subscribe({
      next: data => {
        // console.log(data)  
        this.salesa = data.monthlySales
        this.recentSales = data.recentSales 
        this.salescount = data.todaySales
        this.todayCashAmount = data.todayCashAmount
        this.percentageIncrease = data.percentage_increase
        console.log(data.recentSales)
         if(this.manager){this.createChart()}
      },
      error: error => {
        let msg = error.error.message
        console.error('error :', error)
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

}
