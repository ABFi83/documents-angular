import { Routes } from '@angular/router';
import { authGuard } from '@common/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('@pages/login/login').then(m => m.Login) },
  { path: 'registration', loadComponent: () => import('@pages/registration/registration').then(m => m.Registration) },
  { path: 'main', canActivate: [authGuard], loadComponent: () => import('@pages/main/main').then(m => m.Main) },
  { path: '**', redirectTo: 'login' }
];
