import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGrade } from './info-grade';

describe('InfoGrade', () => {
  let component: InfoGrade;
  let fixture: ComponentFixture<InfoGrade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoGrade],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoGrade);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
