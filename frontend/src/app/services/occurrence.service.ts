import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OccurrenceService {
  private http = inject(HttpClient);
  private occurrenceUrl = 'http://localhost:3001/api/v1/occurrences';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAllOccurrences(): Observable<any> {
    return this.http.get(this.occurrenceUrl, { headers: this.getHeaders() });
  }

  getOccurrenceById(id: string): Observable<any> {
    return this.http.get(`${this.occurrenceUrl}/${id}`);
  }

  createOccurrence(occurrence: any): Observable<any> {
    return this.http.post(this.occurrenceUrl, occurrence, { headers: this.getHeaders() });
  }

  updateOccurrence(id: string, occurrence: any): Observable<any> {
    return this.http.put(`${this.occurrenceUrl}/${id}`, occurrence, { headers: this.getHeaders() });
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.occurrenceUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  deleteOccurrence(id: string): Observable<any> {
    return this.http.delete(`${this.occurrenceUrl}/${id}`, { headers: this.getHeaders() });
  }

  voteOccurrence(id: string, voteType: string): Observable<any> {
    return this.http.post(`${this.occurrenceUrl}/${id}/vote`, { voteType }, { headers: this.getHeaders() });
  }

  moderatorDeleteOccurrence(id: string, reason: string): Observable<any> {
    return this.http.delete(`http://localhost:3001/api/v1/moderation/occurrences/${id}`, {
        headers: this.getHeaders(),
        body: { reason }
    });
  }

  moderatorDeleteComment(occurrenceId: string, commentId: string, reason: string): Observable<any> {
    return this.http.delete(`http://localhost:3001/api/v1/moderation/occurrences/${occurrenceId}/comments/${commentId}`, {
        headers: this.getHeaders(),
        body: { reason }
    });
  }



  getModerationStats(): Observable<any> {
  return this.http.get('http://localhost:3001/api/v1/moderation/stats', { headers: this.getHeaders() });
  }
}