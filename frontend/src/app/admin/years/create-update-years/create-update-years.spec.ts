import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateYears } from './create-update-years';

describe('CreateUpdateYears', () => {
  let component: CreateUpdateYears;
  let fixture: ComponentFixture<CreateUpdateYears>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateYears],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateYears);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
