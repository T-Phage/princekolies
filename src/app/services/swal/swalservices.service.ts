import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SwalservicesService {

  constructor() { }

  fireWarning(title:string){
    Swal.fire({
      title: title,
      icon: 'warning', // Use 'icon' instead of 'type'
      showCancelButton: true,
      showConfirmButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonClass: "btn btn-danger ml-1",
      buttonsStyling: false,
    })
  }
}
