import { Component, AfterViewInit, OnDestroy, OnInit, inject, HostListener } from '@angular/core';
import * as L from 'leaflet';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule, DatePipe],
  templateUrl: './map-view.html',
  styleUrls: ['./map-view.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  currentUser: any = null;
  notifications: any[] = [];
  showDropdown = false;
  private map!: L.Map;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

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

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUser = user;
    });
    if (this.isAuthenticated()) this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => { this.notifications = data.slice(0, 5); },
      error: (err) => console.error(err)
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.loadNotifications();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.bell-container')) this.showDropdown = false;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([41.15, -8.61], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.http.get<any[]>('http://localhost:3001/api/v1/occurrences/map')
      .subscribe({
        next: (data: any[]) => {
          this.loading = false;
          console.log("Data to map:", data);

          data.forEach((occ: any) => {
            if (!occ.latitude || !occ.longitude) return;

            const popupContent = `
            <div style="min-width:150px; font-family: sans-serif;">
            <b style="color: #1e1b4b;">${occ.title}</b><br>
            <span style="padding: 2px 6px; background: #e0e7ff; border-radius: 4px; font-size: 10px;">${occ.status}</span><br>
             <img src="${occ.photoUrl}" style="width:120px; height:80px; object-fit:cover; border-radius:6px; margin:8px 0;"><br>
             <a href="/occurrence/${occ._id}" style="color:#4338ca; text-decoration:none; font-weight:bold; font-size: 13px;">
              View Details →
               </a>
                </div>
                `;

            L.marker([occ.latitude, occ.longitude], { icon: this.redIcon })
              .addTo(this.map)
              .bindPopup(popupContent);
          });
        },
        error: (err: any) => {
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

  isModerator(): boolean {
    return this.currentUser?.role === 'Moderator';
  }
}