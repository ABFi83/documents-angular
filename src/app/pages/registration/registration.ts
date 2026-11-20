import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validate } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthApiService } from '@common/services/auth-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

interface RegistrationModel {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 chars, one letter, one number, one special char.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

@Component({
  selector: 'app-registration',
  imports: [FormField, FormRoot, TranslatePipe],
  templateUrl: './registration.html',
  styleUrl: './registration.scss'
})
export class Registration {
  #authApi = inject(AuthApiService);
  #router = inject(Router);

  protected readonly errorKey = signal<string | null>(null);
  protected readonly registration = form(
    signal<RegistrationModel>({ email: '', confirmEmail: '', password: '', confirmPassword: '' }),
    path => {
      validate(path.email, ({ value }) =>
        EMAIL_PATTERN.test(value()) ? null : { kind: 'email', message: 'REGISTRATION.ERRORS.INVALID_EMAIL' }
      );
      validate(path.confirmEmail, ({ value, valueOf }) =>
        value() === valueOf(path.email) ? null : { kind: 'mismatch', message: 'REGISTRATION.ERRORS.EMAIL_MISMATCH' }
      );
      validate(path.password, ({ value }) =>
        PASSWORD_PATTERN.test(value()) ? null : { kind: 'pattern', message: 'REGISTRATION.ERRORS.WEAK_PASSWORD' }
      );
      validate(path.confirmPassword, ({ value, valueOf }) =>
        value() === valueOf(path.password) ? null : { kind: 'mismatch', message: 'REGISTRATION.ERRORS.PASSWORD_MISMATCH' }
      );
    },
    { submission: { action: () => this.#register(), onInvalid: () => this.#showFirstError() } }
  );

  // One message at a time, in field order.
  #showFirstError(): void {
    const { email, confirmEmail, password, confirmPassword } = this.registration;
    const [first] = [email, confirmEmail, password, confirmPassword].flatMap(field => field().errors());
    this.errorKey.set(first?.message ?? null);
  }

  async #register(): Promise<undefined> {
    this.errorKey.set(null);
    const { email, password } = this.registration().value();
    try {
      await firstValueFrom(this.#authApi.register({ username: email, password }));
      await this.#router.navigate(['/login']);
    } catch (error) {
      const taken = error instanceof HttpErrorResponse && error.status === 400;
      this.errorKey.set(taken ? 'REGISTRATION.ERRORS.EMAIL_TAKEN' : 'REGISTRATION.ERRORS.GENERIC');
    }
  }
}
