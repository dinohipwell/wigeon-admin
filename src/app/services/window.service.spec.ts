import { TestBed, inject } from '@angular/core/testing';

import { WindowService } from './window.service';

xdescribe('WindowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowService]
    });
  });

  it('should be created', inject([WindowService], (service: WindowService) => {
    expect(service).toBeTruthy();
  }));
});
