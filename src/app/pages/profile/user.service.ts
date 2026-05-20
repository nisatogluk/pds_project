import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = 'http://localhost:3000/api'
  private user = { 
    name: 'Leonor Silva', 
    phone: '934988148', 
    address: 'Rua Padre Manuel Guimarães 140', 
    email: 'leo123@gmail.com' 
  };

  getUser() { return { ...this.user }; }
  
  updateUser(data: any) {
    this.user = { ...this.user, ...data };
  }

  constructor(private http: HttpClient) {}

  changePassword(passwordData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, passwordData);
  }
}