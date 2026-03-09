import { TestBed } from '@angular/core/testing';

import { DatabaleService } from './databale.service';

describe('DatabaleService', () => {
  let service: DatabaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatabaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
