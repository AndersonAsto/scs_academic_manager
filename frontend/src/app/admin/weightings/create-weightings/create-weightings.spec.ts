import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWeightings } from './create-weightings';

describe('CreateWeightings', () => {
  let component: CreateWeightings;
  let fixture: ComponentFixture<CreateWeightings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWeightings],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWeightings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
