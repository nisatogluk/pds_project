import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['../register/register.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      phoneNumber: ['', [Validators.pattern(/^(\+351\s?)?[923]\d{8}$|^$/)]],
      addressLine1: [''],
      addressLine2: [''],
      postalCode: ['', [Validators.pattern(/^\d{4}-\d{3}$|^$/)]],
      city: [''],
      gdprConsent: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const {
        username, email, password, confirmPassword,
        phoneNumber, addressLine1, addressLine2, postalCode, city
      } = this.registerForm.value;

      const formData = {

        name: username,
        email,
        password,
        confirmPassword,
        phoneNumber: phoneNumber || null,

        address: [addressLine1, addressLine2, postalCode, city]
          .filter(Boolean)
          .join(', ') || null,

      };

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.router.navigate(['/account-confirmation']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Registration failed.';
        }
      });
    }
  }
}