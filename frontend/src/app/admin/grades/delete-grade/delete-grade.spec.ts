import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteGrade } from './delete-grade';

describe('DeleteGrade', () => {
  let component: DeleteGrade;
  let fixture: ComponentFixture<DeleteGrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteGrade],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteGrade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
