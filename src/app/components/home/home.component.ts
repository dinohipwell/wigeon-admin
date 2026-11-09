import { Component, OnInit, HostListener, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { StateService } from 'src/app/services/state.service';
import { WindowService } from 'src/app/services/window.service';

import { OnlineService } from 'src/app/services/online.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { DtoBusiness } from '../../classes/class-dto/business';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { UserRolesPipe } from '../../pipes/user-roles.pipe';
import { UserRightsPipe } from '../../pipes/user-rights.pipe';




// import { PermissionsPipe } from '../../pipes/permissions.pipe';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: [],
  imports: [DatePipe, UserRolesPipe, UserRightsPipe]
})
export class HomeComponent implements OnInit, OnDestroy {
  public stateService = inject(StateService);
  //public onlineService = inject(OnlineService);

  private windowService = inject(WindowService);
  private router = inject(Router);
  // workerService = inject(ServiceWorkerService);

  // private firebaseService = inject(FirebaseService);


  public localStorageOk = true;
  public isOnline = false;
  public isLoggedIn = 0;
  public error = '';
  public displayModeStandalone = false;
  public deferredPrompt: any;
  public dtToday: Date = null;
  public item: DtoBusiness = null;
  public deleteStage = 0;

  private myLoggedOnChanged$: Subscription;
  private connectionChanged$: Subscription;
  constructor() {

    // this.localStorageOk = this.stateService.testLocalStorage();
    // this.displayModeStandalone = this.stateService.displayModeStandalone();
    // this.dtToday = new Date();


    // this.connectionChanged$ = this.onlineService.connectionChanged$.subscribe({
    //   next: (data: boolean) => {
    //     if (this.isOnline !== data) {
    //       // if (data) {
    //       //   // clear the error which would have been logged and check
    //       //   this.workerService.checkVersionUpdateIfNeeded(false); // do not update so can see if needed
    //       // }
    //       this.isOnline = data;
    //     }
    //   }
    // });

    // this.myLoggedOnChanged$ = this.stateService.loggedOnChanged$.subscribe({
    //   next: (data: number) => {
    //     this.isLoggedIn = data;
    //     if (data < 1) {
    //       this.item = null;
    //     }
    //   }
    // });

  }

  ngOnInit() {
    // this.windowService.scrollToTop()
    // // important to be sure
    // this.onlineService.checkUpdateOnlineStatus();

  }

  ngOnDestroy(): void {
    if (this.myLoggedOnChanged$) {
      this.myLoggedOnChanged$.unsubscribe();
      this.myLoggedOnChanged$ = null;
    }
    if (this.connectionChanged$) {
      this.connectionChanged$.unsubscribe();
      this.connectionChanged$ = null;
    }
  }


  update() {
    //  this.workerService.checkVersionUpdateIfNeeded(true);
  }




  help() {
    //  this.router.navigateByUrl('/help');
  }


  login() {
    // this.router.navigateByUrl('/login');
  }

  // addToHomeScreen() {
  //   // hide our user interface that shows our A2HS button
  //   this.stateService.showInstallButton = false;
  //   // Show the prompt
  //   this.stateService.deferredInstallPrompt.prompt();
  //   // Wait for the user to respond to the prompt
  //   this.stateService.deferredInstallPrompt.userChoice
  //     .then((choiceResult: any) => {
  //       if (choiceResult.outcome === 'accepted') {
  //         // console.log('User accepted the A2HS prompt');
  //       } else {
  //         // console.log('User dismissed the A2HS prompt');
  //         this.stateService.showInstallButton = true;
  //       }
  //       this.stateService.deferredInstallPrompt = null;
  //     });
  // }

  // test() {
  //   this.firebaseService.getTestDoc$()
  //     .subscribe({
  //       next: (data) => {
  //         console.log('ss');

  //       }, error: (err: any) => {


  //       }
  //     });
  // }

}
