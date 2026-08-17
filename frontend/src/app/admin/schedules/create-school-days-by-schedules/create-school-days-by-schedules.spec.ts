import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSchoolDaysBySchedules } from './create-school-days-by-schedules';

describe('CreateSchoolDaysBySchedules', () => {
  let component: CreateSchoolDaysBySchedules;
  let fixture: ComponentFixture<CreateSchoolDaysBySchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSchoolDaysBySchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSchoolDaysBySchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
