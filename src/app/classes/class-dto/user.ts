export class FsUser {
  // 1 record per user as defined by email
  // Maximum rights and roles that Gateway records cannot go above

  userId: string; // doc id
  email: string;
  displayName: string;
  orgId: string;
  dt: Date;
  role: string;
  rights: number;

  // see Wigeon Online Firebase DB doc
  // role - default	g=Grower a=Agronomist c=Contractor v=Advisor o=Other

  // Maximum rights and roles that Gateway records cannot go above

  // rights
  // 0	No use of Wigeon at all
  // 1	Readonly Sub Roles - never writable sub roles control access
  // 2	Sub Roles - Member may use existing businesses by sub role
  // 4	Business Administrator - Member may add businesses for his organisation for his use
  // 8	Organisation Administrator - may update other users gateway records for this orgId, share businesses in his organisation
  // 64	Developer - Dino



  constructor();
  constructor(userId: string, email: string, orgId: string, role: string, rights: number, displayName: string);
  constructor(userId: string = '', email: string = '', orgId: string = '', role: string = '', rights: number = 0, displayName: string = '') {
    this.email = email;
    this.orgId = orgId;
    this.dt = new Date();
    this.role = role;
    this.rights = rights;
    this.userId = userId;
    this.displayName = displayName;
  }
}
