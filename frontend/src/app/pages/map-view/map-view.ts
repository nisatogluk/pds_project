import { Component, AfterViewInit, OnDestroy, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './map-view.html',
  styleUrls: ['./map-view.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  currentUser: any = null;
  private map!: L.Map;
  private http = inject(HttpClient);
  private authService = inject(AuthService);

 private redIcon = L.divIcon({
    className: '',
    html: `<div style="
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 24px;
        height: 24px;
        background: radial-gradient(circle at 35% 35%, #ff6666, #cc0000);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        border: 2px solid #990000;
      "></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUser = user;
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  ngAfterViewInit(): void {
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

            L.marker([occ.latitude, occ.longitude], { icon: this.redIcon })
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