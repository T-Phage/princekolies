import { CommonModule } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpService } from '../../services/httpservices/http.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { SharedService } from '../../services/sharedservices/shared.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ErrormodalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  schemas: [NO_ERRORS_SCHEMA,],
})
export class LoginComponent {

  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    public sharedservice: SharedService,
    private zone: NgZone,
    private router: Router,
  ) {
  }

  loginForm = this.formBuilder.group({
    email: ['', Validators.compose([Validators.email, Validators.required])],
    password: ['', Validators.compose([Validators.required])]
  })

  login(e: Event) {
    e.preventDefault()
    if (this.loginForm.valid) {
      this.httpService.httpLogin(this.loginForm.value)
    }
  }

  ngOnInit(){
    localStorage.clear();
    sessionStorage.clear();
    // let token = sessionStorage.getItem('token');
    // if (token != null){
    //   this.router.navigateByUrl('/')
    // }
  }

  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      const preloader = document.getElementById('global-loader') as HTMLDivElement;
      if (preloader) {
        setTimeout(() =>  preloader.style.display = 'none', 3000);
      }
      // $('#myTable').DataTable();  // Initialize jQuery DataTable outside Angular’s zone
    });
  }
}
