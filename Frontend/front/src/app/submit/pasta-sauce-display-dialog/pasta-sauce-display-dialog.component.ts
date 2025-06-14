import { Component, Input, Output, EventEmitter, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TextareaModule } from 'primeng/textarea';
import {
  MenuConnection,
  PastaSauceDisplaySettings,
  UpdatePastaSauceDisplaySettingsMessage,
  GetPastaSauceDisplaySettingsMessage,
  PastaSauceDisplaySettingsResponse,
  MenuResponseMessage
} from '../../webSocketResource';

interface PastaSauce {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
}

@Component({
  selector: 'app-pasta-sauce-display-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    ToggleSwitchModule,
    SelectModule,
    SliderModule,
    InputTextModule,
    ColorPickerModule,
    TextareaModule
  ],
  templateUrl: './pasta-sauce-display-dialog.component.html',
  styleUrls: ['./pasta-sauce-display-dialog.component.scss']
})
export class PastaSauceDisplayDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() pastaSauce: PastaSauce | null = null;
  @Input() menuConnection: MenuConnection | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() settingsChange = new EventEmitter<PastaSauceDisplaySettings>();

  // Form signals
  settings = signal<PastaSauceDisplaySettings>({
    showImage: true,
    imageSize: 'size-medium',
    showDescription: true,
    customDescription: '',
    customFontColor: '',
    customBgColor: ''
  });

  loading = signal(false);
  saving = signal(false);

  // Options
  imageSizeOptions = [
    { label: 'Piccole (32px)', value: 'size-small' },
    { label: 'Medie (48px)', value: 'size-medium' },
    { label: 'Grandi (64px)', value: 'size-large' }
  ];

  constructor() {
    // Watch for WebSocket response messages
    effect(() => {
      const response = this.menuConnection?.responseMessages();
      if (response) {
        this.handleResponseMessage(response);
      }
    });
  }

  ngOnInit() {
    if (this.visible && this.pastaSauce) {
      this.loadSettings();
    }
  }

  loadSettings() {
    if (!this.pastaSauce || !this.menuConnection) return;

    this.loading.set(true);

    // Send WebSocket message to get display settings
    const message: GetPastaSauceDisplaySettingsMessage = {
      type: 'getPastaSauceDisplaySettings',
      pastaSauceId: this.pastaSauce.id
    };

    this.menuConnection.sendUpdate(message);
  }

  saveSettings() {
    if (!this.pastaSauce || !this.menuConnection) return;

    this.saving.set(true);

    // Send WebSocket message to update display settings
    const message: UpdatePastaSauceDisplaySettingsMessage = {
      type: 'updatePastaSauceDisplaySettings',
      pastaSauceId: this.pastaSauce.id,
      settings: this.settings()
    };

    this.menuConnection.sendUpdate(message);
  }

  updateSetting(key: keyof PastaSauceDisplaySettings, value: any) {
    this.settings.update(current => ({
      ...current,
      [key]: value
    }));
  }

  resetToDefaults() {
    this.settings.set({
      showImage: true,
      imageSize: 'size-medium',
      showDescription: true,
      customDescription: '',
      customFontColor: '',
      customBgColor: ''
    });
  }

  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private handleResponseMessage(response: MenuResponseMessage) {
    // Only handle responses for our current pasta sauce
    if (response.type === 'pastaSauceDisplaySettings' &&
        response.pastaSauceId === this.pastaSauce?.id) {
      this.settings.set(response.settings);

      if (this.loading()) {
        this.loading.set(false);
      }

      if (this.saving()) {
        this.settingsChange.emit(response.settings);
        this.closeDialog();
        this.saving.set(false);
      }
    } else if (response.type === 'error') {
      console.error('Error with pasta sauce display settings:', response.message);
      this.loading.set(false);
      this.saving.set(false);
    }
  }

  get previewImageSizeClass(): string {
    return `pasta-sauce-image preview-image ${this.settings().imageSize}`;
  }

  get previewTextStyle(): any {
    const style: any = {};

    if (this.settings().customFontColor) {
      style.color = this.settings().customFontColor;
    }

    if (this.settings().customBgColor) {
      style.backgroundColor = this.settings().customBgColor;
      style.padding = '0.5rem';
      style.borderRadius = '4px';
    }

    return style;
  }

  get displayDescription(): string {
    return this.settings().customDescription || this.pastaSauce?.description || '';
  }
}
