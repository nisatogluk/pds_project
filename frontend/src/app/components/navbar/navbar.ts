import { Component, OnInit, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule, DatePipe } from '@angular/common';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './navbar.html',
  styles: [`
    nav { background: #333; padding: 1rem; display: flex; gap: 10px; align-items: center; width: 100%; }
    a { color: white; text-decoration: none; padding: 5px 10px; border-radius: 4px; }
    a:hover { background: #555; }
    .bell-container { position: relative; margin-left: auto; cursor: pointer; }
    .bell-icon { font-size: 1.4rem; color: white; }
    .badge { position: absolute; top: -6px; right: -6px; background: red; color: white; border-radius: 50%; font-size: 0.65rem; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
    .dropdown { position: absolute; right: 0; top: 130%; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: 300px; z-index: 1000; overflow: hidden; }
    .dropdown-header { padding: 0.7rem 1rem; font-weight: 600; background: #f5f5f5; color: #333; font-size: 0.9rem; }
    .notification-item { padding: 0.7rem 1rem; border-bottom: 1px solid #eee; font-size: 0.85rem; color: #444; }
    .notification-item.unread { background: #eef4ff; }
    .notification-date { font-size: 0.75rem; color: #999; margin-top: 2px; }
    .empty { padding: 1rem; text-align: center; color: #999; font-size: 0.85rem; }

  `]
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentUser: any = null;
  notifications: any[] = [];
  showDropdown = false;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) this.currentUser = JSON.parse(storedUser);

    this.authService.currentUser$.subscribe(user => {
      if (user) this.currentUser = user;
    });

    if (this.isAuthenticated()) this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => { this.notifications = data.slice(0, 5); },
      error: (err) => console.error(err)
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.loadNotifications();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.bell-container')) this.showDropdown = false;
  }

  isAdmin(): boolean { return this.currentUser?.role === 'Admin'; }
  isAuthenticated(): boolean { return this.authService.isAuthenticated(); }
  logout(): void { this.authService.logout(); }
}
