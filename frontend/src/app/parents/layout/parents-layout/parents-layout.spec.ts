import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentsLayout } from './parents-layout';

describe('ParentsLayout', () => {
  let component: ParentsLayout;
  let fixture: ComponentFixture<ParentsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentsLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ParentsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
