import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-occurrence-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './occurrence-details.html',
  styleUrls: ['./occurrence-details.css']
})
export class OccurrenceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private cdr = inject(ChangeDetectorRef);

  occurrence: any = null;
  loading = true;

  ngOnInit(): void {
    // URL'ID
    const id = this.route.snapshot.paramMap.get('id');
    console.log("Detay sayfası açıldı, ID:", id);

    if (id) {
      this.dataService.getOccurrenceById(id).subscribe({
        next: (data) => {
          console.log("Backend'den gelen detay verisi:", data);
          this.occurrence = data;
          this.loading = false; // SPINNER STOPS ✅
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Detay hatası:", err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  formatDate(date: string): string {
    if (!date) return '---';
    return new Date(date).toLocaleDateString();
  }
}