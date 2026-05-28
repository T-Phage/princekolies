import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriploadService {
  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }
}
