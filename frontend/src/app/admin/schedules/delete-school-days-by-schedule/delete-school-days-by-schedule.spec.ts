import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSchoolDaysBySchedule } from './delete-school-days-by-schedule';

describe('DeleteSchoolDaysBySchedule', () => {
  let component: DeleteSchoolDaysBySchedule;
  let fixture: ComponentFixture<DeleteSchoolDaysBySchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteSchoolDaysBySchedule],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteSchoolDaysBySchedule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
