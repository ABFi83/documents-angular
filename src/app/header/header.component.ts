import { Component, EventEmitter, HostListener, Output, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../user/user.service';
import { signal } from '@angular/core';
import { User } from '../model/model';

import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: []
})
export class HeaderComponent {
  [x: string]: any;
  userSignal;
  isMenuOpen = signal(false);

  @Output() resetEvent= new EventEmitter<void>();

  constructor(private router: Router, private userService: UserService, private loginService: LoginService, private http: HttpClient) {
    this.userSignal = this.userService.getUserSignal();
  }

  user() {
    return this.userSignal();
  }

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
  }

  logout() {
    this.userService.logout();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  reset() {
    this.userService.reset().subscribe({
      next: () => {
        this.isMenuOpen.set(false);
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
    if (this.isMenuOpen() && menuContainer && !menuContainer.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }
}
