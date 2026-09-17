import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerviewComponent } from './customerview.component';

describe('CustomerviewComponent', () => {
  let component: CustomerviewComponent;
  let fixture: ComponentFixture<CustomerviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomerviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
