import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicStaffContracts } from './academic-staff-contracts';

describe('AcademicStaffContracts', () => {
  let component: AcademicStaffContracts;
  let fixture: ComponentFixture<AcademicStaffContracts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicStaffContracts],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicStaffContracts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
