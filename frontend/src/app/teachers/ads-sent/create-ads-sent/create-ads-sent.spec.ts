import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAdsSent } from './create-ads-sent';

describe('CreateAdsSent', () => {
  let component: CreateAdsSent;
  let fixture: ComponentFixture<CreateAdsSent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAdsSent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAdsSent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
