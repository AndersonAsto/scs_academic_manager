import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherGroups } from './teacher-groups';

describe('TeacherGroups', () => {
  let component: TeacherGroups;
  let fixture: ComponentFixture<TeacherGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherGroups],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherGroups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
