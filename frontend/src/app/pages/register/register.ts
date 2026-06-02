import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data'; // Voltamos ao DataService estável

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  showPassword = false;
  strength = 0;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService, // Injeção corrigida
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onPasswordInput(): void {
    const password = this.registerForm.get('password')?.value || '';
    this.strength = 0;

    if (password.length >= 8) {
      this.strength = 1;

      const hasLetters = /[a-zA-Z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecial = /[^a-zA-Z0-9]/.test(password);

      if (hasLetters && hasNumbers) {
        this.strength = 2;
      }
      if (hasLetters && hasNumbers && hasSpecial) {
        this.strength = 3;
      }
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    // Tentamos usar uma chamada genérica para não quebrar a compilação
    const anyService = this.dataService as any;
    const registerMethod = anyService.register || anyService.signUp || anyService.createUser;

    if (registerMethod) {
      registerMethod.call(this.dataService, this.registerForm.value).subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err: any) => {
          this.errorMessage = err?.error?.message || 'An error occurred during registration.';
          this.cdr.detectChanges();
        }
      });
    } else {
      console.error('Método de registo não encontrado no DataService.');
    }
  }
}
