import { Component, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { DataService } from '../../services/data';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './report-form.html',
  styleUrls: ['./report-form.css']
})
export class ReportFormComponent implements AfterViewInit {
  title = '';
  category = '';
  description = '';
  location = '';
  latitude: number | null = null;
  longitude: number | null = null;
  photoUrl = '';
  photoPreview: string | null = null;
  selectedFile: File | null = null;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  private map!: L.Map;
  private marker: L.Marker | null = null;

  private customIcon = L.icon({
    iconUrl: 'https://static.thenounproject.com/png/2146218-200.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  });

  constructor(
    private dataService: DataService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map-selection').setView([41.15, -8.61], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.zone.run(() => {
        const { lat, lng } = e.latlng;
        this.latitude = Number(lat.toFixed(6));
        this.longitude = Number(lng.toFixed(6));
        this.updateMarkerOnMap(lat, lng);
      });
    });
  }

  // Related Marker
  private updateMarkerOnMap(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], { icon: this.customIcon }).addTo(this.map);
    }
    this.cdr.detectChanges();
  }

  // Manuel location
  updateMarkerFromInputs(): void {
    if (this.latitude !== null && this.longitude !== null) {
      const lat = Number(this.latitude);
      const lng = Number(this.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const newPos: L.LatLngExpression = [lat, lng];
        this.map.setView(newPos, this.map.getZoom());
        this.updateMarkerOnMap(lat, lng);
      }
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Only .jpg and .png files are allowed!', 'error');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
        this.photoUrl = this.photoPreview;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
  submitForm(): void {
    if (!this.title?.trim()) { this.showToast("⚠️ Title is required!", "error"); return; }
    if (!this.category) { this.showToast("⚠️ Please select a category!", "error"); return; }
    if (!this.location?.trim()) { this.showToast("⚠️ Location name is required!", "error"); return; }
    if (this.latitude === null || this.longitude === null) {
      this.showToast("📍 Please select a location!", "error");
      return;
    }
    if (!this.photoUrl?.trim()) { this.showToast('Photo is required!', 'error'); return; }
    const data = {
      title: this.title,
      category: this.category,
      description: this.description,
      location: this.location,
      latitude: this.latitude,
      longitude: this.longitude,
      photoUrl: this.photoUrl
    };

    this.dataService.createOccurrence(data).subscribe({
      next: () => {
        this.showToast("✅ Report submitted successfully!", "success");
        setTimeout(() => this.router.navigate(['/map-view']), 1500);
      },
      error: (err: any) => {
        console.error("Submission Error:", err);
        this.showToast("❌ Submission failed!", "error");
      }
    });
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
