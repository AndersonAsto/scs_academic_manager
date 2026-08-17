import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchoolDayBySchedule } from './school-days-by-schedules.model';
import { Schedule } from '../schedules.model';
import { SchoolDaysByScheduleService, UpdateSchoolDayBySchedulePayload } from './school-days-by-schedules.service';

@Component({
  selector: 'app-school-days-by-schedules',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './school-days-by-schedules.html',
  styleUrl: './school-days-by-schedules.css',
})
export class SchoolDaysBySchedules { 
  private sdByScheduleService = inject(SchoolDaysByScheduleService);
  
  schedule = input<Schedule | null>(null);
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  schoolDaysBySchedule = signal<SchoolDayBySchedule[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  editingSdByScheduleId = signal<number | null>(null);
  editForm = signal<UpdateSchoolDayBySchedulePayload>({
    type: 'Calificación Diaria',
    description: null
  });

  typeOptions: string[] = ['Calificación Diaria', 'Práctica', 'Examen'];

  constructor() {
    effect(() => {
      const currentSchedule = this.schedule();
      if (this.isOpen() && currentSchedule) {
        this.loadSDBySchedule(currentSchedule.id);
      }
    });
  }

  loadSDBySchedule(scheduleId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.sdByScheduleService.list(scheduleId).subscribe({
      next: (data) => {
        this.schoolDaysBySchedule.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los días lectivos del horario.');
        this.loading.set(false);
      }
    });
  }

  startEdit(item: SchoolDayBySchedule): void {
    this.editingSdByScheduleId.set(item.id);
    this.editForm.set({
      type: item.type.toString(),
      description: item.description
    });
  }

  cancelEdit(): void {
    this.editingSdByScheduleId.set(null);
  }

  saveEdit(id: number): void {
    this.sdByScheduleService.update(id, this.editForm()).subscribe({
      next: () => {
        this.editingSdByScheduleId.set(null);
        const currentSchedule = this.schedule();
        if (currentSchedule) {
          this.loadSDBySchedule(currentSchedule.id);
        }
      },
      error: () => {
        alert('Error al actualizar el día lectivo.');
      }
    });
  }

  onClose(): void {
    this.editingSdByScheduleId.set(null);
    this.closeModal.emit();
  }
}