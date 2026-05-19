import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OccurrenceService } from '../../services/occurrence.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  occurrences: any[] = [];
  isLoading = true;

  constructor(private occurrenceService: OccurrenceService) {}

  ngOnInit(): void {
    this.occurrenceService.getAllOccurrences().subscribe({
      next: (data: any) => {
        this.occurrences = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching occurrences:', err);
        this.isLoading = false;
      }
    });
  }
}