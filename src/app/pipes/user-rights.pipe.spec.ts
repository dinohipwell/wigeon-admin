import { UserRightsPipe } from './user-rights.pipe';

xdescribe('UserRightsPipe', () => {
  it('create an instance', () => {
    const pipe = new UserRightsPipe();
    expect(pipe).toBeTruthy();
  });
});
