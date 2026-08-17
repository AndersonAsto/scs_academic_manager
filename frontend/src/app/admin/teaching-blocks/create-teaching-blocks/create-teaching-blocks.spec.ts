import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTeachingBlocks } from './create-teaching-blocks';

describe('CreateTeachingBlocks', () => {
  let component: CreateTeachingBlocks;
  let fixture: ComponentFixture<CreateTeachingBlocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTeachingBlocks],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTeachingBlocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
