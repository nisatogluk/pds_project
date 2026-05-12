import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  
  user = {
    name: 'Leonor Silva',
    email: 'leonor@estgf.ipp.pt',
    joinedDate: '2024-05-12'
  };

  myOccurrences: any[] = [
    { id: 1, title: 'Broken Street Light', status: 'Pending', date: '2024-05-10' },
    { id: 2, title: 'Pothole in Rua Padre Manuel', status: 'Resolved', date: '2024-04-28' }
  ];

  constructor(private router: Router) {}

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  viewDetails(id: number) {
    this.router.navigate(['/occurrence', id]);
  }
}