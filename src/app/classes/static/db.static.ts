import { v7 as uuidv7 } from 'uuid';
import { TableBase } from '../class-dto/tableBase';


export class DB {

  static getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  static getTodayNumber(): number {
    return this.getToday().getTime();
  }

  static getNow(): Date {
    const today = new Date();
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today;
  }

  static getNowNumber(): number {
    // use for Items dates with time as hours and minutes BUT NOT for database time stamps as NO milliseconds
    return this.getNow().getTime();
  }

  static getMilliNowNumber(): number {
    // use for database time stamps as include milliseconds
    return Date.now();
  }

  static parseTimeNumber(dateString: any): number {
    if (dateString) {
      const dt = new Date(dateString);
      dt.setSeconds(0, 0);
      return dt.getTime();
    } else {
      return this.getNow().getTime(); // clear button has been pressed
    }
  }

  static parseDateNumber(dateString: any): number {
    if (dateString) {
      const dt = new Date(dateString);
      dt.setHours(0, 0, 0, 0);
      return dt.getTime();
    } else {
      return this.getToday().getTime(); // clear button has been pressed
    }
  }

  static getMonday(dtn: number) {
    const d = new Date(dtn);
    var day = d.getDay(); // get day of week
    // const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    d.setDate(d.getDate() - day + (day == 0 ? -6 : 1));
    return d.getTime();
  }

  static getMonthNamesList(): string[] {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  // static newClearedObject(obj: TableBase, tble: TableTpe): TableBase {
  //   // used by bulk prep data for saving
  //   const temp = Object.assign({}, obj);
  //   Object.keys(temp).forEach(k => {
  //     if (k.endsWith('Z')) { // objects
  //       DB.setProperty(temp as any, k, null);
  //     } else if (k.endsWith('DO')) { // strings
  //       DB.setProperty(temp as any, k, '');
  //     }
  //   });
  //   // clear sub object Z properties
  //   if (tble === TableTpe.jobProduction) {
  //     (temp as DtoJobProduction).prods.forEach(pp => pp.opActsZ = null);
  //   }
  //   return temp;
  // }

  static getProperty<T, K extends keyof T>(obj: T, key: K) {
    // same as  (obj as SpatialBase)[k]
    // use as  DB.getProperty(temp as SpatialBase, k)
    // CAUTION - where k is property name valid in SpatialBase class

    return obj[key]; // Inferred type is T[K]

  }

  static setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
  }

  static calcDateOnlyNow(): number {
    // const x = new Date().setHours(0, 0, 0, 0);
    // const a = new Date();
    // a.setHours(0, 0, 0, 0);
    // const bx = a.getTime();
    // x === bx
    // today
    return new Date().setHours(0, 0, 0, 0);
  }

  static generatePin6(): string {
    // 10,000 run length
    // 4 length out of 4618 duplicated
    // 6 length run 1 95 repeated run 2=84 run 3=81
    const p: number[] = new Array(5);
    let n: number;
    for (let i = 0; i < 6; i++) {
      do {
        // remove any repeated chars
        n = this.getRandomInt(0, 9);
      } while (i > 0 && p[i - 1] === n)
      p[i] = n;;
    }
    return p.join('');
  }

  /**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
  private static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateGuid(): string {
    // Output: "guid-1665869183562-784124"
    // return `guid-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;
    // const s = uuidv7({ msecs: DB.getMilliNowNumber() });
    return uuidv7();

  }

  static bit_test(num: number, bit: number) {
    // bit is zero based index
    // tslint:disable-next-line:no-bitwise
    return ((num >> bit) % 2 !== 0);
  }

  static bit_set(num: number, bit: number) {
    // bit is zero based index
    // tslint:disable-next-line:no-bitwise
    return num | 1 << bit;
  }

  static bit_clear(num: number, bit: number) {
    // bit is zero based index
    // tslint:disable-next-line:no-bitwise
    return num & ~(1 << bit);
  }

  static bit_setAs(num: number, bit: number, b: boolean) {
    // bit is zero based index
    return (b) ? this.bit_set(num, bit) : this.bit_clear(num, bit);
  }

  static bit_toggle(num: number, bit: number) {
    return this.bit_test(num, bit) ? this.bit_clear(num, bit) : this.bit_set(num, bit);
  }


  uniqueListBy(a: TableBase[], key: any) {
    // call as const fields = this.uniqBy(this.fieldsList.filter(x => x.picked), (f: PfFieldItem) => f.field.id);
    // cool key = (f: PfFieldItem) => f.field.id to use as compare

    // also if non object can just use
    // uniq = [...new Set(array)];

    const seen = new Set();
    return a.filter(item => {
      const k = key(item);
      return seen.has(k) ? false : seen.add(k);
    });
  }

}
