import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicRecords } from './academic-records';

describe('AcademicRecords', () => {
  let component: AcademicRecords;
  let fixture: ComponentFixture<AcademicRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicRecords],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicRecords);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
