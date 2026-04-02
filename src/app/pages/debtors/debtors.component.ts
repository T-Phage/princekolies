import { Component } from '@angular/core';
import { HttpService } from '../../services/httpservices/http.service';

@Component({
  selector: 'app-debtors',
  standalone: true,
  imports: [],
  templateUrl: './debtors.component.html',
  styleUrl: './debtors.component.css'
})
export class DebtorsComponent {

  constructor(
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
    this.httpService.getAllDebtors()
    .subscribe({
      next: (res) => {
        console.log(res)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
}
