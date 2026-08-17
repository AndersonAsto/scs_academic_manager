import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateTimeSlots } from './create-update-time-slots';

describe('CreateUpdateTimeSlots', () => {
  let component: CreateUpdateTimeSlots;
  let fixture: ComponentFixture<CreateUpdateTimeSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateTimeSlots],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateTimeSlots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
