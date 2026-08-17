import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseService } from './courses.service';
import { Course } from './courses.model';
import { CreationUpdateCourses } from './creation-update-courses/creation-update-courses';
import { CourseInfo } from './course-info/course-info';
import { DeleteCourse } from './delete-course/delete-course';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [FormsModule, CreationUpdateCourses, CourseInfo, DeleteCourse],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private courseService = inject(CourseService);

  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  isFormModalOpen = signal(false);
  courseToEdit = signal<Course | null>(null);

  isInfoModalOpen = signal(false);
  courseToView = signal<Course | null>(null);

  filteredCourses = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.courses();
    return this.courses().filter(c =>
      c.course.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.courseService.list().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los cursos.');
        this.loading.set(false);
      }
    });
  }

  onAdd(): void {
    this.courseToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  onEdit(course: Course): void {
    this.courseToEdit.set(course);
    this.isFormModalOpen.set(true);
  }

  onCloseFormModal(): void {
    this.isFormModalOpen.set(false);
    this.courseToEdit.set(null);
  }

  onSaved(): void {
    this.isFormModalOpen.set(false);
    this.courseToEdit.set(null);
    this.fetchCourses();
  }

  onInfo(course: Course): void {
    this.courseToView.set(course);
    this.isInfoModalOpen.set(true);
  }

  onCloseInfoModal(): void {
    this.isInfoModalOpen.set(false);
    this.courseToView.set(null);
  }

  isDeleteModalOpen = signal(false);
  courseToDelete = signal<Course | null>(null);

  onDelete(course: Course): void {
    this.courseToDelete.set(course);
    this.isDeleteModalOpen.set(true);
  }

  onCloseDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.courseToDelete.set(null);
  }

  onDeleted(): void {
    this.isDeleteModalOpen.set(false);
    this.courseToDelete.set(null);
    this.fetchCourses();
  }
}