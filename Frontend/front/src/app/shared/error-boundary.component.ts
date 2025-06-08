import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!errorState.hasError; else errorTemplate">
      <ng-content></ng-content>
    </div>

    <ng-template #errorTemplate>
      <div class="error-boundary">
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">Something went wrong</h2>
          <p class="error-message">{{ getErrorMessage() }}</p>

          <div class="error-details" *ngIf="showDetails">
            <details>
              <summary>Error Details</summary>
              <pre class="error-stack">{{ getErrorStack() }}</pre>
              <div class="error-timestamp">
                Occurred at: {{ formatTimestamp() }}
              </div>
            </details>
          </div>

          <div class="error-actions">
            <button class="retry-button" (click)="handleRetry()">
              🔄 Try Again
            </button>

            <button class="reload-button" (click)="handleReload()">
              🔄 Reload Page
            </button>

            <button
              class="details-toggle"
              (click)="toggleDetails()"
              *ngIf="errorState.error">
              {{ showDetails ? 'Hide' : 'Show' }} Details
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .error-boundary {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 2rem;
      border-radius: 8px;
      margin: 1rem;
    }

    .error-container {
      text-align: center;
      max-width: 600px;
      width: 100%;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-title {
      color: #dc2626;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .error-message {
      color: #7f1d1d;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .error-details {
      margin: 1.5rem 0;
      text-align: left;
    }

    details {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #fca5a5;
      border-radius: 4px;
      padding: 1rem;
    }

    summary {
      cursor: pointer;
      font-weight: 500;
      color: #dc2626;
      margin-bottom: 0.5rem;
    }

    .error-stack {
      background: #f9f9f9;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 0.75rem;
      font-size: 0.75rem;
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
    }

    .error-timestamp {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .error-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .retry-button,
    .reload-button,
    .details-toggle {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .retry-button {
      background: #dc2626;
      color: white;
    }

    .retry-button:hover {
      background: #b91c1c;
      transform: translateY(-1px);
    }

    .reload-button {
      background: #6b7280;
      color: white;
    }

    .reload-button:hover {
      background: #4b5563;
      transform: translateY(-1px);
    }

    .details-toggle {
      background: transparent;
      color: #dc2626;
      border: 1px solid #dc2626;
    }

    .details-toggle:hover {
      background: #dc2626;
      color: white;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .error-boundary {
        padding: 1rem;
        margin: 0.5rem;
      }

      .error-container {
        padding: 0;
      }

      .error-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .retry-button,
      .reload-button,
      .details-toggle {
        width: 100%;
      }
    }
  `]
})
export class ErrorBoundaryComponent implements OnInit {
  @Input() errorState: ErrorBoundaryState = { hasError: false };
  @Input() onRetry?: () => void;
  @Input() fallbackMessage = 'An unexpected error occurred. Please try refreshing the page.';

  showDetails = false;

  ngOnInit(): void {
    // Log error for debugging
    if (this.errorState.hasError && this.errorState.error) {
      console.error('ErrorBoundary caught error:', this.errorState.error);
    }
  }

  getErrorMessage(): string {
    if (this.errorState.error?.message) {
      return this.errorState.error.message;
    }
    return this.fallbackMessage;
  }

  getErrorStack(): string {
    if (this.errorState.error?.stack) {
      return this.errorState.error.stack;
    }
    if (this.errorState.errorInfo) {
      return this.errorState.errorInfo;
    }
    return 'No error details available';
  }

  formatTimestamp(): string {
    if (this.errorState.timestamp) {
      return this.errorState.timestamp.toLocaleString();
    }
    return 'Unknown';
  }

  handleRetry(): void {
    if (this.onRetry) {
      this.onRetry();
    } else {
      // Default retry behavior - reset error state
      this.errorState = { hasError: false };
    }
  }

  handleReload(): void {
    window.location.reload();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
