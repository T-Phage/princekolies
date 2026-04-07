import { ElementRef, Injectable } from '@angular/core';
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

    // Method to trigger the print
    printReceipt(receiptContent: ElementRef) {
      let ele = document.getElementById("receipt") as HTMLDivElement
      // ele.style.display = 'block'
      const printContent = receiptContent.nativeElement.innerHTML;
      const WindowPrt = window.open('', '_blank')//, 'width=z00,height=600');
      if (WindowPrt) {
        WindowPrt.document.write(`
            <html>
            <head>
              <title>Receipt</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              
              <style>
                /* Add any receipt-specific styling here */
                @page {
                  margin: 0;
                }
                body {
                  margin-top: 0px !important;
                  padding-top: 0px !important;
                  color: #000 !important;
                  margin: 0 auto;
                  font-size: 11px;
                }
                  body::after {
                    content: "";
                    display: block;
                    height: 150px;
                  }
                    
                 table {
                  width: 100%;
                  border-collapse: collapse;
                  color: #000;
                }
                table, th, td {
                  border: 1px solid black;
                }
                th, td {
                  padding: 10px;
                  text-align: center;
                }
                  td, th {
                  border-style : hidden!important;
                  }
                h2, h3 {
                  text-align: center;
                  color: #000;
                } 
            .page-header {
              margin: 0 0 1rem;
              padding-bottom: 1rem;
              padding-top: .5rem;
              border-bottom: 1px dotted #e2e2e2;
              display: -ms-flexbox;
              display: flex;
              -ms-flex-pack: justify;
              justify-content: space-between;
              -ms-flex-align: center;
              align-items: center;
            }
          .page-title {
              padding: 0;
              margin: 0;
              font-size: 1.75rem;
              font-weight: 300;
          }
        .brc-default-l1 {
            border-color: #dce9f0!important;
        }
    
        .ml-n1, .mx-n1 {
            margin-left: -.25rem!important;
        }
        .mr-n1, .mx-n1 {
            margin-right: -.25rem!important;
        }
        .mb-4, .my-4 {
            margin-bottom: 1.5rem!important;
        }
    
        hr {
            margin-top: 1rem;
            margin-bottom: 1rem;
            border: 0;
            border-top: 1px solid rgba(0,0,0,.1);
          }
    
        .font-bolder, .text-600 {
            font-weight: 600!important;
        }
    
      .pb-25, .py-25 {
          padding-bottom: .75rem!important;
      }
    
    .pt-25, .py-25 {
      padding-top: .75rem!important;
    }
    
                .bgc-default-l4, .bgc-h-default-l4:hover {
                    background-color: #f3f8fa!important;
                }
                .page-header .page-tools {
                    -ms-flex-item-align: end;
                    align-self: flex-end;
                }
    
    
                .w-2 {
                    width: 1rem;
                }
    
                .text-120 {
                    font-size: 120%!important;
                }
    
              .text-150 {
                  font-size: 150%!important;
              }
              .text-60 {
                  font-size: 60%!important;
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
          
            ${printContent}
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            <hr/>
            ...
          </body>
          </html>
        `);

      }

      setTimeout(() => {
        WindowPrt.focus()
        WindowPrt.print();
        setTimeout(() => {
          WindowPrt.close()
        }, 900)
        WindowPrt.close();
      }, 500); 
      
    }    
}
