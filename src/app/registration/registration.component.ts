import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';

import { RegistrationService } from './registration.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registration.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  email = '';
  confirmEmail = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal<string | null>(null);

  constructor(private router: Router, private registrationService:RegistrationService) {}

  validateEmail(email: string): boolean {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validatePassword(password: string): boolean {
    // At least 8 chars, one letter, one number, one special char
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  }

  onRegister() {
    if (!this.validateEmail(this.email)) {
      this.errorMessage.set('Inserisci una email valida.');
      return;
    }
    if (this.email !== this.confirmEmail) {
      this.errorMessage.set('Le email non coincidono.');
      return;
    }
    if (!this.validatePassword(this.password)) {
      this.errorMessage.set('La password deve avere almeno 8 caratteri, una lettera, un numero e un carattere speciale.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Le password non coincidono.');
      return;
    }
    this.errorMessage.set(null); // Reset error message
    this.registrationService.registration(this.email, this.password).subscribe({
      next: (response) => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.status === 400) {
          this.errorMessage.set('Email già registrata.');
        } else {
          this.errorMessage.set('Errore durante la registrazione.');
        }
      }
    });
  }
}
