export enum UniCode {
  tick = '\u{2715}',
  tickFilled = '\u{2705}',
  cancelRed = '\u{274C}',
  cancel = 1
  // red U+274C &#10060;
  // black U+1F5D9 & #x1F5D9;


  // Symbol	Name	Unicode	TS/JS Escape	HTML Entity
  // ✓	Check Mark	U + 2714	\u2714 & #x2714;
  // ✔	Heavy Check Mark	U + 2715	\u2715 & #x2715;
  // ✅	Check Mark Emoji	U + 2705	\u{ 2705 }	& #x2705;
  // ☑	Ballot Box with Check	U + 2611	\u2611 & #x2611;


}

export enum PhosphorVector {
  // got from Google AI
  // Exact Phosphor 'Check' Bold vector path
  boldCheckPath = 'M22.94,11.06a1.5,1.5,0,0,1,0,2.12l-8,8a1.5,1.5,0,0,1-2.12,0l-4-4a1.5,1.5,0,1,1,2.12-2.12L13.5,17.69l6.94-6.94A1.5,1.5,0,0,1,22.94,11.06Z',
  // Exact Phosphor 'X' Bold vector path
  boldCrossPath = 'M21.06,9.44a1.5,1.5,0,0,1,0,2.12L16.62,16l4.44,4.44a1.5,1.5,0,1,1-2.12,2.12L14.5,18.12l-4.44,4.44a1.5,1.5,0,0,1-2.12-2.12L12.38,16,7.94,11.56a1.5,1.5,0,0,1,2.12-2.12L14.5,13.88l4.44-4.44A1.5,1.5,0,0,1,21.06,9.44Z'

}

export enum CropConstants {
  firstHarvestYear = 2020,
  lastHarvestYear = 2060
}

export enum MapConstants {
  mmPerInch = 25.4,

  maxScaleEdit = 15000,
  maxScaleDetail = 100000,
  maxScale = 1000000,

  minScale = 100,
  maxEntityWH = 100000, // 100km
  maxEntityPointCount = 10000,

  smoothDistance = 2,

  snapOnPixelWidth = 25,
  snapOffPixelWidth = 7,

  markingOutLayerGroupId = 'guid-markingout',
  // markingOutLayerTpe = 9001,
  //geoRegionLayerGroupTpe = 1001,
  //  surveyLayerGroupTpe = 1002,
  // backgroundImageLayerGroupTpe = 1003,
  //importedDataLayerGroupTpe = 1004,
  //featureSetLayerGroupTpe = 1005,

  pointComparisonMinDiff = 0.000001,

  topEntitySequence = -1,
  ToolOkToSave = "ToolOkToSave"
}

export enum LayerTpe {
  standardDrawing = 0,
  featureSet = 5,

  // in and ideal world I wish the below had single figure layer tpes
  // survey = 1002,
  // backgroundImage = 1003,
  // importedData = 1004,


  // > 1000 special type of layers
  fieldBoundary = 1002,
  zoneBoundary = 1004,
  geoRegion = 1109,
  fieldRows = 1006,
  markingOut = 9001,

  // backgroundImage = 1003,
  // importedData = 1004,
  // featureSet = 1005,

}

export enum LayerGroupTpe {
  standardDrawing = 0,
  geoRegion = 1001,
  survey = 1002,
  backgroundImage = 1003,
  importedData = 1004,
  featureSet = 1005,

}
export enum Epoc {
  allYears = 99999
}

export enum CaptionTpe {
  field = 0,
  zone = 1,
  block = 2, //cropRecord
  // harvest = 3,
  crop = 4, //sequence
  blocksCollective = 5,
  rowBed = 6,
}

export enum TopTableTpe {
  // Used by changeSets
  // Do NOT include any tables NOT synced via changeSets eg ent_ tables
  // NB if add to MUST ALSO see Firebase service download data
  none = 0,

  business = 1,
  field = 3,

  cropType = 7,

  jobNote = 21,
  jobProduction = 22,
  operator = 25,
  product = 26,
  productCost = 27,
  settingBiz = 29,
  settingOrgOB = 30,
  wPlan = 31,
  stock = 32,
  jobSample = 35,
  jobSensor = 42,
  pfData = 43,
  machinery = 37,

  mapKey = 53,
  timeTrack = 54,
  rPlan = 56,

  jobRecom = 101,


  map = 901, // contains other childs
  layerTile = 902, // normal map layers and not marking out layer // SEs as child changes
  layer = 932,
  superEntityTile = 921,
  styleGroup = 942, //  changeset holds all for a map
  superEntityBoundary = 951, // Boundary type as single SEs
  // not used yet as gridData goes to PfData - superEntityPF = 961, // pf data type as single SEs
}


export enum TableTpe {
  // LOGIC
  //======
  // IndexedDb tables
  // Ends in X and is not a sepperate table in DB but saved under the parent OR is a dummy table for dataBuffer
  // Ends in OB no indBid as outside of business
  // Object properties names ending in Z are nulled before data is put in DtoChange
  // Do NOT include any tables NOT synced via changeSets

  noneOB = 0, // for testing

  business = 1,

  link = 2, // used to link cropping to SE/Note/Production/etc BUT NOT saved under cropping only under the linked to object

  field = 3,
  zone = 4,
  block = 5,
  crop = 6,

  cropType = 7, // not used yet
  variety = 8, // not used yet

  field_workingX = 9, // dataBuffer second view of fields

  jobNote = 21,
  jobNoteX = 40,// dataBuffer second view
  jobProduction = 22,
  jobProductionX = 38,// dataBuffer second view
  jobProductionWPlanX = 49,

  opAction = 50,

  prodGroup = 23, // not used yet

  operator = 25,
  product = 26,
  productCost = 27,
  settingLocal = 28, // only saved in indexDB
  settingBiz = 29,
  settingOrgOB = 30, // may need to save elsewhere under org online

  wPlan = 31, // draft in buffer
  wPlanIssuedX = 44,
  wPlanStartedX = 45,
  wPlanCompletedX = 46,
  wPlanConfirmedX = 47,
  wPlanArchivedX = 48,

  stock = 32,

  cropSummary = 34,
  jobSample = 35,
  jobSampleX = 39,// dataBuffer second view
  jobSampleXX = 41,// dataBuffer second view
  jobSensor = 42,
  pfData = 43,
  // pfDataX=52,
  lastSync = 36,
  machinery = 37,

  // also in indexdb
  jobRecom = 101,
  jobRecomX = 102,// dataBuffer second view
  jobRecomRPlanX = 103,
  jobNoteRPlanX = 104,

  mapKey = 53,
  timeTrack = 54,
  timeTrackX = 55,// dataBuffer second view
  rPlan = 56,
  rPlanIssuedX = 57,
  rPlanStartedX = 58,
  rPlanCompletedX = 59,
  rPlanConfirmedX = 60,
  rPlanArchivedX = 61,

  // change and changeSet

  map = 901, // contains other childs

  layerTile = 902, // for mapping layers normal this is top table in changeSets

  superEntityTile = 921, // contains other childs
  superEntityBoundary = 951, // contains other childs
  superEntityPF = 961, // contains other childs

  entityX = 922, // x combined with SE
  subEntityX = 923, // x  combined with Entity

  layerGroup = 931, // object combined with map
  layer = 932, // object top table


  styleLink = 941, // object combined with SE and layer

  styleGroup = 942,

  style = 943, // object combined with map

  // mapView = 914, // only saved in indexedDB as per device/user
  // gmTile BUT google map tiles not saved online
}

export enum DataConstants {
  dataVersion = 1, // put in new DTO objects
  maxCatalgueBands = 5
}

export enum DateTimeConstants {
  msInDay = 86400000, // 24 * 60 * 60000
  msInHour = 3600000, // 60 * 60000
  msIn10Mins = 600000, // 10 * 60*1000
  msIn5Mins = 300000 // 5 * 60000
}
