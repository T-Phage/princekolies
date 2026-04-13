import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/httpservices/http.service';
import { PrintService } from '../../services/print/print.service';
import { SharedService } from '../../services/sharedservices/shared.service';
import { DatabaleService } from '../../services/datatable/databale.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ErrormodalComponent } from '../../components/errormodal/errormodal.component';
import * as XLSX from 'xlsx';
import FileSaver, { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [ReactiveFormsModule, ErrormodalComponent, CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  providers: [CurrencyPipe]
})
export class SalesComponent implements OnInit {
  @ViewChild('receiptContent') receiptContent!: ElementRef;  

  products$!: Observable<any>;

  sales$!: Observable<any>;

  sales: any[] = []
  products: any[] = []

  selectedProduct: any;

  constructor(
    private formBuilder: FormBuilder,
    private httpservice: HttpService,
    public sharedservice: SharedService,
    private printservice: PrintService,
    private datableservice: DatabaleService,
    private router: Router,
  ) { 
    
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

  saleClicked(customer_name:any,reference:any,status:any,grand_total:any,payment_status:any,amount_paid:any,biller:any,items:any){
    this.clickedSale.customer_name = customer_name
    this.clickedSale.reference = reference
    this.clickedSale.status = status
    this.clickedSale.grand_total = grand_total
    this.clickedSale.amount_paid = amount_paid
    this.clickedSale.payment_status = payment_status
    this.clickedSale.biller = biller
    this.clickedSale.items = items

    // console.log(this.clickedSale)
  }

  ngOnInit(): void {
    this.httpservice.getProducts(1, 10)
      .subscribe({
        next: data => {
          // console.log(data)
          this.products = data
        },
        error: error => {
          console.error('error :', error)
        }
      });
      
      this.httpservice.getSales(1, 10)
      .subscribe({
        next: data => {
          this.sales = data;
          this.datableservice.initiateDataTable('.datasales', 25);
        },
        error: _err => {}
      })
    }

  get items() {
    return this.newSalesFrm.get('items') as FormArray;
  }

  addAlias(product:string, product_id: number, quantity: number, purchase_price: any, unit_cost:any, barcode:any) {
    this.items.push(this.formBuilder.group({
      'product': [product, Validators.required],
      'product_id': [product_id, Validators.required],
      'barcode': [product_id, Validators.required],
      'quantity': [quantity, Validators.compose([Validators.min(1)])],
      'purchase_price': [parseFloat(purchase_price), Validators.compose([Validators.required])],
      'unit_cost': [parseFloat(unit_cost)],
    }));
    // this.calculateTotal(this.items.length-1)
    this.calculateGrandTotal()
  }

  newSalesFrm = this.formBuilder.group({
    'customer_name': ['', Validators.required],
    'reference': [''],
    'status': ['Completed', Validators.required],
    'grand_total': ['', Validators.required],
    'amount_paid': [0, Validators.required],
    'payment_status': ['Paid', Validators.compose([ Validators.required])],
    'biller': [sessionStorage.getItem('id')],
    'items': this.formBuilder.array([]),
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
    item.get('purchase_price')?.setValue(total);
    this.calculateGrandTotal()
  }

  // Function to calculate the grand total
  calculateGrandTotal(): void {
    let grandTotal = this.items.controls.reduce((acc, item) => {
      const itemTotal = item.get('purchase_price')?.value || 0;  // Get total for each item or 0 if null
      return acc + itemTotal;  // Sum up all totals
    }, 0);

    // Update the grand_total form control if necessary
    this.newSalesFrm.get('grand_total')?.setValue(grandTotal.toFixed(2));
  }

  inpProductChange(evt: any){
    const inputValue = evt.target.value;
    this.selectedProduct = this.products.find(product => product.name === inputValue);

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

  // Custom validation to check if a product already exists in the array
  isProductExists(product: string): boolean {
    return this.items.controls.some(control => control.value.product === product);
  }

  currentDate = new Date()
  submitSalesFrm(evt: Event){
    evt.preventDefault()

    this.submitted = true

    // this.newSalesFrm.controls.amount_paid.setValue(parseFloat(this.newSalesFrm.controls.amount_paid))
    console.log(this.newSalesFrm.value)

    if (this.newSalesFrm.valid && this.newSalesFrm.controls.items.length >= 1){
      console.log(this.newSalesFrm.value)
      this.httpservice.addNewSale(this.newSalesFrm.value, this.receiptContent)
      .subscribe({
        next: data => {
          $('.datasales').DataTable().destroy()
          this.sharedservice.infoFunc('alert alert-success', data.message, false, false, false) 
          this.sales$ = this.httpservice.getSales(1, 10);
          this.newSalesFrm.controls.reference?.setValue(`${data.sale.reference}`)
          let printIt = this.printservice.printReceipt //(this.receiptContent);
          let ctn = this.receiptContent
          // window.location.reload() 
          setTimeout(()=> {
            $('.datasales').DataTable({
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
          },1000)  
          setTimeout(()=>{
            console.log(this.newSalesFrm.controls.reference)
            printIt(ctn)

          }, 3000)    
          // this.newSalesFrm.reset()
        },
        error: error => {
          let msg = error.error.message
          console.error('error :', error)
          this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
        }
      })
      // this.printReceipt();
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

  // deleteSale(){
  //   this.httpservice.deleteSale(this.clickedSale.reference)
  //   .subscribe({
  //     next: data => {
  //       this.sharedservice.infoFunc('alert alert-success', 'record deleted', false, false, false)
      
  //       this.products$ = this.httpservice.getProducts(1, 10);
  //       $('.datasales').DataTable().destroy()
  //       this.httpservice.getSales(1, 10)
  //       .subscribe({})
  //       setTimeout(() =>{ 
  //         this.sharedservice.infoFunc('', '', false, false, false)
  //         this.datableservice.initiateDataTable('.datasales', 25);
  //       }, 100)
  //       this.hide = false
  //       // $('#delete-sale-units').modal('hide').on('hidden.bs.modal', function () {
  //       //   $('body').removeClass('modal-open'); // Ensure body scroll is enabled
  //       //   $('body').css('overflow', 'auto');
  //       //   $('.modal-backdrop').remove(); // Remove leftover backdrop
  //       // });
  //     },
  //     error: error => {
  //       let msg = error.error.message
  //       console.error('error :', error)
  //       this.sharedservice.infoFunc('alert alert-danger', msg, false, false, false)
  //       setTimeout(()=>{
  //         this.sharedservice.infoFunc('', '', false, false, false)
          
  //       }, 5000)
  //     }
  //   })
  // }
  hide:boolean = true;
  refreshData(){
    $('.datasales').DataTable().destroy();
    this.sharedservice.refreshComponentFunc(this.router.url)
  }

  ngOnDestroy(): void {
    // Destroy the DataTable to free up resources
    $('.datasales').DataTable().destroy();
  }

}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
