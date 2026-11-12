export class Message {
  text = '';
  tpe = 0; // 'wm-alert-box-danger': n.tpe===0, 'wm-alert-box-warning': n.tpe===1,'wm-alert-box-info': n.tpe===2,'wm-alert-box-success': n.tpe===3

  constructor(tpe: number, text: string) {
    this.tpe = tpe;
    this.text = text;
  }
}
