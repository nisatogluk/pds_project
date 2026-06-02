import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../../services/data'; // Confirma se o caminho para o teu serviço está correto

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

  // Variáveis para o controlo do Olho e da Força da Password
  showPassword = false;
  strength = 0;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
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

  // Validador para garantir que as duas passwords coincidem
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  // Alterna a visibilidade do texto da password
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Calcula dinamicamente o nível de segurança da password
  onPasswordInput(): void {
    const password = this.registerForm.get('password')?.value || '';
    this.strength = 0;

    if (password.length >= 8) {
      this.strength = 1; // Nível 1: Mínimo de 8 caracteres (Vermelho)

      const hasLetters = /[a-zA-Z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecial = /[^a-zA-Z0-9]/.test(password);

      // Nível 2: Letras + Números (Amarelo)
      if (hasLetters && hasNumbers) {
        this.strength = 2;
      }

      // Nível 3: Letras + Números + Símbolos Especiais (Verde)
      if (hasLetters && hasNumbers && hasSpecial) {
        this.strength = 3;
      }
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.dataService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'An error occurred during registration.';
        this.cdr.detectChanges();
      }
    });
  }
}
