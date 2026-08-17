import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdsReceived } from './ads-received';

describe('AdsReceived', () => {
  let component: AdsReceived;
  let fixture: ComponentFixture<AdsReceived>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsReceived],
    }).compileComponents();

    fixture = TestBed.createComponent(AdsReceived);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
