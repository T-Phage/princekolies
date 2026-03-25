import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestockComponent } from './restock.component';

describe('RestockComponent', () => {
  let component: RestockComponent;
  let fixture: ComponentFixture<RestockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
