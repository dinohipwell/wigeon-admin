import { Component, EventEmitter, Input, Output, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styles: [],
  imports: [FormsModule, DatePipe]
})

export class DropDownComponent {
  public isDropped = false;

  @Input() nullItemWord = 'Pick...'; // if empty
  @Input() disabled = false;
  @Input() propId = 'id';
  @Input() propName = 'name';
  @Input() btnClass = 'wm-btn-outline-secondary';

  @Input() propIdList = 'id';
  @Input() propNameList = 'name';
  @Input() propNameListMinor = '';
  @Input() propNamegrey = '';

  @Input() item: any = null;
  @Input() item2: any = null;
  //   this.windowService.scrollListIdIntoView('crop' + crop.id);

  @Input() list: any[] = null;
  @Input() list2: any[] = null;

  @Input() fixedBtnText = '';
  @Input() fixedBtnIcon = 0;
  @Input() pickExtraObj: any = null;
  // If used used make sure parent div is ALWAYS >100px or else use class wm-list-min-h-100 for the parent div
  @Input() height100 = false; // false = height300 and true = height100px

  @Output() pick = new EventEmitter<any>();
  // use with number arrays instead of propId and propName
  // NB make new pipe in calling component
  @Input() pipeObj: PipeTransform = null;
  @Input() isColour = false;
  @Input() pipeObjMinor: PipeTransform = null;

  @Input() isColourSimple = false;
  @Input() isNote = false;

  drop() {
    this.isDropped = !this.isDropped;
  }

  picked(n: any) {
    // const idKey = Object.keys(this.item).find(k => k === this.idName);
    // DB.getProperty(this.item as any, this.propName);

    // (this.item as any)[this.propName]
    this.pick.emit((this.pickExtraObj) ? [n, this.pickExtraObj] : n);
    this.isDropped = false;
  }




  // Object list example
  //  <app-drop-down  [disabled]="!editMode" [height100]="true" [item]="croppingDataState.filterCropType" [list] = "croppingDataState.filterCropTypeList" (pick) = "croppingDataState.filterCropType=$event" > </app-drop-down>

  // Object list example BUT NOT a .name property add in:
  //  [propNameList]="'zName'" [propName]="'zName'"  NB note the inside ''
  //
  // [propIdList]="'idn'" [propId]="'idn'"

  // String list example
  // <app-drop-down [disabled]="!editMode" [height100]="true" [propId]="''" [propName]="''" [propIdList]="''" [propNameList]="''" [item]="months[item.stockMonth]" [list]="months" (pick)="pickMonth($event)" > </app-drop-down>

  // ID numbers list example using pipe
  // <app-drop-down [disabled]="editItem.status>maxEditStatus" [height100]="true" [propId]="''" [propName]="''"[propIdList]="''"[propNameList]="''"[item]="editItem.tpe"[pipeObj]="noteType" [list]="tasks"(pick)="pickTask($event)" > </app-drop-down>

  // <app-drop-down [disabled]="edi" [propId]="''" [propName]="''"[propIdList]="''"[propNameList]="''"[item]="editItem.tpe"[pipeObj]="noteType" [list]="tasks"(pick)="pickTask($event)" > </app-drop-down>

  // In code add
  // public noteType = new NoteTypePipe();


}
