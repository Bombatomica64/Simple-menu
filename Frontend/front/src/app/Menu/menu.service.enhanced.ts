import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retryWhen, delay, take, catchError, tap } from 'rxjs/operators';
import { Menu } from './menu';
import { environment } from '../../environments/environment.dynamic';

export interface ConnectionState {
  connected: boolean;
  reconnecting: boolean;
  lastError?: string;
  retryCount: number;
  lastConnected?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuSocket: WebSocketSubject<Menu> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 3000; // Start with 3 seconds
  private maxReconnectInterval = 30000; // Max 30 seconds
  private connectionTimer: any;

  public currentMenu$ = new BehaviorSubject<Menu | null>(null);
  public connectionState$ = new BehaviorSubject<ConnectionState>({
    connected: false,
    reconnecting: false,
    retryCount: 0
  });

  constructor() {
    this.initializeConnection();

    // Monitor connection health
    this.startConnectionMonitoring();
  }

  private initializeConnection(): void {
    try {
      this.updateConnectionState({ reconnecting: true });

      this.menuSocket = webSocket({
        url: environment.wsUrl,
        openObserver: {
          next: () => {
            console.log('✅ WebSocket connected successfully');
            this.reconnectAttempts = 0;
            this.reconnectInterval = 3000;
            this.updateConnectionState({
              connected: true,
              reconnecting: false,
              lastConnected: new Date(),
              retryCount: this.reconnectAttempts
            });
          }
        },
        closeObserver: {
          next: () => {
            console.log('🔌 WebSocket connection closed');
            this.updateConnectionState({
              connected: false,
              reconnecting: false
            });
            this.scheduleReconnect();
          }
        }
      });

      // Subscribe to WebSocket updates with error handling
      this.menuSocket.pipe(
        retryWhen(errors =>
          errors.pipe(
            tap(error => {
              console.error('❌ WebSocket error:', error);
              this.updateConnectionState({
                lastError: error.message || 'Connection error',
                connected: false
              });
            }),
            delay(this.reconnectInterval),
            take(this.maxReconnectAttempts),
            catchError(err => {
              console.error('❌ Max reconnection attempts reached:', err);
              this.updateConnectionState({
                lastError: 'Max reconnection attempts reached',
                reconnecting: false
              });
              return of(null);
            })
          )
        ),
        catchError(error => {
          console.error('❌ Fatal WebSocket error:', error);
          this.updateConnectionState({
            lastError: 'Fatal connection error',
            connected: false,
            reconnecting: false
          });
          return of(null);
        })
      ).subscribe({
        next: (menu) => {
          if (menu) {
            console.log('📨 Received menu update');
            this.currentMenu$.next(menu);
          }
        },
        error: (err) => {
          console.error('❌ Menu subscription error:', err);
          this.updateConnectionState({
            lastError: err.message,
            connected: false
          });
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket connection:', error);
      this.updateConnectionState({
        lastError: 'Failed to initialize connection',
        connected: false,
        reconnecting: false
      });
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Stopping reconnection.');
      this.updateConnectionState({
        lastError: 'Max reconnection attempts reached',
        reconnecting: false
      });
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const backoffDelay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1) + jitter,
      this.maxReconnectInterval
    );

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${Math.round(backoffDelay)}ms`);

    this.updateConnectionState({
      reconnecting: true,
      retryCount: this.reconnectAttempts
    });

    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnect();
      }
    }, backoffDelay);
  }

  private reconnect(): void {
    try {
      // Close existing connection if any
      if (this.menuSocket) {
        this.menuSocket.complete();
        this.menuSocket = null;
      }

      // Reinitialize connection
      this.initializeConnection();
    } catch (error) {
      console.error('❌ Error during reconnection:', error);
      this.updateConnectionState({
        lastError: 'Reconnection failed',
        connected: false
      });
      this.scheduleReconnect();
    }
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    const currentState = this.connectionState$.value;
    this.connectionState$.next({ ...currentState, ...updates });
  }

  private startConnectionMonitoring(): void {
    // Check connection health every 60 seconds
    this.connectionTimer = setInterval(() => {
      const state = this.connectionState$.value;

      if (!state.connected && !state.reconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('🔄 Connection health check: attempting to reconnect');
        this.scheduleReconnect();
      }

      // Log connection status for monitoring
      if (state.connected) {
        console.log('✅ Connection health check: connected');
      } else {
        console.warn(`⚠️  Connection health check: disconnected (retry ${state.retryCount}/${this.maxReconnectAttempts})`);
      }
    }, 60000);
  }

  public forceReconnect(): void {
    console.log('🔄 Force reconnect requested');
    this.reconnectAttempts = 0; // Reset attempt counter
    this.reconnect();
  }

  public getConnectionState(): Observable<ConnectionState> {
    return this.connectionState$.asObservable();
  }

  public getCurrentMenu(): Observable<Menu | null> {
    return this.currentMenu$.asObservable();
  }

  ngOnDestroy(): void {
    if (this.connectionTimer) {
      clearInterval(this.connectionTimer);
    }

    if (this.menuSocket) {
      this.menuSocket.complete();
    }
  }
}
