import { Component, inject, signal, computed } from '@angular/core';
import {
  TeachingBlockCourseAverageService,
  Contract,
  TeacherGroup,
  TeachingBlockItem,
  StudentAverageRow,
} from './teaching-block-course-average.service';

@Component({
  selector: 'app-teaching-block-course-average',
  imports: [],
  templateUrl: './teaching-block-course-average.html',
  styleUrl: './teaching-block-course-average.css',
})
export class TeachingBlockCourseAverage {
  private service = inject(TeachingBlockCourseAverageService);

  contracts = signal<Contract[]>([]);
  selectedContractId = signal<number | null>(null);
  selectedContract = computed(
    () => this.contracts().find((c) => c.id === this.selectedContractId()) ?? null,
  );

  teacherGroups = signal<TeacherGroup[]>([]);
  selectedTeacherGroupId = signal<number | null>(null);
  selectedTeacherGroup = computed(
    () => this.teacherGroups().find((g) => g.id === this.selectedTeacherGroupId()) ?? null,
  );

  showBlockModal = signal(false);
  teachingBlocks = signal<TeachingBlockItem[]>([]);
  selectedBlock = signal<TeachingBlockItem | null>(null);

  students = signal<StudentAverageRow[]>([]);
  isLoadingStudents = signal(false);
  calculatingIds = signal<Set<number>>(new Set());

  async ngOnInit() {
    this.contracts.set(await this.service.getMyContracts());
  }

  async onContractChange(contractId: number) {
    this.selectedContractId.set(contractId);
    this.resetFrom('teacherGroup');

    this.teacherGroups.set(await this.service.getTeacherGroups(contractId));
  }

  onTeacherGroupChange(teacherGroupId: number) {
    this.selectedTeacherGroupId.set(teacherGroupId);
    this.resetFrom('block');
  }

  // Abierto manualmente por el docente, igual que en academic-records — no automático.
  async openBlockModal() {
    const contract = this.selectedContract();
    if (!contract) return;

    this.teachingBlocks.set(await this.service.getTeachingBlocks(contract.year_id));
    this.showBlockModal.set(true);
  }

  closeBlockModal() {
    this.showBlockModal.set(false);
  }

  selectBlock(block: TeachingBlockItem) {
    this.selectedBlock.set(block);
    this.showBlockModal.set(false);
    this.students.set([]);
  }

  async loadStudents() {
    const contract = this.selectedContract();
    const group = this.selectedTeacherGroup();
    const block = this.selectedBlock();

    if (!contract || !group || !block) return;

    this.isLoadingStudents.set(true);

    try {
      const students = await this.service.getStudents(contract.year_id, group.grade_id, group.section_id);
      const existing = await this.service.getExistingAverages(group.id, block.id);
      const existingByRegistration = new Map(existing.map((record) => [record.registration_id, record]));

      const studentsWithAverages = students.map((student) => {
        const record = existingByRegistration.get(student.registration_id);
        if (!record) return student;

        return {
          ...student,
          daily_average: record.daily_average,
          practice_average: record.practice_average,
          exam_average: record.exam_average,
          attendance_average: record.attendance_average,
          teaching_block_average: record.teaching_block_average,
          hasRecord: true,
        };
      });

      this.students.set(studentsWithAverages);
    } finally {
      this.isLoadingStudents.set(false);
    }
  }

  isCalculating(registrationId: number): boolean {
    return this.calculatingIds().has(registrationId);
  }

  async calculateFor(student: StudentAverageRow) {
    const group = this.selectedTeacherGroup();
    const block = this.selectedBlock();
    if (!group || !block) return;

    this.calculatingIds.update((set) => new Set(set).add(student.registration_id));

    try {
      const response = await this.service.calculate(student.registration_id, group.id, block.id);

      this.students.update((rows) =>
        rows.map((row) =>
          row.registration_id === student.registration_id
            ? {
              ...row,
              daily_average: response.data.daily_average,
              practice_average: response.data.practice_average,
              exam_average: response.data.exam_average,
              attendance_average: response.data.attendance_average,
              teaching_block_average: response.data.teaching_block_average,
              hasRecord: true,
            }
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

  private resetFrom(step: 'teacherGroup' | 'block'): void {
    if (step === 'teacherGroup') {
      this.selectedTeacherGroupId.set(null);
      this.teacherGroups.set([]);
    }

    this.selectedBlock.set(null);
    this.teachingBlocks.set([]);
    this.students.set([]);
    this.searchTerm.set('');
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
}