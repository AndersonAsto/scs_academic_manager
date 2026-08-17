import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSchedules } from './report-schedules';

describe('ReportSchedules', () => {
  let component: ReportSchedules;
  let fixture: ComponentFixture<ReportSchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportSchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportSchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
