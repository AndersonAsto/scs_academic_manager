import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSchoolDays } from './update-school-days';

describe('UpdateSchoolDays', () => {
  let component: UpdateSchoolDays;
  let fixture: ComponentFixture<UpdateSchoolDays>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSchoolDays],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateSchoolDays);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
