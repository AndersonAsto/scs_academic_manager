import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingBlocks } from './teaching-blocks';

describe('TeachingBlocks', () => {
  let component: TeachingBlocks;
  let fixture: ComponentFixture<TeachingBlocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachingBlocks],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachingBlocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
