import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EnvConfigService {
  private injector = inject(Injector);

  // public apiUrl = '';
  public webUrl = '';
  public envName = '';

  constructor() {
    //  Since this service will run when your application bootstraps, we cannot rely on the other services and the Dependency Injection model to be ready
    // see https://www.technouz.com/4746/how-to-use-run-time-environment-variables-in-angular/
    // Runs in app.module.ts so everything is loaded ready

    this.webUrl = window.location.origin;
  }

  loadAppConfig() {
    const http = this.injector.get(HttpClient);

    return http.get('/env.json').pipe(
      map(res => {
        //   this.apiUrl = (e as WebEnv).apiUrl;
        this.envName = (res as WebEnv).envName;
      })
    )
    // .toPromise()
    // .then(e => {
  }
}

export interface WebEnv {
  apiUrl: string;
  envName: string;
}
