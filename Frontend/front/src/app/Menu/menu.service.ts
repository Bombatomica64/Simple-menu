import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Menu } from './menu';
import { environment } from '../../environments/environment.dynamic';


@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuSocket: WebSocketSubject<Menu>;
  public currentMenu$ = new BehaviorSubject<Menu | null>(null);
  constructor() {
    // Connect to WebSocket for real-time menu updates
    this.menuSocket = webSocket(environment.wsUrl);

    // Subscribe to WebSocket updates
    this.menuSocket.subscribe(
      (menu) => {
        console.log('Received menu update:', menu);
        this.currentMenu$.next(menu);
      },
      (err) => console.error('WebSocket error:', err),
      () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after a delay
        setTimeout(() => this.reconnect(), 3000);
      }
    );
  }

  // Reconnect if connection is lost
  private reconnect(): void {
    console.log('Attempting to reconnect WebSocket...');
    this.menuSocket = webSocket(environment.wsUrl);
    this.menuSocket.subscribe(
      (menu) => this.currentMenu$.next(menu),
      (err) => console.error('WebSocket reconnection error:', err),
      () => setTimeout(() => this.reconnect(), 3000)
    );
  }
}
