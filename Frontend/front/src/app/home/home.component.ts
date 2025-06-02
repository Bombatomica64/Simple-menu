import { Component, inject, OnInit, PLATFORM_ID, Injector, runInInjectionContext, signal, effect } from '@angular/core';
import { MultiPageMenuComponent } from '../multi-page-menu/multi-page-menu.component';
import { Menu } from '../Menu/menu';
import { isPlatformBrowser } from '@angular/common';
import { menuConnection, MenuConnection } from '../webSocketResource';
import { environment } from '../../environments/environment.dynamic';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MultiPageMenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);
  menuConnection: MenuConnection | null = null;
  showConnectionStatus = signal(true);

  constructor() {
    // Hide connection status after 1 second when connected
    effect(() => {
      if (this.menuConnection?.connected()) {
        setTimeout(() => {
          this.showConnectionStatus.set(false);
        }, 1000);
      }
    });
  }

  ngOnInit() {    if (isPlatformBrowser(this.platformId)) {
      // Connect to WebSocket for real-time menu updates
      runInInjectionContext(this.injector, () => {
        this.menuConnection = menuConnection(environment.wsUrl);
      });
    }
  }
}
