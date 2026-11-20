import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = signal<string | null>(null); // Aggiunto per gestire i messaggi di errore

  constructor(private router: Router, private loginService: LoginService) {}

  async login() {
    try {
      const response: any = await firstValueFrom(this.loginService.login(this.username, this.password));
      if (response.access_token) {
        this.loginService.setToken(response.access_token);
        this.router.navigate(['/main']);
      } else {
        this.errorMessage.set('Credenziali non valide');
      }
    } catch (error) {
      this.errorMessage.set('Errore di login');
    }
  }

  goToRegistration() {
    this.router.navigate(['/registration']);
  }
}
