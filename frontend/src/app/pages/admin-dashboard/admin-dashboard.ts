import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { OccurrenceService } from '../../services/occurrence.service';
import { StatusUpdateModalComponent } from '../../components/status-update-modal/status-update-modal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, StatusUpdateModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  private occurrenceService = inject(OccurrenceService);
  private cdr = inject(ChangeDetectorRef);

  occurrences: any[] = [];
  isModalOpen = false;
  selectedOccurrenceId = '';
  selectedOccurrenceStatus = 'PENDING';

  ngOnInit(): void {
    this.loadOccurrences();
  }

  loadOccurrences(): void {
    this.occurrenceService.getAllOccurrences().subscribe({
      next: (data) => {
        console.log('Occurrences:', data);
        this.occurrences = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading occurrences:', err)
    });
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