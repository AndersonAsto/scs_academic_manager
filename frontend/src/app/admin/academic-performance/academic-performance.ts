import { Component, inject, signal, computed } from '@angular/core';
import {
  AcademicPerformanceService,
  YearItem,
  GradeItem,
  SectionItem,
  SectionCourse,
  StudentPerformanceRow,
  AcademicRecordDetail,
  BlockAverageDetail,
} from './academic-performance.service';
import { AnnualReportService } from './annual-report.service';
import { AnnualReportPdfService } from './annual-report-pdf.service';

type DetailType = 'records' | 'blocks' | 'course' | null;

@Component({
  selector: 'app-academic-performance',
  imports: [],
  templateUrl: './academic-performance.html',
  styleUrl: './academic-performance.css',
})
export class AcademicPerformance {
  private service = inject(AcademicPerformanceService);

  years = signal<YearItem[]>([]);
  grades = signal<GradeItem[]>([]);
  sections = signal<SectionItem[]>([]);

  selectedYearId = signal<number | null>(null);
  selectedGradeId = signal<number | null>(null);
  selectedSectionId = signal<number | null>(null);

  searchTerm = signal('');

  students = signal<StudentPerformanceRow[]>([]);
  isLoadingStudents = signal(false);
  sectionCourses = signal<SectionCourse[]>([]);

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();

    return this.students().filter((student) =>
      `${student.names} ${student.fathers_surname} ${student.mothers_surname}`
        .toLowerCase()
        .includes(term),
    );
  });

  selectedStudent = signal<StudentPerformanceRow | null>(null);
  pendingAction = signal<DetailType>(null);
  showCourseSelectModal = signal(false);

  selectedCourse = signal<SectionCourse | null>(null);
  showDetailModal = signal(false);
  detailType = signal<DetailType>(null);
  isLoadingDetail = signal(false);
  recordsDetail = signal<AcademicRecordDetail[]>([]);
  blocksDetail = signal<BlockAverageDetail[]>([]);
  courseAverageDetail = signal<number | null>(null);

  isWideDetail = computed(() => this.detailType() === 'records' || this.detailType() === 'blocks');

  async ngOnInit() {
    const [years, grades, sections] = await Promise.all([
      this.service.getYears(),
      this.service.getGrades(),
      this.service.getSections(),
    ]);

    this.years.set(years);
    this.grades.set(grades);
    this.sections.set(sections);
  }

  onYearChange(yearId: number) {
    this.selectedYearId.set(yearId);
    this.resetRoster();
  }

  onGradeChange(gradeId: number) {
    this.selectedGradeId.set(gradeId);
    this.resetRoster();
  }

  onSectionChange(sectionId: number) {
    this.selectedSectionId.set(sectionId);
    this.resetRoster();
  }

  private resetRoster() {
    this.students.set([]);
    this.sectionCourses.set([]);
    this.searchTerm.set('');
  }

  async loadStudents() {
    const yearId = this.selectedYearId();
    const gradeId = this.selectedGradeId();
    const sectionId = this.selectedSectionId();

    if (!yearId || !gradeId || !sectionId) return;

    this.isLoadingStudents.set(true);

    try {
      const [students, sectionCourses] = await Promise.all([
        this.service.getStudents(yearId, gradeId, sectionId),
        this.service.getSectionCourses(yearId, gradeId, sectionId),
      ]);

      this.sectionCourses.set(sectionCourses);

      const studentsWithGeneralAverage = await Promise.all(
        students.map(async (student) => {
          const record = await this.service.getGeneralAverage(student.registration_id);
          return {
            ...student,
            general_average: record?.general_average ?? null,
            hasGeneralAverage: !!record,
          };
        }),
      );

      this.students.set(studentsWithGeneralAverage);
    } finally {
      this.isLoadingStudents.set(false);
    }
  }

  // --- Selector de curso ---

  openCourseSelect(student: StudentPerformanceRow, action: DetailType) {
    this.selectedStudent.set(student);
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

  // --- Modal de detalle ---

  private async loadDetail() {
    const student = this.selectedStudent();
    const course = this.selectedCourse();
    const type = this.detailType();
    if (!student || !course || !type) return;

    this.isLoadingDetail.set(true);

    try {
      if (type === 'records') {
        this.recordsDetail.set(await this.service.getAcademicRecords(student.registration_id, course.id));
      } else if (type === 'blocks') {
        this.blocksDetail.set(await this.service.getBlockAverages(student.registration_id, course.id));
      } else if (type === 'course') {
        this.courseAverageDetail.set(await this.service.getCourseAverage(student.registration_id, course.id));
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

  // generación de reporte
  downloadingIds = signal<Set<number>>(new Set());
  downloadingAnnualReportIds = signal<Set<number>>(new Set());

  isDownloading(registrationId: number): boolean {
    return this.downloadingIds().has(registrationId);
  }

  isDownloadingAnnualReport(registrationId: number): boolean { // NUEVO
    return this.downloadingAnnualReportIds().has(registrationId);
  }

  async downloadDetailedReport(student: StudentPerformanceRow) {
    const yearId = this.selectedYearId();
    if (!yearId) return;

    this.downloadingIds.update((set) => new Set(set).add(student.registration_id));

    try {
      await this.service.downloadDetailedReport(student.registration_id, yearId);
    } finally {
      this.downloadingIds.update((set) => {
        const next = new Set(set);
        next.delete(student.registration_id);
        return next;
      });
    }
  }

  private annualReport = inject(AnnualReportService);
  private annualReportPdf = inject(AnnualReportPdfService);

  async downloadAnnualReport(student: StudentPerformanceRow) {
    const yearId = this.selectedYearId();
    const gradeId = this.selectedGradeId();
    const sectionId = this.selectedSectionId();
    if (!yearId || !gradeId || !sectionId) return;

    const year = this.years().find((y) => y.id === yearId);
    const grade = this.grades().find((g) => g.id === gradeId);
    const section = this.sections().find((s) => s.id === sectionId);
    if (!year || !grade || !section) return;

    this.downloadingAnnualReportIds.update((set) => new Set(set).add(student.registration_id)); // NUEVO

    try {
      const data = await this.annualReport.getAnnualReportData(
        student.registration_id,
        yearId,
        gradeId,
        sectionId,
        { names: student.names, fathers_surname: student.fathers_surname, mothers_surname: student.mothers_surname },
        grade.grade,
        section.section,
        year.year,
      );

      await this.annualReportPdf.generate(data);
    } finally { // NUEVO
      this.downloadingAnnualReportIds.update((set) => {
        const next = new Set(set);
        next.delete(student.registration_id);
        return next;
      });
    }
  }
}