import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { MainComponent } from './main/main.component';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './registration/registration.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  {
    path: 'main',
    component: MainComponent},
  { path: '**', redirectTo: 'login' },
];
