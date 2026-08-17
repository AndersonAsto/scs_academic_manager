import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoAcademicStaff } from './info-academic-staff';

describe('InfoAcademicStaff', () => {
  let component: InfoAcademicStaff;
  let fixture: ComponentFixture<InfoAcademicStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoAcademicStaff],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoAcademicStaff);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
