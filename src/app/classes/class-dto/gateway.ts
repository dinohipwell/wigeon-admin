import { DB } from "../../classes/static/db.static";

export class FsGateway {
  // 1 record exists per user per business this allows you to use
  // Doc id = email + bId if no user Id IE this gateway is an offer to share not yet accepted OR userId + bId for normal records
  id: string; // needed for editing but NOT used as docId
  userId: string; // is left blank if making an offer to share as the OFFERER does not know any userIds
  email: string; // always present
  orgId: string; // path to the business
  bId: string; // business this allows access to
  role: string;// role	g = Grower a = Agronomist c = Contractor v = Advisor o = Other
  permissions: string;
  epoc: number; // 0=all -1= from last year -2=from 2 years agaon etc else is the fuzy harvest year to start getting data
  rights: number; // bit map initially as number 1 2 4 8 etc for speed of coding

  dtn: number;
  // see Wigeon Online Firebase DB doc
  // rights
  // 0 None
  // 1 Readonly Permissions - Sub Roles control access but NO write
  // 2 Permissions - must use sub roles to control access/editing
  // 4 Business Administrator - full access and editing no sub roles used



  constructor(userId: string, email: string, orgId: string, bizId: string, role: string, rights: number, permissions: string, epoc: number) {
    this.id = DB.generateGuid();
    this.email = email;
    this.orgId = orgId;
    this.bId = bizId;
    this.role = role;
    this.permissions = permissions;
    this.rights = rights;
    this.userId = userId;
    this.epoc = epoc;
    this.dtn = DB.getNowNumber();
  }
}
