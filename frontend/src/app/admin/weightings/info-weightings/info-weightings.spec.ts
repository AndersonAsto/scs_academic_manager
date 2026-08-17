import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoWeightings } from './info-weightings';

describe('InfoWeightings', () => {
  let component: InfoWeightings;
  let fixture: ComponentFixture<InfoWeightings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoWeightings],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoWeightings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
