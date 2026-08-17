import { Component, inject, signal, computed } from '@angular/core';
import {
  GeneralAverageService,
  Contract,
  TeacherGroup,
  SectionCourse,
  StudentRow,
  AcademicRecordDetail,
  BlockAverageDetail,
} from './general-average.service';
import { AnnualReportService } from '../../admin/academic-performance/annual-report.service';
import { AnnualReportPdfService } from '../../admin/academic-performance/annual-report-pdf.service';

type DetailType = 'records' | 'blocks' | 'course' | null;

@Component({
  selector: 'app-general-average',
  imports: [],
  templateUrl: './general-average.html',
  styleUrl: './general-average.css',
})
export class GeneralAverage {
  private service = inject(GeneralAverageService);

  contracts = signal<Contract[]>([]);
  selectedContractId = signal<number | null>(null);
  selectedContract = computed(
    () => this.contracts().find((c) => c.id === this.selectedContractId()) ?? null,
  );

  teacherGroups = signal<TeacherGroup[]>([]);
  tutorGroup = computed(() => this.teacherGroups().find((g) => g.tutor) ?? null);

  sectionCourses = signal<SectionCourse[]>([]);
  students = signal<StudentRow[]>([]);
  isLoadingStudents = signal(false);
  calculatingIds = signal<Set<number>>(new Set());

  // Selector de curso (paso previo a cualquier modal de solo lectura)
  selectedStudent = signal<StudentRow | null>(null);
  pendingAction = signal<DetailType>(null);
  showCourseSelectModal = signal(false);

  // Modal de detalle (solo lectura)
  selectedCourse = signal<SectionCourse | null>(null);
  showDetailModal = signal(false);
  detailType = signal<DetailType>(null);
  isLoadingDetail = signal(false);
  recordsDetail = signal<AcademicRecordDetail[]>([]);
  blocksDetail = signal<BlockAverageDetail[]>([]);
  courseAverageDetail = signal<number | null>(null);

  async ngOnInit() {
    this.contracts.set(await this.service.getMyContracts());
  }

  async onContractChange(contractId: number) {
    this.selectedContractId.set(contractId);
    this.students.set([]);
    this.sectionCourses.set([]);
    this.teacherGroups.set([]);
    this.searchTerm.set('');

    this.teacherGroups.set(await this.service.getTeacherGroups(contractId));

    const tutor = this.tutorGroup();
    if (tutor) {
      await this.loadRoster();
    }
  }

  private async loadRoster() {
    const contract = this.selectedContract();
    const tutor = this.tutorGroup();
    if (!contract || !tutor) return;

    this.searchTerm.set('');

    this.isLoadingStudents.set(true);

    try {
      const [students, sectionCourses] = await Promise.all([
        this.service.getStudents(contract.year_id, tutor.grade_id, tutor.section_id),
        this.service.getSectionCourses(contract.year_id, tutor.grade_id, tutor.section_id),
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

  openCourseSelect(student: StudentRow, action: DetailType) {
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

  // --- Cálculo final ---

  isCalculating(registrationId: number): boolean {
    return this.calculatingIds().has(registrationId);
  }

  async calculateGeneral(student: StudentRow) {
    this.calculatingIds.update((set) => new Set(set).add(student.registration_id));

    try {
      const response = await this.service.calculateGeneralAverage(student.registration_id);

      this.students.update((rows) =>
        rows.map((row) =>
          row.registration_id === student.registration_id
            ? { ...row, general_average: response.data.general_average, hasGeneralAverage: true }
            : row,
        ),
      );
    } finally {
      this.calculatingIds.update((set) => {
        const next = new Set(set);
        next.delete(student.registration_id);
        return next;
      });
    }
  }

  isWideDetail = computed(
    () => this.detailType() === 'records' || this.detailType() === 'blocks',
  );

  attendanceClass(attendance: AcademicRecordDetail['attendance']): string {
    return attendance ? `attendance-${attendance}` : 'attendance-none';
  }

  searchTerm = signal('');

  filteredStudents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();

    return this.students().filter((student) =>
      `${student.names} ${student.fathers_surname} ${student.mothers_surname}`
        .toLowerCase()
        .includes(term),
    );
  });

  private annualReport = inject(AnnualReportService);
  private annualReportPdf = inject(AnnualReportPdfService);

  downloadingIds = signal<Set<number>>(new Set());
  downloadingAnnualReportIds = signal<Set<number>>(new Set());

  isDownloading(registrationId: number): boolean {
    return this.downloadingIds().has(registrationId);
  }

  isDownloadingAnnualReport(registrationId: number): boolean {
    return this.downloadingAnnualReportIds().has(registrationId);
  }

  async downloadDetailedReport(student: StudentRow) {
    const contract = this.selectedContract();
    if (!contract) return;

    this.downloadingIds.update((set) => new Set(set).add(student.registration_id));

    try {
      await this.service.downloadDetailedReport(student.registration_id, contract.year_id);
    } finally {
      this.downloadingIds.update((set) => {
        const next = new Set(set);
        next.delete(student.registration_id);
        return next;
      });
    }
  }

  async downloadAnnualReport(student: StudentRow) {
    const contract = this.selectedContract();
    const tutor = this.tutorGroup();
    if (!contract || !tutor) return;

    this.downloadingAnnualReportIds.update((set) => new Set(set).add(student.registration_id));

    try {
      const data = await this.annualReport.getAnnualReportData(
        student.registration_id,
        contract.year_id,
        tutor.grade_id,
        tutor.section_id,
        { names: student.names, fathers_surname: student.fathers_surname, mothers_surname: student.mothers_surname },
        tutor.grade,
        tutor.section,
        contract.year,
      );

      await this.annualReportPdf.generate(data);
    } finally {
      this.downloadingAnnualReportIds.update((set) => {
        const next = new Set(set);
        next.delete(student.registration_id);
        return next;
      });
    }
  }
}