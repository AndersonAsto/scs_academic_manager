import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRegistrations } from './delete-registrations';

describe('DeleteRegistrations', () => {
  let component: DeleteRegistrations;
  let fixture: ComponentFixture<DeleteRegistrations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteRegistrations],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteRegistrations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
