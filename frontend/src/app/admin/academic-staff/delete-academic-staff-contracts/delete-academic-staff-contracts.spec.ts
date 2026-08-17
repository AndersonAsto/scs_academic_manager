import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAcademicStaffContracts } from './delete-academic-staff-contracts';

describe('DeleteAcademicStaffContracts', () => {
  let component: DeleteAcademicStaffContracts;
  let fixture: ComponentFixture<DeleteAcademicStaffContracts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAcademicStaffContracts],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAcademicStaffContracts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
