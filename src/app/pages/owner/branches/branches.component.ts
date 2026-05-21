import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpService } from '../../../services/httpservices/http.service';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedService } from '../../../services/sharedservices/shared.service';
import { DatabaleService } from '../../../services/datatable/databale.service';
import { SwalservicesService } from '../../../services/swal/swalservices.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})

export class BranchesComponent {
  branches$!: Observable<any>;
  users$!: Observable<any>;
  branches:any[] = [];
  hide = false;
  submitted = false;
  constructor(
    private httpservice: HttpService,
    private fb: FormBuilder,
    public sharedservice: SharedService,
    private datable: DatabaleService,
    private swalservice: SwalservicesService,
    private router: Router,
  ){}

  selectedBranchId:any;

  branchClicked(branch:any){
    // console.log(branch);

    this.updateBranchFrm.get('location')?.setValue(branch.location);
    this.updateBranchFrm.get('branch_name')?.setValue(branch.branch_name);
    this.updateBranchFrm.get('branch_manager')?.setValue(branch.branch_manager);
    this.selectedBranchId = branch.id;
  }

  refresh(){
    this.sharedservice.refreshComponentFunc(this.router.url);
  }

  updateBranch(evt: Event){
    this.sharedservice.infoFunc('alert alert-info', 'updating branch details...', true, true, true)
    if(!this.updateBranchFrm.valid){
      this.swalservice.fireError('Please fill all required fields with valid data')
      this.sharedservice.infoFunc('', '', false, false, false);
      return
    }

    this.httpservice.patchbranches(this.selectedBranchId, this.updateBranchFrm.value).subscribe({
      next: (data)=>{
        $('.databranches').DataTable().destroy();
        this.swalservice.fireSuccess('Branch updated successfully')
        this.sharedservice.infoFunc('', '', false, false, false)
        this.ngOnInit();
      },
      error: (err)=>{
        this.swalservice.fireError('An error occurred while updating branch');
        this.sharedservice.infoFunc('', '', false,false,false)
        console.log(err)
      }
    })
  }
  updateBranchFrm = this.fb.group({
    location: ['', Validators.required],
    branch_name: ['', Validators.required],
    branch_manager : [],
  }) 

  newBranchFrm = this.fb.group({
    location: ['', Validators.required],
    branch_name: ['', Validators.required],
    branch_code: ['', Validators.required],
    branch_manager : ['', ],
  }) 

  newBranch(evt: Event){
    this.sharedservice.infoFunc('alert alert-info', 'creating new branch...', true,true,true)
    evt.preventDefault();
    
    console.log(this.newBranchFrm)
    if(!this.newBranchFrm.valid){
      this.swalservice.fireError('Please fill all required fields with valid data')
      this.sharedservice.infoFunc('', '', false,false,false)
      return
    }

    this.httpservice.postbranches(this.newBranchFrm.value).subscribe({
      next: (data)=>{
        $('.databranches').DataTable().destroy();
        this.sharedservice.infoFunc('', '', false, false, false)
        this.swalservice.fireSuccess('Branch created successfully')
        this.ngOnInit();
      },
      error: (err)=>{
        this.swalservice.fireError('An error occurred while creating branch')
        this.sharedservice.infoFunc('alert alert-danger', 'Failed to create branch', false, false, false)
        setTimeout(()=>{
          this.sharedservice.infoFunc('', '', false, false, false)  
        }, 4000);
        console.log(err)
      }
    })
  }

  ngOnInit():void {
    // console.log('update',this.updateBranchFrm)
    // console.log('new',this.newBranchFrm)
    this.sharedservice.infoFunc('','',false,false,false)
    this.users$ = this.httpservice.getUsers();
    this.branches$ = this.httpservice.getbranches();
    this.branches$.subscribe({
      next: (data)=>{
        console.log(data)
        this.branches = data
        this.datable.initiateDataTable('.databranches', 10);
      },
      error: (err) => {
        console.log(err)
        this.sharedservice.infoFunc('alert alert-danger','failed to fetch data',false,false,false)
      }
    })
  }

  ngOnDestroy(){
    this.sharedservice.infoFunc('', '', false, false, false)
    $('.databranches').DataTable().destroy();
  }
}
