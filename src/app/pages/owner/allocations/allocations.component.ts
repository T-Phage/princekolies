import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpService } from '../../../services/httpservices/http.service';
import { SharedService } from '../../../services/sharedservices/shared.service';
import * as XLSX from 'xlsx';
import FileSaver, { saveAs } from 'file-saver';
import { ValidationService } from '../../../services/validationservices/validation.service';
import { ErrormodalComponent } from '../../../components/errormodal/errormodal.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { startWith, pairwise } from 'rxjs/operators';
import { SwalservicesService } from '../../../services/swal/swalservices.service';
import { DatabaleService } from '../../../services/datatable/databale.service';

@Component({
  selector: 'app-allocations',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ErrormodalComponent],
  templateUrl: './allocations.component.html',
  styleUrl: './allocations.component.css',
  schemas: [NO_ERRORS_SCHEMA],
  providers: [CurrencyPipe]
})
export class AllocationsComponent {
  products: any[] = [];
  branches:any[] = [];
  
    role:string = '';
  
    constructor(
      private httpservice: HttpService,
      public currency: CurrencyPipe,
      public valservice: ValidationService,
      private zone: NgZone,
      private formBuilder: FormBuilder,
      public sharedservice: SharedService,
      private datatableservice: DatabaleService,
      private router: Router,
    ) { 
    }

    getStock(product:any, branchId:number): number {
      try {
        const allocation = product.branches.find((b:any) => b.id === branchId);
        return allocation ? allocation.pivot.quantity_in_stock : 0;
      } catch (e) {
        return 0
      }
    }

    getTotalStock(product:any) {
      try{
        return product.branches.reduce((acc:number, cur:any) => Number(acc) + Number(this.getStock(product, cur.id)), 0);
      } catch(e) {
        return 0
      }
    }
    
    ngOnInit() {
      this.sharedservice.infoFunc('alert alert-info', 'fetching products allocations...  ', true, true, true);
      this.role = sessionStorage.getItem('role') || '';
      this.httpservice.getbranches()
      .subscribe({
        next: data => {
          this.branches = data
          // console.log(data)
        },
        error: _error => {
          console.log(_error);
        }
      })
  
      this.httpservice.getProducts(1, 0)
        .subscribe({
          next: data => {
            this.products = data.products
            // console.log(data)
            this.sharedservice.infoFunc('', '', false, false, false);
              // if (data.length > 0){
                setTimeout(() => {
                //   this.sharedservice.infoFunc('', '', false, false, false);
                  this.datatableservice.initiateDataTable('.dataallocation', 35);
                }, 200);
                return;
              // } 
          },
          error: _error => {
            this.sharedservice.infoFunc('', '', false, false, false);
            console.log(_error);
            // this.initDataTable();
            if(_error.error.staus === 401){
              this.httpservice.httpLogout()
            }
          }
        })
    }

    limit = 0
    updateAllocationFrm = this.formBuilder.group({
      'allocations': this.formBuilder.array([]),
    })

    get allocations() {
      return this.updateAllocationFrm.get('allocations') as FormArray;
    }
    productId:any;

    selectedItem:any = {};
  
    allocationClicked(id:any,name:any){
      // Reset the product ID first
      this.productId = null;
  
      // console.log('clicked',id, name)

      this.selectedItem = this.products.find((item:any) => item.id === id)
      // console.log(this.selectedItem)
  
      this.productId = id

      this.allocations.clear()

      for(var i=0;i<this.branches.length;i++){
        this.allocations.push(this.formBuilder.group({
          'branch_id': [this.branches[i].id, Validators.required],
          'branch_name': [this.branches[i].branch_name, Validators.required],
          'product_id': [this.productId, Validators.required],
          'product_name': [this.selectedItem.name, Validators.required],
          'quantity': [this.getStock(this.selectedItem, this.branches[i].id), Validators.compose([Validators.min(0), Validators.required])],
        }));
        // console.log(this.getStock(this.selectedItem, this.branches[i].id))
      }
      let limit = this.getTotalStock(this.selectedItem)
      this.updateAllocationFrm.get('allocations')?.setValidators([this.valservice.totalStockValidator(limit)]);
      this.updateAllocationFrm.get('allocations')?.updateValueAndValidity();

      this.setupAllocationSync()

      // console.log(this.updateAllocationFrm.value)
  
    }

    // Call this method after you populate your 'allocations' array
    setupAllocationSync() {
      this.allocations.controls.forEach((group, index) => {
        const quantityControl = group.get('quantity');
        
        if (quantityControl) {
          quantityControl.valueChanges
            .pipe(
              startWith(quantityControl.value),
              pairwise()
            )
            .subscribe(([prev, curr]) => {
              // Identify the other row (assuming only 2 rows exist)
              const otherIndex = index === 0 ? 1 : 0;
              const otherGroup = this.allocations.at(otherIndex);
              const otherQuantityControl = otherGroup.get('quantity');

              if (otherQuantityControl) {
                const diff = curr - prev;
                const newOtherValue = (otherQuantityControl.value || 0) - diff;

                // Update the other field without triggering its own valueChanges
                otherQuantityControl.setValue(newOtherValue, { emitEvent: false });
              }
            });
        }
      });
    }

    hide:boolean = true;
  
    submitUpdateFrm(event:Event){
      this.sharedservice.infoFunc('alert alert-info', 'allocating updated', true, true, true) 
      event.preventDefault();
  
      // console.log(this.updateAllocationFrm.value)
      // console.log(this.updateAllocationFrm)
      if(this.updateAllocationFrm.valid){
        this.httpservice.allocateProducts(this.updateAllocationFrm.value)
        .subscribe({
          next: data => {
            this.sharedservice.infoFunc('alert alert-success', 'product allocation updated', false, false, false) 
            $('.dataallocation').DataTable().destroy();

            const modalElement = document.getElementById('update-product');
            if (modalElement) {
              // Get Bootstrap modal instance and hide it
              const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
              if (modal) {
                modal.hide();
              }
            }
            
            setTimeout(()=> {
              // this.sharedservice.infoFunc('','', false,false,false)
              // Close the modal and clean up backdrop
              // this.ngOnInit();
              this.refreshData();
            }, 200)
          },
          error: error => {
            let msg = error.error.message
            console.error('error :', error)
            this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
            let fume = this.sharedservice.infoFunc
  
            setTimeout(()=>{
              fume('', '', false, false, false) 
            }, 5000)
          }
        })
      }
    }
    
    // Method to export the product table to Excel
    exportToExcel() {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.products);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Product Table': worksheet },
        SheetNames: ['Product Table']
      };
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'product_table');
    }
  
    // Save the Excel file
    saveAsExcelFile(buffer: any, fileName: string) {
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
    }
  
    exportTableToPDF() {
      // Create a new jsPDF instance
      const doc = new jsPDF();
  
      var data = this.products
  
      // Add table content using autoTable
  
      const columns = [
          { header: "Product", dataKey: "name" },
          { header: "Category", dataKey: "category_id" },
          { header: "Price", dataKey: "price" },
          { header: "Quantity", dataKey: "quantity" }
      ];
      autoTable(doc, {
          columns: columns,
          body: data,
          foot: [[
            { content: `Total Items: ${this.products.length}`, colSpan: 1, styles: { fontStyle: 'bold' } },
            { content: `Feed: `, styles: { fontStyle: 'bold', halign: 'right' } },
            { content: `Others: `, styles: { fontStyle: 'bold', halign: 'right' } }
          ]],
          theme: 'grid'
      });
  
      // Save the generated PDF
      doc.save('products_table_'+(new Date().toDateString().split('T')[0].replace(' ', '_'))+'.pdf');
    }
  
    printTable() {
      const printWindow = window.open('', '_blank');  // Open a new window
      if (printWindow) {
        const tableHtml = this.generateTableHtml();  // Generate the table HTML
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Product Table</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <h2>Product Table</h2>
              ${tableHtml}
            </body>
          </html>
        `);
        printWindow.document.close();  // Close the document to finish loading
      }
    }
  
    // Generate the HTML for the table
    private generateTableHtml(): string {
      let tableHtml = '<table><thead><tr><th>Product Name</th><th>Category</th><th>Quantity</th><th>Price</th></tr></thead><tbody>';
      this.products.forEach(product => {
        tableHtml += `<tr>
                        <td>${product.name}</td>
                        <td>${product.category_id}</td>
                        <td>${product.quantity}</td>
                        <td>${product.price}</td>
                      </tr>`;
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
    
    refreshData(){
      // location.reload();
      this.sharedservice.refreshComponentFunc(this.router.url);
    }
  
    ngOnDestroy(): void {
      // Destroy the DataTable to free up resources
      $('.dataallocation').DataTable().destroy();
      this.sharedservice.infoFunc('', '', false, false, false);
    }
  
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
