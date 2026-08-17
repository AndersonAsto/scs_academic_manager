import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = new FormBuilder();
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const { username, password } = this.loginForm.getRawValue();

    try {
      const user = await this.authService.login(username!, password!);
      this.router.navigate([this.authService.homeRouteForRole(user.role)]);
    } catch {
      this.errorMessage.set('Usuario o contraseña incorrectos.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}