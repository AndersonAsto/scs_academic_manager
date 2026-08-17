import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAdsSent } from './update-ads-sent';

describe('UpdateAdsSent', () => {
  let component: UpdateAdsSent;
  let fixture: ComponentFixture<UpdateAdsSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateAdsSent],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateAdsSent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
