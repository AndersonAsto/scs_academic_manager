import { Component, inject, signal, computed } from '@angular/core';
import {
  ParentDashboardService,
  ChildRegistration,
  ParentDashboardSummary,
  ParentSectionCourseSummary,
} from './parent-dashboard.service';
import { BarChartComponent } from '../../admin/services/bar-chart.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [BarChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class ParentsDashboard {
  private service = inject(ParentDashboardService);
  private router = inject(Router);

  children = signal<ChildRegistration[]>([]);
  isLoadingChildren = signal(false);

  years = computed(() => {
    const unique = new Map<number, number>();
    for (const child of this.children()) unique.set(child.year_id, child.year);
    return [...unique.entries()]
      .map(([year_id, year]) => ({ year_id, year }))
      .sort((a, b) => b.year - a.year);
  });

  selectedYearId = signal<number | null>(null);
  childrenForSelectedYear = computed(() =>
    this.children().filter((c) => c.year_id === this.selectedYearId()),
  );

  selectedRegistrationId = signal<number | null>(null);
  selectedChild = computed(
    () => this.children().find((c) => c.registration_id === this.selectedRegistrationId()) ?? null,
  );

  isLoadingSummary = signal(false);
  summary = signal<ParentDashboardSummary | null>(null);

  selectedCourseName = signal<string | null>(null);
  selectedCourseDetail = computed(() =>
    this.summary()?.courses.find((c) => c.course === this.selectedCourseName()) ?? null,
  );

  async ngOnInit() {
    this.isLoadingChildren.set(true);
    try {
      this.children.set(await this.service.getMyChildren());
    } finally {
      this.isLoadingChildren.set(false);
    }
  }

  onYearChange(yearId: number) {
    this.selectedYearId.set(yearId);
    this.selectedRegistrationId.set(null);
    this.summary.set(null);
    this.selectedCourseName.set(null);
  }

  async onChildChange(registrationId: number) {
    this.selectedRegistrationId.set(registrationId);
    this.summary.set(null);
    this.selectedCourseName.set(null);

    this.isLoadingSummary.set(true);

    try {
      this.summary.set(await this.service.getSummary(registrationId));
    } finally {
      this.isLoadingSummary.set(false);
    }
  }

  toggleCourse(courseName: string) {
    this.selectedCourseName.set(this.selectedCourseName() === courseName ? null : courseName);
  }

  blockLabels(course: ParentSectionCourseSummary): string[] {
    return course.blocks.map((b) => b.teaching_block);
  }

  blockValues(course: ParentSectionCourseSummary): number[] {
    return course.blocks.map((b) => b.average ?? 0);
  }

  computedCourseAverage(course: ParentSectionCourseSummary): number | null {
    const values = course.blocks.map((b) => b.average).filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2));
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}