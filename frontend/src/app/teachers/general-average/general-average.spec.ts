import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAverage } from './general-average';

describe('GeneralAverage', () => {
  let component: GeneralAverage;
  let fixture: ComponentFixture<GeneralAverage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralAverage],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralAverage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
