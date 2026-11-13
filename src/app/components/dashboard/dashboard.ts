import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminFirebaseService } from '@services/admin-firebase.service';
import { FirebaseService } from '@services/firebase.service';
import { OnlineService } from '@services/online.service';
import { StateService } from '@services/state.service';
import { Subscription } from 'rxjs';
import { FsBusinessList } from 'src/app/classes/class-dto/business';
import { FsGateway } from 'src/app/classes/class-dto/gateway';
import { FsOrganisation } from 'src/app/classes/class-dto/organisation';
import { ToolbarErrorComponent } from '@components/sub-components/toolbar-error.component';
import { DropDownComponent } from '@components/common/drop-down.component';

@Component({
  selector: 'app-dashboard',
  imports: [ToolbarErrorComponent, DropDownComponent],
  templateUrl: './dashboard.html',
  styles: [],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  public stateService = inject(StateService);
  public onlineService = inject(OnlineService);
  private service = inject(AdminFirebaseService);
  private fsService = inject(FirebaseService);

  private connectionChanged$: Subscription;
  public isOnline = false;
  public list: FsOrganisation[] = null;
  public item: FsOrganisation = null;

  public editMode = false;
  public businessList: FsBusinessList[] = null;
  public gateways: FsGateway[] = null;

  public foundItemId = '';
  public foundName = '';

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
    this.getList();

  }

  ngOnDestroy(): void {
    if (this.connectionChanged$) {
      this.connectionChanged$.unsubscribe();
      this.connectionChanged$ = null;
    }
  }

  getList() {

    this.stateService.spinnerShowLoad();
    this.service.getOrganisationsList$().subscribe({
      next: (data: FsOrganisation[]) => {
        this.list = data;

        this.stateService.spinnerHide();

      }, error: (err: any) => {
        this.list = null;

        this.stateService.spinnerHide();

      }
    });
  }

  selectOrganisation(n: FsOrganisation) {
    this.item = n;
    this.getBusinessList();
  }

  getBusinessList() {

    this.stateService.spinnerShowLoad();
    this.gateways = null;
    this.foundItemId = '';
    this.service.getBusinessList$(this.item.docId).subscribe({
      next: (data: FsBusinessList[]) => {
        this.businessList = data;

        this.stateService.spinnerHide();

      }, error: (err: any) => {
        this.businessList = null;

        this.stateService.spinnerHide();

      }
    });
  }

  displayBusiness(n: FsBusinessList) {

    this.foundItemId = (n) ? n.bId : '';
    if (n) {
      this.foundName = n.name;
      this.getGateways();
    } else {
      this.gateways = null;
    }
  }

  getGateways() {

    this.stateService.spinnerShowLoad();
    this.service.getGatewaysList$(this.foundItemId).subscribe({
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
