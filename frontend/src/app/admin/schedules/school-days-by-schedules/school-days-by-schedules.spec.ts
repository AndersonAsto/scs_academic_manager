import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolDaysBySchedules } from './school-days-by-schedules';

describe('SchoolDaysBySchedules', () => {
  let component: SchoolDaysBySchedules;
  let fixture: ComponentFixture<SchoolDaysBySchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolDaysBySchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolDaysBySchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
