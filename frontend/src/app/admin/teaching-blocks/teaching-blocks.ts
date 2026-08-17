import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfoTeachingBlocks } from './info-teaching-blocks/info-teaching-blocks';
import { CreateTeachingBlocks } from './create-teaching-blocks/create-teaching-blocks';
import { TeachingBlock } from './teaching-blocks.model';
import { TeachingBlockService } from './teaching-blocks.service';
import { UpdateTeachingBlock } from '../teaching-blocks/update-teaching-block/update-teaching-block';
import { DeleteTeachingBlocks } from './delete-teaching-blocks/delete-teaching-blocks';

@Component({
  selector: 'app-teaching-blocks',
  imports: [FormsModule, InfoTeachingBlocks, CreateTeachingBlocks, UpdateTeachingBlock, DeleteTeachingBlocks],
  templateUrl: './teaching-blocks.html',
  styleUrl: './teaching-blocks.css',
  standalone: true
})
export class TeachingBlocks {
  private teachingBlockService = inject(TeachingBlockService);

  teachingBlock = signal<TeachingBlock[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isCreateModalOpen = signal(false);

  isUpdateModalOpen = signal(false);
  teachingToEdit = signal<TeachingBlock | null>(null);

  isInfoModalOpen = signal(false);
  teachingToView = signal<TeachingBlock | null>(null);

  constructor() {
    this.fetchTeachingBlocks();
  }

  filteredTeachingBlocks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const year = this.selectedYear();

    return this.teachingBlock().filter(tb => {
      const matchesSearch =
        !term ||
        tb.teaching_block.toLowerCase().includes(term) ||
        tb.start_day.includes(term) ||
        tb.end_day.includes(term) ||
        tb.year.year.toString().includes(term);

      const matchesYear =
        year === null ||
        tb.year.id === year;

      return matchesSearch && matchesYear;
    });
  });

  fetchTeachingBlocks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.teachingBlockService.list().subscribe({
      next: (data) => {
        this.teachingBlock.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los bloques lectivos.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    //this.teachingToEdit.set(null);
    this.isCreateModalOpen.set(true);
  }

  onEdit(teachingBlock: TeachingBlock): void {
    this.teachingToEdit.set(teachingBlock);
    this.isUpdateModalOpen.set(true);
  }

  onCloseUpdateModal(): void {
    this.isUpdateModalOpen.set(false);
    this.teachingToEdit.set(null);
  }

  onCloseFormModal(): void {
    //this.teachingToEdit.set(null);
    this.isUpdateModalOpen.set(false);
  }

  onSaved(): void {
    this.isCreateModalOpen.set(false);
    this.isUpdateModalOpen.set(false);
    this.teachingToEdit.set(null);
    this.fetchTeachingBlocks();
  }

  onInfo(teachingBlock: TeachingBlock): void {
    this.teachingToView.set(teachingBlock);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.teachingToView.set(null);
  }

  onCloseCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  years = computed(() => {
    const years = this.teachingBlock()
      .map(tb => tb.year);
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

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.yearToDelete.set(null);

    this.selectedYear.set(null);

    this.fetchTeachingBlocks();
  }

  selectedYearObject = computed(() => {
    const id = this.selectedYear();
    if (id === null) return null;

    return this.years().find(y => y.id === id) ?? null;
  });
}
