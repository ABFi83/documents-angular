import { Routes } from '@angular/router';
import { authGuard } from '@common/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('@pages/login/login').then(m => m.Login) },
  { path: 'registration', loadComponent: () => import('@pages/registration/registration').then(m => m.Registration) },
  {
    // Pages behind the login share the shell: header + the logged-in user.
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@common/components/app-shell/app-shell').then(m => m.AppShell),
    children: [
      { path: 'main', loadComponent: () => import('@pages/main/main').then(m => m.Main) },
      {
        path: 'documents',
        loadComponent: () => import('@pages/documents/documents-list/documents-list').then(m => m.DocumentsList)
      },
      {
        path: 'documents/:id',
        loadComponent: () => import('@pages/documents/documents-detail/documents-detail').then(m => m.DocumentsDetail)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
