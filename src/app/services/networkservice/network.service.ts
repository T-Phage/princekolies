import { Injectable } from '@angular/core';
import { Observable, merge, fromEvent, map, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  // Initialize with the current browser status
  private internalOnlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$: Observable<boolean>;

  constructor() { 
    this.onlineStatus$ = merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    );

    // Update our subject so we can check current state synchronously if needed
    this.onlineStatus$.subscribe(status => {
      this.internalOnlineStatus$.next(status);
    });
  }

  get isOnline(): boolean {
    return this.internalOnlineStatus$.value;
  }
}
