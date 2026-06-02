import { Component, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Adicionado HttpClient
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

  // ORS Sugestões & Debounce
  suggestions: any[] = [];
  private searchTimeout: any;

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
    private router: Router,
    private http: HttpClient // Injetado para falar com o nosso Proxy do Backend
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

        // Faz reverse geocoding automático ao clicar no mapa!
        this.reverseGeocode(lat, lng);
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

  // ---- OPENROUTESERVICE: Autocomplete (Debounce 300ms) ----
  onSearchInput(event: any): void {
    const text = event.target.value;
    this.location = text;

    // Limpa o temporizador se o utilizador continuar a escrever (Debounce)
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    // Só pesquisa se tiver pelo menos 3 letras
    if (text.length < 3) {
      this.suggestions = [];
      return;
    }

    this.searchTimeout = setTimeout(() => {
      // Chama a nossa rota segura no Backend
      this.http.get<any>(`http://localhost:3000/api/map/geocode?text=${encodeURIComponent(text)}`).subscribe({
        next: (data) => {
          this.suggestions = data.features || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Geocode error:', err)
      });
    }, 300);
  }

  // Selecionar sugestão da lista
  selectSuggestion(suggestion: any): void {
    this.location = suggestion.properties.label;

    // ORS devolve coordenadas no formato [longitude, latitude]
    const [lng, lat] = suggestion.geometry.coordinates;
    this.latitude = Number(lat.toFixed(6));
    this.longitude = Number(lng.toFixed(6));
    this.suggestions = []; // Esconde a lista

    this.map.setView([lat, lng], 16);
    this.updateMarkerOnMap(lat, lng);
  }

  // ---- OPENROUTESERVICE: Reverse Geocoding ----
  private reverseGeocode(lat: number, lng: number): void {
    this.http.get<any>(`http://localhost:3000/api/map/reverse?lat=${lat}&lon=${lng}`).subscribe({
      next: (data) => {
        if (data.features && data.features.length > 0) {
          this.location = data.features[0].properties.label;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Reverse Geocode error:', err)
    });
  }

  // Botão: GPS Use My Location
  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.showToast("GPS is not supported by your browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.latitude = Number(lat.toFixed(6));
        this.longitude = Number(lng.toFixed(6));
        this.map.setView([lat, lng], 16);
        this.updateMarkerOnMap(lat, lng);

        this.reverseGeocode(lat, lng);
      },
      (error) => {
        this.showToast("Unable to retrieve your location", "error");
      }
    );
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
