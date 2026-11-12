import { TestBed } from '@angular/core/testing';

import { EnvConfigService } from '../services/env-config.service';

xdescribe('EnvConfigService', () => {
  let service: EnvConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
