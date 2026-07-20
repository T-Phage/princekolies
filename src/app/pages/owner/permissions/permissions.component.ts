import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import { HttpService } from '../../../services/httpservices/http.service';
import { SharedService } from '../../../services/sharedservices/shared.service';
import { Observable } from "rxjs";

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, ErrormodalComponent],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent {
  users$!:Observable<any>;
  role = this.httpservice.getUserRole()

  permissions:any[] = [];

  constructor(
    private httpservice: HttpService,
    public sharedservice: SharedService,
  ) {}

  ngOnInit(): void {
    this.users$ = this.httpservice.getUsers()
  }
}
