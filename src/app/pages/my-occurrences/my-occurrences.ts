import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-my-occurrences',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-occurrences.html',
  styleUrls: ['./my-occurrences.css']
})
export class MyOccurrencesComponent implements OnInit {
  reports: any[] = [];
  loading: boolean = true;
  private dataService = inject(DataService);
  private cdr = inject(ChangeDetectorRef); 

  ngOnInit(): void {
    console.log("Datas are loading...");

    this.dataService.getMyOccurrences().subscribe({
      next: (data: any) => {
        
        this.reports = [...data];
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

  formatDate(date: string): string {
    if (!date) return '---';
    const d = new Date(date);
    return d.toLocaleDateString();
  }
}