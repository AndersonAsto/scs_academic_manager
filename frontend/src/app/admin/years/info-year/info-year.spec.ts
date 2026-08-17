import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoYear } from './info-year';

describe('InfoYear', () => {
  let component: InfoYear;
  let fixture: ComponentFixture<InfoYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoYear],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoYear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
