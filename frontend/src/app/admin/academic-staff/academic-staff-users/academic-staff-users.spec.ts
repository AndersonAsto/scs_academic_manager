import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicStaffUsers } from './academic-staff-users';

describe('AcademicStaffUsers', () => {
  let component: AcademicStaffUsers;
  let fixture: ComponentFixture<AcademicStaffUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicStaffUsers],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicStaffUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
