import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementsService } from '../ads-sent.service';
import { CourseAverageService, Contract, TeacherGroup } from '../../course-average/course-average.service';

interface SelectableRegistration {
  registration_id: number;
  student_id: number;
  names: string;
  fathers_surname: string;
  mothers_surname: string;
  selected: boolean;
}

@Component({
  selector: 'app-create-ads-sent',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-ads-sent.html',
  styleUrl: './create-ads-sent.css',
})
export class CreateAdsSent {

  isOpen = input(false);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private announcementsService = inject(AnnouncementsService);
  private courseAverageService = inject(CourseAverageService);

  contracts = signal<Contract[]>([]);
  teacherGroups = signal<TeacherGroup[]>([]);
  registrations = signal<SelectableRegistration[]>([]);

  selectedContractId = signal<number | null>(null);
  selectedTeacherGroupId = signal<number | null>(null);
  loadingRegistrations = signal(false);

  form = this.fb.group({
    type: this.fb.control('', Validators.required),
    priority: this.fb.control(''),
    affair: this.fb.control('', Validators.required),
    registration_date: this.fb.control('', Validators.required),
    description: this.fb.control(''),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;

      this.courseAverageService.getMyContracts().then(d => this.contracts.set(d));

      this.selectedContractId.set(null);
      this.selectedTeacherGroupId.set(null);
      this.teacherGroups.set([]);
      this.registrations.set([]);

      this.form.reset({
        type: '',
        priority: '',
        affair: '',
        registration_date: '',
        description: ''
      });

      this.errorMessage = '';
    });
  }

  async onContractChange(contractId: number): Promise<void> {
    this.selectedContractId.set(contractId);
    this.selectedTeacherGroupId.set(null);
    this.registrations.set([]);

    this.teacherGroups.set(
      await this.courseAverageService.getTeacherGroups(contractId)
    );
  }

  async onTeacherGroupChange(teacherGroupId: number): Promise<void> {
    this.selectedTeacherGroupId.set(teacherGroupId);

    const contract = this.contracts().find(c => c.id === this.selectedContractId());
    const group = this.teacherGroups().find(g => g.id === teacherGroupId);

    if (!contract || !group) return;

    this.loadingRegistrations.set(true);

    try {
      const students = await this.courseAverageService.getStudents(
        contract.year_id,
        group.grade_id,
        group.section_id
      );

      this.registrations.set(
        students.map(s => ({
          registration_id: s.registration_id,
          student_id: s.student_id,
          names: s.names,
          fathers_surname: s.fathers_surname,
          mothers_surname: s.mothers_surname,
          selected: false
        }))
      );
    } finally {
      this.loadingRegistrations.set(false);
    }
  }

  toggleRegistration(registrationId: number): void {
    this.registrations.update(list =>
      list.map(r =>
        r.registration_id === registrationId
          ? { ...r, selected: !r.selected }
          : r
      )
    );
  }

  toggleAll(checked: boolean): void {
    this.registrations.update(list => list.map(r => ({ ...r, selected: checked })));
  }

  get selectedCount(): number {
    return this.registrations().filter(r => r.selected).length;
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const registrationIds = this.registrations()
      .filter(r => r.selected)
      .map(r => r.registration_id);

    if (registrationIds.length === 0) {
      this.errorMessage = 'Seleccione al menos un destinatario.';
      return;
    }

    if (!this.selectedTeacherGroupId()) {
      this.errorMessage = 'Seleccione un grupo docente.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.announcementsService.create({
      teacher_group_id: this.selectedTeacherGroupId()!,
      registration_ids: registrationIds,
      type: this.form.value.type!,
      priority: this.form.value.priority || null,
      affair: this.form.value.affair!,
      registration_date: this.form.value.registration_date!,
      description: this.form.value.description?.trim() || null
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.saved.emit();
      },
      error: err => {
        this.submitting = false;
        this.errorMessage = err?.error?.message ?? 'Ocurrió un error. Inténtalo nuevamente.';
      }
    });
  }
}