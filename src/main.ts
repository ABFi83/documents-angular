// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './app/token.interceptor';
import { errorInterceptor } from './app/error.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    importProvidersFrom(ToastrModule.forRoot()),
    provideHttpClient(
      withInterceptors([TokenInterceptor]),
      withInterceptors([errorInterceptor])
    )
  ]
}).catch(err => console.error(err));
