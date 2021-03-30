import { TestBed } from '@angular/core/testing';

import { ParkingSpotsService } from './parkingspots.service';

describe('ParkingSpotsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParkingSpotsService = TestBed.get(ParkingSpotsService);
    expect(service).toBeTruthy();
  });
});
