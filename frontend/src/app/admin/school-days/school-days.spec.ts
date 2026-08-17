import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolDays } from './school-days';

describe('SchoolDays', () => {
  let component: SchoolDays;
  let fixture: ComponentFixture<SchoolDays>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolDays],
    }).compileComponents();

    fixture = TestBed.createComponent(SchoolDays);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
