import { Component, AfterViewInit } from '@angular/core';
import { ScriploadService } from '../../../services/scriptload/scripload.service';
import { FormBuilder, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { HttpService } from '../../../services/httpservices/http.service';
import { SharedService } from '../../../services/sharedservices/shared.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import { DatabaleService } from '../../../services/datatable/databale.service';

declare var $: any;

@Component({
  selector: 'app-product-audit',
  standalone: true,
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, CommonModule, ErrormodalComponent],
  templateUrl: './product-audit.component.html',
  styleUrl: './product-audit.component.css'
})
export class ProductAuditComponent {

  products$!: Observable<any>;
  branches$!: Observable<any>;
  auditData: any[] = [];
  no_of_branches = Number(sessionStorage.getItem('number_of_branches'));

  constructor(
    private scriptLoader: ScriploadService,
    private fb: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private datableservice: DatabaleService,
  ) {}

  auditForm = this.fb.group({
    'product': [''],
    // 'reason': [''],
    'branch': [''],
    'startDate': [''],
    'endDate': ['']
  });

  queryAudit(evt: Event) {
    $('.dataaudit').DataTable().destroy();
    console.log('clicked')
    evt.preventDefault();
    this.auditData = [];
    // console.log(this.auditForm.value);

    this.httpservice.auditProduct(this.auditForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.auditData = res; // Store the fetched audit data
        this.sharedservice.infoFunc('alert alert-success', 'Audit data fetched successfully! ', false, false, false)
        setTimeout(() => {
          this.datableservice.initiateDataTable('.dataaudit', 20);
          this.sharedservice.infoFunc('', '', false, false, false)
        }, 500);
      },
      error: (err) => {
        this.sharedservice.infoFunc('alert alert-danger', 'Error fetching audit data! ', false, false, false)
        console.log(err);
      }
    });
  }

  ngOnInit() {
    this.products$ = this.httpservice.getProducts(0, 0);
    this.branches$ = this.httpservice.getbranches();
  }

  ngOnDestroy() {
    $('.dataaudit').DataTable().destroy();
    this.sharedservice.infoFunc('', '', false, false, false);
  }

}
