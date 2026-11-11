import { AfterContentInit, Component, OnDestroy, OnInit, afterNextRender, inject } from '@angular/core';
import { Subscription, timer } from 'rxjs';


import { StateService } from 'src/app/services/state.service';


@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  // standalone: true,
  styles: []
})
export class SpinnerComponent implements OnInit, OnDestroy {
  stateService = inject(StateService);

  // Navigate must use replaceUrl see below so browser history does not take you back to displaying the spinner
  // this.router.navigate([{ outlets: { message: (bShow) ? 'spinner' : null } }], {replaceUrl: true});
  public shown = false;
  public showMe = false;
  private myTimer: any = null;
  private subscription: any = null;
  public showClose = false;

  public spinnerProgress = -1;
  public spinnerText = '';
  public spinnerProgressText = '';

  private mySpinnerOnChanged$: Subscription;

  constructor() {
    this.mySpinnerOnChanged$ = this.stateService.spinnerOnChanged$.subscribe({
      next: (data: [number, string]) => {
        this.spinnerProgress = data[0];
        this.spinnerProgressText = data[1];
      }
    });

  }

  ngOnInit() {
    this.spinnerText = this.stateService.spinnerText;
    this.showClose = false;
    this.shown = false;
    this.showMe = true;


    const timerInstance = timer(25);
    timerInstance.subscribe(t => {
      this.shown = true; // also use this to show progress bar and text else get a ExpressionChangedAfterItHasBeenCheckedError
    });

    this.myTimer = timer(10000);
    this.subscription = this.myTimer.subscribe(() => {
      this.showClose = true;

    });

  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.myTimer = null;
    if (this.mySpinnerOnChanged$) {
      this.mySpinnerOnChanged$.unsubscribe();
      this.mySpinnerOnChanged$ = null;
    }
  }

  close() {
    this.stateService.spinnerHide();
  }

}
