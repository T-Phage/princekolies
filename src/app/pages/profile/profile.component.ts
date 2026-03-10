import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ErrormodalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
  ) { 
  }
  
  currentUser:any = {
    phone_number: '',
    name: '',
    email: ''
  };
  
  ngOnInit(){
    this.httpservice.httpself(); 
    let rawUser = sessionStorage.getItem('user')
    if (rawUser !=  null){
      var user = JSON.parse(rawUser) 
      this.currentUser = user
    }
  }

  updateProfileFrm = this.formBuilder.group({
    'phone_number': [this.currentUser.phone_number],
    'name': [this.currentUser.name, Validators.required],
    'email': [this.currentUser.email, Validators.email],
  })
 
  submitForm(evt: Event){
    evt.preventDefault()
    console.log(this.updateProfileFrm.value)

    if(this.updateProfileFrm.valid){
      this.httpservice.updateProfile(this.updateProfileFrm.value, this.currentUser.id)
      .subscribe({
        next: async data => {
          this.sharedservice.infoFunc('alert alert-success', 'profile updated', false, false, false)
          console.log(data)
          

          sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('is_admin', data.is_admin)
          sessionStorage.setItem('email', data.user.email)
          sessionStorage.setItem('id', data.user.id)
          sessionStorage.setItem('role', data.user.role)
          sessionStorage.setItem('username', data.user.name)
          sessionStorage.setItem('user', JSON.stringify(data.user))
          // this.users$.
          setTimeout(() => this.sharedservice.infoFunc('', '', false, false, false), 3000)
          // setTimeout(()=>this.sharedservice.refreshComponentFunc('dashboard/users'), 2000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)

        }
      })
    }
  }

  ngAfterViewInit(){
    this.updateProfileFrm.controls.email.setValue(this.currentUser.email)
    this.updateProfileFrm.controls.name.setValue(this.currentUser.name)
    this.updateProfileFrm.controls.phone_number.setValue(this.currentUser.phone_number)
  }

}
