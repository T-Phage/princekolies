import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NetworkService } from './services/networkservice/network.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'exposale';

  isOffline: boolean = false;
  manager: boolean = false;
  owner: boolean = false;

  constructor(
    // private titleService: Title,
    public router: Router,
    private networkService: NetworkService,
  ){
    console.log('app component loaded');
    let token = sessionStorage.getItem('token');
    let role = `${sessionStorage.getItem('role')}`;
    // console.log (token)
    if (token == null){
      this.router.navigateByUrl('/auth/login')
    } else {
      if(role == 'Business_Owner'){
        this.owner = true;
        this.router.navigateByUrl('/dashboard/overview-dashboard')
      }
      else if(role == 'Manager'){
        this.manager = true;
        this.router.navigateByUrl('/dashboard/sales-dashboard')
      } else {
        this.router.navigateByUrl('/dashboard/pos')
      }
    }
  }

  ngOnInit() {
    this.networkService.onlineStatus$.subscribe((online: any) => {
      this.isOffline = !online;
    });
  }
}
