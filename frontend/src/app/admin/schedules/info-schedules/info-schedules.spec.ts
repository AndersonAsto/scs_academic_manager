import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSchedules } from './info-schedules';

describe('InfoSchedules', () => {
  let component: InfoSchedules;
  let fixture: ComponentFixture<InfoSchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoSchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
