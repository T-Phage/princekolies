import { TestBed } from '@angular/core/testing';

import { ScriploadService } from './scripload.service';

describe('ScriploadService', () => {
  let service: ScriploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScriploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
