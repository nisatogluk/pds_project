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

  constructor(
    private swPush: SwPush,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url.includes('/login') || event.url === '/') {
        this.showPrompt = false;
      } else {
        this.checkPrompt();
      }
    });

    if (!this.router.url.includes('/login') && this.router.url !== '/') {
      this.checkPrompt();
    }
  }

  checkPrompt(): void {
    const loggedIn = this.authService.isAuthenticated();

  
    if (loggedIn && Notification.permission === 'default') {
      this.showPrompt = true;
    } else {
      this.showPrompt = false;
    }
  }

  requestPermission(): void {
    if (!this.swPush.isEnabled) {
    // SwPush does not work in ng serve — use native permission
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
  }
}