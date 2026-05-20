import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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
export class NavbarComponent {}