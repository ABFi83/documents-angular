import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '@common/services/session.service';
import { UserApiService } from '@common/services/user-api.service';
import { User } from '@interfaces/user.interface';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-header',
  imports: [TranslatePipe],
  templateUrl: './main-header.html',
  styleUrl: './main-header.scss'
})
export class MainHeader {
  #userApi = inject(UserApiService);
  #session = inject(SessionService);
  #router = inject(Router);
  #translate = inject(TranslateService);

  user = input<User | null>(null);
  profileReset = output();

  protected readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  protected reset(): void {
    this.#userApi.reset().subscribe({
      next: () => {
        this.menu().nativeElement.hidePopover();
        this.profileReset.emit();
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
