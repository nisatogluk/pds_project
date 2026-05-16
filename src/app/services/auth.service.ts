import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private loginUrl = 'http://localhost:3000/api/v1/auth/login';
  private registerUrl = 'http://localhost:3000/api/v1/auth/register';
  private forgotPasswordUrl = 'http://localhost:3000/api/v1/auth/forgot-password';

  login(credentials: any): Observable<any> {
    return this.http.post(this.loginUrl, credentials);
  }

  register(user: any): Observable<any> {
    return this.http.post(this.registerUrl, user);
  }

  forgotPassword(email: string) {
  return this.http.post(this.forgotPasswordUrl, { email });
  }
}