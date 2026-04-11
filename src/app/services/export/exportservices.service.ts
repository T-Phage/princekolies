import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportservicesService {

  constructor() { }

  // private generateTableHtml(thead:string, items:any[]): string {
  //   let tableHtml = thead;
  //   items.forEach(item => {
  //     tableHtml += `<tr>
  //                     <td>${item.name}</td>
  //                     <td>${item.category_id}</td>
  //                     <td>${item.quantity}</td>
  //                     <td>${item.price}</td>
  //                   </tr>`;
  //   });
  //   tableHtml += '</tbody></table>';
  //   return tableHtml;
  // }
}
