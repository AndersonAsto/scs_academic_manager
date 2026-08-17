import { Component, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService, ProfileData } from '../../admin/profile/profile.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-parent-profile',
  imports: [FormsModule],
  templateUrl: './parent-profile.html',
  styleUrl: './parent-profile.css',
})
export class ParentProfile {
  private service = inject(ProfileService);
  private authService = inject(AuthService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profile = signal<ProfileData | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  isUploadingPicture = signal(false);
  isDeletingPicture = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  username = signal('');
  email = signal('');
  phoneNumber = signal('');
  password = signal('');
  confirmPassword = signal('');

  avatarUrl = computed(() => this.service.resolveImageUrl(this.profile()?.profile_picture ?? null));

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    this.isLoading.set(true);

    try {
      const profile = await this.service.getMyProfile();
      this.profile.set(profile);
      this.username.set(profile.username ?? '');
      this.email.set(profile.personalInformation.email);
      this.phoneNumber.set(profile.personalInformation.phone_number);
    } finally {
      this.isLoading.set(false);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingPicture.set(true);
    this.errorMessage.set(null);

    try {
      const newPath = await this.service.uploadProfilePicture(file);
      this.profile.update((current) => (current ? { ...current, profile_picture: newPath } : current));
      await this.authService.refreshCurrentUser();
      this.successMessage.set('Foto de perfil actualizada.');
    } catch {
      this.errorMessage.set('No se pudo subir la imagen. Verifica el formato (JPG, PNG, WEBP) y el tamaño (máx. 3 MB).');
    } finally {
      this.isUploadingPicture.set(false);
      input.value = '';
    }
  }

  async removeProfilePicture() {
    if (!this.profile()?.profile_picture) return;

    this.isDeletingPicture.set(true);
    this.errorMessage.set(null);

    try {
      await this.service.deleteProfilePicture();
      this.profile.update((current) => (current ? { ...current, profile_picture: null } : current));
      await this.authService.refreshCurrentUser();
      this.successMessage.set('Foto de perfil eliminada.');
    } catch {
      this.errorMessage.set('No se pudo eliminar la foto de perfil.');
    } finally {
      this.isDeletingPicture.set(false);
    }
  }

  async save() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.password() && this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.isSaving.set(true);

    try {
      await this.service.updateProfile({
        username: this.username(),
        email: this.email(),
        phone_number: this.phoneNumber(),
        ...(this.password() ? { password: this.password() } : {}),
      });

      this.password.set('');
      this.confirmPassword.set('');

      await this.loadProfile();
      await this.authService.refreshCurrentUser();

      this.successMessage.set('Perfil actualizado correctamente.');
    } catch (error: any) {
      this.errorMessage.set(error?.error?.message ?? 'No se pudo actualizar el perfil.');
    } finally {
      this.isSaving.set(false);
    }
  }
}