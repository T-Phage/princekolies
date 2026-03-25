import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css'
})

export class ExpensesComponent {
  constructor(
    private httpservice: HttpService,
  ){}

  expenses: any[] = [];

  role:string = '';

  ngOnInit(): void {
    console.log('=====let see')
    this.httpservice.getExpenses().subscribe({
      next: data =>{
        console.log(data)
      },
      error: error => {
        console.log(error)
      },
      complete: () => {
        // console.log(vrr)
      }
    })
  }
}
