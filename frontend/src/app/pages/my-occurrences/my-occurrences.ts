import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-my-occurrences',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-occurrences.html',
  styleUrls: ['./my-occurrences.css']
})
export class MyOccurrencesComponent implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  loading: boolean = true;

  selectedStatus: string = '';
  selectedSort: string = 'newest';

  statuses = ['PENDING', 'UNDER_ANALYSIS', 'IN_RESOLUTION', 'APPROVED', 'REJECTED', 'SOLVED'];

  private dataService = inject(DataService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.dataService.getMyOccurrences().subscribe({
      next: (data: any) => {
        this.reports = [...data];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Loading Error:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = [...this.reports];

    if (this.selectedStatus) {
      result = result.filter(r => r.status === this.selectedStatus);
    }

    if (this.selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    this.filteredReports = result;
  }

  formatDate(date: string): string {
    if (!date) return '---';
    return new Date(date).toLocaleDateString();
  }
}
