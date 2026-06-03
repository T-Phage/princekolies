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

  fireSuccess(title:string){
    Swal.fire({
      title: title,
      icon: 'success', // Use 'icon' instead of 'type'
      showCancelButton: true,
      showConfirmButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonClass: "btn btn-danger ml-1",
      buttonsStyling: false,
    })
  }

  fireError(title:string){
    Swal.fire({
      title: title,
      icon: 'error', // Use 'icon' instead of 'type'
      showCancelButton: true,
      showConfirmButton: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonClass: "btn btn-danger ml-1",
      buttonsStyling: false,
    })
  }

  fireAlert(){
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to proceed with this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'No, cancel'
    }).then((result:any) => {
      if (result.isConfirmed) {
        // Code to execute when the user proceeds
        // Swal.fire('Submitted!', 'Your request has been processed.', 'success');
        // return true;
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Code to execute when the user cancels
        // Swal.fire('Cancelled', 'Your request has been cancelled.', 'error');
        // return false
      }
    });
  }
}
