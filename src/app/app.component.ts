import { Component, NO_ERRORS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NetworkService } from './services/networkservice/network.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'exposale';

  isOffline: boolean = false;
  manager: boolean = false;
  owner: boolean = false;
  private isModalCurrentlyOpen = false;

  constructor(
    // private titleService: Title,
    public router: Router,
    private networkService: NetworkService,
  ){
    console.log('app component loaded');
    let token = sessionStorage.getItem('token');
    let role = `${sessionStorage.getItem('role')}`;
    // console.log (token)
    if(this.router.url == '/customer-screen'){
      return; // Allow access to the customer screen without authentication
    }
    console.log(this.router.url)
    // if (token == null){
    //   this.router.navigateByUrl('/auth/login')
    // } else {
    //   if(role == 'Business_Owner' || role == 'Account_Officer'){
    //     this.owner = true;
    //     this.router.navigateByUrl('/dashboard/overview-dashboard')
    //   }
    //   else if(role == 'Manager'){
    //     this.manager = true;
    //     this.router.navigateByUrl('/dashboard/sales-dashboard')
    //   } else {
    //     this.router.navigateByUrl('/dashboard/sales-dashboard')
    //   }
    // }
  }

  ngOnInit() {
    this.networkService.onlineStatus$.subscribe((online: any) => {
      this.isOffline = !online;
    });

    // Listen for global click or focus events to detect when a Bootstrap modal opens
    // This makes it completely dynamic for ALL modals across your POS system
    document.addEventListener('show.bs.modal', () => {
      this.isModalCurrentlyOpen = true;
      // Push a fake state into the browser history. 
      // This creates a "shield" so the next back press is consumed by us, not the router.
      history.pushState({ modalOpen: true }, '', window.location.href);
    });

    document.addEventListener('hidden.bs.modal', () => {
      // If the user closes the modal normally (clicking a close button), 
      // we reset our state tracker and clear the fake history entry
      this.isModalCurrentlyOpen = false;
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // If a modal is open on the screen, INTERCEPT the back press
    if (this.isModalCurrentlyOpen || document.querySelector('.modal.show')) {
      
      // 1. Close the modal and the backdrop immediately
      this.forceCloseAllModals();
      
      // 2. Reset the state tracker
      this.isModalCurrentlyOpen = false;

      console.log('First back press: Closed modal and backdrop.');
    } else {
      // Subsequent back press: No modal is open, so let the browser handle 
      // normal routing/navigation naturally.
      console.log('Subsequent back press: Navigating pages.');
    }
  }

  private forceCloseAllModals() {
    const openModals = document.querySelectorAll('.modal.show, .modal.in');
    
    openModals.forEach(modalElement => {
      // Clean closure via Bootstrap API
      try {
        const bootstrap = (window as any).bootstrap;
        if (bootstrap && bootstrap.Modal) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) 
                             || bootstrap.Modal.getOrCreateInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
      } catch (e) {
        console.log('Fallback to hard hidden style');
      }

      // Hard DOM removal fallback
      (modalElement as HTMLElement).style.display = 'none';
      modalElement.classList.remove('show', 'in');
    });

    // Wipe out the dark background backdrop instantly
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    // Restore device scrollbars
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  // @HostListener('window:popstate')
  // onPopState() {
  //   this.forceCloseAllModals();
  // }

  // private forceCloseAllModals() {
  //   // 1. Find all modals that are currently visible on the screen
  //   const openModals = document.querySelectorAll('.modal.show, .modal.in');
    
    // openModals.forEach(modalElement => {
    //   // Try to close it cleanly using Bootstrap's JavaScript instance first
    //   try {
    //     const bootstrap = (window as any).bootstrap;
    //     if (bootstrap && bootstrap.Modal) {
    //       const modalInstance = bootstrap.Modal.getInstance(modalElement) 
    //                          || bootstrap.Modal.getOrCreateInstance(modalElement);
    //       if (modalInstance) {
    //         modalInstance.hide();
    //       }
    //     }
    //   } catch (e) {
    //     console.log('Bootstrap instance hide failed, falling back to manual DOM removal');
    //   }

    //   // 2. HARD FALLBACK: Forcefully hide the modal visual elements immediately
    //   (modalElement as HTMLElement).style.display = 'none';
    //   modalElement.classList.remove('show', 'in');
    //   modalElement.setAttribute('aria-hidden', 'true');
    // });

    // 3. Destructive cleanup of all orphaned backdrops
    // const backdrops = document.querySelectorAll('.modal-backdrop');
    // backdrops.forEach(backdrop => backdrop.remove());

    // // 4. Restore regular page scrolling to the body
    // document.body.classList.remove('modal-open');
    // document.body.style.overflow = '';
    // document.body.style.paddingRight = '';
  // }
    // 1. Push an initial fake state when the app boots up
    // this.pushFakeState();

    // // 2. Every time the user changes pages naturally, re-push the fake state
    // this.router.events.pipe(
    //   filter(event => event instanceof NavigationEnd)
    // ).subscribe(() => {
    //   this.pushFakeState();
    // });
  // }

  // @HostListener('window:popstate', ['$event'])
  // onPopState(event: PopStateEvent) {
  //   const currentUrl = this.router.url;

  //   // Check if the user is on the login page
  //   if (currentUrl.includes('auth/login')) {
  //     // ALLOW EXIT: Do nothing. 
  //     // The browser will naturally go back to whatever was before the app, effectively exiting it.
  //     console.log('On login page: Allowing application exit.');
  //   } else {
  //     // BLOCK BACK PRESS: Force the browser to stay on the current page
  //     console.log('Back press blocked on POS page.');
      
  //     // Immediately inject the fake state back so the next back press is also trapped
  //     this.pushFakeState();

  //     // (Optional) Place any global modal cleanup here if you still want modals to close 
  //     // instead of navigating back:
  //     this.cleanupModals();
  //   }
  // }

  // private pushFakeState() {
  //   // Pushing a null state creates a "buffer" in the browser history. 
  //   // When the user presses back, they consume this fake state instead of actually navigating away.
  //   history.pushState(null, '', window.location.href);
  // }

  // private cleanupModals() {
  //   document.body.classList.remove('modal-open');
  //   const backdrops = document.querySelectorAll('.modal-backdrop');
  //   backdrops.forEach(backdrop => backdrop.remove());
  // }
}
