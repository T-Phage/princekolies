import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthserviceService } from '../../services/auth/authservice.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthserviceService);
  const router = inject(Router);

  // Check your application's authentication state
  if(authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
