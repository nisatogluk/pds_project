import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoginComponent],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordPage implements OnInit {
  resetPasswordForm!: FormGroup;
  isSubmitted: boolean = false;
  errorMessage: string = '';
  token: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.resetPasswordForm.value;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }

      if (!this.token) {
        this.errorMessage = 'Invalid or missing token.';
        return;
      }

      this.errorMessage = '';
      
      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.isSubmitted = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to reset password. Please try again.';
        }
      });
    }
  }
}