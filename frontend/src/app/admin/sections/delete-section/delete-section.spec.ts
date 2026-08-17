import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSection } from './delete-section';

describe('DeleteSection', () => {
  let component: DeleteSection;
  let fixture: ComponentFixture<DeleteSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteSection],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
