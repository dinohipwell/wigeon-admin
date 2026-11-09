import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userRoles',
  standalone: true
})
export class UserRolesPipe implements PipeTransform {

  transform(value: string): string {
    // First letter ONLY
    value = value.slice(0, 1);
    if (value === 'A') {
      return 'Agronomist Link';
    } else if (value === 'M') {
      return 'Farm Manager';
    } else if (value === 'C') {
      return 'Contractor Link';
    } else if (value === 'V') {
      return 'Advisor Link';
    } else if (value === 'E') {
      return 'Farm Events Manager';
    } else if (value === 'S') {
      return 'Farm Shoot Manager';
    } else if (value === 'O') {
      return 'Farm Operator';
    } else if (value === 'U') {
      return 'Farm User';
    } else {
      return 'None';
    }

  }

}
