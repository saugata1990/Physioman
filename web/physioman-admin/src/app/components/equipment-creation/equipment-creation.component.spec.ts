import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCreationComponent } from './equipment-creation.component';

describe('EquipmentCreationComponent', () => {
  let component: EquipmentCreationComponent;
  let fixture: ComponentFixture<EquipmentCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
