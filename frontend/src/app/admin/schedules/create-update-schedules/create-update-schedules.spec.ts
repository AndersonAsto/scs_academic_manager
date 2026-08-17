import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSchedules } from './create-update-schedules';

describe('CreateUpdateSchedules', () => {
  let component: CreateUpdateSchedules;
  let fixture: ComponentFixture<CreateUpdateSchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateSchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateSchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
