import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusUpdateModalComponent } from '../../components/status-update-modal/status-update-modal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatusUpdateModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  isModalOpen = false;
  selectedOccurrenceStatus = 'PENDING';

  openStatusModal(status: string) {
    this.selectedOccurrenceStatus = status;
    this.isModalOpen = true;
  }

  closeStatusModal() {
    this.isModalOpen = false;
  }

  handleStatusUpdate(newStatus: string) {
    console.log('New stateOccurrence value:', newStatus);
  }
}