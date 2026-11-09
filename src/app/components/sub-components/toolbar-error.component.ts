import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-toolbar-error',
  templateUrl: './toolbar-error.component.html'
})
export class ToolbarErrorComponent implements OnDestroy {
  public errorService = inject(ErrorService);
  private cdr = inject(ChangeDetectorRef);
  private errorListChanged$: Subscription;

  // shows above modals so modals
  // fixed to bottom of screen
  // is semi transparent
  // has it's own dismiss bar



  constructor() {
    // this.isLoggedIn = this.stateService.isLoggedIn
    // this.errorService.errorList
    this.errorListChanged$ = this.errorService.onErrorListChanged$.subscribe({
      next: (data: boolean) => {
        if (data) {
          this.cdr.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.errorListChanged$) {
      this.errorListChanged$.unsubscribe();
      this.errorListChanged$ = null;
    }
  }

  close() {
    this.errorService.clearErrors();
    // this.clearErr.emit('');
  }



}

