import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTimeSlots } from './info-time-slots';

describe('InfoTimeSlots', () => {
  let component: InfoTimeSlots;
  let fixture: ComponentFixture<InfoTimeSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTimeSlots],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTimeSlots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
