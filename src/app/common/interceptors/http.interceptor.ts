import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpFeedbackService } from '@common/services/http-feedback.service';
import { SessionService } from '@common/services/session.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

const ERROR_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  401: 'COMMON.HTTP_ERRORS.UNAUTHORIZED',
  403: 'COMMON.HTTP_ERRORS.FORBIDDEN',
  404: 'COMMON.HTTP_ERRORS.NOT_FOUND',
  500: 'COMMON.HTTP_ERRORS.SERVER_ERROR'
};

/** Sends the session token and turns the known HTTP errors into a snackbar. */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SessionService).token();
  const feedback = inject(HttpFeedbackService);
  const translate = inject(TranslateService);

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = ERROR_MESSAGES[error.status];
      if (message) feedback.notifyError(translate.instant(message));
      return throwError(() => error);
    })
  );
};
