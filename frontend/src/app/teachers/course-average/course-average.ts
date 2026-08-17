import { Component, inject, signal, computed } from '@angular/core';
import {
  CourseAverageService,
  Contract,
  TeacherGroup,
  StudentCourseAverageRow,
  TeachingBlockItem,
  BlockAverageEntry,
} from './course-average.service';

@Component({
  selector: 'app-course-average',
  imports: [],
  templateUrl: './course-average.html',
  styleUrl: './course-average.css',
})
export class CourseAverage {
  private service = inject(CourseAverageService);

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

  students = signal<StudentCourseAverageRow[]>([]);
  isLoadingStudents = signal(false);
  calculatingIds = signal<Set<number>>(new Set());

  teachingBlocks = signal<TeachingBlockItem[]>([]);

  async ngOnInit() {
    this.contracts.set(await this.service.getMyContracts());
  }

  async onContractChange(contractId: number) {
    this.selectedContractId.set(contractId);
    this.selectedTeacherGroupId.set(null);
    this.teacherGroups.set([]);
    this.students.set([]);
    this.searchTerm.set('');

    this.teacherGroups.set(await this.service.getTeacherGroups(contractId));
  }

  onTeacherGroupChange(teacherGroupId: number) {
    this.selectedTeacherGroupId.set(teacherGroupId);
    this.students.set([]);
    this.searchTerm.set('');
  }

  async loadStudents() {
    const contract = this.selectedContract();
    const group = this.selectedTeacherGroup();

    if (!contract || !group) return;

    this.searchTerm.set('');

    this.isLoadingStudents.set(true);

    try {
      const [teachingBlocks, students, existingCourseAverages, blockAveragesRaw] = await Promise.all([
        this.service.getTeachingBlocks(contract.year_id),
        this.service.getStudents(contract.year_id, group.grade_id, group.section_id),
        this.service.getExistingAverages(group.id),
        this.service.getBlockAveragesByGroup(group.id),
      ]);

      this.teachingBlocks.set(teachingBlocks);

      const courseAveragesByRegistration = new Map(
        existingCourseAverages.map((record) => [record.registration_id, record]),
      );

      // registration_id -> (teaching_block_id -> average)
      const blockAveragesByRegistration = new Map<number, Map<number, number | null>>();
      for (const record of blockAveragesRaw) {
        if (!blockAveragesByRegistration.has(record.registration_id)) {
          blockAveragesByRegistration.set(record.registration_id, new Map());
        }
        blockAveragesByRegistration
          .get(record.registration_id)!
          .set(record.teaching_block_id, record.teaching_block_average);
      }

      const studentsWithAverages = students.map((student) => {
        const courseRecord = courseAveragesByRegistration.get(student.registration_id);
        const studentBlocks = blockAveragesByRegistration.get(student.registration_id);

        const blockAverages: BlockAverageEntry[] = teachingBlocks.map((block) => ({
          teaching_block_id: block.id,
          teaching_block: block.teaching_block,
          average: studentBlocks?.get(block.id) ?? null,
        }));

        return {
          ...student,
          overall_course_average: courseRecord?.overall_course_average ?? null,
          hasRecord: !!courseRecord,
          blockAverages,
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

  async calculateFor(student: StudentCourseAverageRow) {
    const group = this.selectedTeacherGroup();
    if (!group) return;

    this.calculatingIds.update((set) => new Set(set).add(student.registration_id));

    try {
      const response = await this.service.calculate(student.registration_id, group.id);

      this.students.update((rows) =>
        rows.map((row) =>
          row.registration_id === student.registration_id
            ? {
              ...row,
              overall_course_average: response.data.overall_course_average,
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