import { Component, NgZone } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../services/validationservices/validation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  manager:boolean = false;
  username = `${sessionStorage.getItem('username')}`
  userrole = `${sessionStorage.getItem('role')}`

  togglesideNav:boolean = false
  
  toggleMenu() {
    // console.log('Button clicked!'); // Verify if the click even triggers
    // this.validationService.toggleFunc();
    this.togglesideNav =!this.togglesideNav
  }

  constructor(
    public router: Router,
    private zone: NgZone,
    private sharedservice: SharedService,
    public validationService: ValidationService,
  ){
    let role = `${sessionStorage.getItem('role')}`
    if(role == 'Manager'){
        this.manager = true;
    }
  }

  ngAfterViewInit(): void {
    // Hide preloader once the view is fully initialized
   
    this.zone.runOutsideAngular(() => {
      const preloader = document.getElementById('global-loader') as HTMLDivElement;
      if (preloader) {
        preloader.style.display = 'none';

      }
    })
  }

}
