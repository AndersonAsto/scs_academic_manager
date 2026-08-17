import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoWeightings } from './info-weightings/info-weightings';
import { Weighting } from './weightings.model';
import { WeightingsService } from './weightings.service';
import { CreateWeightings } from './create-weightings/create-weightings';
import { UpdateWeighting } from './update-weighting/update-weighting';
import { DeleteWeightings } from './delete-weightings/delete-weightings';

@Component({
  selector: 'app-weightings',
  imports: [FormsModule, InfoWeightings, CreateWeightings, UpdateWeighting, DeleteWeightings],
  standalone: true,
  templateUrl: './weightings.html',
  styleUrl: './weightings.css',
})
export class Weightings {
  private weightingService = inject(WeightingsService);

  weighting = signal<Weighting[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isCreateModalOpen = signal(false);
  isUpdateModalOpen = signal(false);
  weightingToEdit = signal<Weighting | null>(null);

  isInfoModalOpen = signal(false);
  weightingToView = signal<Weighting | null>(null);

  constructor() {
    this.fetchWeighting();
  }

  filteredWeightings = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const year = this.selectedYear();

    return this.weighting().filter(w => {
      const matchesSearch =
        !term ||
        w.weighting.toString().toLowerCase().includes(term) ||
        w.type.toLocaleLowerCase().includes(term) ||
        w.year.year.toString().includes(term);

      const matchesYear =
        year === null ||
        w.year.id === year;

      return matchesSearch && matchesYear;
    });
  });

  fetchWeighting(): void {
    this.loading.set(true);
    this.error.set(null);

    this.weightingService.list().subscribe({
      next: (data) => {
        this.weighting.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las ponderaciones.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.isCreateModalOpen.set(true);
  }

  onEdit(weighting: Weighting): void {
    this.weightingToEdit.set(weighting);
    this.isUpdateModalOpen.set(true);
  }

  onCloseCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onCloseUpdateModal(): void {
    this.weightingToEdit.set(null);
    this.isUpdateModalOpen.set(false);
  }

  onSaved(): void {
    this.isCreateModalOpen.set(false);
    this.isUpdateModalOpen.set(false);
    this.weightingToEdit.set(null);
    this.fetchWeighting();
  }

  onInfo(weighting: Weighting): void {
    this.weightingToView.set(weighting);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.weightingToView.set(null);
  }

  years = computed(() => {
    const years = this.weighting()
      .map(w => w.year);
    return years.filter(
      (year, index, array) =>
        index === array.findIndex(y => y.id === year.id)
    );
  });

  selectedYear = signal<number | null>(null);

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedYear.set(null);
  }

  isDeleteModalOpen = signal(false);
  yearToDelete = signal<number | null>(null);

  onDelete(): void {

    const yearId = this.selectedYear();

    if (yearId === null) {
      return;
    }

    this.yearToDelete.set(yearId);
    this.isDeleteModalOpen.set(true);
  }

  selectedYearObject = computed(() => {

    const id = this.selectedYear();

    if (id === null) {
      return null;
    }

    return this.years().find(y => y.id === id) ?? null;
  });

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);
  }

  onDeleted(): void {

    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);

    this.selectedYear.set(null);

    this.fetchWeighting();
  }
}
