import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseAverage } from './course-average';

describe('CourseAverage', () => {
  let component: CourseAverage;
  let fixture: ComponentFixture<CourseAverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseAverage],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseAverage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
