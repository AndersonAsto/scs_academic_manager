import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicPerformance } from './academic-performance';

describe('AcademicPerformance', () => {
  let component: AcademicPerformance;
  let fixture: ComponentFixture<AcademicPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicPerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicPerformance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
