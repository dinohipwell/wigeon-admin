import { DB } from "../../classes/static/db.static";
import { DataConstants } from "../static/constants";

export abstract class TableBase {
  id: string;
  tpe: number; // >1000 only has 1 tile  see MapConstants.markingOutLayerTpe
  // owner: string; // organisation.id of the owner or left blank if this is not important - USED BY SE
  bId: string; // Primary parent business id


  dtnCreated: number;
  dtnUpdated: number;
  deleted: boolean;
  inactive: boolean;
  version: number;

  //OD
  temp: number;


  constructor(bId: string, id: string = null) {
    this.bId = bId;
    if (id) {
      this.id = id;
    } else {
      this.id = DB.generateGuid();
    }
    this.tpe = 0;
    this.dtnCreated = DB.getMilliNowNumber();
    this.dtnUpdated = this.dtnCreated; // if same as dtnCreated then added without further changes - may have been saved
    this.deleted = false;
    this.inactive = false;
    this.version = DataConstants.dataVersion;
    this.temp = 0;

  }

}

export class STableBase {

  static logDataChanged(data: TableBase) {
    data.dtnUpdated = DB.getMilliNowNumber();
  }
}
