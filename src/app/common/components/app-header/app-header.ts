import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CurrentUserService } from '@common/services/current-user.service';
import { SessionService } from '@common/services/session.service';
import { UserApiService } from '@common/services/user-api.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss'
})
export class AppHeader {
  #userApi = inject(UserApiService);
  #currentUser = inject(CurrentUserService);
  #session = inject(SessionService);
  #router = inject(Router);
  #translate = inject(TranslateService);

  protected readonly user = this.#currentUser.user;
  protected readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  // The wiped user has no CV left: the profile page shows the upload again.
  protected reset(): void {
    this.#userApi.reset().subscribe({
      next: () => {
        this.menu().nativeElement.hidePopover();
        this.#currentUser.reload();
        void this.#router.navigate(['/main']);
      },
      error: error => {
        alert(this.#translate.instant('MAIN.HEADER.RESET_ERROR'));
        console.error(error);
      }
    });
  }

  protected logout(): void {
    this.#session.clear();
    void this.#router.navigate(['/login']);
  }
}
