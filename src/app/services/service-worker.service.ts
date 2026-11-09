import { ApplicationRef, Injectable, inject } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { EnvConfigService } from './env-config.service';
import { EnvName, MyHttpService, WebVersion } from './my-http.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerService {
  // private appRef = inject(ApplicationRef);
  private swUpdate = inject(SwUpdate);
  private myHttp = inject(MyHttpService);
  private envConfigService = inject(EnvConfigService);

  // see ngsw-config.json for caching options
  // lazy load modules are also cashed
  // test with http-server and  http://localhost:8080
  public codeVersion = '';
  public codeSha = '';
  public availableVersion = '';
  public errMsg = '';
  public availableVersionSW = false;
  public enabledSWCalled = false;
  public calledSW = false;

  constructor() {
    const swUpdate = this.swUpdate;

    // SwPush for doing server Web Push notifications
    // SwUpdate for managing application version updates
    this.codeVersion = environment.version;
    this.codeSha = environment.sha;
    // fires when finds one is found to be available

    swUpdate.versionUpdates.subscribe({
      next: (evt: VersionEvent) => {
        if (evt.type === 'VERSION_READY') {
          this.availableVersionSW = true; // flag to be updated on modue change
        }
        //   case 'VERSION_DETECTED':
        //   case 'VERSION_INSTALLATION_FAILED':
      },
      error: (error: any) => {
        try {
          // ignore if offline
          this.errMsg = error.message;
        } catch {
        }
      },
      // complete: () => console.info('complete')
    });

    // this.swUpdate.available.subscribe(() => {
    //   this.availableVersionSW = true; // flag to be updated on modue change
    // }, error => {
    //   try {
    //     this.errMsg = error.message;
    //   } catch {
    //   }
    // });


  }

  checkVersionUpdateIfNeeded(mayUpdate: boolean) {
    // Called from change of module when safe to update
    this.errMsg = '';
    if (this.availableVersionSW) {
      if (mayUpdate) {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
        return false;
      } else {
        return true;
      }
    } else {
      this.getWebVersion();
      // temp code to always check
      if (this.availableVersion && this.availableVersion !== this.codeVersion) {
        // availableVersionSW will be set when found and hence webVersion will not be got ongoing
        this.calledSW = true;
        if (this.swUpdate && this.swUpdate.isEnabled) {
          this.enabledSWCalled = true;
          this.swUpdate.checkForUpdate();
        }
      }
      return true;
    }
  }

  // Updates Logic
  // The service worker auto checks for updates during initialization and on each navigation request that is, when the user navigates from a different address to this app. If this app is left open then the below is important
  // this is called on change of module to save a timer as not mission critical
  // returns promise void BUT getVersionAvailable fires if a version is available
  // CAUTION if got once, not updated and checked again does not cause the available event below to fire a second time
  // so we have a flag set that on change of module in Nav-menu can be checked causing a reload when we want it
  //
  // updates.unrecoverable.subscribe(event => { not in this version
  //   notifyUser(
  //     `An error occurred that we cannot recover from:\n${event.reason}\n\n` +
  //     'Please reload the page.');
  // });

  getWebVersion() {
    this.myHttp.getWeb<WebVersion>('/version.json').subscribe({
      next: (data) => {
        this.availableVersion = data.semver;
      }, error: (error: any) => {
        this.availableVersion = '';
        try {
          // ignore if offline
          this.errMsg = error.message;
        } catch {
        }
      }
    });

  }

  // this.getWeb<WebVersion>('/version.json').subscribe({
  //   next: (data) => {
  //     this.availableVersion = data.semver;
  //   }, error: (error: any) => {
  //     this.availableVersion = '';
  //     try {
  //       this.errMsg = error.message;
  //     } catch {
  //     }
  //   }
  // });
  // getWeb<T>(url: string): Observable<T> {
  //   const uri = this.envConfigService.webUrl + url + '?t=' + new Date().getTime();
  //   return this.http.get<T>(uri).pipe(
  //     map(res => {
  //       return res;
  //     })
  //   );
  // }

  getBuildTypeName(): string {
    switch (this.envConfigService.envName) {
      case EnvName.Local:
        return 'Debug';
      case EnvName.PrPreview:
        return 'Pr-Preview';
      case EnvName.Staging:
        return 'Staging';
      default:
        return 'Live';
    }
  }



  getBuildTypeNum(): number {
    switch (this.envConfigService.envName) {
      case EnvName.Local:
        return 2;
      case EnvName.PrPreview:
        return 1;
      case EnvName.Staging:
        return 1;
      default:
        return 0;
    }
  }

}

// export interface WebVersion {
//   semver: string;
// }

// export enum EnvName {
//   Local = 'local',
//   PrPreview = 'pr-preview',
//   Staging = 'staging',
//   Live = 'live'
// }
