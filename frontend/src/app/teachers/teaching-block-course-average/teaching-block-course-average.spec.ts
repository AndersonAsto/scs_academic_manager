import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingBlockCourseAverage } from './teaching-block-course-average';

describe('TeachingBlockCourseAverage', () => {
  let component: TeachingBlockCourseAverage;
  let fixture: ComponentFixture<TeachingBlockCourseAverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachingBlockCourseAverage],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachingBlockCourseAverage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
