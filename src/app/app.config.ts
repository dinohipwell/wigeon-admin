import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';
import { EnvConfigService } from '@services/env-config.service';


const appInitializerFn = (envConfigService: EnvConfigService) => {
  return () => {
    return envConfigService.loadAppConfig();
  };
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),

    EnvConfigService,
    provideAppInitializer(() => {
      const initializerFn = (appInitializerFn)(inject(EnvConfigService));
      return initializerFn();
    }),

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }), // no persistent local cache off line saving still works but you cannot get data if offline at the start
  ]
};
