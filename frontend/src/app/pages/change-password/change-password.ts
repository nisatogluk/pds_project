import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  showSuccess = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'The new passwords do not match.';
        this.showSuccess = false;
        return;
      }

      this.errorMessage = '';

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.showSuccess = true;
          this.passwordForm.reset();
          setTimeout(() => this.showSuccess = false, 3000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update password.';
          this.showSuccess = false;
        }
      });
    }
  }
}