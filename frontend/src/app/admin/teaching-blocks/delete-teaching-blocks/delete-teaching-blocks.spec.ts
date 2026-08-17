import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTeachingBlocks } from './delete-teaching-blocks';

describe('DeleteTeachingBlocks', () => {
  let component: DeleteTeachingBlocks;
  let fixture: ComponentFixture<DeleteTeachingBlocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTeachingBlocks],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTeachingBlocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
