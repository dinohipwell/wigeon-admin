import { Component, HostListener, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

import { WindowService } from 'src/app/services/window.service';
// import { StateService } from '../../../mapping/
import { StateService } from 'src/app/services/state.service';
import { NavComponent, NavItem } from '../sub-components/nav.component';
import { ServiceWorkerService } from '@services/service-worker.service';


@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html', imports: [NavComponent]
})
export class NavMenuComponent {

  stateService = inject(StateService);
  private windowService = inject(WindowService);
  private router = inject(Router);
  private location = inject(Location);
  private workerService = inject(ServiceWorkerService);

  public isNavbarOpen = false;

  public logoHeight = 38; // 130;
  private lastUrl = '';
  public buildNum = 0;
  public buildName = '';
  public modules: NavItem[] = [{ num: 1, path: '/home', name: 'Home' }, { num: 2, path: '/usermanager', name: 'User Manager' }];


  constructor() {

    this.buildNum = this.workerService.getBuildTypeNum();
    if (this.buildNum > 0) {
      // leave blank if live
      this.buildName = this.workerService.getBuildTypeName();
    }


    this.stateService.toolbarH = this.logoHeight + 10; // inc padding
    this.stateService.setScreenSize(this.windowService.nativeWindow.innerWidth, this.windowService.nativeWindow.innerHeight);



    // <a> tag with href="home" When used in Angular without the Angular Router triggers a full page reload

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isNavbarOpen = false;  // only gets to subscribe if url has changed
        if (event.url && this.lastUrl !== event.url) {
          if (event.url === '/home' || event.url === '/') {
            if (this.stateService.currentModuleId !== 1) {
              this.stateService.currentModuleId = 1;
              this.workerService.checkVersionUpdateIfNeeded(false); // do not update so can see if needed
              // {this.checkServer();}
            }
          } else {
            const m = this.modules.find(x => x.path === event.url) || null;
            if (m) {
              if (m.num > 0) {
                if (this.stateService.currentModuleId !== m.num) {
                  // change of module
                  this.stateService.currentModuleId = m.num;
                  this.workerService.checkVersionUpdateIfNeeded(true);
                }
              } else if (this.stateService.currentModuleId === 1) {
                this.stateService.currentModuleId = 0; // non module page from home page no longer highlight home nav as may be sub page of another module
              }
            }
          }
          this.lastUrl = event.url;
        }
      });
  }

  pick(n: NavItem) {


    if (n) {
      this.router.navigateByUrl(n.path);
    }

  }

  @HostListener('window:resize', []) reSize() {
    // allow for margin
    // const w = this.windowService.nativeWindow.innerWidth - 5;
    // const h = this.windowService.nativeWindow.innerHeight - 5;

    this.stateService.setScreenSize(this.windowService.nativeWindow.innerWidth, this.windowService.nativeWindow.innerHeight);

  }

  @HostListener('window:appinstalled', ['$event'])
  installedApp(e: any) {
    // installed web app by any means
    this.stateService.showInstallButton = false;
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: any) {
    // If your Progressive Web App meets the required installation criteria, the browser fires a beforeinstallprompt event
    // ie if already installed but you run from bowser will not get this
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.stateService.deferredInstallPrompt = e;
    this.stateService.showInstallButton = true;
  }
}
