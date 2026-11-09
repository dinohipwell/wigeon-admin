import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, HostBinding, ChangeDetectorRef, inject } from '@angular/core';
import { timer, catchError, map, Observable, of, throwError } from 'rxjs';

import { StateService } from 'src/app/services/state.service';
import { WindowService } from 'src/app/services/window.service';
import { DB } from 'src/app/classes/static/db.static';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent {
  stateService = inject(StateService);
  private windowService = inject(WindowService);

  public myWidth = 0;
  public dropped = false;
  public activeName = '';
  public activeNum = -999;


  @Input() logoHeight = 0;
  @Input() title = '';
  @Input() items: NavItem[] = [];
  @Input() set pickedNum(num: number) {
    if (this.activeNum !== num) {
      this.activeNum = num;
      const i = this.items.findIndex(x => x.num === num);
      this.activeName = (i === -1) ? '' : this.items[i].name;
    }
  }
  @Input() stackedMaxWidth = 850;

  @Output() picked = new EventEmitter<number>();
  @Output() pickedItem = new EventEmitter<NavItem>();

  constructor() {
    this.myWidth = this.stateService.screenWidth;
  }
  pick(n: NavItem) {
    this.picked.emit(n.num);
    this.pickedItem.emit(n);
    this.activeName = n.name;
    this.dropped = false;
  }

  @HostListener('window:resize', []) onResize() {
    // parent does not scroll
    this.myWidth = this.stateService.screenWidth;

  }
}

export class NavItem {
  num: number;
  name: string;
  path: string;
  constructor(num: number, name: string) {
    this.num = num;
    this.name = name;
    this.path = '';
  }
}

