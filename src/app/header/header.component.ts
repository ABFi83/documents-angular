import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { UserService } from '../user/user.service';
import { signal } from '@angular/core';
import { User } from '../model/model';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  @Output() resetEvent= new EventEmitter<void>();

  constructor(private router: Router, private userService: UserService, private loginService: LoginService, private http: HttpClient) {
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

  reset() {
    this.userService.reset().subscribe({
      next: () => {
        this.isMenuOpen = false;
        this.resetEvent.emit();
      },
      error: (err) => {
        alert('Errore durante il reset');
        console.error(err);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuContainer = document.querySelector('.menu-container');
    if (this.isMenuOpen && menuContainer && !menuContainer.contains(event.target as Node)) {
      this.isMenuOpen = false;
    }
  }
}
