import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoUsersRegistrations } from './personal-info-users-registrations';

describe('PersonalInfoUsersRegistrations', () => {
  let component: PersonalInfoUsersRegistrations;
  let fixture: ComponentFixture<PersonalInfoUsersRegistrations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalInfoUsersRegistrations],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalInfoUsersRegistrations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
