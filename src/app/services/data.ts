import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  // Port and backend num communicate
  private baseUrl = 'http://localhost:3000/api/v1/occurrences';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // New Raports
  createOccurrence(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/occurrence`, data, { headers: this.getHeaders() });
  }
// data.ts 
getOccurrenceById(id: string) {
  return this.http.get(`${this.baseUrl}/${id}`);
}
  // Get all pins on the map
  getMapOccurrences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/map`);
  }

  // get my occurences on the map 
  getMyOccurrences(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/api/v1/occurrences/my-occurrences', {
    headers: this.getHeaders()
  });
}
}