import { Component, inject, signal, computed } from '@angular/core';
import {
  TeacherDashboardService,
  Contract,
  TeacherDashboardSummary,
} from './teacher-dashboard.service';
import { BarChartComponent } from '../../admin/services/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [BarChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class TeachersDashboard {
  private service = inject(TeacherDashboardService);

  contracts = signal<Contract[]>([]);
  selectedContractId = signal<number | null>(null);

  isLoading = signal(false);
  summary = signal<TeacherDashboardSummary | null>(null);

  selectedCourseGroupId = signal<number | null>(null);
  selectedCourseDetail = computed(() =>
    this.summary()?.courses.find((c) => c.teacher_group_id === this.selectedCourseGroupId()) ?? null,
  );

  selectedTutorCourseName = signal<string | null>(null);
  selectedTutorCourseDetail = computed(() =>
    this.summary()?.tutor_section_summary?.courses.find((c) => c.course === this.selectedTutorCourseName()) ?? null,
  );

  async ngOnInit() {
    this.contracts.set(await this.service.getMyContracts());
  }

  async onContractChange(contractId: number) {
    this.selectedContractId.set(contractId);
    this.selectedCourseGroupId.set(null);
    this.selectedTutorCourseName.set(null);
    this.summary.set(null);

    this.isLoading.set(true);

    try {
      this.summary.set(await this.service.getSummary(contractId));
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleCourse(teacherGroupId: number) {
    this.selectedCourseGroupId.set(this.selectedCourseGroupId() === teacherGroupId ? null : teacherGroupId);
  }

  toggleTutorCourse(courseName: string) {
    this.selectedTutorCourseName.set(this.selectedTutorCourseName() === courseName ? null : courseName);
  }

  blockLabels(course: { blocks: { teaching_block: string }[] }): string[] {
    return course.blocks.map((b) => b.teaching_block);
  }

  blockValues(course: { blocks: { average: number | null }[] }): number[] {
    return course.blocks.map((b) => b.average ?? 0);
  }

  computedCourseAverage(course: { blocks: { average: number | null }[] }): number | null {
    const values = course.blocks.map((b) => b.average).filter((v): v is number => v !== null);
    if (values.length === 0) return null;
    return Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2));
  }
}