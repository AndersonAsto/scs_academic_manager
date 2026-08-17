import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const userRole = authService.role();

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return router.createUrlTree([authService.homeRouteForRole(userRole!)]);
  }

  return true;
};

// Evita que alguien con sesión activa vea el login otra vez.
export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree([authService.homeRouteForRole(authService.role()!)]);
  }

  return true;
};