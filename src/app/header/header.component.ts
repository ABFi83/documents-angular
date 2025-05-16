import { Component } from '@angular/core';
import { UserService } from '../user/user.service';
import { signal } from '@angular/core';
import { User } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent {
  [x: string]: any;
  userSignal;
  isMenuOpen = false;

  constructor(private router: Router, private userService: UserService, private loginService: LoginService) {
    this.userSignal = this.userService.getUserSignal();
  }

  user() {
    return this.userSignal();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.userService.logout();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
