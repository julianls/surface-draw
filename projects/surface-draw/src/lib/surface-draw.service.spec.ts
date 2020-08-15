import { TestBed } from '@angular/core/testing';

import { SurfaceDrawService } from './surface-draw.service';

describe('SurfaceDrawService', () => {
  let service: SurfaceDrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurfaceDrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
