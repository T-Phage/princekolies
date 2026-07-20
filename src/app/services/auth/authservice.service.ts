import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {

  constructor() { }

  currentRole = signal<string | null>(sessionStorage.getItem('user_role'));
  accountType = signal<string | null>(sessionStorage.getItem('account_type'));

  login(token: string, role: string, accountType: string) {
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('user_role', role);
    sessionStorage.setItem('account_type', accountType);
    
    this.currentRole.set(role);
    this.accountType.set(accountType);
  }

  // Check if the BUSINESS has the right plan
  hasAccountType(allowedTypes: string[]): boolean {
    const type = this.accountType();
    return type ? allowedTypes.includes(type) : false;
  }

  // Check if the USER has the right job role
  hasRole(allowedRoles: string[]): boolean {
    const role = this.currentRole();
    return role ? allowedRoles.includes(role) : false;
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('auth_token') !== null;
  }
}
