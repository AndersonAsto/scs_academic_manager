import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateGrades } from './create-update-grades';

describe('CreateUpdateGrades', () => {
  let component: CreateUpdateGrades;
  let fixture: ComponentFixture<CreateUpdateGrades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateGrades],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateGrades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
