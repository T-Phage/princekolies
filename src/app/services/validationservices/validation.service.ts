import { Injectable } from '@angular/core';
import { HttpService } from '../httpservices/http.service';
import { ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';

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

  totalStockValidator(maxTotal: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const allocations = (control as FormArray).value;
      const currentTotal = allocations.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

      return currentTotal > maxTotal ? { totalExceeded: { max: maxTotal, actual: currentTotal } } : null;
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

  ghanaCardValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null; // Return null if empty (handled by Validators.required)
      }

      // Regex breakdown: 
      // ^GHA- : Starts with 'GHA-'
      // \d{9} : Followed by exactly 9 digits
      // -\d$  : Ends with a hyphen and exactly 1 digit
      const ghanaCardRegex = /^GHA-\d{9}-\d$/i;
      const isValid = ghanaCardRegex.test(value);

      return isValid ? null : { invalidGhanaCard: true };
    };
  }
}
