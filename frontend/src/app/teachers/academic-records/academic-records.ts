import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AcademicRecordService,
  Contract,
  TeacherGroup,
  ScheduleItem,
  LectiveDay,
  StudentRow,
  AcademicRecordModel
} from './academic-records.service';

@Component({
  selector: 'app-academic-record',
  imports: [FormsModule],
  templateUrl: './academic-records.html',
  styleUrl: './academic-records.css',
})
export class AcademicRecord {
  private service = inject(AcademicRecordService);

  // Paso 1: contratos / años
  contracts = signal<Contract[]>([]);
  selectedContractId = signal<number | null>(null);
  selectedContract = computed(
    () => this.contracts().find((c) => c.id === this.selectedContractId()) ?? null,
  );

  // Paso 2: grupos de enseñanza
  teacherGroups = signal<TeacherGroup[]>([]);
  selectedTeacherGroupId = signal<number | null>(null);
  selectedTeacherGroup = computed(
    () => this.teacherGroups().find((g) => g.id === this.selectedTeacherGroupId()) ?? null,
  );

  // Paso 3: horarios
  schedules = signal<ScheduleItem[]>([]);
  selectedScheduleId = signal<number | null>(null);

  // Paso 4: calendario de días lectivos
  showCalendarModal = signal(false);
  lectiveDays = signal<LectiveDay[]>([]);
  selectedDay = signal<LectiveDay | null>(null);

  // Paso 5: estudiantes / tabla editable
  students = signal<StudentRow[]>([]);
  isLoadingStudents = signal(false);
  isSaving = signal(false);

  attendanceOptions: Array<{ value: StudentRow['attendance']; label: string }> = [
    { value: 'P', label: 'Presente' },
    { value: 'T', label: 'Tardanza' },
    { value: 'J', label: 'Justificado' },
    { value: 'F', label: 'Falta' },
  ];

  async openCalendar() {
    const scheduleId = this.selectedScheduleId();
    if (!scheduleId) return;

    this.lectiveDays.set(await this.service.getLectiveDays(scheduleId));
    this.showCalendarModal.set(true);
  }

  async ngOnInit() {
    this.contracts.set(await this.service.getMyContracts());
  }

  async onContractChange(contractId: number) {
    this.selectedContractId.set(contractId);
    this.resetFrom('teacherGroup');

    this.teacherGroups.set(await this.service.getTeacherGroups(contractId));
  }

  async onTeacherGroupChange(teacherGroupId: number) {

    this.selectedTeacherGroupId.set(teacherGroupId);

    this.resetFrom('schedule');

    this.schedules.set(
      await this.service.getSchedules(teacherGroupId)
    );
  }

  async onScheduleChange(scheduleId: number) {
    this.selectedScheduleId.set(scheduleId);
    this.resetFrom('day');
  }

  selectDay(day: LectiveDay) {
    this.selectedDay.set(day);
    this.showCalendarModal.set(false);
    this.students.set([]); // el docente decide cuándo cargar con el botón
  }

  closeCalendar() {
    this.showCalendarModal.set(false);
  }

  async loadStudents(): Promise<void> {

    console.log('========== CARGAR ESTUDIANTES ==========');

    const contract = this.selectedContract();
    const group = this.selectedTeacherGroup();
    const day = this.selectedDay();

    console.log('Contrato seleccionado:', contract);
    console.log('Grupo seleccionado:', group);
    console.log('Día seleccionado:', day);

    if (!contract) {
      console.error('No existe contrato seleccionado.');
      return;
    }

    if (!group) {
      console.error('No existe grupo docente seleccionado.');
      return;
    }

    if (!day) {
      console.error('No existe día seleccionado.');
      return;
    }

    console.log('year_id:', contract.year_id);
    console.log('grade_id:', group.grade_id);
    console.log('section_id:', group.section_id);
    console.log(
      'school_day_by_schedule_id:',
      day.id
    );

    this.isLoadingStudents.set(true);

    try {

      /*
       * 1. Obtener estudiantes matriculados
       *    en el año, grado y sección.
       */
      const students =
        await this.service.getStudents(
          contract.year_id,
          group.grade_id,
          group.section_id
        );

      console.log(
        'Estudiantes recibidos:',
        students
      );

      /*
       * 2. Obtener los registros académicos
       *    existentes para ese día.
       *
       *    Puede devolver:
       *
       *    data: []
       *
       *    o:
       *
       *    data: [...]
       */
      const existing =
        await this.service.getExistingRecords(
          day.id
        );

      console.log(
        'Registros existentes:',
        existing
      );

      /*
       * 3. Indexar registros por matrícula.
       */
      const existingByRegistration =
        new Map<number, AcademicRecordModel>();

      for (const record of existing) {

        existingByRegistration.set(
          record.registration_id,
          record
        );
      }

      /*
       * 4. Combinar estudiantes con registros existentes.
       *
       *    Si existe registro:
       *    se cargan sus valores.
       *
       *    Si no existe:
       *    se mantienen los null.
       */
      const studentsWithRecords =
        students.map(student => {

          const record =
            existingByRegistration.get(
              student.registration_id
            );

          if (!record) {
            return student;
          }

          return {
            ...student,

            attendance:
              record.attendance,

            score:
              record.score,

            incident:
              record.incident,

            description:
              record.description
          };
        });

      /*
       * 5. Guardar resultado en el signal.
       */
      this.students.set(
        studentsWithRecords
      );

      console.log(
        'Students signal:',
        this.students()
      );

      console.log(
        'Total estudiantes:',
        studentsWithRecords.length
      );

      console.log(
        'Total registros existentes:',
        existing.length
      );

    } catch (error) {

      console.error(
        'Error cargando estudiantes:',
        error
      );

    } finally {

      this.isLoadingStudents.set(false);

    }
  }

  async save() {
    const day = this.selectedDay();
    if (!day || this.students().length === 0) return;

    this.isSaving.set(true);

    try {
      await this.service.saveRecords(day.id, this.students());
      // TODO: mostrar toast/mensaje de éxito según el sistema de notificaciones que uses.
    } finally {
      this.isSaving.set(false);
    }
  }

  private resetFrom(
    step: 'teacherGroup' | 'schedule' | 'day'
  ): void {

    this.searchTerm.set(''); // se limpia en cualquier paso

    if (step === 'teacherGroup') {

      this.selectedTeacherGroupId.set(null);
      this.teacherGroups.set([]);

      this.selectedScheduleId.set(null);
      this.schedules.set([]);

      this.selectedDay.set(null);
      this.lectiveDays.set([]);

      this.students.set([]);

      return;
    }

    if (step === 'schedule') {

      this.selectedScheduleId.set(null);
      this.schedules.set([]);

      this.selectedDay.set(null);
      this.lectiveDays.set([]);

      this.students.set([]);

      return;
    }

    // step === 'day'
    this.selectedDay.set(null);
    this.lectiveDays.set([]);

    this.students.set([]);
  }

  searchTerm = signal('');

  filteredStudents = computed(() => { // NUEVO
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.students();

    return this.students().filter((student) =>
      `${student.names} ${student.fathers_surname} ${student.mothers_surname}`
        .toLowerCase()
        .includes(term),
    );
  });
}