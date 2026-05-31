import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OccurrenceService } from '../../services/occurrence.service';
import { StatusUpdateModalComponent } from '../../components/status-update-modal/status-update-modal';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, StatusUpdateModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private occurrenceService = inject(OccurrenceService);
  private cdr = inject(ChangeDetectorRef);

  occurrences: any[] = [];
  filteredOccurrences: any[] = [];
  isModalOpen = false;
  selectedOccurrenceId = '';
  selectedOccurrenceStatus = 'PENDING';
  selectedPeriod = 'all';
  sortBy = 'date';
  showCharts = false;

  private statusChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  get totalOccurrences() { return this.occurrences.length; }
  get pendingCount() { return this.occurrences.filter(o => o.status === 'PENDING').length; }
  get solvedCount() { return this.occurrences.filter(o => o.status === 'SOLVED').length; }
  get inResolutionCount() { return this.occurrences.filter(o => o.status === 'IN_RESOLUTION').length; }
  get approvedCount() { return this.occurrences.filter(o => o.status === 'APPROVED').length; }
  get rejectedCount() { return this.occurrences.filter(o => o.status === 'REJECTED').length; }
  get underAnalysisCount() { return this.occurrences.filter(o => o.status === 'UNDER_ANALYSIS').length; }

  get avgResolutionTime(): string {
    const solved = this.occurrences.filter(o => o.status === 'SOLVED' && o.createdAt);
    if (!solved.length) return 'N/A';
    const avgDays = solved.reduce((acc, o) => {
      const days = (new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return acc + days;
    }, 0) / solved.length;
    return `${Math.round(avgDays)} days`;
  }

  ngOnInit(): void {
    this.loadOccurrences();
  }

  ngOnDestroy(): void {
    this.statusChart?.destroy();
    this.categoryChart?.destroy();
  }

  loadOccurrences(): void {
    this.occurrenceService.getAllOccurrences().subscribe({
      next: (data) => {
        this.occurrences = [...data];
        this.applyFilters();
        this.cdr.detectChanges();
        if (this.showCharts) this.renderCharts();
      },
      error: (err) => console.error('Error loading occurrences:', err)
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

    // Status chart
    const statusCtx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, {
        type: 'bar',
        data: {
          labels: ['Pending', 'Approved', 'In Resolution', 'Solved', 'Rejected', 'Under Analysis'],
          datasets: [{
            label: 'Occurrences by Status',
            data: [
              this.pendingCount,
              this.approvedCount,
              this.inResolutionCount,
              this.solvedCount,
              this.rejectedCount,
              this.underAnalysisCount
            ],
            backgroundColor: ['#fef9c3', '#dcfce7', '#fce7f3', '#dbeafe', '#fee2e2', '#e0e7ff'],
            borderColor: ['#854d0e', '#166534', '#9d174d', '#1e40af', '#991b1b', '#3730a3'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } }
        }
      });
    }

    // Category chart
    const categoryCtx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCtx) {
      const categories: { [key: string]: number } = {};
      this.occurrences.forEach(o => {
        if (o.category) categories[o.category] = (categories[o.category] || 0) + 1;
      });
      this.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#e0e7ff', '#dcfce7', '#fef9c3', '#fee2e2', '#fce7f3', '#dbeafe', '#f3f4f6']
          }]
        },
        options: { responsive: true }
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.occurrences];
    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      const days = this.selectedPeriod === 'week' ? 7 : this.selectedPeriod === 'month' ? 30 : 365;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.createdAt) >= cutoff);
    }
    if (this.sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.sortBy === 'votes') {
      filtered.sort((a, b) => (b.votes?.upvotes?.length || 0) - (a.votes?.upvotes?.length || 0));
    } else if (this.sortBy === 'status') {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }
    this.filteredOccurrences = filtered;
  }

  openStatusModal(occurrence: any) {
    this.selectedOccurrenceId = occurrence._id;
    this.selectedOccurrenceStatus = occurrence.status;
    this.isModalOpen = true;
  }

  closeStatusModal() {
    this.isModalOpen = false;
  }

  handleStatusUpdate(newStatus: string) {
    this.occurrenceService.updateStatus(this.selectedOccurrenceId, newStatus).subscribe({
      next: () => {
        this.loadOccurrences();
        this.closeStatusModal();
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }
}