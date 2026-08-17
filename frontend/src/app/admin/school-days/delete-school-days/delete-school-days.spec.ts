import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSchoolDays } from './delete-school-days';

describe('DeleteSchoolDays', () => {
  let component: DeleteSchoolDays;
  let fixture: ComponentFixture<DeleteSchoolDays>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteSchoolDays],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteSchoolDays);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
