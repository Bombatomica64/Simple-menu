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
  pastaTypeFontSize: number;

  // Pasta Sauces
  pastaSauceShowImage: boolean;
  pastaSauceImageSize: string;
  pastaSauceShowDescription: boolean;
  pastaSauceFontSize: number;
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

  // Font size range (percentage)
  fontSizeMin = 75;
  fontSizeMax = 150;

  // Global display settings - unified for all pasta types and sauces
  displaySettings = signal<GlobalDisplaySettings>({
    pastaTypeShowImage: true,
    pastaTypeImageSize: 'size-medium',
    pastaTypeShowDescription: true,
    pastaTypeFontSize: 100,

    pastaSauceShowImage: true,
    pastaSauceImageSize: 'size-medium',
    pastaSauceShowDescription: true,
    pastaSauceFontSize: 100
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

  ngOnInit() {
    // Load current settings from the menu if available
    const currentMenu = this.menu();
    if (currentMenu) {
      this.displaySettings.update(settings => ({
        ...settings,
        pastaTypeShowImage: currentMenu.globalPastaTypeShowImage ?? true,
        pastaTypeImageSize: currentMenu.globalPastaTypeImageSize ?? 'size-medium',
        pastaTypeShowDescription: currentMenu.globalPastaTypeShowDescription ?? true,
        pastaTypeFontSize: currentMenu.globalPastaTypeFontSize ?? 100,

        pastaSauceShowImage: currentMenu.globalPastaSauceShowImage ?? true,
        pastaSauceImageSize: currentMenu.globalPastaSauceImageSize ?? 'size-medium',
        pastaSauceShowDescription: currentMenu.globalPastaSauceShowDescription ?? true,
        pastaSauceFontSize: currentMenu.globalPastaSauceFontSize ?? 100
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
      pastaTypeFontSize: 100,

      pastaSauceShowImage: true,
      pastaSauceImageSize: 'size-medium',
      pastaSauceShowDescription: true,
      pastaSauceFontSize: 100
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
