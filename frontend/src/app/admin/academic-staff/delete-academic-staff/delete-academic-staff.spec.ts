import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAcademicStaff } from './delete-academic-staff';

describe('DeleteAcademicStaff', () => {
  let component: DeleteAcademicStaff;
  let fixture: ComponentFixture<DeleteAcademicStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAcademicStaff],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAcademicStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
