import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@common/services/session.service';

/** Pages behind the login: without a token the user lands on the login page. */
export const authGuard: CanActivateFn = () => inject(SessionService).isLoggedIn() || inject(Router).createUrlTree(['/login']);
