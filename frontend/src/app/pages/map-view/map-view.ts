import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './map-view.html',
  styleUrls: ['./map-view.css']
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  loading = true;
  private map!: L.Map;
  private http = inject(HttpClient); // HttpClient

  ngAfterViewInit(): void {
    // Start Map
    this.map = L.map('map').setView([41.15, -8.61], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.http.get<any[]>('http://localhost:3001/api/v1/occurrences/map')
      .subscribe({
        next: (data) => {
          this.loading = false;
          console.log("Data to map:", data);

          data.forEach((occ: any) => {
            if (!occ.latitude || !occ.longitude) return;

            const popupContent = `
              <div style="min-width:150px; font-family: sans-serif;">
                <b style="color: #1e1b4b;">${occ.title}</b><br>
                <span style="padding: 2px 6px; background: #e0e7ff; border-radius: 4px; font-size: 10px;">${occ.status}</span><br>
                <img src="${occ.photoUrl}" style="width:120px; height:80px; object-fit:cover; border-radius:6px; margin:8px 0;"><br>
                <a href="/this-occurrence/${occ._id}" style="color:#4338ca; text-decoration:none; font-weight:bold; font-size: 13px;">
                  View Details →
                </a>
              </div>
            `;

            L.marker([occ.latitude, occ.longitude])
              .addTo(this.map)
              .bindPopup(popupContent);
          });
        },
        error: (err) => {
          console.error("Map can not load:", err);
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}