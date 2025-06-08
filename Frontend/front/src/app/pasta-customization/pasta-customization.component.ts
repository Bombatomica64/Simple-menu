import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';

export interface PastaCustomization {
  showImages: boolean;
  showDescriptions: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

@Component({
  selector: 'app-pasta-customization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OverlayPanelModule,
    ToggleButtonModule,
    SelectButtonModule,
    ButtonModule
  ],
  templateUrl: './pasta-customization.component.html',
  styleUrls: ['./pasta-customization.component.scss']
})
export class PastaCustomizationComponent {
  // Input signal for current customization settings
  customization = input<PastaCustomization>({
    showImages: true,
    showDescriptions: true,
    fontSize: 'medium'
  });

  // Output signal for when customization changes
  customizationChange = output<PastaCustomization>();

  // Internal signals for the UI
  showImages = signal(true);
  showDescriptions = signal(true);
  fontSize = signal<'small' | 'medium' | 'large'>('medium');

  // Font size options for UI
  fontSizeOptions = [
    { label: 'S', value: 'small' },
    { label: 'M', value: 'medium' },
    { label: 'L', value: 'large' }
  ];

  constructor() {
    // Sync input with internal signals
    effect(() => {
      const customizationValue = this.customization();
      this.showImages.set(customizationValue.showImages);
      this.showDescriptions.set(customizationValue.showDescriptions);
      this.fontSize.set(customizationValue.fontSize);
    });

    // Emit changes when internal signals change
    effect(() => {
      const newCustomization: PastaCustomization = {
        showImages: this.showImages(),
        showDescriptions: this.showDescriptions(),
        fontSize: this.fontSize()
      };
      this.customizationChange.emit(newCustomization);
    });
  }

  // Methods to update settings
  toggleImages() {
    this.showImages.update(current => !current);
  }

  toggleDescriptions() {
    this.showDescriptions.update(current => !current);
  }

  setFontSize(size: 'small' | 'medium' | 'large') {
    this.fontSize.set(size);
  }

  resetToDefaults() {
    this.showImages.set(true);
    this.showDescriptions.set(true);
    this.fontSize.set('medium');
  }
}
