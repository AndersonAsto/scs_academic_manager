import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSchoolDays } from './info-school-days';

describe('InfoSchoolDays', () => {
  let component: InfoSchoolDays;
  let fixture: ComponentFixture<InfoSchoolDays>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSchoolDays],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoSchoolDays);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
