import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        notificationService.showError('Non sei autorizzato ad accedere a questa risorsa.');
      } else if (error.status === 403) {
        notificationService.showError('Accesso vietato.');
      } else if (error.status === 404) {
        notificationService.showError('Risorsa non trovata.');
      } else
      if (error.status === 500) {
        notificationService.showError('Si è verificato un errore interno del server.');
      }
      return throwError(() => error);
    })
  );
};
