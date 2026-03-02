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
  baseUrl = 'https://techneservers.com/pos_api/api'
  appToken = 'ZxcvkdmnvnbjkjewoMQ23'
  dateError: boolean = false;
  allowedDate: Date = new Date('2025-02-22'); // Replace with your desired date

  constructor(
    private http: HttpClient,
    private sharedservice: SharedService,
    private router: Router,
  ) { }

  httpLogout() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/'])
  }

   // Set up headers
   private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-App-Token': this.appToken, // Custom header
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

      console.log("something is happening")
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

          if(data.user.role == "Manager"){
            this.router.navigate(['/dashboard/overview-dashboard'])
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
    return this.http.get<any>(`${this.baseUrl}/products?page=${page}&per_page=${perPage}`) 
  }

  getProductsExpiring(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/expiry?page=${page}&per_page=${perPage}`)
  }

  getStockedOutProducts(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/stocked-out?page=${page}&per_page=${perPage}`)
  }

  getLowStockedProducts(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/stocked-low?page=${page}&per_page=${perPage}`)
  }

  getSales(page: number, perPage: number) {
    return this.http.get<any>(`${this.baseUrl}/sales`)
  }

  returnSale(id:any, body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating status...', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/sale/return/${id}`, body)
  }

  getSalesReturns(page: number, perPage: number) {
    return this.http.get<any>(`${this.baseUrl}/sales/returns`)
  }

  getCategories(page: number, perPage: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category?page=${page}&per_page=${perPage}`);
  }

  createProduct(body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'adding new product...', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/add/product`, body)

  }

  updateProduct(id: any, body:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating product...', true, true, true)
    return this.http.post(`${this.baseUrl}/product/update/${id}`, body) //.subscribe({
  }

  deleteProduct(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/product/delete/${id}`, {}) //.subscribe({
  }

  createCategory(body: any) {
    this.sharedservice.infoFunc('alert alert-info', 'creating category... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/create/category`, body)//.subscribe({
  }

  updateCategory(id: any, body:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating category...', true, true, true)
    return this.http.post(`${this.baseUrl}/category/update/${id}`, body) //.subscribe({
  }

  deleteCategory(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/category/delete/${id}`, {}) //.subscribe({
  }

  addNewSale(body: any, ele: ElementRef) {
    this.sharedservice.infoFunc('alert alert-info', 'saving data', true, true, true)        
    return this.http.post<any>(`${this.baseUrl}/add/sales`, body)
  }

  deleteSale(id: any) {
    // this.sharedservice.infoFunc('alert alert-info', 'deleting product...', true, true, true)
    return this.http.post(`${this.baseUrl}/delete/sale/${id}`, {}) //.subscribe({
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics`);
  }

  getSalesAnalytics(id:any, year:any, role:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/analytics/${id}/${year}/${role}`);
  }

  getUserSalesAnalytics(id:any, year:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/user/${id}/${year}`);
  }
  getUserSalesDateAnalytics(id:any, date:any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/user/date/${id}/${date}`);
  }
  getallyears(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/all/years`);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users`);
  }

  createUser(body: any) {
     this.sharedservice.infoFunc('alert alert-info', 'creating user... ', true, true, true)
     return this.http.post<any>(`${this.baseUrl}/auth/register`, body)
  }

  resetPasswordUser(id: any) {
    this.sharedservice.infoFunc('alert alert-info', 'reseting user password... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/user/reset-password/${id}`, {})
 }

  updateUser(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating user... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/auth/update/${id}`, body)
  }
  deleteUser(id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'deleting user... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/auth/delete/${id}`, {})
  }

  updateProfile(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating profile... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/update/profile/${id}`, body)
  }

  updatepassword(body: any, id:any) {
    this.sharedservice.infoFunc('alert alert-info', 'updating profile... ', true, true, true)
    return this.http.post<any>(`${this.baseUrl}/update/password/${id}`, body)
  }
  
}
