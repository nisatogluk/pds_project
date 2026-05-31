import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.css']
})
export class BackButtonComponent implements OnInit {
  private router = inject(Router);
  isVisible = false;

  private readonly HOME_ROUTES = [
    '/', '/home', '/map', '/map-view', '/login', '/register'
  ];

  ngOnInit(): void {
    // Wait for NavigationEnd on first load 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.urlAfterRedirects);
      });

    // If the router is already active, also check the current URL
    if (this.router.navigated) {
      this.checkRoute(this.router.url);
    }
  }

  private checkRoute(url: string): void {
    // Fragment (#), query param (?), matrix param (;) 
    const cleanUrl = url.split('?')[0].split('#')[0].split(';')[0];
    this.isVisible = !this.HOME_ROUTES.includes(cleanUrl);
  }

  goBack(): void {
    (document.activeElement as HTMLElement)?.blur();

    // Dirty form check
    const dirtyElement = document.querySelector(
      'form.ng-dirty, input.ng-dirty, select.ng-dirty, textarea.ng-dirty'
    );

    if (dirtyElement) {
      const confirmed = confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }

    // Use browser's own history stack — satisfies Constraint
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}