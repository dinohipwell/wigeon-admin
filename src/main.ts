import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';
import { EnvConfigService } from './app/services/env-config.service';
import { enableProdMode } from '@angular/core';


const appInitializerFn = (envConfigService: EnvConfigService) => {
  return () => {
    return envConfigService.loadAppConfig();
  };
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
