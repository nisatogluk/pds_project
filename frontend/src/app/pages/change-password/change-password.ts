import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../profile/user.service'; 

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  showSuccess = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const { newPassword, confirmPassword } = this.passwordForm.value;

      if (newPassword !== confirmPassword) {
        this.errorMessage = 'The new passwords do not match.';
        this.showSuccess = false;
        return;
      }

      this.errorMessage = '';
      
      setTimeout(() => {
        this.showSuccess = true;
        this.passwordForm.reset();

        setTimeout(() => this.showSuccess = false, 3000);
      }, 500);
    }
  }
}