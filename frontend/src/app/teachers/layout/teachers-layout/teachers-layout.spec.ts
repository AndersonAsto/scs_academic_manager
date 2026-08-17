import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersLayout } from './teachers-layout';

describe('TeachersLayout', () => {
  let component: TeachersLayout;
  let fixture: ComponentFixture<TeachersLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachersLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachersLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
