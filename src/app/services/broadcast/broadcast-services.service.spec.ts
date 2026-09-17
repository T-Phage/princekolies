import { TestBed } from '@angular/core/testing';

import { BroadcastServicesService } from './broadcast-services.service';

describe('BroadcastServicesService', () => {
  let service: BroadcastServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BroadcastServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
