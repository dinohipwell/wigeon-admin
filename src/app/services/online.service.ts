import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { MyHttpService, WebVersion } from './my-http.service';

@Injectable({
  providedIn: 'root'
})

export class OnlineService implements OnDestroy {


  private myHttp = inject(MyHttpService);
  private internalConnectionChanged = new BehaviorSubject<boolean>(true); // default to most likely case
  private internalVisibiltyChanged = new BehaviorSubject<boolean>(true);
  private myTimer: any = null;
  private subscription: any = null;

  get visibiltyChanged$() {
    return this.internalVisibiltyChanged.asObservable();
  }

  get connectionChanged$() {
    return this.internalConnectionChanged.asObservable();
  }


  constructor() {
    window.addEventListener('online', () => this.checkUpdateOnlineStatus());
    window.addEventListener('offline', () => this.checkUpdateOnlineStatus());
    window.addEventListener('visibilitychange', () => this.visibilitychange());
    // inital settings
    this.checkUpdateOnlineStatus();
    this.visibilitychange()
  }

  ngOnDestroy(): void {
    // clear up
    this.endTimer();
    if (this.internalConnectionChanged) {
      this.internalConnectionChanged.unsubscribe();
    }
    if (this.internalVisibiltyChanged) {
      this.internalVisibiltyChanged.unsubscribe();
    }

  }


  private visibilitychange() {
    // This event fires with a visibilityState of hidden when a user navigates to a new page, switches tabs, closes the tab, minimizes or closes the browser, or, on mobile, switches from the browser to a different app. Transitioning to hidden is the last event that's reliably observable by the page, so developers should treat it as the likely end of the user's session (for example, for sending analytics data).

    if (document.hidden) {
      this.internalVisibiltyChanged.next(false);
    } else {
      this.internalVisibiltyChanged.next(true);
    }
  }

  public checkUpdateOnlineStatusTest(b: boolean) {
    // real online status has changed
    this.internalConnectionChanged.next(b);
  }

  public checkUpdateOnlineStatus() {
    // real online status may have changed
    // may be called from firebase if it gets an error
    if (window.navigator.onLine) {

      // coming back online so check server which will also check authorisation and hence isLoggedIn
      this.myHttp.getWeb<WebVersion>('/version.json').subscribe({
        next: (data) => {
          // this.availableVersion = data.semver; as used by service-worker
          // back online so stop the watch
          this.endTimer();
          this.internalConnectionChanged.next(true); // override
        }, error: (error: any) => {
          // offline down the line so start a watch to see when back
          this.startTimerWithDelay();
          this.internalConnectionChanged.next(false);
        }
      });

    } else {
      // stop the watch if one is on as device turned offline and we will know when back on\
      this.endTimer();
      this.internalConnectionChanged.next(false);
    }
  }

  public endTimer() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.myTimer = null;
  }

  public startTimerWithDelay() {
    if (!this.myTimer) {
      // only start if needed - interval 0.5 min
      this.myTimer = timer(30000, 30000);
      this.subscription = this.myTimer.subscribe(() => {
        this.checkUpdateOnlineStatus();
      });
    }
  }

  // public checkServerIsOk() {
  //   // called from nav bar
  //   if (window.navigator.onLine) {
  //     // coming back online so check server which will also check authorisation and hence isLoggedIn
  //     this.checkServer().subscribe(b => {
  //       if (this.serverOffForMaintenance !== b) {
  //         // if changed raise observable event
  //         this.serverOffForMaintenance = b;
  //         this.internalConnectionChanged.next(!this.serverOffForMaintenance);
  //       }
  //     });
  //   }
  // }





}
