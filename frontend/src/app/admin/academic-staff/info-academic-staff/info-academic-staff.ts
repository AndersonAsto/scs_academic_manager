import { Component, inject, input, output, signal } from '@angular/core';
import { AcademicStaffModel } from '../academic-staff.model';
import { AcademicStaffContractsService } from '../academic-staff-contracts/academic-staff-contracts.service';
import { AcademicStaffContract } from '../academic-staff-contracts/academic-staff-contracts.model';
import { AcademicStaffPdfService } from './academic-staff-pdf.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-info-academic-staff',
  imports: [],
  standalone: true,
  templateUrl: './info-academic-staff.html',
  styleUrl: './info-academic-staff.css',
})
export class InfoAcademicStaff {

  private contractsService = inject(AcademicStaffContractsService);
  private pdfService = inject(AcademicStaffPdfService);

  isOpen = input<boolean>(false);
  academicStaff = input<AcademicStaffModel | null>(null);
  closeModal = output<void>();
  contracts = signal<AcademicStaffContract[]>([]);
  loadingContracts = signal(false);
  errorContracts = signal<string | null>(null);
  generatingPdf = signal(false);

  onBackdropClick(): void {
    this.closeModal.emit();
  }

  loadContracts(): void {

    const staff = this.academicStaff();

    if (!staff) {
      return;
    }

    this.loadingContracts.set(true);
    this.errorContracts.set(null);

    this.contractsService
      .list(staff.id)
      .subscribe({

        next: (data) => {
          this.contracts.set(data);
          this.loadingContracts.set(false);
        },

        error: () => {
          this.contracts.set([]);
          this.errorContracts.set(
            'No se pudieron cargar los contratos del personal académico.'
          );
          this.loadingContracts.set(false);
        }
      });
  }

  async downloadPdf(): Promise<void> {
    const staff = this.academicStaff();

    if (!staff) {
      return;
    }

    this.generatingPdf.set(true);

    try {
      const contracts =
        await firstValueFrom(
          this.contractsService.list(staff.id)
        );
      await this.pdfService.generate(
        staff,
        contracts
      );
    } catch (error) {
      console.error(
        'Error generando el reporte PDF:',
        error
      );
    } finally {
      this.generatingPdf.set(false);
    }
  }

  formatDate(
    value: string | undefined
  ): string {

    if (!value) {
      return '—';
    }

    const date =
      new Date(
        value.replace(' ', 'T')
      );

    return date.toLocaleString(
      'es-PE',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }
}