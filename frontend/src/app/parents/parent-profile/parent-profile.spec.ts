import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentProfile } from './parent-profile';

describe('ParentProfile', () => {
  let component: ParentProfile;
  let fixture: ComponentFixture<ParentProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
