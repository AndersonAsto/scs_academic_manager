import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateRegistration } from './create-update-registration';

describe('CreateUpdateRegistration', () => {
  let component: CreateUpdateRegistration;
  let fixture: ComponentFixture<CreateUpdateRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
