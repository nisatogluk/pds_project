import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { NotificationPromptComponent } from './components/notification-prompt/notification-prompt.component'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,BackButtonComponent,NotificationPromptComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'pds_frontend';
}
