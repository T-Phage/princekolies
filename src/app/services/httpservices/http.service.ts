import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedService } from '../sharedservices/shared.service';

@Injectable({
  providedIn: 'root'
})

export class HttpService {
  // baseUrl = 'http://localhost/pos/public/api'
  // baseUrl = 'http://localhost/techne_app_2/public/api'
  baseUrl = 'https://techneservers.com/pos_api/api'
  // appToken = 'ZxcvkdmnvnbjkjewoMQ23'
  // appToken = sessionStorage.getItem('token') || '';
  appToken:string = '';
  role:string = '';
  dateError: boolean = false;
  allowedDate: Date = new Date('2025-02-22'); // Replace with your desired date

  constructor(
    private http: HttpClient,
    private sharedservice: SharedService,
    private router: Router,
  ) { }

  httpLogout() {
    this.http.post<any>(`${this.baseUrl}/auth/logout`, {}, {headers: this.getHeaders(),}).subscribe({
        next: data => {
          this.appToken = '';
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigate(['/auth/login'])
        },
        error: error => {
          alert("wht")
          this.appToken = '';
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigate(['/auth/login']);
        }
      });
  }

  httpself() {
    console.log('self')
    this.http.get<any>(`${this.baseUrl}/self`, {headers: this.getHeaders(),}).subscribe({
        next: data => {
          console.log('self')
          // console.log(data)
        },
        error: error => {
          console.log(error)
        },
        complete() {
          
        },
      });
  }

   // Set up headers
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token') || this.appToken}`, // Custom header
      'Content-Type': 'application/json', // Standard header
    });
  }
  
  httpLogin(body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'authenticating user...', true, true, true)
    const currentDate = new Date();
    // if (currentDate > this.allowedDate) {
    //   this.dateError = true;
    //   console.log("log")
    //   return;
    // }
    try {

      // console.log("something is happening")
      this.http.post<any>(`${this.baseUrl}/auth/login`, body, {headers: this.getHeaders(),}).subscribe({
        next: data => {
          this.sharedservice.infoFunc('alert alert-success', 'user authenticated', false, false, false)
          // console.log(data)
        
          sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('is_admin', data.is_admin)
          sessionStorage.setItem('email', data.user.email)
          sessionStorage.setItem('id', data.user.id)
          sessionStorage.setItem('role', data.user.role)
          sessionStorage.setItem('username', data.user.name)
          sessionStorage.setItem('user', JSON.stringify(data.user))

          this.appToken = data.token;
          this.role = data.role;

          // console.log(data)
          if(data.user.role == "Business_Owner"){
            this.router.navigate(['/dashboard/overview-dashboard'])
          }
          else if(data.user.role == "Manager"){
            this.router.navigate(['/dashboard/sales-dashboard'])
          } else {
            this.router.navigate(['/dashboard/pos'])
          }
          
          setTimeout(() => {
            this.sharedservice.infoFunc('', '', false, false, false)
          }, 3000)
          
        },
        error: error => {
          let msg = error.error.message
          // console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
        }
      })
    } catch(e){
      this.sharedservice.infoFunc('alert alert-danger', 'Network Error', false, false, false)
    }

  }

  getProducts(page: number, perPage: number): Observable<any> {
    // console.log("getting products", this.appToken)
    return this.http.get<any>(`${this.baseUrl}/products`, {headers: this.getHeaders()}) 
  }

  getProductsExpiring(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/expiry?page=${page}&per_page=${perPage}`, {headers: this.getHeaders()})
  }

  getStockedOutProducts(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/stocked-out?page=${page}&per_page=${perPage}`, {headers: this.getHeaders()})
  }

  getLowStockedProducts(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/stocked-low?page=${page}&per_page=${perPage}`, {headers: this.getHeaders()})
  }

  getSales(page: number, perPage: number) {
    return this.http.get<any>(`${this.baseUrl}/sales`, {headers: this.getHeaders()})
  }

  returnSale(id:any, body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating status...', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/sale/return/${id}`, body, {headers: this.getHeaders()}) //.subscribe({
  }

  getSalesReturns(page: number, perPage: number) {
    return this.http.get<any>(`${this.baseUrl}/sales/returns`, {headers: this.getHeaders()})
  }

  getCategories(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category?page=${page}&per_page=${perPage}`, {headers: this.getHeaders()});
  }

  createProduct(body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'adding new product...', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/add/product`, body, {headers: this.getHeaders()})

  }

  updateProduct(id: any, body:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating product...', true, true, true)
    return this.http.post(`${this.baseUrl}/product/update/${id}`, body, {headers: this.getHeaders()}) //.subscribe({
  }

  deleteProduct(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/product/delete/${id}`, {}, {headers: this.getHeaders()}) //.subscribe({
  }

  createCategory(body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'creating category... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/create/category`, body, {headers: this.getHeaders()})//.subscribe({
  }

  updateCategory(id: any, body:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating category...', true, true, true)
    return this.http.post(`${this.baseUrl}/category/update/${id}`, body, {headers: this.getHeaders()}) //.subscribe({
  }

  deleteCategory(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/category/delete/${id}`, {}, {headers: this.getHeaders()}) //.subscribe({
  }

  addNewSale(body: any, ele: ElementRef) {
    this.sharedservice.infoFunc('alert alert-info', 'saving data', true, true, true)        
    return this.http.post<any>(`${this.baseUrl}/add/sales`, body, {headers: this.getHeaders()}  )
  }

  deleteSale(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/delete/sale/${id}`, {}, {headers: this.getHeaders()}) //.subscribe({
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics`, {headers: this.getHeaders()} );
  }

  getSalesAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/analytics`, {headers: this.getHeaders()});
  }

  getUserSalesDateAnalytics(id:any, date:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/user/date/${id}/${date}`, {headers: this.getHeaders()});
  }
  getUserSalesDateAnalyticsAsAdmin(date:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/admin/date/${date}`, {headers: this.getHeaders()});
  }
  getallyears(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/all/years`, {headers: this.getHeaders()});
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users`, {headers: this.getHeaders()});
  }

  createUser(body: any) {
     this.sharedservice.infoFunc('alert alert-info', 'creating user... ', true, true, true)
     return this.http.post<any>(`${this.baseUrl}/auth/register`, body, {headers: this.getHeaders()})//.subscribe({
  }

  resetPasswordUser(id: any) {
    this.sharedservice.infoFunc('alert alert-info', 'reseting user password... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/user/reset-password/${id}`, {}, {headers: this.getHeaders()})
 }

  updateUser(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating user... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/auth/update/${id}`, body, {headers: this.getHeaders()})
  }
  deleteUser(id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'deleting user... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/auth/delete/${id}`, {}, {headers: this.getHeaders()})
  }

  updateProfile(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating profile... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/update/profile/${id}`, body, {headers: this.getHeaders()})
  }

  updatepassword(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating profile... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/update/password/${id}`, body, {headers: this.getHeaders()})
  }

  getbranches(){
    // this.sharedservice.infoFunc('alert alert-info', 'fetching branches... ', true, true, true)
    return this.http.get<any>(`${this.baseUrl}/branches`, {headers: this.getHeaders()})
  }

  getExpenses(){
    return this.http.get<any>(`${this.baseUrl}/expenses`, {headers: this.getHeaders()})
  }

  postExpenses(){
    return this.http.post<any>(`${this.baseUrl}/expenses`, {headers: this.getHeaders()})
  }

  postExpenseCategory(){
    return this.http.post<any>(`${this.baseUrl}/expense/category`, {headers: this.getHeaders()})
  }

  getExpenseCategory(){
    return this.http.get<any>(`${this.baseUrl}/expense/category`, {headers: this.getHeaders()})
  }

  // restock
  postRestock(body: any){
    return this.http.post<any>(`${this.baseUrl}/restock`, body, {headers: this.getHeaders()})
  }

  getAllCustomers(){
    return this.http.get<any>(`${this.baseUrl}/business/customers`, {headers: this.getHeaders()})
  }

  getAllDebtors(){
    return this.http.get<any>(`${this.baseUrl}/unpaid/sales`, {headers: this.getHeaders()})
  }

  makeSalePayment(body: any){
    return this.http.post<any>(`${this.baseUrl}/sale/edit/payment`, body, {headers: this.getHeaders()})
  }
  
}
