import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRegistration } from './info-registration';

describe('InfoRegistration', () => {
  let component: InfoRegistration;
  let fixture: ComponentFixture<InfoRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
