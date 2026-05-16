import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from '../login/login';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, LoginComponent],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm!: FormGroup;
  isSubmitted: boolean = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const emailValue = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(emailValue).subscribe({
        next: () => {
          this.isSubmitted = true;
        },
        error: () => {
          this.isSubmitted = true;
        }
      });
    }
  }
}