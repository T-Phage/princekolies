import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import {CommonModule} from '@angular/common';
import { Subscription } from 'rxjs';
import { BroadcastServicesService } from '../../services/broadcast/broadcast-services.service';

@Component({
  selector: 'app-customerview',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './customerview.component.html',
  styleUrl: './customerview.component.css'
})
export class CustomerviewComponent {

  cartItems: any[] = [];
  cartTotal: number = 0;
  subtotal: number = 0;
  tax: number = 0;
  private cartSub!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private cartBroadcast: BroadcastServicesService,
  ) {}

  ngOnInit(): void {
    this.cartSub = this.cartBroadcast.onUpdate().subscribe((data) => {
      console.log('Broadcast received in customer screen:', data);
      this.cartItems = data.items || [];
      this.subtotal = data.subtotal || 0;
      this.cartTotal = data.total || 0;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
  }
}
