import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="strength-container" *ngIf="passwordToCheck">
      <div class="bars-wrapper">
        <div class="strength-bar" [style.background-color]="bar0"></div>
        <div class="strength-bar" [style.background-color]="bar1"></div>
        <div class="strength-bar" [style.background-color]="bar2"></div>
      </div>
      <span class="strength-label" [style.color]="bar0 !== '#e0e0e0' ? bar0 : '#999'">
        {{ strengthText }}
      </span>
    </div>
  `
})
export class PasswordStrengthComponent implements OnChanges {
  // Recebe a password do formulário pai (ex: Registo)
  @Input() passwordToCheck: string = '';

  strengthText: string = '';
  bar0: string = '#e0e0e0'; // Cinzento (vazio)
  bar1: string = '#e0e0e0';
  bar2: string = '#e0e0e0';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['passwordToCheck']) {
      this.calculateStrength(this.passwordToCheck || '');
    }
  }

  private calculateStrength(password: string): void {
    // Se estiver vazio, reseta as cores
    if (!password) {
      this.strengthText = '';
      this.setBarColors('#e0e0e0', '#e0e0e0', '#e0e0e0');
      return;
    }

    let strengthScore = 0;

    // Regras básicas para preparação bcrypt:
    if (password.length >= 8) strengthScore += 1;
    if (password.match(/(?=.*[a-z])(?=.*[A-Z])/)) strengthScore += 1; // Tem minúsculas e maiúsculas
    if (password.match(/(?=.*[0-9])(?=.*[!@#$%^&*])/)) strengthScore += 1; // Tem números e símbolos

    // Define as cores (Vermelho, Amarelo, Verde) com base no score
    switch (strengthScore) {
      case 0:
      case 1:
        this.strengthText = 'Weak';
        this.setBarColors('#dc2626', '#e0e0e0', '#e0e0e0'); // Vermelho
        break;
      case 2:
        this.strengthText = 'Medium';
        this.setBarColors('#eab308', '#eab308', '#e0e0e0'); // Amarelo
        break;
      case 3:
        this.strengthText = 'Strong';
        this.setBarColors('#16a34a', '#16a34a', '#16a34a'); // Verde
        break;
    }
  }

  private setBarColors(c1: string, c2: string, c3: string) {
    this.bar0 = c1;
    this.bar1 = c2;
    this.bar2 = c3;
  }
}
