import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { catchError, switchMap, retryWhen } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Add headers for CoinGecko API
  const apiReq = req.clone({
    setHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return next(apiReq).pipe(
    catchError((error) => {
      console.error(`[API] Error ${error.status} for ${req.url}:`, error.message);

      // Rate limit: retry after delay
      if (error.status === 429) {
        return timer(60000).pipe(
          switchMap(() => next(apiReq))
        );
      }

      return throwError(() => error);
    })
  );
};
