import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSection } from './create-update-section';

describe('CreateUpdateSection', () => {
  let component: CreateUpdateSection;
  let fixture: ComponentFixture<CreateUpdateSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateUpdateSection],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUpdateSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
