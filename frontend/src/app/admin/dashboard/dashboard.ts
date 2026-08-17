import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService, YearItem, AdminSummary, AdminGroupSummary, CourseGroupAverage } from './dashboard.service';
import { BarChartComponent } from '../services/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [BarChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private service = inject(DashboardService);
  private router = inject(Router);

  years = signal<YearItem[]>([]);
  selectedYearId = signal<number | null>(null);
  summary = signal<AdminSummary | null>(null);
  isLoading = signal(false);

  maxGradeSectionCount = computed(() => {
    const rows = this.summary()?.by_grade_section ?? [];
    return rows.reduce((max, row) => Math.max(max, row.count), 0) || 1;
  });

  groupsSummary = signal<AdminGroupSummary[]>([]);

  async ngOnInit() {
    const years = await this.service.getYears();
    this.years.set(years);

    if (years.length > 0) {
      const currentCalendarYear = new Date().getFullYear();
      const matchingYear = years.find((y) => y.year === currentCalendarYear);
      const defaultYear = matchingYear ?? [...years].sort((a, b) => b.year - a.year)[0];

      this.selectedYearId.set(defaultYear.id);
      await this.loadSummary();
    }
  }

  async onYearChange(yearId: number) {
    this.selectedYearId.set(yearId);
    await this.loadSummary();
  }

  private async loadSummary() {
    const yearId = this.selectedYearId();
    if (!yearId) return;

    this.isLoading.set(true);

    try {
      const [summary, groupsSummary] = await Promise.all([
        this.service.getAdminSummary(yearId),
        this.service.getAdminGroupsSummary(yearId),
      ]);

      this.summary.set(summary);
      this.groupsSummary.set(groupsSummary);
    } finally {
      this.isLoading.set(false);
    }
  }

  barWidth(count: number): number {
    return Math.round((count / this.maxGradeSectionCount()) * 100);
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  selectedGroupKey = signal<string | null>(null);
  selectedCourseName = signal<string | null>(null);

  selectedGroupDetail = computed(() => {
    const key = this.selectedGroupKey();
    if (!key) return null;
    return this.groupsSummary().find((g) => `${g.grade}||${g.section}` === key) ?? null;
  });

  selectedCourseDetail = computed(() => {
    const group = this.selectedGroupDetail();
    const courseName = this.selectedCourseName();
    if (!group || !courseName) return null;
    return group.courses.find((c) => c.course === courseName) ?? null;
  });

  toggleGroup(grade: string, section: string) {
    const key = `${grade}||${section}`;
    this.selectedGroupKey.set(this.selectedGroupKey() === key ? null : key);
    this.selectedCourseName.set(null); // reset al cambiar de grupo
  }

  toggleCourse(courseName: string) {
    this.selectedCourseName.set(this.selectedCourseName() === courseName ? null : courseName);
  }

  courseBlockLabels(course: CourseGroupAverage): string[] {
    return course.blocks.map((b) => b.teaching_block);
  }

  courseBlockValues(course: CourseGroupAverage): number[] {
    return course.blocks.map((b) => b.average ?? 0);
  }

  courseComputedAverage(course: CourseGroupAverage): number | null {
    const values = course.blocks
      .map((b) => b.average)
      .filter((v): v is number => v !== null);

    if (values.length === 0) return null;

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return Number(avg.toFixed(2));
  }
}