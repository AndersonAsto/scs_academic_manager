import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsSent } from './ads-sent';

describe('AdsSent', () => {
  let component: AdsSent;
  let fixture: ComponentFixture<AdsSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsSent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdsSent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
