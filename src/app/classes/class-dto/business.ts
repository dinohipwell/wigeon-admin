import { DB } from "../static/db.static";

import { FsGateway } from "./gateway";
import { TableBase } from "./tableBase";

export class BusinessPickerItem {
  // used in firestore
  fsBusinessList: FsBusinessList
  myGateWay: FsGateway;
  inactive: boolean; // taken from local business


  constructor(fsBusinessList: FsBusinessList, gateWay: FsGateway) {

    this.fsBusinessList = fsBusinessList;
    this.myGateWay = gateWay;
    this.inactive = fsBusinessList.status > 100;
  }
}


export class FsBusinessList {
  // used in firestore
  bId: string;
  orgId: string;
  name: string;
  status: number; // 1001 deleted 101 inactive
  shared: number;
  linkOrgId: string; // only if used fuzzy logic as linked biz may be removed from you system so only valid if there
  linkBId: string;
  customer: string;


  constructor(bId: string, name: string, orgId: string, customer: string) {

    this.bId = bId;
    this.orgId = orgId;
    this.name = name;
    this.status = 0;
    this.shared = 0;
    this.linkOrgId = '';
    this.linkBId = '';
    this.customer = customer;
  }
}

export class BusinessGroup {
  name: string;
  rTpe: number;
  view: boolean;
  businessPickerList: BusinessPickerItem[];

  constructor(rTpe: number) {
    this.rTpe = rTpe;
    this.view = false;
    // 30 = Owned Outright
    // pickable to use properly >10 to <60
    this.name = (rTpe === 1001) ? 'Deleted' : (rTpe === 35) ? 'Shared Full Access' : (rTpe === 40) ? 'Collaborations' : (rTpe === 5) ? 'Collaboration Requests' : (rTpe === 50) ? 'Read-onlys' : (rTpe === 60) ? 'Collaborator Linked Source' : (rTpe === 99) ? 'Offline Businesses' : 'Full Access';
    this.businessPickerList = [];
  }

}

export class DtoBusiness extends TableBase {

  skinTpe: number; // 0=generic 1 = agri
  name: string;

  customer: string;

  orgId: string; // organisation.id of the owner or left blank if this is not important - USED BY SE

  orgName: string;
  currencyUnitKey: string; // default storage currency unit. NB if changed whould have to work through all records converting data

  filterListsZ: any; // adminfix[] = null; // holds cropping data for display
  boundariesZ: any;  // adminfix DtoSuperEntity[] = null; // filled when needed for map displaying and loaded into boundary layers by being foud by link

  lastUsedGateWay: FsGateway = null;
  pic: string;
  address1: string;
  address2: string;
  address3: string;
  postcode: string;
  email: string;
  tel: string;

  stockMethod: number;  // 1=harvest year 0=last price
  stockDay: number;  // used for 12 month price period
  stockMonth: number;  // used for 12 month price period

  firstMapZ: any;// adminfix DtoMap; // set when biz is created

  long: number;
  lat: number;

  linkOrgId: string; // only if used fuzzy logic as linked biz may be removed from you system so only valid if there
  linkBId: string;

  catCostBand: string;

  // DO
  view: boolean;

  // test obj: DtoOperator;

  // constructor overload
  constructor(makeId: boolean);
  constructor(makeId: boolean, orgId: string, orgName: string, skinTpe: number, name: string, gateWay: FsGateway);
  constructor(makeId: boolean, orgId: string = '', orgName: string = '', skinTpe: number = 0, name: string = '', gateWay: FsGateway = null) {
    // this is not on the prototype of json imported objects
    // but only used once for client generated new instances
    // ensures that all the properties exist so posting back to server type matches
    const newId = (makeId) ? DB.generateGuid() : '';
    super(newId, newId); // id amd bId duplicates for normal business

    if (gateWay) {
      gateWay.bId = newId;
      this.lastUsedGateWay = gateWay;
    }
    this.orgId = orgId; // organisation
    this.orgName = orgName;
    this.currencyUnitKey = 'GBP';
    this.skinTpe = skinTpe;
    this.name = name;
    this.filterListsZ = [];
    this.boundariesZ = [];
    this.view = true;
    this.stockMethod = 0;
    this.stockDay = 1
    this.stockMonth = 7;// aug
    this.long = 0;
    this.lat = 0;
    this.firstMapZ = null;
    this.linkOrgId = '';
    this.linkBId = '';
    this.customer = '';
    this.catCostBand = '';
  }
}

