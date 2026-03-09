import { Component, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { SharedService } from '../../services/sharedservices/shared.service';
import { RouterLink } from '@angular/router';
import { DatabaleService } from '../../services/datatable/databale.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  users$!: Observable<any>
  users:any = []

  constructor(
    private httpservice: HttpService,
    private formbuilder: FormBuilder,
    public sharedservice: SharedService,
    private datatableservice: DatabaleService,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.users$ = this.httpservice.getUsers()
    // .subscribe({
    //   next: data => { 
    //     this.users = data.users
    //     this.users$ = of(this.users)
    //     console.log(data)
    //     setTimeout(() => {
    //         this.datatableservice.initiateDataTable();
    //     }, 2000);
        
    //   },
    //   error: _error => {}
    // });
    // this.httpservice.getUsers()
    // Ensure the value is a boolean on every change
  }

  selectedUser = {
    'name': '',
    'email': '',
    'phone_number': '',
    'role': '',
    'user_account': '',
    'status': [false],
  }

  userid: any;

  updateUserFrm = this.formbuilder.group({
    'name': ['', Validators.required],
    'email': ['', Validators.compose([Validators.required, Validators.email])],
    'phone_number': ['', Validators.required],
    'role': ['', Validators.required],
    'user_account': ['', Validators.required],
    'status': [false]
  })

  userClicked(id: any, name: string, email: string, phone_number: string, role: string, user_account: string) {
    this.updateUserFrm.controls.name.setValue(name)
    this.updateUserFrm.controls.email.setValue(email)
    this.updateUserFrm.controls.phone_number.setValue(phone_number)
    this.updateUserFrm.controls.role.setValue(role)
    this.updateUserFrm.controls.user_account.setValue(user_account)
    this.userid = id
  }

  newUserFrm = this.formbuilder.group({
    'name': ['', Validators.required],
    'email': ['', Validators.compose([Validators.required, Validators.email])],
    'phone_number': ['', Validators.required],
    'role': ['', Validators.required],
    'user_account': ['', Validators.required],
    'status': [false],
    'password': ['', Validators.required],
    'c_password': ['', Validators.compose([Validators.required, passwordMatchValidator('password', 'c_password')])],
  })

  resetPasswordTodefault(){
    this.httpservice.resetPasswordUser(this.userid).subscribe({
      next: data => {
        this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false)
        setTimeout(()=> this.sharedservice.infoFunc('', '', false, false, false), 5000)
      },
      error: error => {
        let msg = error.error.message
        console.error('error :', error)
        this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
        setTimeout(()=> this.sharedservice.infoFunc('', '', false, false, false), 5000)
      }
    })
  }

  createNewUser(e: Event) {
    console.log(this.newUserFrm.value)
    // $('.datanew').DataTable().destroy()
    // this.users$ = this.httpservice.getUsers()
    // setTimeout(()=>$('.datanew').DataTable(), 2000)
    // this.newUserFrm.controls.status.setValue(this.stringToBoolean(this.newUserFrm.controls.status.value))

    e.preventDefault()
    if (this.newUserFrm.valid) {
      this.httpservice.createUser(this.newUserFrm.value)
        .subscribe({
          next: async data => {
            this.sharedservice.infoFunc('alert alert-success', 'user created', false, false, false)
            console.log(data)
            $('.datanew').DataTable().destroy()
            $('.datanew ').empty()
            this.users$ = this.httpservice.getUsers()
            // this.users$.
            setTimeout(() => {
              this.sharedservice.infoFunc('', '', false, false, false)
              this.closeModalAndRefresh();
              //   $('.datanew').DataTable({
              //   "bFilter": true,
              //   // "sDom": 'fBtlpi',
              //   "dom": 'pftil',
              //   "ordering": true,
              //   "language": {
              //     search: ' ',
              //     sLengthMenu: '_MENU_',
              //     searchPlaceholder: "Search",
              //     info: "_START_ - _END_ of _TOTAL_ items",
              //     paginate: {
              //       next: ' <i class="fa fa-angle-right"></i>',
              //       previous: '<i class="fa fa-angle-left"></i> '
              //     },
              //   },
              //   initComplete: (_settings: any, _json: any) => {
              //     $('.dataTables_filter').appendTo('#tableSearch');
              //     $('.dataTables_filter').appendTo('.search-input');
              //     $('#info').appendTo('#info')
              //   },
              // })
            }, 1000)
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
  updateUser(e: Event) {
    console.log(this.updateUserFrm.value)
    e.preventDefault()
    if (this.updateUserFrm.valid) {
      this.httpservice.updateUser(this.updateUserFrm.value, this.userid)
        .subscribe({
          next: async data => {
            this.sharedservice.infoFunc('alert alert-success', 'user updated', false, false, false)
            console.log(data)
            $('.datanew').DataTable().destroy()
            $('.datanew ').empty()
            this.users$ = this.httpservice.getUsers()
            // this.users$.
            setTimeout(() =>{ 
              this.sharedservice.infoFunc('', '', false, false, false)
              this.closeModalAndRefresh();
              // $('.datanew').DataTable({
              //   "bFilter": true,
              //   // "sDom": 'fBtlpi',
              //   "dom": 'pftil',
              //   "ordering": true,
              //   "language": {
              //     search: ' ',
              //     emptyTable: "No data available in table",
              //     infoEmpty: "",
              //     sLengthMenu: '_MENU_',
              //     searchPlaceholder: "Search",
              //     info: "_START_ - _END_ of _TOTAL_ items",
              //     paginate: {
              //       next: ' <i class="fa fa-angle-right"></i>',
              //       previous: '<i class="fa fa-angle-left"></i> '
              //     },
              //   },
              //   initComplete: (_settings: any, _json: any) => {
              //     $('.dataTables_filter').appendTo('#tableSearch');
              //     $('.dataTables_filter').appendTo('.search-input');
              //     $('#info').appendTo('#info')
              //   },
              
              // })
              
            }, 1000)
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

   closeModalAndRefresh() {
    // Get the modal element
    const modalElement = document.getElementById('update-product');
    if (modalElement) {
      // Get Bootstrap modal instance and hide it
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Remove modal backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Restore body scroll
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    // Refresh the component
    this.sharedservice.refreshComponentFunc('dashboard/users');
  }
  hide:boolean = true;
  deleteUser() {
      this.httpservice.deleteUser(this.userid)
        .subscribe({
          next: async data => {
            this.sharedservice.infoFunc('alert alert-success', 'user deleted', false, false, false)
            console.log(data)
            $('.datanew').DataTable().destroy()
            $('.datanew ').empty()
            this.users$ = this.httpservice.getUsers()
            // this.users$.
            setTimeout(() =>{ 
              this.sharedservice.infoFunc('', '', false, false, false)

              $('.datanew').DataTable({
                "bFilter": true,
                // "sDom": 'fBtlpi',
                "dom": 'pftil',
                "ordering": true,
                "language": {
                  search: ' ',
                  emptyTable: "No data available in table",
                  infoEmpty: "",
                  sLengthMenu: '_MENU_',
                  searchPlaceholder: "Search",
                  info: "_START_ - _END_ of _TOTAL_ items",
                  paginate: {
                    next: ' <i class="fa fa-angle-right"></i>',
                    previous: '<i class="fa fa-angle-left"></i> '
                  },
                },
                initComplete: (_settings: any, _json: any) => {
                  $('.dataTables_filter').appendTo('#tableSearch');
                  $('.dataTables_filter').appendTo('.search-input');
                  $('#info').appendTo('#info')
                },
              
              })
              
            }, 1000)
            // $('#delete-units').modal('hide')
            // $('#delete-units').modal('hide').on('hidden.bs.modal', function () {
              // $('body').removeClass('modal-open'); // Ensure body scroll is enabled
              // $('body').css('overflow', 'auto');
              // $('.modal-backdrop').remove(); // Remove leftover backdrop
            // });
            this.hide = false;
            // setTimeout(()=>this.sharedservice.refreshComponentFunc('dashboard/users'), 2000)
          },
          error: error => {
            let msg = error.error.message
            console.error('error :', error)
            this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)

          }
        })
  }

  stringToBoolean(value: string): boolean | null {
    if (value.trim().toLowerCase() === 'true') return true;
    if (value.trim().toLowerCase() === 'false') return false;
    return null; // Invalid input, not a boolean
  }

  // ngAfterViewInit() {
  //   this.zone.runOutsideAngular(() => {
  //     setTimeout(() => {
  //       $('.datanew').DataTable({
  //         "bFilter": true,
  //         // "sDom": 'fBtlpi',
  //         "dom": 'pftil',
  //         "ordering": true,
  //         "language": {
  //           emptyTable: "No data available in table",
  //           infoEmpty: "",
  //           search: ' ',
  //           sLengthMenu: '_MENU_',
  //           searchPlaceholder: "Search",
  //           info: "_START_ - _END_ of _TOTAL_ items",
  //           paginate: {
  //             next: ' <i class="fa fa-angle-right"></i>',
  //             previous: '<i class="fa fa-angle-left"></i> '
  //           },
  //         },
  //         initComplete: (_settings: any, _json: any) => {
  //           $('.dataTables_filter').appendTo('#tableSearch');
  //           $('.dataTables_filter').appendTo('.search-input');
  //           $('#info').appendTo('#info')
  //         }
  //       })
  //     }, 1000)
  //   })
  // }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datanew').DataTable().destroy();
  }

}


export function passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const passwordControl = formGroup.get(password);
    const confirmPasswordControl = formGroup.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null; // Form controls haven't been created yet
    }

    const isMatch = passwordControl.value === confirmPasswordControl.value;
    return isMatch ? null : { passwordsMismatch: true };
  };
}