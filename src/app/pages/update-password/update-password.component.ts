import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../services/httpservices/http.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [ErrormodalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})

export class UpdatePasswordComponent {
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
    let rawUser = sessionStorage.getItem('user')
    if (rawUser !=  null){
      var user = JSON.parse(rawUser) 
      this.currentUser = user
    }
  }

  updatePasswordFrm = this.formBuilder.group({
    'old_password': [this.currentUser.phone_number],
    'new_password': [this.currentUser.name, Validators.min(8)],
    'c_password': [this.currentUser.email, Validators.min(8)],
  })

  submitForm(evt: Event){
    evt.preventDefault()
    console.log(this.updatePasswordFrm.value)
    console.log(this.updatePasswordFrm.valid)
    if(this.updatePasswordFrm.valid){
      this.httpservice.updatepassword(this.updatePasswordFrm.value, this.currentUser.id)
      .subscribe({
        next: async data => {
          this.sharedservice.infoFunc('alert alert-success', 'password updated', false, false, false)
          // console.log(data)
          setTimeout(()=>this.sharedservice.infoFunc('', '', false, false, false), 2000)
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
        }
      })
    }
  }
}
