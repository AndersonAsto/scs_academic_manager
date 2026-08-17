import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAcademicRecord } from './student-academic-record';

describe('StudentAcademicRecord', () => {
  let component: StudentAcademicRecord;
  let fixture: ComponentFixture<StudentAcademicRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAcademicRecord],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentAcademicRecord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
