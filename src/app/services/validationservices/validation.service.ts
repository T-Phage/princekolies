import { Injectable } from '@angular/core';
import { HttpService } from '../httpservices/http.service';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(
    private httpservice: HttpService,
  ) { }

  togglesideNav:boolean = true
  toggleFunc(){
    this.togglesideNav = !this.togglesideNav
  }

  // Validator function to check for positive integers
  positiveIntegerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      // Check if the value is a positive integer
      if (value && (!Number.isInteger(+value) || value <= 0)) {
        return { notPositiveInteger: true };  // Validation error
      }
      return null;  // Valid case
    };
  }

  deleteClicked(id: any){

    let func = this.httpservice.deleteProduct;
    setTimeout(()=>{
      let mdlElement = (document.getElementsByClassName('delete'))
      
      mdlElement[0].addEventListener('click', function(){
        func(id)
        
      });
  
    })
  }
}
