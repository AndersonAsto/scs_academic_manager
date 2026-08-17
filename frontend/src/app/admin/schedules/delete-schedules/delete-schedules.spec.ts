import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSchedules } from './delete-schedules';

describe('DeleteSchedules', () => {
  let component: DeleteSchedules;
  let fixture: ComponentFixture<DeleteSchedules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteSchedules],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteSchedules);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
