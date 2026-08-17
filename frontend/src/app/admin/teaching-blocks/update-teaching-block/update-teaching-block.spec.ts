import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTeachingBlock } from './update-teaching-block';

describe('UpdateTeachingBlock', () => {
  let component: UpdateTeachingBlock;
  let fixture: ComponentFixture<UpdateTeachingBlock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTeachingBlock],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateTeachingBlock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
