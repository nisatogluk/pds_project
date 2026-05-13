import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocationService {

  selectedCoords = signal<{lat: number, lng: number} | null>(null);
}