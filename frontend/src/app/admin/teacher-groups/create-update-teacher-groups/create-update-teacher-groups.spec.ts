import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateTeacherGroups } from './create-update-teacher-groups';

describe('CreateUpdateTeacherGroups', () => {
  let component: CreateUpdateTeacherGroups;
  let fixture: ComponentFixture<CreateUpdateTeacherGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateTeacherGroups],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateTeacherGroups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
