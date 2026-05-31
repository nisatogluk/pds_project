import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { OccurrenceService } from '../../services/occurrence.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-moderator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './moderator-dashboard.html',
  styleUrls: ['./moderator-dashboard.css']
})
export class ModeratorDashboard implements OnInit, OnDestroy {
  private occurrenceService = inject(OccurrenceService);
  private cdr = inject(ChangeDetectorRef);

  occurrences: any[] = [];
  filteredOccurrences: any[] = [];
  filterStatus = 'all';
  filterCategory = '';
  categories: string[] = [];
  showCharts = false;

  // Moderation stats
  totalOccurrences = 0;
  totalComments = 0;
  deletedOccurrences = 0;
  deletedComments = 0;

  private statusChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  showDeleteOccurrenceModal = false;
  showDeleteCommentModal = false;
  selectedOccurrenceId = '';
  selectedCommentId = '';
  moderationReason = '';

  ngOnInit(): void {
    this.loadOccurrences();
    this.loadModerationStats();
  }

  ngOnDestroy(): void {
    this.statusChart?.destroy();
    this.categoryChart?.destroy();
  }

  loadOccurrences(): void {
    this.occurrenceService.getAllOccurrences().subscribe({
      next: (data: any) => {
        this.occurrences = [...data];
        this.categories = [...new Set(data.map((o: any) => o.category).filter(Boolean))] as string[];
        this.applyFilters();
        this.cdr.detectChanges();
        if (this.showCharts) this.renderCharts();
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  loadModerationStats(): void {
    this.occurrenceService.getModerationStats().subscribe({
      next: (stats: any) => {
        this.totalOccurrences = stats.totalOccurrences;
        this.totalComments = stats.totalComments;
        this.deletedOccurrences = stats.deletedOccurrences;
        this.deletedComments = stats.deletedComments;
        this.cdr.detectChanges();
        if (this.showCharts) this.renderCharts();
      },
      error: (err: any) => console.error('Error loading moderation stats:', err)
    });
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
    if (this.showCharts) {
      setTimeout(() => this.renderCharts(), 100);
    } else {
      this.statusChart?.destroy();
      this.categoryChart?.destroy();
      this.statusChart = null;
      this.categoryChart = null;
    }
  }

  renderCharts(): void {
    this.statusChart?.destroy();
    this.categoryChart?.destroy();

    const statusCtx = document.getElementById('modStatusChart') as HTMLCanvasElement;
    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, {
        type: 'bar',
        data: {
          labels: ['Total Occurrences', 'Total Comments', 'Deleted Occurrences', 'Deleted Comments'],
          datasets: [{
            label: 'Moderation Overview',
            data: [this.totalOccurrences, this.totalComments, this.deletedOccurrences, this.deletedComments],
            backgroundColor: ['#dbeafe', '#e0e7ff', '#fee2e2', '#fee2e2'],
            borderColor: ['#1e40af', '#3730a3', '#991b1b', '#991b1b'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }

    const categoryCtx = document.getElementById('modCategoryChart') as HTMLCanvasElement;
    if (categoryCtx) {
      const cats: { [key: string]: number } = {};
      this.occurrences.forEach(o => {
        if (o.category) cats[o.category] = (cats[o.category] || 0) + 1;
      });
      this.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(cats),
          datasets: [{
            data: Object.values(cats),
            backgroundColor: ['#e0e7ff', '#dcfce7', '#fef9c3', '#fee2e2', '#fce7f3', '#dbeafe', '#f3f4f6']
          }]
        },
        options: { responsive: true }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.occurrences];
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(o => o.status === this.filterStatus);
    }
    if (this.filterCategory) {
      filtered = filtered.filter(o => o.category === this.filterCategory);
    }
    this.filteredOccurrences = filtered;
  }

  openDeleteOccurrenceModal(id: string): void {
    this.selectedOccurrenceId = id;
    this.moderationReason = '';
    this.showDeleteOccurrenceModal = true;
  }

  openDeleteCommentModal(occurrenceId: string, commentId: string): void {
    this.selectedOccurrenceId = occurrenceId;
    this.selectedCommentId = commentId;
    this.moderationReason = '';
    this.showDeleteCommentModal = true;
  }

  closeModals(): void {
    this.showDeleteOccurrenceModal = false;
    this.showDeleteCommentModal = false;
    this.moderationReason = '';
  }

  confirmDeleteOccurrence(): void {
    if (!this.moderationReason.trim()) return;
    this.occurrenceService.moderatorDeleteOccurrence(this.selectedOccurrenceId, this.moderationReason).subscribe({
      next: () => {
        this.closeModals();
        this.loadOccurrences();
        this.loadModerationStats();
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  confirmDeleteComment(): void {
    if (!this.moderationReason.trim()) return;
    this.occurrenceService.moderatorDeleteComment(this.selectedOccurrenceId, this.selectedCommentId, this.moderationReason).subscribe({
      next: () => {
        this.closeModals();
        this.loadOccurrences();
        this.loadModerationStats();
      },
      error: (err: any) => console.error('Error:', err)
    });
  }
}