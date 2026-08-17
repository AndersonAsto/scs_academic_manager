import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Weightings } from './weightings';

describe('Weightings', () => {
  let component: Weightings;
  let fixture: ComponentFixture<Weightings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Weightings],
    }).compileComponents();

    fixture = TestBed.createComponent(Weightings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
