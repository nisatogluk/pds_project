import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  private user = { 
    name: 'John Doe', 
    phone: '912345678', 
    address: 'Rua de Braga, 123', 
    email: 'john.doe@example.com' 
  };

  getUser() { return { ...this.user }; }
  
  updateUser(data: any) {
    this.user = { ...this.user, ...data };
  }
}