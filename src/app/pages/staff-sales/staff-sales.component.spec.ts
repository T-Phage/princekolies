import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffSalesComponent } from './staff-sales.component';

describe('StaffSalesComponent', () => {
  let component: StaffSalesComponent;
  let fixture: ComponentFixture<StaffSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffSalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StaffSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
