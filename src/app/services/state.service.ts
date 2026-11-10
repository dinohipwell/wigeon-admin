import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { WindowService } from './window.service';
import { OnlineService } from './online.service';
import { EnvConfigService } from './env-config.service';
import { EnvName } from './my-http.service';

// interface NavigatorIOSI extends Navigator {
//   standalone: any;
//   minimal - ui: any;
// }
// type NavigatorIOS = NavigatorIOSI & typeof globalThis.navigator;

@Injectable({
  providedIn: 'root'
})
export class StateService implements OnDestroy {
  private envConfigService = inject(EnvConfigService);
  private router = inject(Router);
  private windowService = inject(WindowService);

  public showInstallButton = false;
  public deferredInstallPrompt: any;

  // public hasMouse = false;
  public userId = '';
  public userName = '';
  public userEmail = '';

  public isLoggedIn = 0; // RO use setIsLoggedIn()
  // public isLoggedInOffline = false;

  public toolbarH = 0;
  public currentModuleId = -1;

  // auth levels ==================
  public isDeveloper = false;
  public isUserOrgAdmin = false;
  public isUserBizAdmin = false;// can add businesses
  public isUser = false;
  public isUserRO = false; // if not then not logged in or no longer valid user

  public userMemberOrgId = '';  // all from member user record in firestore
  public userRole = '';
  // there is NO USER Permissions
  public userRights = 0;
  // =====================================


  public extraSmallMode = false;
  public smallMode = false;
  public mediumMode = false;
  public portraitMode = false;
  public largeMode = false;
  public screenWidth = 100; // screen width

  public screenHeight = 100;

  public spinnerText = '';
  private spinnerProgress = -1;
  private spinnerProgressText = '';
  public spinnerIsShown = 0;
  private internalLoggedOnChanged = new BehaviorSubject<number>(0);
  private internalSpinnerOnChanged = new BehaviorSubject<[number, string]>([this.spinnerProgress, this.spinnerProgressText]);



  public showNav = true;

  public showCropSidebarOverride = false;
  public showCropSidebar = true; // always on now
  public showCropsMain = true;
  public showMapEngine = true;
  public printMapEngine = false; // use for printing

  public lastHelpTopic = 0;

  get loggedOnChanged$() {
    return this.internalLoggedOnChanged.asObservable();
  }

  get spinnerOnChanged$() {
    return this.internalSpinnerOnChanged.asObservable();
  }


  constructor() {
    this.setScreenSize(this.windowService.nativeWindow.innerWidth, this.windowService.nativeWindow.innerHeight);
  }

  ngOnDestroy() {
    if (this.internalLoggedOnChanged) {
      this.internalLoggedOnChanged.unsubscribe();
    }
    if (this.internalSpinnerOnChanged) {
      this.internalSpinnerOnChanged.unsubscribe();
    }
  }

  isDebugBuild(): boolean {
    return this.envConfigService.envName === EnvName.Local;
  }

  setIsLoggedIn(n: number) {
    // 11 =logged in online  1=offline logged in
    if (this.isLoggedIn !== n) {
      this.isLoggedIn = n;
      if (n < 1) {
        this.blankUser();
      }
      this.internalLoggedOnChanged.next(n); // raise observable event picked up in dataservice
    }
  }

  setSpinnerProgress(n: number, t: string | null) {

    if (t === null) {
      t = this.spinnerProgressText;
    }

    if (this.spinnerProgress !== n || this.spinnerProgressText !== t) {
      this.spinnerProgress = n;
      this.spinnerProgressText = t;
      this.internalSpinnerOnChanged.next([n, t]); // raise observable event picked up in spinner component
    }
  }

  blankUser() {
    this.userId = '';
    this.userName = '';
    this.userEmail = '';
    this.isDeveloper = false;
    this.isUserOrgAdmin = false;
    this.isUserBizAdmin = false;
    this.isUser = false;
    this.isUserRO = false;

    this.userMemberOrgId = '';
    this.userRole = '';
    this.userRights = 0;

  }




  setScreenSize(innerWidth: number, innerHeight: number) {

    this.screenHeight = innerHeight;
    if (this.screenWidth !== innerWidth) {
      this.screenWidth = innerWidth;
      this.extraSmallMode = innerWidth < 600; // see wm-grid-style phones
      this.smallMode = innerWidth >= 600; // < 768; // portraight tablets and larger phones
      this.mediumMode = innerWidth >= 768;
      this.largeMode = innerWidth >= 992;
      this.portraitMode = innerHeight > innerWidth;
    }
  }

  displayModeStandalone(): boolean {
    // @media all and(display-mode: standalone) {
    const nav = navigator as any;
    // isInWebAppiOS = (window.navigator.standalone === true);
    // isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
    // if (navigator.standalone) { displayMode = 'standalone-ios';
    // do not think is on IOS (window.matchMedia('(display-mode: minimal-ui)').matches) {

    return (window.matchMedia('(display-mode: standalone)').matches) || nav.standalone;
    // else is 'browser tab'

  }


  testLocalStorage(): boolean {
    try {
      const j = 'Ok';
      localStorage.setItem('ggg_check', j);
      const i = localStorage.getItem('ggg_check');
      return (i === j);
    } catch (e) {
      return false;
    }
  }

  private showSpinner(bShow: boolean) {
    if (bShow) {
      // 2 is needed as in too many case spinner is called BEFORE changing route to new page which itslef clears the spinner
      if (this.spinnerIsShown < 2) {
        this.spinnerIsShown++;
        this.router.navigate([{ outlets: { message: 'spinner' } }], { skipLocationChange: true });
      }
    } else if (this.spinnerIsShown > 0) {
      this.spinnerIsShown = 0;
      this.router.navigate([{ outlets: { message: null } }], { replaceUrl: true });
    }
  }

  spinnerHide() {
    this.showSpinner(false);
  }
  spinnerShowLoad() {
    this.spinnerText = 'Loading data, please wait...';
    this.setSpinnerProgress(-1, '');
    this.showSpinner(true);
  }

  spinnerShowSave() {
    if (this.isLoggedIn) { // } && this.onlineService.isOnline) {
      this.spinnerText = 'Saving data locally and syncing online, please wait...';
    } else {
      this.spinnerText = 'Saving data locally, please wait...';
    }
    this.setSpinnerProgress(-1, '');
    this.showSpinner(true);
  }

  spinnerShowProcess() {
    this.spinnerText = 'Processing data, please wait...';
    this.setSpinnerProgress(-1, '');
    this.showSpinner(true);
  }




}
