import { Component, signal, computed, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { Menu } from '../../Menu/menu';

interface DisplayOption {
  label: string;
  value: string;
}

interface GlobalDisplaySettings {
  // Pasta Types
  pastaTypeShowImage: boolean;
  pastaTypeImageSize: string;
  pastaTypeShowDescription: boolean;
  pastaTypeFontSize: number; // Now in rem units (1-5)

  // Pasta Sauces
  pastaSauceShowImage: boolean;
  pastaSauceImageSize: string;
  pastaSauceShowDescription: boolean;
  pastaSauceFontSize: number; // Now in rem units (1-5)
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
export class PastaDisplayManagementComponent implements OnInit {
  // Input: current menu to load existing settings
  menu = input<Menu | null | undefined>();

  // Output: emit settings updates to parent component
  settingsUpdate = output<GlobalDisplaySettings>();

  // Image size options
  imageSizeOptions: DisplayOption[] = [
    { label: 'Piccole (32px)', value: 'size-small' },
    { label: 'Medie (48px)', value: 'size-medium' },
    { label: 'Grandi (64px)', value: 'size-large' }
  ];

  // Font size range (rem units)
  fontSizeMin = 1;
  fontSizeMax = 5;

  // Get font size label for display
  getFontSizeLabel(remValue: number): string {
    if (remValue <= 1) return `${remValue}rem (Molto Piccolo)`;
    if (remValue <= 1.25) return `${remValue}rem (Piccolo)`;
    if (remValue <= 1.5) return `${remValue}rem (Normale)`;
    if (remValue <= 2) return `${remValue}rem (Medio)`;
    if (remValue <= 2.5) return `${remValue}rem (Grande)`;
    if (remValue <= 3) return `${remValue}rem (Molto Grande)`;
    return `${remValue}rem (Enorme)`;
  }

  // Global display settings - unified for all pasta types and sauces
  displaySettings = signal<GlobalDisplaySettings>({
    pastaTypeShowImage: true,
    pastaTypeImageSize: 'size-medium',
    pastaTypeShowDescription: true,
    pastaTypeFontSize: 1.5, // 1.5rem (medium size)

    pastaSauceShowImage: true,
    pastaSauceImageSize: 'size-medium',
    pastaSauceShowDescription: true,
    pastaSauceFontSize: 1.5 // 1.5rem (medium size)
  });

  // Computed properties for styling
  pastaTypeImageSizeClass = computed(() => this.displaySettings().pastaTypeImageSize);
  pastaSauceImageSizeClass = computed(() => this.displaySettings().pastaSauceImageSize);

  pastaTypeFontSizeStyle = computed(() => ({
    fontSize: `${this.displaySettings().pastaTypeFontSize}%`
  }));

  pastaSauceFontSizeStyle = computed(() => ({
    fontSize: `${this.displaySettings().pastaSauceFontSize}%`
  }));

  // Internal properties for the template's ngModel binding
  get globalPastaFontSizeInternal(): string {
    const fontSize = this.displaySettings().pastaTypeFontSize;
    if (fontSize <= 75) return 'text-xs';
    if (fontSize <= 87.5) return 'text-sm';
    if (fontSize <= 100) return 'text-base';
    if (fontSize <= 112.5) return 'text-lg';
    if (fontSize <= 125) return 'text-xl';
    return 'text-2xl';
  }

  set globalPastaFontSizeInternal(value: string) {
    let fontSize: number;
    switch (value) {
      case 'text-xs': fontSize = 75; break;
      case 'text-sm': fontSize = 87.5; break;
      case 'text-base': fontSize = 100; break;
      case 'text-lg': fontSize = 112.5; break;
      case 'text-xl': fontSize = 125; break;
      case 'text-2xl': fontSize = 150; break;
      default: fontSize = 100;
    }
    this.updatePastaTypeSettings('pastaTypeFontSize', fontSize);
  }

  get globalSauceFontSizeInternal(): string {
    const fontSize = this.displaySettings().pastaSauceFontSize;
    if (fontSize <= 75) return 'text-xs';
    if (fontSize <= 87.5) return 'text-sm';
    if (fontSize <= 100) return 'text-base';
    if (fontSize <= 112.5) return 'text-lg';
    if (fontSize <= 125) return 'text-xl';
    return 'text-2xl';
  }

  set globalSauceFontSizeInternal(value: string) {
    let fontSize: number;
    switch (value) {
      case 'text-xs': fontSize = 75; break;
      case 'text-sm': fontSize = 87.5; break;
      case 'text-base': fontSize = 100; break;
      case 'text-lg': fontSize = 112.5; break;
      case 'text-xl': fontSize = 125; break;
      case 'text-2xl': fontSize = 150; break;
      default: fontSize = 100;
    }
    this.updatePastaSauceSettings('pastaSauceFontSize', fontSize);
  }

  ngOnInit() {
    // Load current settings from the menu if available
    const currentMenu = this.menu();
    if (currentMenu) {
      // Convert old percentage values to rem if needed
      const convertPercentageToRem = (percentage: number): number => {
        if (percentage >= 50 && percentage <= 200) {
          // It's likely a percentage value, convert to rem (100% = 1.5rem)
          return Math.max(1, Math.min(5, percentage / 100 * 1.5));
        }
        // It's already a rem value or reasonable range
        return Math.max(1, Math.min(5, percentage));
      };

      this.displaySettings.update(settings => ({
        ...settings,
        pastaTypeShowImage: currentMenu.globalPastaTypeShowImage ?? true,
        pastaTypeImageSize: currentMenu.globalPastaTypeImageSize ?? 'size-medium',
        pastaTypeShowDescription: currentMenu.globalPastaTypeShowDescription ?? true,
        pastaTypeFontSize: convertPercentageToRem(currentMenu.globalPastaTypeFontSize ?? 1.5),

        pastaSauceShowImage: currentMenu.globalPastaSauceShowImage ?? true,
        pastaSauceImageSize: currentMenu.globalPastaSauceImageSize ?? 'size-medium',
        pastaSauceShowDescription: currentMenu.globalPastaSauceShowDescription ?? true,
        pastaSauceFontSize: convertPercentageToRem(currentMenu.globalPastaSauceFontSize ?? 1.5)
      }));
    }
  }

  // Update pasta type settings
  updatePastaTypeSettings(key: keyof Pick<GlobalDisplaySettings, 'pastaTypeShowImage' | 'pastaTypeImageSize' | 'pastaTypeShowDescription' | 'pastaTypeFontSize'>, value: any) {
    this.displaySettings.update(settings => ({
      ...settings,
      [key]: value
    }));
    this.sendSettingsUpdate();
  }

  // Update pasta sauce settings
  updatePastaSauceSettings(key: keyof Pick<GlobalDisplaySettings, 'pastaSauceShowImage' | 'pastaSauceImageSize' | 'pastaSauceShowDescription' | 'pastaSauceFontSize'>, value: any) {
    this.displaySettings.update(settings => ({
      ...settings,
      [key]: value
    }));
    this.sendSettingsUpdate();
  }

  // Apply pasta type settings to pasta sauces
  applyPastaTypeToSauce() {
    const current = this.displaySettings();
    this.displaySettings.update(settings => ({
      ...settings,
      pastaSauceShowImage: current.pastaTypeShowImage,
      pastaSauceImageSize: current.pastaTypeImageSize,
      pastaSauceShowDescription: current.pastaTypeShowDescription,
      pastaSauceFontSize: current.pastaTypeFontSize
    }));
    this.sendSettingsUpdate();
  }

  // Apply pasta sauce settings to pasta types
  applySauceToPastaType() {
    const current = this.displaySettings();
    this.displaySettings.update(settings => ({
      ...settings,
      pastaTypeShowImage: current.pastaSauceShowImage,
      pastaTypeImageSize: current.pastaSauceImageSize,
      pastaTypeShowDescription: current.pastaSauceShowDescription,
      pastaTypeFontSize: current.pastaSauceFontSize
    }));
    this.sendSettingsUpdate();
  }

  // Reset all settings to defaults
  resetToDefaults() {
    const defaultSettings: GlobalDisplaySettings = {
      pastaTypeShowImage: true,
      pastaTypeImageSize: 'size-medium',
      pastaTypeShowDescription: true,
      pastaTypeFontSize: 1.5, // 1.5rem

      pastaSauceShowImage: true,
      pastaSauceImageSize: 'size-medium',
      pastaSauceShowDescription: true,
      pastaSauceFontSize: 1.5 // 1.5rem
    };

    this.displaySettings.set(defaultSettings);
    this.sendSettingsUpdate();
  }

  // Send settings update via Output signal to parent component
  private sendSettingsUpdate() {
    const settings = this.displaySettings();
    this.settingsUpdate.emit(settings);
    console.log('📡 Emitted global pasta display settings update:', settings);
  }

  // Get current settings (for external access)
  getCurrentSettings() {
    return this.displaySettings();
  }
}
