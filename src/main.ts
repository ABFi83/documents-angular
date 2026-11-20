import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { TokenInterceptor } from './app/token.interceptor';
import { errorInterceptor } from './app/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHotToastConfig({ position: 'bottom-right', duration: 3000 }),
    provideHttpClient(withInterceptors([TokenInterceptor, errorInterceptor])),
  ]
}).catch(err => console.error(err));
