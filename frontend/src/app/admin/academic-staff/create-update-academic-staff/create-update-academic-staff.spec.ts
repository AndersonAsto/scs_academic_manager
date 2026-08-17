import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateAcademicStaff } from './create-update-academic-staff';

describe('CreateUpdateAcademicStaff', () => {
  let component: CreateUpdateAcademicStaff;
  let fixture: ComponentFixture<CreateUpdateAcademicStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateAcademicStaff],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateAcademicStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
