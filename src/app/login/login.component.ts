import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null; // Aggiunto per gestire i messaggi di errore

  constructor(private router: Router, private loginService: LoginService) {}

  async login() {
    try {
      const response: any = await firstValueFrom(this.loginService.login(this.username, this.password));
      if (response.access_token) {
        this.loginService.setToken(response.access_token);
        this.router.navigate(['/main']);
      } else {
        this.errorMessage = 'Credenziali non valide';
      }
    } catch (error) {
      this.errorMessage = 'Errore di login';
    }
  }
}
