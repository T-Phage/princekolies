import { Component } from '@angular/core';
import { SharedService } from '../../services/sharedservices/shared.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-errormodal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './errormodal.component.html',
  styleUrl: './errormodal.component.css'
})
export class ErrormodalComponent {
  constructor (
    public sharedservice: SharedService,
  ) { }
}
