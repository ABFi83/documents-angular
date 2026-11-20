import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, DOCUMENT, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { httpInterceptor } from '@common/interceptors/http.interceptor';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

// English for English browsers, Italian (the original copy) for everyone else.
const uiLanguage = navigator.language.startsWith('en') ? 'en' : 'it';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideAppInitializer(() => {
      inject(DOCUMENT).documentElement.lang = uiLanguage;
    }),
    provideTranslateService({
      lang: uiLanguage,
      fallbackLang: 'it',
      // useHttpBackend: the copy must not go through httpInterceptor, which itself needs TranslateService.
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json', useHttpBackend: true })
    })
  ]
};
