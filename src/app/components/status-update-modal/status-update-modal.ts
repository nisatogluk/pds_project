import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-status-update-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-update-modal.html',
  styleUrls: ['./status-update-modal.css']
})
export class StatusUpdateModalComponent {
  @Input() isOpen: boolean = false; 
  @Input() currentStatus: string = 'PENDING';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  closeModal() {
    this.close.emit();
  }

  saveStatus() {
    this.save.emit(this.currentStatus);
    this.closeModal();
  }
}