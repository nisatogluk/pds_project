import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-notification-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-prompt.component.html',
  styleUrls: ['./notification-prompt.component.css']
})
export class NotificationPromptComponent implements OnInit {
  showPrompt: boolean = false;
  VAPID_PUBLIC_KEY = 'BB1_YOUR_MOCK_VAPID_PUBLIC_KEY_FOR_TESTING_PURPOSES';

  // Routes where the banner should NOT appear
  private readonly EXCLUDED_ROUTES = ['/login', '/register', '/'];

  constructor(
    private swPush: SwPush,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (this.isExcludedRoute(event.url)) {
        this.showPrompt = false;
      } else {
        this.checkPrompt();
      }
    });

    if (!this.isExcludedRoute(this.router.url)) {
      this.checkPrompt();
    }
  }

  private isExcludedRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0];
    return this.EXCLUDED_ROUTES.some(route =>
      route === '/' ? cleanUrl === '/' : cleanUrl.startsWith(route)
    );
  }

  private getDismissedKey(): string {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user._id; 
        if (userId) {
          return `notificationDismissed_${userId}`;
        }
      }
    } catch (e) {
      console.error('LocalStorage parse error:', e);
    }
    return 'notificationDismissed_guest';
  }

  checkPrompt(): void {
    const loggedIn = this.authService.isAuthenticated();
    const dismissed = localStorage.getItem(this.getDismissedKey());

    if (loggedIn && !dismissed && Notification.permission === 'default') {
      this.showPrompt = true;
    } else {
      this.showPrompt = false;
    }
  }

  requestPermission(): void {
    if (!this.swPush.isEnabled) {
      // SwPush does not work in ng serve — use native permission fallback
      Notification.requestPermission().then(res => {
        console.log('Permission result:', res);
      });
      this.showPrompt = false;
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      console.log('Subscribed:', sub);
      this.showPrompt = false;
    })
    .catch(err => {
      console.log('Error:', err);
      this.showPrompt = false;
    });
  }

  dismissPrompt(): void {
    this.showPrompt = false;
    localStorage.setItem(this.getDismissedKey(), 'true');
  }
}