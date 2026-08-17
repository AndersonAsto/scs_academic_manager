import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTeachingBlocks } from './info-teaching-blocks';

describe('InfoTeachingBlocks', () => {
  let component: InfoTeachingBlocks;
  let fixture: ComponentFixture<InfoTeachingBlocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTeachingBlocks],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTeachingBlocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
