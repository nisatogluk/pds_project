import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { UserService } from './user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule], 
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditing = false;
  showSuccess = false;
  profileImageUrl: string | null = null; 

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.profileForm = this.fb.group({
      name: [{value: '', disabled: true}, Validators.required],
      phone: [{value: '', disabled: true}, Validators.required],
      address: [{value: '', disabled: true}, Validators.required],
      email: [{value: '', disabled: true}]
    });
  }

  ngOnInit() {
    const userData = this.userService.getUser();
    this.profileForm.patchValue(userData);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result; 
      };
      reader.readAsDataURL(file);
    }
  }

  save() {
    if (this.profileForm.valid) {
      this.userService.updateUser(this.profileForm.getRawValue());
      this.showSuccess = true;
      this.toggleEdit();
      setTimeout(() => this.showSuccess = false, 3000);
    }
  }
}