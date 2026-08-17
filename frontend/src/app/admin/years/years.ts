import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Year } from './years.model';
import { YearService } from './years.service';
import { InfoYear } from './info-year/info-year';
import { CreateUpdateYears } from './create-update-years/create-update-years';
import { DeleteYear } from './delete-year/delete-year';

@Component({
  selector: 'app-years',
  imports: [FormsModule, InfoYear, CreateUpdateYears, DeleteYear],
  templateUrl: './years.html',
  styleUrl: './years.css',
  standalone: true
})
export class Years {
  private yearsService = inject(YearService);

  years = signal<Year[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isFormModalOpen = signal(false);
  yearToEdit = signal<Year | null>(null);

  isInfoModalOpen = signal(false);
  yearToView = signal<Year | null>(null);

  constructor() {
    this.fetchYears();
  }

  filteredYears = computed(() => {
    const term = this.searchTerm().trim();
    if (!term) return this.years();
    return this.years().filter(c =>
      c.year.toString().includes(term)
    );
  });

  fetchYears(): void {
    this.loading.set(true);
    this.error.set(null);

    this.yearsService.list().subscribe({
      next: (data) => {
        this.years.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los años lectivos.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.yearToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  onEdit(year: Year): void {
    this.yearToEdit.set(year);
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.yearToEdit.set(null);
    this.isFormModalOpen.set(false);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.yearToEdit.set(null);
    this.fetchYears();
  }

  onInfo(year: Year): void {
    this.yearToView.set(year);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.yearToView.set(null);
  }

  isDeleteModalOpen = signal(false);
  yearToDelete = signal<Year | null>(null);

  onDelete(year: Year): void {
    this.yearToDelete.set(year);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);
    this.fetchYears();
  }
}
