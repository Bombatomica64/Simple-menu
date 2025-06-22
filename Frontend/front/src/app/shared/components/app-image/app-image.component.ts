import { Component, input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.dynamic';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showImage()) {
      <img
        [src]="fullImageUrl()"
        [alt]="alt()"
        [title]="title() || alt()"
        [class]="cssClass()"
        [style]="style()"
        (error)="onImageError($event)"
        (load)="onImageLoad($event)"
      />
    }

    @if (showErrorPlaceholder()) {
      <div class="image-error-placeholder" [class]="cssClass()" [style]="style()">
        <i class="pi pi-image"></i>
        <span>Immagine non disponibile</span>
      </div>
    }
  `,
  styles: [`
    img {
      display: block;
    }

    .image-error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border: 2px dashed #ddd;
      color: #999;
      min-height: 100px;
    }

    .image-error-placeholder i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .image-error-placeholder span {
      font-size: 0.9rem;
    }
  `]
})
export class AppImageComponent {
  // Input properties
  src = input.required<string>(); // Relative or absolute image path
  alt = input<string>('Image');
  title = input<string>('');
  cssClass = input<string>('');
  style = input<string>('');

  // Internal state
  private imageError = signal(false);

  // Computed properties
  fullImageUrl = computed(() => {
    const imageSrc = this.src();
    if (!imageSrc) return '';

    // If it's already a full URL (starts with http/https), return as is
    if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) {
      return imageSrc;
    }

    // If it starts with /assets, it's a relative path from the server
    if (imageSrc.startsWith('/assets')) {
      return `${environment.apiUrl}${imageSrc}`;
    }

    // If it doesn't start with /, add it
    const normalizedSrc = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
    return `${environment.apiUrl}${normalizedSrc}`;
  });

  showErrorPlaceholder = computed(() => this.imageError() && !!this.src());
  showImage = computed(() => !this.imageError() && !!this.src());

  onImageError(event: Event) {
    console.warn('Image failed to load:', this.fullImageUrl());
    this.imageError.set(true);
  }

  onImageLoad(event: Event) {
    this.imageError.set(false);
  }
}
