import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicStaff } from './academic-staff';

describe('AcademicStaff', () => {
  let component: AcademicStaff;
  let fixture: ComponentFixture<AcademicStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicStaff],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
