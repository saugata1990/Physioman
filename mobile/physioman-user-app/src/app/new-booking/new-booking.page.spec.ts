import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBookingPage } from './new-booking.page';

describe('NewBookingPage', () => {
  let component: NewBookingPage;
  let fixture: ComponentFixture<NewBookingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBookingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBookingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
