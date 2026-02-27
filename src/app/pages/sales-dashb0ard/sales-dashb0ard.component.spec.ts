import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDashb0ardComponent } from './sales-dashb0ard.component';

describe('SalesDashb0ardComponent', () => {
  let component: SalesDashb0ardComponent;
  let fixture: ComponentFixture<SalesDashb0ardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDashb0ardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesDashb0ardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
