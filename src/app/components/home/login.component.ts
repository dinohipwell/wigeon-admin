import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { StateService } from 'src/app/services/state.service';

import { UserInfo } from '@angular/fire/auth';
import { OnlineService } from 'src/app/services/online.service';
import { ErrorService } from 'src/app/services/error.service';
import { FormsModule } from '@angular/forms';

import { UserRightsPipe } from '../../pipes/user-rights.pipe';
import { UserRolesPipe } from '../../pipes/user-roles.pipe';
import { WindowService } from 'src/app/services/window.service';
import { Subscription } from 'rxjs';
import { ToolbarErrorComponent } from '../sub-components/toolbar-error.component';




@Component({
  selector: 'app-login',
  // imports: [],
  templateUrl: './login.component.html',
  styles: ``,
  imports: [FormsModule, UserRightsPipe, UserRolesPipe, ToolbarErrorComponent]
})
export class LoginComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private firebaseService = inject(FirebaseService);
  public stateService = inject(StateService);
  private onlineService = inject(OnlineService);
  private errorService = inject(ErrorService);

  private windowService = inject(WindowService)



  public title = 'Login';
  public mode = 0;  // 0=online ready to start logging on 1-local login  201=process

  public info = 0;
  public localStorageOk = false;
  public isOnline = false;
  public isLoggedIn = 0;
  public processingPassword = false
  public email = ''; // auto filled by html due to input type
  public password = ''; // ditto
  public offlinePassword = '';
  public resetPin = false;

  private myLoggedOnChanged$: Subscription;
  private connectionChanged$: Subscription;
  constructor() {

    this.connectionChanged$ = this.onlineService.connectionChanged$.subscribe({
      next: (data: boolean) => {
        if (this.isOnline !== data) {
          this.isOnline = data;
          this.password = ''; // as shown if go offline and would be the online code
        }
      }
    });

    this.myLoggedOnChanged$ = this.stateService.loggedOnChanged$.subscribe({
      next: (data: number) => {
        if (this.isLoggedIn !== data) {
          this.isLoggedIn = data;
          if (data) {
            this.title = 'User Account';
          } else {
            this.title = 'Login';
          }

        }
      }
    });

  }

  ngOnInit() {
    this.windowService.scrollToTop();
    // important to be sure
    this.onlineService.checkUpdateOnlineStatus();
    const url = this.router.url;

    this.localStorageOk = this.firebaseService.testLocalStorage();
    this.mode = 0;
    if (this.isLoggedIn === 11) {

    } else if (this.isLoggedIn === 1) {
      if (this.isOnline) {
        // go for proper login
      } else {
        this.mode = 1; // local login
      }

    }

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

  logout() {
    this.firebaseService.logout();
  }

  login() {
    if (this.email && this.password) {
      this.stateService.spinnerShowProcess();
      this.processingPassword = true;
      this.errorService.clearErrors();

      if (this.isOnline) {
        this.firebaseService.logout(); // clear so change in status loads wigeon user
        this.firebaseService.passwordLogin$(this.email, this.password, this.resetPin).subscribe({
          next: (tup: [boolean, string]) => {
            this.password = '';
            this.processingPassword = false;
            this.stateService.spinnerHide();
            if (tup[0]) {
              this.offlinePassword = tup[1];
              this.mode = 201;
            } else {
              this.ok();
            }
          }, error: (err: any) => {
            // in list
            this.mode = 0;
            this.offlinePassword = '';
            this.processingPassword = false;
            this.stateService.spinnerHide();
          }
        });
      } else {
        // do not logout as offline and it happens late undoing this
        const ret = this.firebaseService.passwordLoginOffline(this.email, this.password);
        this.password = '';
        this.processingPassword = false;
        this.stateService.spinnerHide();
        if (ret === 1) {
          this.ok();
        }

      }
    }
  }
  rePassword() {
    if (this.email) {
      this.stateService.spinnerShowProcess();
      this.processingPassword = true;
      this.errorService.clearErrors();

      this.firebaseService.sendPasswordResetEmail$(this.email).subscribe({
        next: (data) => {
          if (data === 1) {
            this.mode = 2;
          }
          this.processingPassword = false;
          this.stateService.spinnerHide();

        }, error: (err: any) => {
          // in list
          this.processingPassword = false;
          this.stateService.spinnerHide();
        }
      });
    }
  }

  copyToClipBoard() {

    if (this.offlinePassword) {

      navigator.clipboard.writeText(this.offlinePassword).then(x => {

      }).catch((error) => {
        // this.errorService.addError(0, 'Clipboard copying error - ' + error);
      });
    }
  }

  ok() {
    this.router.navigateByUrl('/home');
  }
}
