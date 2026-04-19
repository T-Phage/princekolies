import { Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
// import FileSaver, { saveAs } from 'file-saver';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { PrintService } from '../../services/print/print.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import { DatabaleService } from '../../services/datatable/databale.service';
// import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [ReactiveFormsModule, ErrormodalComponent, CommonModule],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.css'
})
export class ReturnsComponent {

    @ViewChild('receiptContent') receiptContent!: ElementRef;  
  
    hideBtn: boolean = true;
    products$!: Observable<any>;
    branches$!: Observable<any>;
  
    sales: any[] = []
    all_sales: any[] = []
    products: any[] = []
    
    selectedProduct: any;

    manager:boolean = false;
    owner:boolean = false;

    userRole = this.httpservice.getUserRole();
  
    // formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.UPC_A];
    scannedCode: string | null = null;
    hasTorch: boolean = false;
    isScannerVisible: boolean = true;
  
    barcodeData: string = '';
    inputBuffer: string = '';
    scanTimeout: any;
  
    constructor(
      private formBuilder: FormBuilder,
      private httpservice: HttpService,
      public sharedservice: SharedService,
      private printservice: PrintService,
      private dataTableservice: DatabaleService,
      private zone: NgZone,
    ) { 
      let role = `${sessionStorage.getItem('role')}`
      if(role == 'Manager'){
          this.manager = true;
      }
    }
  
    clickedSale = {
      customer_name: '',
      reference: '',
      status: '',
      grand_total: '',
      amount_paid: 0.0,
      payment_status: '',
      biller: '',
      items: [],
    }

    branch = this.formBuilder.group({
      'id': [sessionStorage.getItem('selected_branch')]
    });

    branchChange() {
      if (Number(`${this.branch.value.id}`) == 0){
        this.sharedservice.infoFunc('', '', false, false, false);
        this.hideBtn = true;
        return
      }

    this.sharedservice.infoFunc('alert alert-info', 'fetching branch products...  ', true, true, true);
    $('.returnstable').DataTable().destroy()
    sessionStorage.setItem('selected_branch', `${this.branch.value.id}`)
    this.httpservice.getByBranchProducts(this.branch.value.id)
      .subscribe({
        next: data => {
          // console.log(data)
          this.products = data
        }
      });

    this.httpservice.getBranchSales(this.branch.value.id)
    .subscribe({
      next: data => {
        // console.log(data) all_sales
        this.all_sales = data
      }
    });
    this.httpservice.getBranchSalesReturns(this.branch.value.id)
      .subscribe({
        next: data => {
          this.sales = data
          // Initialize DataTable after data loads
          setTimeout(() => {
            this.dataTableservice.initiateDataTable('.returnstable', 20);
            this.sharedservice.infoFunc('', '', false, false, false);
          }, 200);
        },
        error: _error => {
          console.log(_error);
          // this.initDataTable();
          if(_error.error.staus === 401){
            this.httpservice.httpLogout()
          }
        }
      })
      this.hideBtn = false;
    }
  
    saleClicked(customer_name:any,reference:any,status:any,grand_total:any,payment_status:any,amount_paid:any,biller:any,items:any){
      this.clickedSale.customer_name = customer_name
      this.clickedSale.reference = reference
      this.clickedSale.status = status
      this.clickedSale.grand_total = grand_total
      this.clickedSale.amount_paid = amount_paid
      this.clickedSale.payment_status = payment_status
      this.clickedSale.biller = biller
      this.clickedSale.items = items
  
      console.log(this.clickedSale)
    }
  
    ngOnInit(): void {
      this.sharedservice.infoFunc('alert alert-info', 'fetching branch returns...  ', true, true, true);
      this.branches$ = this.httpservice.getbranches()
      this.userRole = this.httpservice.getUserRole();
      if(this.userRole !== 'Business_Owner'){
      
        this.httpservice.getSalesReturns(1, 10).subscribe({
          next: data => {
            this.sales = data
            // console.log(this.sales)
            this.dataTableservice.initiateDataTable('.returnstable', 15)
            this.sharedservice.infoFunc('', '', false, false, false);
          },
          error: err => {
            this.sharedservice.infoFunc('alert alert-danger', 'An error occured.', false, false, false);
          }
        })
        this.httpservice.getSales(1, 10).subscribe({
          next: data => {
            // console.log(data) all_sales
            this.all_sales = data
          }
        })
        this.httpservice.getProducts(1, 10).subscribe({
          next: data => {
            // console.log(data)
            this.products = data
          }
        })

        return;
      }

      if (this.branch.value.id == null || this.branch.value.id == '0') {
        setTimeout(() => {
            this.sharedservice.infoFunc('alert alert-danger', 'branch not selected...  ', false, false, false);
        }, 4500);
  
          return
      }

      this.httpservice.getByBranchProducts(this.branch.value.id)
        .subscribe({
          next: data => {
            // console.log(data)
            this.products = data
          }
        });

        this.httpservice.getBranchSales(this.branch.value.id)
        .subscribe({
          next: data => {
            // console.log(data) all_sales
            this.all_sales = data
          }
        });

      this.httpservice.getBranchSalesReturns(this.branch.value.id)
      .subscribe({
          next: data => {
            this.sales = data
            this.sharedservice.infoFunc('', '', false, false, false);
            
            setTimeout(() => {
              this.sharedservice.infoFunc('', '', false, false, false);
              this.dataTableservice.initiateDataTable('.returnstable', 15)
            }, 170);
            
          },
          error: _error => {
            this.sharedservice.infoFunc('','', false, false, false);
            setTimeout(() => {
              this.sharedservice.infoFunc('', '', false, false, false);
            }, 4000)
            console.log(_error);
            // this.initDataTable();
            if(_error.error.staus === 401){
              this.httpservice.httpLogout()
            }
          }
        })

        this.hideBtn = false;
    }
  
    get items() {
      return this.returnSalesFrm.get('items_returned') as FormArray;
    }
  
    addAlias(product:string, product_id: number, quantity: number, purchase_price: any, unit_cost:any, barcode:any) {
      this.items.push(this.formBuilder.group({
        'product': [product, Validators.required],
        'product_id': [product_id, Validators.required],
        'barcode': [barcode],
        'quantity': [quantity, Validators.compose([Validators.min(1)])],
        'return_price': [parseFloat(purchase_price), Validators.compose([Validators.required])],
        'unit_cost': [parseFloat(unit_cost)],
      }));
      this.calculateTotal(this.items.length-1)
      this.calculateGrandTotal()
    }
  
    returnSalesFrm = this.formBuilder.group({
      'invoiceId': ['', Validators.required],
      'grand_total': [''],
      'receivedby': [sessionStorage.getItem('id')],
      'items_returned': this.formBuilder.array([]),
    })
  
    submitted = false
  
    // Remove an item at the given index from the FormArray
    removeItem(index: number): void {
      this.items.removeAt(index);
      this.calculateGrandTotal()
    }
  
    // Calculate total for a specific item when quantity or price changes
    calculateTotal(index: number): void {
      const item = this.items.at(index);
      const quantity = item.get('quantity')?.value;
      const price = item.get('unit_cost')?.value;
  
      const total = quantity * price;
      item.get('return_price')?.setValue(total);
      this.calculateGrandTotal()
    }
  
    // Function to calculate the grand total
    calculateGrandTotal(): void {
      let grandTotal = this.items.controls.reduce((acc, item) => {
        const itemTotal = item.get('return_price')?.value || 0;  // Get total for each item or 0 if null
        return acc + itemTotal;  // Sum up all totals
      }, 0);
  
      // Update the grand_total form control if necessary
      this.returnSalesFrm.get('grand_total')?.setValue(grandTotal.toFixed(2));
    }
  
    inpProductChange(evt: any){
      const inputValue = evt.target.value;
      this.selectedProduct = this.products.find(product => product.barcode === inputValue);
  
      if (this.selectedProduct) {
        this.addAlias(
          this.selectedProduct.name, 
          this.selectedProduct.id, 
          1,
          this.selectedProduct.price,
          this.selectedProduct.price,
          this.selectedProduct.barcode,
        );
      }
    }

    inpProductNameChange(evt: any){
      const inputValue = evt.target.value;
      this.selectedProduct = this.products.find(product => product.name === inputValue);
  
      if (this.selectedProduct) {
        this.addAlias(
          this.selectedProduct.name, 
          this.selectedProduct.id, 
          1,
          this.selectedProduct.price,
          this.selectedProduct.price,
          this.selectedProduct.barcode || '',
        );
      }
    }

    // @HostListener('window:keypress', ['$event'])
    // handleKeyDown(event: KeyboardEvent) {
    //   if (event.key === 'Enter') {
    //     event.preventDefault(); // Prevent form submission
    //     this.barcodeData = this.inputBuffer; // Finalize barcode data
    //     this.inputBuffer = ''; // Clear the buffer
    //     this.onBarcodeScanned(this.barcodeData);
    //   } else {
    //     this.inputBuffer += event.key; // Capture the scanned key
    //   }
    // }
  
    onBarcodeScanned(barcode: string) {
      console.log('Scanned barcode:', barcode);
      // Add logic to process the barcode here
    }
  
    // Custom validation to check if a product already exists in the array
    isProductExists(product: string): boolean {
      return this.items.controls.some(control => control.value.product === product);
    }

    hide:boolean = true;
    deleteSale(){
      this.httpservice.deleteSale(this.clickedSale.reference)
      .subscribe({
        next: data => {
          this.sharedservice.infoFunc('alert alert-success', 'record deleted', false, false, false)
        
          $('.datanew').DataTable().destroy()
          
          this.httpservice.getSalesReturns(1, 10).subscribe({
            next: sdata => {
              this.sales = sdata
            }
          })
          this.products$ = this.httpservice.getProducts(1, 10);
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
            // $('#delete-units').modal('hide')
            // $('#delete-units').modal('hide').on('hidden.bs.modal', function () {
            //   $('body').removeClass('modal-open'); // Ensure body scroll is enabled
            //   $('body').css('overflow', 'auto');
            //   $('.modal-backdrop').remove(); // Remove leftover backdrop
            // });
          }, 3000)
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
  
    currentDate = new Date()
    submitSalesReturnFrm(evt: Event){
      evt.preventDefault()
  
      this.submitted = true
      console.log(this.returnSalesFrm)
      console.log(this.returnSalesFrm.value)
  
      if (this.returnSalesFrm.valid && this.returnSalesFrm.controls.items_returned.length >= 1){
        // console.log(this.returnSalesFrm.value)
        this.httpservice.returnSale(this.returnSalesFrm.controls.invoiceId.value, this.returnSalesFrm.value)
        .subscribe({
          next: data => {
          this.submitted = false;

            $('.datanew').DataTable().destroy()
            // $('.datanew ').empty()
            this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false) 
            
            this.httpservice.getSalesReturns(1, 10).subscribe({
              next: data => {
                this.sales = data
              }
            })
            // this.returnSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
            setTimeout(()=> {
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
                    next: ' <i class=" fa fa-angle-right"></i>',
                    previous: '<i class="fa fa-angle-left"></i> '
                  },
                },
                initComplete: (_settings: any, _json: any) => {
                  $('.dataTables_filter').appendTo('#tableSearch');
                  $('.dataTables_filter').appendTo('.search-input');
                },
              }); 
              this.returnSalesFrm.controls.items_returned.clear();
            },1000)
            setTimeout(()=> {
              this.sharedservice.infoFunc('', '', false, false, false)
              // this.returnSalesFrm.reset()
              // $('.no-pagination .table tbody').empty()
            }, 8000)    
            
          },
          error: error => {
            let msg = error.error.message
            // console.error('error :', error)
            this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
            setTimeout(()=> {
              this.sharedservice.infoFunc('', '', false, false, false)
            }, 4000)    
            // this.sharedservice.infoFunc('', '', false, false, false)
          }
        })
      }
    }
  
    printTable() {
      const printWindow = window.open('', '_blank');  // Open a new window
      if (printWindow) {
        const tableHtml = this.generateTableHtml();  // Generate the table HTML
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Sales Table</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <h2>Sales Table</h2>
              ${tableHtml}
            </body>
          </html>
        `);
        printWindow.document.close();  // Close the document to finish loading
      }
    }
  
    // Generate the HTML for the table
    private generateTableHtml(): string {
      let tableHtml = '<table><thead><tr><th>Customer Name</th><th>Reference</th><th>Date Created</th><th>Status</th><th>Grand Total</th><th>Biller</th><th>Payment Status</th></tr></thead><tbody>';
      this.sales.forEach(sale => {
        tableHtml += `<tr>
                        <td>${sale.customer_name}</td>
                        <td>${sale.reference}</td>
                        <td>${new Date(sale.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}</td>
                        <td>${sale.status}</td>
                        <td>${sale.grand_total}</td>
                        <td>${sale.biller}</td>
                        <td>${sale.payment_status}</td>
                      </tr>`;
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
  
    // Method to export the product table to Excel
    exportToExcel() {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.sales);
      const workbook: XLSX.WorkBook = {
        Sheets: { 'Sales Table': worksheet },
        SheetNames: ['Sales Table']
      };
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'sales_table');
    }
  
    // Save the Excel file
    saveAsExcelFile(buffer: any, fileName: string) {
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}.xlsx`);
    }
  
    exportTableToPDF() {
      // Create a new jsPDF instance
      const doc = new jsPDF();
  
      // Add table content using autoTable
      autoTable(doc, { 
        html: '#table', 
        startY: 10,
          theme: 'grid', // Optional: Customize theme and layout as needed
          styles: { fontSize: 8 }
      });
  
      // Save the generated PDF
      doc.save('sales_table.pdf');
    }
  
    refreshData(){
      
      this.httpservice.getSalesReturns(1, 10).subscribe({
        next: sdata => {
          this.sales = sdata
        }
      })
      $('.datanew').DataTable().destroy();
      setTimeout(()=> {
        $('.datanew2').DataTable({
          "bFilter": true,
          "sDom": 'fBtlpi',
          // "dom": 'pftil',
          "ordering": true,
          "language": {
            search: ' ',
            emptyTable: "No data available in table",
            infoEmpty: "",
            sLengthMenu: '_MENU_',
            searchPlaceholder: "Search",
            info: "_START_ - _END_ of _TOTAL_ items",
            paginate: {
              next: ' <i class=" fa fa-angle-right"></i>',
              previous: '<i class="fa fa-angle-left"></i> '
            },
          },
          initComplete: (_settings: any, _json: any) => {
            $('.dataTables_filter').appendTo('#tableSearch');
            $('.dataTables_filter').appendTo('.search-input');
          },
        }); 
      },3000)
    }
  
    // ngAfterViewInit(): void {
    //   // Hide preloader once the view is fully initialized
  
    //   // this.products$.subscribe({
    //   //   next: data => {
    //   //     if(data){
    //   this.zone.runOutsideAngular(() => {
    //     setTimeout(() => {
    //       const preloader = document.getElementById('global-loader') as HTMLDivElement;
    //       if (preloader) {
    //         preloader.style.display = 'none';
    //       }
    //       $('.datanew').DataTable({
    //         "bFilter": true,
    //         // "sDom": 'fBtlpi',
    //         // "dom": 'pftil',
    //         "ordering": true,
    //         "language": {
    //           search: ' ',
    //           emptyTable: "No data available in table",
    //           infoEmpty: "",
    //           sLengthMenu: '_MENU_',
    //           searchPlaceholder: "Search",
    //           info: "_START_ - _END_ of _TOTAL_ items",
    //           paginate: {
    //             next: ' <i class=" fa fa-angle-right"></i>',
    //             previous: '<i class="fa fa-angle-left"></i> '
    //           },
    //         },
    //         initComplete: (_settings: any, _json: any) => {
    //           $('.dataTables_filter').appendTo('#tableSearch');
    //           $('.dataTables_filter').appendTo('.search-input');
  
    //         },
    //       });  // Initialize jQuery DataTable outside Angular’s zone
    //     }, 2000)
    //   }
    //   );
    //   // }
    //   // });
    //   // });
    // }

    ngOnDestroy(): void {
      // Destroy the DataTable to free up resources
      $('.datanew').DataTable().destroy();
    }
  
  
  }
  
  const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  
