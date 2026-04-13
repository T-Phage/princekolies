import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleanalyticsComponent } from './saleanalytics.component';

describe('SaleanalyticsComponent', () => {
  let component: SaleanalyticsComponent;
  let fixture: ComponentFixture<SaleanalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleanalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaleanalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
