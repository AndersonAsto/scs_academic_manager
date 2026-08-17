import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` }, withCredentials: true })
    : req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthEndpoint) {
        return from(authService.refreshAccessToken()).pipe(
          switchMap((newToken) => {
            if (!newToken) {
              return throwError(() => error);
            }

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
              withCredentials: true,
            });

            return next(retryReq);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};