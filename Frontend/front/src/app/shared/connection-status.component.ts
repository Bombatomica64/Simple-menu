import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, timer } from 'rxjs';
import { ConnectionState } from '../Menu/menu.service';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-status" [ngClass]="getStatusClass()" *ngIf="connectionState">
      <div class="status-indicator">
        <div class="status-dot" [ngClass]="getDotClass()"></div>
        <span class="status-text">{{ getStatusText() }}</span>
      </div>

      <div class="status-details" *ngIf="showDetails">
        <div *ngIf="connectionState.reconnecting" class="retry-info">
          Retry {{ connectionState.retryCount }}/10
          <div class="loading-spinner"></div>
        </div>

        <div *ngIf="connectionState.lastError" class="error-info">
          {{ connectionState.lastError }}
        </div>

        <div *ngIf="connectionState.lastConnected" class="last-connected">
          Last connected: {{ formatTime(connectionState.lastConnected) }}
        </div>

        <button
          *ngIf="!connectionState.connected && !connectionState.reconnecting"
          class="retry-button"
          (click)="onRetryClick()"
          [disabled]="retryButtonDisabled">
          {{ retryButtonText }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .connection-status {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      min-width: 200px;
      transition: all 0.3s ease;
    }

    .connection-status.connected {
      background: rgba(34, 197, 94, 0.9);
    }

    .connection-status.disconnected {
      background: rgba(239, 68, 68, 0.9);
    }

    .connection-status.reconnecting {
      background: rgba(251, 191, 36, 0.9);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-dot.connected {
      background: #22c55e;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    }

    .status-dot.disconnected {
      background: #ef4444;
      box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
    }

    .status-dot.reconnecting {
      background: #fbbf24;
      animation: pulse 1.5s infinite;
    }

    .status-details {
      margin-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 8px;
    }

    .retry-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .loading-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-info {
      color: #fca5a5;
      font-size: 10px;
      margin-bottom: 4px;
    }

    .last-connected {
      color: #d1d5db;
      font-size: 10px;
      margin-bottom: 8px;
    }

    .retry-button {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
      transition: background 0.2s;
    }

    .retry-button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
    }

    .retry-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Hide on small screens to save space */
    @media (max-width: 640px) {
      .connection-status {
        top: 5px;
        right: 5px;
        padding: 6px 8px;
        font-size: 11px;
        min-width: 150px;
      }

      .status-details {
        display: none;
      }
    }
  `]
})
export class ConnectionStatusComponent implements OnInit, OnDestroy {
  @Input() connectionState$!: Observable<ConnectionState>;
  @Input() onRetry!: () => void;
  @Input() showDetails = true;

  connectionState: ConnectionState | null = null;
  retryButtonDisabled = false;
  retryButtonText = 'Retry Connection';

  private subscription?: Subscription;
  private retryTimer?: Subscription;

  ngOnInit(): void {
    if (this.connectionState$) {
      this.subscription = this.connectionState$.subscribe(state => {
        this.connectionState = state;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.retryTimer) {
      this.retryTimer.unsubscribe();
    }
  }

  getStatusClass(): string {
    if (!this.connectionState) return 'disconnected';

    if (this.connectionState.connected) return 'connected';
    if (this.connectionState.reconnecting) return 'reconnecting';
    return 'disconnected';
  }

  getDotClass(): string {
    if (!this.connectionState) return 'disconnected';

    if (this.connectionState.connected) return 'connected';
    if (this.connectionState.reconnecting) return 'reconnecting';
    return 'disconnected';
  }

  getStatusText(): string {
    if (!this.connectionState) return 'Disconnected';

    if (this.connectionState.connected) return 'Connected';
    if (this.connectionState.reconnecting) return 'Reconnecting...';
    return 'Disconnected';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }

  onRetryClick(): void {
    if (this.retryButtonDisabled || !this.onRetry) return;

    this.retryButtonDisabled = true;
    this.retryButtonText = 'Retrying...';

    this.onRetry();

    // Re-enable button after 5 seconds
    this.retryTimer = timer(5000).subscribe(() => {
      this.retryButtonDisabled = false;
      this.retryButtonText = 'Retry Connection';
    });
  }
}
