import { TestBed, inject } from '@angular/core/testing';

import { MyHttpService, MyRequestOptions } from './my-http.service';

xdescribe('MyHttpService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyHttpService]
    });
  });

  it('should be created', inject([MyHttpService], (service: MyHttpService) => {
    expect(service).toBeTruthy();
  }));
});
