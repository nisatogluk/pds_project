import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styles: [`
    nav { background: #333; padding: 1rem; display: flex; gap: 10px; }
    a { color: white; text-decoration: none; padding: 5px 10px; border-radius: 4px; }
    a:hover { background: #555; }
  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  currentUser: any = null;

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'Admin';
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}