import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '@common/components/app-header/app-header';
import { CurrentUserService } from '@common/services/current-user.service';

/** Layout of the pages behind the login: header + page. Owns the logged-in user, loaded afresh on every login. */
@Component({
  selector: 'app-shell',
  imports: [AppHeader, RouterOutlet],
  providers: [CurrentUserService],
  template: '<app-header /><router-outlet />',
  styles: ':host { display: block; container-type: inline-size; }'
})
export class AppShell {}
