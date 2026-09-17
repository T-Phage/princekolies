import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BroadcastServicesService {

  private channel: BroadcastChannel;
  private cartSubject = new Subject<any>();

  constructor(
    private ngZone: NgZone,
  ) {
    // Create a broadcast channel named 'pos_cart_channel'
    this.channel = new BroadcastChannel('pos_cart_channel');

    // Listen for incoming messages from other windows
    this.channel.onmessage = (event) => {
      // Run inside NgZone so Angular updates the customer UI instantly
      this.ngZone.run(() => {
        this.cartSubject.next(event.data);
      });
    };
  }

  // Called by Seller Screen to broadcast updates
  sendUpdate(cartData: any): void {
    this.channel.postMessage(cartData);
  }

  // Subscribed to by Customer Screen to receive updates
  onUpdate(): Observable<any> {
    return this.cartSubject.asObservable();
  }
}
