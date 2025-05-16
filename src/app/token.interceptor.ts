import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './login/login.service';
import { environment } from './environment';
import { Router } from '@angular/router';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(environment.tokenKey);
  if (!token) {
    const router = inject(Router);
    router.navigate(['/login']);
    return next(req);
  }
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};
