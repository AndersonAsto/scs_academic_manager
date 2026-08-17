import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTeacherGroups } from './info-teacher-groups';

describe('InfoTeacherGroups', () => {
  let component: InfoTeacherGroups;
  let fixture: ComponentFixture<InfoTeacherGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTeacherGroups],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTeacherGroups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
