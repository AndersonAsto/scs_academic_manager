import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteWeightings } from './delete-weightings';

describe('DeleteWeightings', () => {
  let component: DeleteWeightings;
  let fixture: ComponentFixture<DeleteWeightings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteWeightings],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteWeightings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
