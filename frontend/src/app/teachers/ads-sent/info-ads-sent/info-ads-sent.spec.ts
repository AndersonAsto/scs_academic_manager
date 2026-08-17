import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAdsSent } from './info-ads-sent';

describe('InfoAdsSent', () => {
  let component: InfoAdsSent;
  let fixture: ComponentFixture<InfoAdsSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAdsSent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoAdsSent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
