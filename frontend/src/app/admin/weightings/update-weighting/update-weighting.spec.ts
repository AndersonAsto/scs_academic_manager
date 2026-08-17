import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateWeighting } from './update-weighting';

describe('UpdateWeighting', () => {
  let component: UpdateWeighting;
  let fixture: ComponentFixture<UpdateWeighting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateWeighting],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateWeighting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
