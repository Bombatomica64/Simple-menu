import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';

interface DisplayOption {
  label: string;
  value: string;
}

interface DisplaySettings {
  showImages: boolean;
  imageSize: string;
  showDescriptions: boolean;
  fontSize: number;
}

@Component({
  selector: 'app-pasta-display-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ToggleSwitchModule,
    SelectModule,
    SliderModule,
    TabViewModule,
    ButtonModule
  ],
  templateUrl: './pasta-display-management.component.html',
  styleUrls: ['./pasta-display-management.component.scss']
})
export class PastaDisplayManagementComponent {
  // Image size options
  imageSizeOptions: DisplayOption[] = [
    { label: 'Piccole (32px)', value: 'size-small' },
    { label: 'Medie (48px)', value: 'size-medium' },
    { label: 'Grandi (64px)', value: 'size-large' }
  ];

  // Font size range (percentage)
  fontSizeMin = 75;
  fontSizeMax = 150;

  // Pasta types display settings
  pastaTypesSettings = signal<DisplaySettings>({
    showImages: true,
    imageSize: 'size-medium',
    showDescriptions: true,
    fontSize: 100
  });

  // Pasta sauces display settings
  pastaSaucesSettings = signal<DisplaySettings>({
    showImages: true,
    imageSize: 'size-medium',
    showDescriptions: true,
    fontSize: 100
  });

  // Computed properties for current settings
  pastaTypeImageSizeClass = computed(() => this.pastaTypesSettings().imageSize);
  pastaSauceImageSizeClass = computed(() => this.pastaSaucesSettings().imageSize);

  pastaTypeFontSizeStyle = computed(() => ({
    fontSize: `${this.pastaTypesSettings().fontSize}%`
  }));

  pastaSauceFontSizeStyle = computed(() => ({
    fontSize: `${this.pastaSaucesSettings().fontSize}%`
  }));

  // Methods to update settings
  updatePastaTypeSettings(key: keyof DisplaySettings, value: any) {
    this.pastaTypesSettings.update(settings => ({
      ...settings,
      [key]: value
    }));
  }

  updatePastaSauceSettings(key: keyof DisplaySettings, value: any) {
    this.pastaSaucesSettings.update(settings => ({
      ...settings,
      [key]: value
    }));
  }

  // Apply all settings to both pasta types and sauces
  applyToAll(sourceSettings: DisplaySettings) {
    this.pastaTypesSettings.set({ ...sourceSettings });
    this.pastaSaucesSettings.set({ ...sourceSettings });
  }

  // Reset all settings to defaults
  resetToDefaults() {
    const defaultSettings: DisplaySettings = {
      showImages: true,
      imageSize: 'size-medium',
      showDescriptions: true,
      fontSize: 100
    };

    this.pastaTypesSettings.set({ ...defaultSettings });
    this.pastaSaucesSettings.set({ ...defaultSettings });
  }

  // Get display settings for external components
  getPastaTypeSettings() {
    return this.pastaTypesSettings();
  }

  getPastaSauceSettings() {
    return this.pastaSaucesSettings();
  }
}
