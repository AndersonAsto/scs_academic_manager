import { Component, inject, signal, computed } from '@angular/core';
import {
  StudentAcademicRecordService,
  ChildRegistration,
  SectionCourse,
  AcademicRecordDetail,
  BlockAverageDetail,
} from './student-academic-record.service';
import { AnnualReportService } from '../../admin/academic-performance/annual-report.service';
import { AnnualReportPdfService } from '../../admin/academic-performance/annual-report-pdf.service';

type DetailType = 'records' | 'blocks' | 'course' | null;

@Component({
  selector: 'app-student-academic-record',
  imports: [],
  templateUrl: './student-academic-record.html',
  styleUrl: './student-academic-record.css',
})
export class StudentAcademicRecord {
  private service = inject(StudentAcademicRecordService);

  private annualReport = inject(AnnualReportService);
  private annualReportPdf = inject(AnnualReportPdfService);

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

  generalAverage = signal<number | null>(null);
  hasGeneralAverage = signal(false);
  isLoadingGeneralAverage = signal(false);
  sectionCourses = signal<SectionCourse[]>([]);

  showCourseSelectModal = signal(false);
  pendingAction = signal<DetailType>(null);

  selectedCourse = signal<SectionCourse | null>(null);
  showDetailModal = signal(false);
  detailType = signal<DetailType>(null);
  isLoadingDetail = signal(false);
  recordsDetail = signal<AcademicRecordDetail[]>([]);
  blocksDetail = signal<BlockAverageDetail[]>([]);
  courseAverageDetail = signal<number | null>(null);

  isWideDetail = computed(() => this.detailType() === 'records' || this.detailType() === 'blocks');

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
    this.resetChildData();
  }

  async onChildChange(registrationId: number) {
    this.selectedRegistrationId.set(registrationId);
    this.resetChildData();

    const child = this.selectedChild();
    if (!child) return;

    this.isLoadingGeneralAverage.set(true);

    try {
      const [generalAverage, sectionCourses] = await Promise.all([
        this.service.getGeneralAverage(child.registration_id),
        this.service.getSectionCourses(child.year_id, child.grade_id, child.section_id),
      ]);

      this.generalAverage.set(generalAverage?.general_average ?? null);
      this.hasGeneralAverage.set(!!generalAverage);
      this.sectionCourses.set(sectionCourses);
    } finally {
      this.isLoadingGeneralAverage.set(false);
    }
  }

  private resetChildData() {
    this.generalAverage.set(null);
    this.hasGeneralAverage.set(false);
    this.sectionCourses.set([]);
  }

  openCourseSelect(action: DetailType) {
    this.pendingAction.set(action);
    this.showCourseSelectModal.set(true);
  }

  closeCourseSelect() {
    this.showCourseSelectModal.set(false);
    this.pendingAction.set(null);
  }

  async selectCourse(course: SectionCourse) {
    this.selectedCourse.set(course);
    this.detailType.set(this.pendingAction());
    this.showCourseSelectModal.set(false);
    this.showDetailModal.set(true);
    await this.loadDetail();
  }

  private async loadDetail() {
    const child = this.selectedChild();
    const course = this.selectedCourse();
    const type = this.detailType();
    if (!child || !course || !type) return;

    this.isLoadingDetail.set(true);

    try {
      if (type === 'records') {
        this.recordsDetail.set(await this.service.getAcademicRecords(child.registration_id, course.id));
      } else if (type === 'blocks') {
        this.blocksDetail.set(await this.service.getBlockAverages(child.registration_id, course.id));
      } else if (type === 'course') {
        this.courseAverageDetail.set(await this.service.getCourseAverage(child.registration_id, course.id));
      }
    } finally {
      this.isLoadingDetail.set(false);
    }
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailType.set(null);
    this.selectedCourse.set(null);
    this.recordsDetail.set([]);
    this.blocksDetail.set([]);
    this.courseAverageDetail.set(null);
  }

  attendanceClass(attendance: AcademicRecordDetail['attendance']): string {
    return attendance ? `attendance-${attendance}` : 'attendance-none';
  }

  downloadingDetailedIds = signal<Set<number>>(new Set());
  downloadingAnnualReportIds = signal<Set<number>>(new Set());

  isDownloadingDetailed(registrationId: number): boolean {
    return this.downloadingDetailedIds().has(registrationId);
  }

  isDownloadingAnnualReport(registrationId: number): boolean {
    return this.downloadingAnnualReportIds().has(registrationId);
  }

  async downloadDetailedReport() {
    const child = this.selectedChild();

    if (!child) return;

    const registrationId = child.registration_id;

    this.downloadingDetailedIds.update((set) => {
      const next = new Set(set);
      next.add(registrationId);
      return next;
    });

    try {
      await this.service.downloadDetailedReport(
        child.registration_id,
        child.year_id,
      );
    } finally {
      this.downloadingDetailedIds.update((set) => {
        const next = new Set(set);
        next.delete(registrationId);
        return next;
      });
    }
  }

  async downloadAnnualReport() {
    const child = this.selectedChild();

    if (!child) return;

    const registrationId = child.registration_id;

    this.downloadingAnnualReportIds.update((set) => {
      const next = new Set(set);
      next.add(registrationId);
      return next;
    });

    try {
      const data = await this.annualReport.getAnnualReportData(
        child.registration_id,
        child.year_id,
        child.grade_id,
        child.section_id,
        {
          names: child.names,
          fathers_surname: child.fathers_surname,
          mothers_surname: child.mothers_surname,
        },
        child.grade,
        child.section,
        child.year,
      );

      await this.annualReportPdf.generate(data);
    } finally {
      this.downloadingAnnualReportIds.update((set) => {
        const next = new Set(set);
        next.delete(registrationId);
        return next;
      });
    }
  }
}