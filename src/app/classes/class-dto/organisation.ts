import { BusinessGroup, DtoBusiness, FsBusinessList } from "./business";
import { TableBase } from "./tableBase";

export class FsOrganisation {
  // used by firestore
  name: string = '';
  docId: string = '';

}

export class Organisation {
  // Constructed from FsOrganisation when data loaded so never actually directly saved
  name: string;
  docId: string;

  view: boolean;
  businessGrpList: BusinessGroup[];
  flag: number;


  constructor(docId: string, name: string) {
    // this is not on the prototype of json imported objects
    // but only used once for client generated new instances
    // ensures that all the properties exist so posting back to server type matches
    this.name = name;
    this.docId = docId;
    this.businessGrpList = [];
    this.view = false;
    this.flag = 0;

  }
}
