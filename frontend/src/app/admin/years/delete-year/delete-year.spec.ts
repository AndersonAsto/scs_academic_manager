import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteYear } from './delete-year';

describe('DeleteYear', () => {
  let component: DeleteYear;
  let fixture: ComponentFixture<DeleteYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteYear],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteYear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
