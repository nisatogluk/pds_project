import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/v1/occurrences';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Create a new occurrence/report
  createOccurrence(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data, { headers: this.getHeaders() });
  }

  // Get a specific occurrence by ID
  getOccurrenceById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Get all occurrences for map view
  getMapOccurrences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/map`);
  }

  // Get current user's occurrences
  getMyOccurrences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/my-occurrences`, {
      headers: this.getHeaders()
    });
  }

  // Update an occurrence
  updateOccurrence(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // Update occurrence status
  updateOccurrenceStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // Delete an occurrence
  deleteOccurrence(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Add comment to occurrence
  addComment(occurrenceId: string, text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${occurrenceId}/comments`, { text }, { headers: this.getHeaders() });
  }

  // Get all comments for an occurrence
  getComments(occurrenceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${occurrenceId}/comments`);
  }
}
