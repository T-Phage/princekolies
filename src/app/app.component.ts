import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'princekolies';

  constructor(
    // private titleService: Title,
    public router: Router,
  ){
    console.log('app component loaded');
    let token = sessionStorage.getItem('token');
    let isAdmin = sessionStorage.getItem('is_admin');
    console.log (token)
    if (token == null){
      this.router.navigateByUrl('/auth/login')
    } else {
      if(isAdmin == 'true'){
        this.router.navigateByUrl('/dashboard/overview-dashboard')
      } else {
        this.router.navigateByUrl('/dashboard/pos')
      }
    }
  }
}
