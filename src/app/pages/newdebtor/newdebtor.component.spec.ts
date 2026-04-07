import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewdebtorComponent } from './newdebtor.component';

describe('NewdebtorComponent', () => {
  let component: NewdebtorComponent;
  let fixture: ComponentFixture<NewdebtorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewdebtorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewdebtorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
