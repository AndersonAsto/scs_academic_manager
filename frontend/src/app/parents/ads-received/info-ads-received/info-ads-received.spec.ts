import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAdsReceived } from './info-ads-received';

describe('InfoAdsReceived', () => {
  let component: InfoAdsReceived;
  let fixture: ComponentFixture<InfoAdsReceived>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAdsReceived],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoAdsReceived);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
