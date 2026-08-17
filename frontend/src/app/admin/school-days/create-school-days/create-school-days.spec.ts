import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSchoolDays } from './create-school-days';

describe('CreateSchoolDays', () => {
  let component: CreateSchoolDays;
  let fixture: ComponentFixture<CreateSchoolDays>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSchoolDays],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSchoolDays);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
