import { Component, inject, OnInit, PLATFORM_ID, Resource, signal } from '@angular/core';
import { PastaComponent } from '../pasta/pasta.component';
import { httpResource, HttpResourceRequest } from '@angular/common/http';
import { Menu } from '../Menu/menu';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { menuConnection } from '../webSocketResource';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PastaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  menuConnection: { resource: any; connected: () => boolean } | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Connect to WebSocket for real-time menu updates
      this.menuConnection = menuConnection('ws://localhost:3000/menu-updates');
    }
  }
}
