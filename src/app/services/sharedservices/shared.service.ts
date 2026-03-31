import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private router: Router,
  ) { }

  amount = /^[0-9]\d*(\.\d{0,2})?$/
  quantity = /^[1-99999]?$/

  responses = {
    class: '',
    message: '',
    spin: false,
    showSpinner: false,
    showBtnSpinner: false,
    disabled: false
  }

  togglesideNav = true
  toggleFunc(){
    alert("origin")
    this.togglesideNav = !this.togglesideNav
  }

  infoFunc(type: string, message: string, spin: boolean, showSpinner: boolean, disable: boolean) {
    this.responses.class = type
    this.responses.message = message
    this.responses.showSpinner = showSpinner
    this.responses.spin = spin
    this.responses.disabled = disable
  }

  refreshComponentFunc(route: string) {
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([route]);
  }

  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve(); // Script already exists
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(`Could not load script: ${src}`);
      };
      document.body.appendChild(script);
    });
  }

  loadStyle(href: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        resolve(); // Style already exists
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        resolve();
      };
      link.onerror = (error) => {
        reject(`Could not load style: ${href}`);
      };
      document.head.appendChild(link);
    });
  }

  loadResources() {
    // Load scripts and styles as needed
    // this.loadScript('assets/js/jquery-3.7.1.min.js').then(() => {console.log('jQuery loaded!');
    // }).catch(error => console.error(error));

    this.loadStyle('assets/css/bootstrap.min.css').then(() => {
      console.log('assets/css/bootstrap.min.css');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/bootstrap-datetimepicker.min.css"').then(() => {
      console.log('assets/css/bootstrap-datetimepicker.min.css"');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/bootstrap-datetimepicker.min.css"').then(() => {
      console.log('assets/css/bootstrap-datetimepicker.min.css"');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/animate.css').then(() => {
      console.log('assets/css/animate.css"');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/select2.min.css').then(() => {
      console.log('assets/css/select2.min.css');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/fontawesome.min.css').then(() => {
      console.log('assets/css/fontawesome.min.css"');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/all.min.css').then(() => {
      console.log('assets/css/all.min.css');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/style.css').then(() => {
      console.log('assets/css/style.css');
    }).catch(error => console.error(error));
    this.loadStyle('assets/css/feather.css').then(() => {
      console.log('assets/css/feather.css');
    }).catch(error => console.error(error));
  }
}
