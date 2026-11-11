import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToolbarErrorComponent } from '@components/sub-components/toolbar-error.component';
import { AdminFirebaseService } from '@services/admin-firebase.service';
import { FirebaseService } from '@services/firebase.service';
import { OnlineService } from '@services/online.service';
import { StateService } from '@services/state.service';
import { Subscription } from 'rxjs';
import { FsGateway } from 'src/app/classes/class-dto/gateway';
import { FsOrganisation } from 'src/app/classes/class-dto/organisation';
import { FsUser } from 'src/app/classes/class-dto/user';
// import { DtoOperator } from 'shared-classes';

@Component({
  selector: 'app-user',
  imports: [FormsModule, ToolbarErrorComponent, DatePipe],
  templateUrl: './user.component.html',
  styles: [],
})
export class UserComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  public stateService = inject(StateService);
  public onlineService = inject(OnlineService);
  private service = inject(AdminFirebaseService);
  private fsService = inject(FirebaseService);

  private connectionChanged$: Subscription;


  public isOnline = false;
  public editMode = false;
  public users: FsUser[] = null;
  public email = '';
  public enterprise: FsOrganisation = null;
  public gateways: FsGateway[] = null;

  constructor() {
    this.connectionChanged$ = this.onlineService.connectionChanged$.subscribe({
      next: (data: boolean) => {
        this.isOnline = data;
      }
    });
  }

  ngOnInit(): void {
    if (this.stateService.userRights < 64) {
      this.router.navigateByUrl('/home');
    }

  }

  ngOnDestroy(): void {
    if (this.connectionChanged$) {
      this.connectionChanged$.unsubscribe();
      this.connectionChanged$ = null;
    }
  }

  // test() {

  //   this.service.getEmailNoUidGateway$('aaaaaaa')
  //     .subscribe({
  //       next: (data) => {
  //         this.service.getUidBidGateway$('aaaaaaa')
  //           .subscribe({
  //             next: (data) => {
  //               const t = 0;
  //             }, error: (e: any) => {
  //               this.stateService.spinnerHide();

  //             }
  //           });
  //       }, error: (e: any) => {
  //         this.stateService.spinnerHide();

  //       }
  //     });
  // }

  getList() {
    // let op = DtoOperator;

    // // "shared-classes": "../widgeonapp/client/src/app/shared/index.ts"

    // ,
    // "@shared-models": [
    //   "../widgeonapp/client/src/app/shared/index.ts"
    // ]

    // ,
    // "../widgeonapp/client/src/app/shared/**/*.ts"

    if (this.email) {
      this.stateService.spinnerShowLoad();
      this.service.getUsersByEmail$(this.email).subscribe({
        next: (data: FsUser[]) => {
          this.users = data;
          if (data.length > 0) {
            this.getOrganisation(this.users[0].orgId);
            this.getGateways(this.users[0].userId, this.users[0].email);
          } else {
            this.enterprise = null;
            this.gateways = null;
          }
          this.stateService.spinnerHide();

        }, error: (err: any) => {
          this.users = null;

          this.stateService.spinnerHide();

        }
      });
    }
  }

  getOrganisation(id: string) {
    this.fsService.getFsOrganisation$(id)
      .subscribe({
        next: (data: FsOrganisation) => {
          this.enterprise = data;
          this.stateService.spinnerHide();

        }, error: (err: any) => {
          this.enterprise = null;

          this.stateService.spinnerHide();

        }
      });
  }

  getGateways(id: string, email: string) {
    this.service.getGatewayList$(id, email).subscribe({
      next: (data: FsGateway[]) => {
        this.gateways = data;
        this.stateService.spinnerHide();

      }, error: (err: any) => {
        this.gateways = null;

        this.stateService.spinnerHide();

      }
    });
  }
  close() {

  }

}
