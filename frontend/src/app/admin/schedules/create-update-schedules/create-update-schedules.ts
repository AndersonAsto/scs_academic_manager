import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Observable, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { Schedule } from '../schedules.model';
import { SchedulesService } from '../schedules.service';

import { TeacherGroupsService } from '../../teacher-groups/teacher-groups.service';
import { TimeSlotService } from '../../time-slots/time-slots.service';
import { YearService } from '../../years/years.service';

import { TeacherGroup } from '../../teacher-groups/teacher-groups.model';
import { TimeSlot } from '../../time-slots/time-slots.model';
import { Year } from '../../years/years.model';

@Component({
  selector: 'app-create-update-schedules',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-update-schedules.html',
  styleUrl: './create-update-schedules.css',
})
export class CreateUpdateSchedules {
  isOpen = input(false);
  schedule = input<Schedule | null>(null);

  closeModal = output<void>();
  saved = output<void>();

  submitting = false;
  errorMessage = '';
  private fb = inject(FormBuilder);

  private schedulesService = inject(SchedulesService);
  private teacherGroupsService = inject(TeacherGroupsService);
  private timeSlotsService = inject(TimeSlotService);
  private yearService = inject(YearService);

  years = signal<Year[]>([]);
  teacherGroups = signal<TeacherGroup[]>([]);
  timeSlots = signal<TimeSlot[]>([]);


  form = this.fb.group({

    year_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),

    teacher_group_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),

    time_slot_id: this.fb.control<number | null>(
      null,
      Validators.required
    ),

    day: this.fb.control<string | null>(
      null,
      Validators.required
    ),

    description: this.fb.control('')
  });

  yearSelected = toSignal(
    this.form.controls.year_id.valueChanges.pipe(
      startWith(this.form.controls.year_id.value)
    )
  );

  teacherGroupsByYear = computed(() => {

    const year = Number(this.yearSelected());

    return this.teacherGroups().filter(tg =>
      tg.academic_staff_contract.year_id === year
    );

  });

  selectedTeacherGroup = computed(() => {

    const id = this.form.controls.teacher_group_id.value;

    return this.teacherGroups().find(tg => tg.id === id) ?? null;

  });

  constructor() {

    this.loadYears();
    this.loadTeacherGroups();
    this.loadTimeSlots();

    effect(() => {

      if (!this.isOpen()) return;

      const schedule = this.schedule();

      if (!schedule) {

        this.form.reset({

          year_id: null,
          teacher_group_id: null,
          time_slot_id: null,
          day: null,
          description: ''

        });

        this.errorMessage = '';

        return;
      }

      this.form.patchValue({

        year_id: schedule.teacher_group.academic_staff_contract.year_id,

        teacher_group_id: schedule.teacher_group_id,

        time_slot_id: schedule.time_slot_id,

        day: schedule.day,

        description: schedule.description ?? ''

      });

      this.errorMessage = '';

    });

  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const payload = {

      teacher_group_id:
        this.form.value.teacher_group_id!,

      time_slot_id:
        this.form.value.time_slot_id!,

      day:
        this.form.value.day!,

      description:
        this.form.value.description?.trim() || null

    };

    const request$: Observable<unknown> =
      this.isEditMode
        ? this.schedulesService.update(
          this.schedule()!.id,
          payload
        )
        : this.schedulesService.create(payload);

    request$.subscribe({

      next: () => {

        this.submitting = false;
        this.saved.emit();

      },

      error: err => {

        this.submitting = false;

        this.errorMessage =
          err?.error?.message ??
          'Ocurrió un error. Inténtelo nuevamente.';

      }

    });

  }

  private loadYears() {

    this.yearService.list().subscribe({
      next: data => this.years.set(data)
    });

  }

  private loadTeacherGroups() {

    this.teacherGroupsService.list().subscribe({
      next: data => this.teacherGroups.set(data)
    });

  }

  private loadTimeSlots() {

    this.timeSlotsService.list().subscribe({
      next: data => this.timeSlots.set(data)
    });

  }
  get isEditMode(): boolean {
    return !!this.schedule();
  }

  onCancel(): void {
    this.closeModal.emit();
  }

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  getTeacherName(group: TeacherGroup): string {

    const p =
      group.academic_staff_contract
        .academic_staff
        .personal_information;

    return `${p.names} ${p.fathers_surname} ${p.mothers_surname}`;

  }

  getTimeSlotLabel(slot: TimeSlot): string {

    return `${slot.start_time} - ${slot.end_time}`;

  }

  days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes'
  ];

}
