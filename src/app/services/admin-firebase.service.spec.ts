import { TestBed, inject } from '@angular/core/testing';

import { AdminFirebaseService } from './admin-firebase.service';

xdescribe('AdminFirebaseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminFirebaseService]
    });
  });

  it('should be created', inject([AdminFirebaseService], (service: AdminFirebaseService) => {
    expect(service).toBeTruthy();
  }));
});
