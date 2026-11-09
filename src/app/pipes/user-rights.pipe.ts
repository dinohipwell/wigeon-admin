import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRights',
  standalone: true
})
export class UserRightsPipe implements PipeTransform {

  transform(value: number): string {

    if (value === 1) {
      return 'By RO Permissions';
    } else if (value === 2) {
      return 'By Permissions';
    } else if (value === 4) {
      return 'Business Administrator';
    } else if (value === 8) {
      return 'Orgainsation Administrator';
    } else if (value === 64) {
      return 'Systems Developer';
    } else { // 0
      return 'None';
    }

  }

}
