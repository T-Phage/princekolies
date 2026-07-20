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
                  font-size: 12px;
                  font-family: Arial, sans-serif;
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
                table {
                    border: 0px solid #000;
                }
                table th {
                  border-bottom: 1px solid #000;
                }
                table th {
                    font-size: 12px;
                }
                table td {
                    font-size: 12px;
                }
                th, td {
                  padding: 10px;
                  text-align: center;
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
            .text-center {
              text-align: center !important;
            }
              .head-text {
                font-size:20px;
                margin:0 !important;
              }
              .hide {
                display: none;
              }
                .img-receipt {

                  .receipt-row td {
                    padding: 2px;
                  }
                  .text-12 {
                    font-size: 12px;
                  }
                  .icon-head a img {
                    width: 50px;
                    height: 30px;
                  }
                  .head-text {
                    font-size:14px;
                    margin:0 !important;
                  }
                  .amount-payable {
                    border-top: 1px solid #000; 
                    * {
                      margin: 0;
                      padding: 0;
                    }
                    td {
                      font-size: 14px;
                      font-weight: bold;
                    }
                  }
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
