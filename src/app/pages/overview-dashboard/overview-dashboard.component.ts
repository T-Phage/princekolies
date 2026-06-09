import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import  Chart from 'chart.js/auto';
import { Observable } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private fb: FormBuilder,
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
  monthlySales:any;
  totalUnPaidSalesCash:number = 0;
  totalProductsPrice:number = 0;

  session_off:boolean = false;

  salesa:any;
  year = new Date().getFullYear();
  years$!: Observable<any>;
  products:any[] = [];
  totalPrice: number = 0;
  branches: any[] = [];

  username = '';
  selectedBranch:any = 0;

  branch = this.fb.group({
    'id': [sessionStorage.getItem('selected_branch')],
  })
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

    if(parseInt(`${this.branch.value.id}`) != 0 ){
      this.branchChange();
      return
    }
    this.httpservice.getProducts(1, 10).subscribe((products) => {
      this.totalPrice = this.calculateTotal(products);
      // console.log(this.totalPrice)
    });
      // this.httpservice.httpself();
    this.years$ = this.httpservice.getallyears()
      
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
        this.totalUnPaidSalesCash = data.totalUnPaidSalesCash
        this.branches = data.branches
        this.totalProductsPrice = data.totalProductsPrice
        this.monthlySales = data.monthlySales
        
        this.createChart()
        
        setTimeout(() => {
          this.selectedBranch = sessionStorage.getItem('selected_branch');
          console.log(this.selectedBranch)
        }, 100);

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
    // } else {

    // }
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
      const price = product.unit_price || 0;
      const quantity = product.quantity_in_stock || 0;
      return sum + price * quantity;
    }, 0);
  }

  createChart(){

    const data = {// values on X-Axis
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'August', 'Sep', 'Oct', 'Nov', 'Dec'], 
       datasets: [
        {
          label: "TCash Sales",
          data: [this.monthlySales['1'].total.toString(), this.monthlySales['2'].total.toString(), this.monthlySales['3'].total.toString(), this.monthlySales['4'].total.toString(), this.monthlySales['5'].total.toString(), this.monthlySales['6'].total.toString(), this.monthlySales['7'].total.toString(), this.monthlySales['8'].total.toString(), this.monthlyCashSales['9'].toString(), this.monthlySales['10'].total.toString(), this.monthlySales['11'].total.toString(), this.monthlySales['12'].total.toString()],
          backgroundColor: '#5078F2',
          borderColor: '#5078F2',
          tension: 0.1
        },
        {
          label: "Outright",
          data: [this.monthlySales['1'].outright.toString(), this.monthlySales['2'].outright.toString(), this.monthlySales['3'].outright.toString(), this.monthlySales['4'].outright.toString(), this.monthlySales['5'].outright.toString(), this.monthlySales['6'].outright.toString(), this.monthlySales['7'].outright.toString(), this.monthlySales['8'].outright.toString(), this.monthlyCashSales['9'].toString(), this.monthlySales['10'].outright.toString(), this.monthlySales['11'].outright.toString(), this.monthlySales['12'].outright.toString()],
          backgroundColor: '#dbf26e',
          borderColor: '#dbf26e',
          tension: 0.1
        },
        {
          label: "Credit",
          data: [`${this.monthlySales['1'].credit.toString()}`, `${this.monthlySales['2'].credit.toString()}`, `${this.monthlySales['3'].credit.toString()}`, `${this.monthlySales['4'].credit.toString()}`, `${this.monthlySales['5'].credit.toString()}`, `${this.monthlySales['6'].credit.toString()}`, `${this.monthlySales['7'].credit.toString()}`, `${this.monthlySales['8'].credit.toString()}`, `${this.monthlySales['9'].credit.toString()}`, `${this.monthlySales['10'].credit.toString()}`, `${this.monthlySales['11'].credit.toString()}`, `${this.monthlySales['12'].credit.toString()}`],
          backgroundColor: '#FF7878',
          borderColor: '#FF7878',
          tension: 0.1
        } 
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
            display: true
          },
        }
        // aspectRatio:2.5
      }
      
    });

  }

  branchChange() {
    const existingChart = Chart.getChart("MyChart"); // Use your canvas ID
    if (existingChart) {
        existingChart.destroy();
    }

    // Now create your new chart
    // new Chart(document.getElementById("MyChart"), config);
    var branch = `${this.branch.value.id}`;
    sessionStorage.setItem('selected_branch', branch)
    // console.log((evt.target as HTMLSelectElement).value)
    if (parseInt(`${this.branch.value.id}`) == 0){
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
        this.totalUnPaidSalesCash = data.totalUnPaidSalesCash
        this.totalPrice = this.calculateTotal(data.products)
        this.totalProductsPrice = data.totalProductsPrice
        this.branches = data.branches
        this.monthlySales = data.monthlySales

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
