import { TestBed } from '@angular/core/testing';

import { SwalservicesService } from './swalservices.service';

describe('SwalservicesService', () => {
  let service: SwalservicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwalservicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
