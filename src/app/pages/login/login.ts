import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthApiService } from '@common/services/auth-api.service';
import { SessionService } from '@common/services/session.service';
import { Credentials } from '@interfaces/auth.interface';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  #authApi = inject(AuthApiService);
  #session = inject(SessionService);
  #router = inject(Router);

  protected readonly errorKey = signal<string | null>(null);
  // No validators: an empty submit still reaches the BE, which answers with the login error.
  protected readonly credentials = form(signal<Credentials>({ username: '', password: '' }), {
    submission: { action: () => this.#login() }
  });

  async #login(): Promise<undefined> {
    try {
      const response = await firstValueFrom(this.#authApi.login(this.credentials().value()));
      if (!response.access_token) {
        this.errorKey.set('LOGIN.ERRORS.INVALID_CREDENTIALS');
        return;
      }
      this.#session.setToken(response.access_token);
      await this.#router.navigate(['/main']);
    } catch {
      this.errorKey.set('LOGIN.ERRORS.GENERIC');
    }
  }
}
