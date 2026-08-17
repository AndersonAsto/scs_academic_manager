import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTeacherGroups } from './delete-teacher-groups';

describe('DeleteTeacherGroups', () => {
  let component: DeleteTeacherGroups;
  let fixture: ComponentFixture<DeleteTeacherGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTeacherGroups],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTeacherGroups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
