import {
  Component,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { SchedulesService } from '../schedules.service';
import { ScheduleReportPdfService } from './schedule-report-pdf.service';

@Component({
  selector: 'app-report-schedules',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './report-schedules.html',
  styleUrl: './report-schedules.css'
})
export class ReportSchedules {

  private schedulesService =
    inject(SchedulesService);

  private pdfService =
    inject(ScheduleReportPdfService);

  isOpen =
    input<boolean>(false);

  years =
    input<any[]>([]);

  grades =
    input<any[]>([]);

  sections =
    input<any[]>([]);

  closeModal =
    output<void>();

  generatingPdf =
    signal(false);

  selectedYear =
    signal<number | null>(null);

  selectedGrade =
    signal<number | null>(null);

  selectedSection =
    signal<number | null>(null);

  error =
    signal<string | null>(null);

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  onClose(): void {
    this.closeModal.emit();
  }

  async generatePdf(): Promise<void> {

    const yearId =
      this.selectedYear();

    const gradeId =
      this.selectedGrade();

    const sectionId =
      this.selectedSection();

    if (
      !yearId ||
      !gradeId ||
      !sectionId
    ) {
      this.error.set(
        'Debe seleccionar año, grado y sección.'
      );

      return;
    }

    this.error.set(null);

    this.generatingPdf.set(true);

    try {

      const response =
        await firstValueFrom(
          this.schedulesService.getScheduleReport(
            yearId,
            gradeId,
            sectionId
          )
        );

      if (!response.data.length) {

        this.error.set(
          'No existen horarios registrados para la selección indicada.'
        );

        return;
      }

      await this.pdfService.generate(
        response.data
      );

      this.closeModal.emit();

    } catch (error) {

      console.error(
        'Error generando reporte de horarios:',
        error
      );

      this.error.set(
        'No se pudo generar el reporte de horarios.'
      );

    } finally {

      this.generatingPdf.set(false);

    }
  }
}