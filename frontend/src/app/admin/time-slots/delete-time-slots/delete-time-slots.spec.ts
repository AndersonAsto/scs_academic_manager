import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTimeSlots } from './delete-time-slots';

describe('DeleteTimeSlots', () => {
  let component: DeleteTimeSlots;
  let fixture: ComponentFixture<DeleteTimeSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTimeSlots],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTimeSlots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
