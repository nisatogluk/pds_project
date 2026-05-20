import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccurrenceService {
  private http = inject(HttpClient);
  private occurrenceUrl = 'http://localhost:3000/api/v1/occurrences';

  getAllOccurrences(): Observable<any> {
    return this.http.get(this.occurrenceUrl);
  }

  getOccurrenceById(id: string): Observable<any> {
    return this.http.get(`${this.occurrenceUrl}/${id}`);
  }

  createOccurrence(occurrence: any): Observable<any> {
    return this.http.post(this.occurrenceUrl, occurrence);
  }

  updateOccurrence(id: string, occurrence: any): Observable<any> {
    return this.http.put(`${this.occurrenceUrl}/${id}`, occurrence);
  }

  deleteOccurrence(id: string): Observable<any> {
    return this.http.delete(`${this.occurrenceUrl}/${id}`);
  }
}
