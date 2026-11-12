import { UserRolesPipe } from './user-roles.pipe';

xdescribe('UserRolesPipe', () => {
  it('create an instance', () => {
    const pipe = new UserRolesPipe();
    expect(pipe).toBeTruthy();
  });
});
