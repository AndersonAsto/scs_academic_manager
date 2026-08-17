import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAdsSent } from './delete-ads-sent';

describe('DeleteAdsSent', () => {
  let component: DeleteAdsSent;
  let fixture: ComponentFixture<DeleteAdsSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAdsSent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAdsSent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
