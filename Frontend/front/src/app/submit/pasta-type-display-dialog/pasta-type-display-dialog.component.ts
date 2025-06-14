import { Component, Input, Output, EventEmitter, signal, OnInit, inject, effect } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.dynamic';
import {
  MenuConnection,
  GetPastaTypeDisplaySettingsMessage,
  UpdatePastaTypeDisplaySettingsMessage
} from '../../webSocketResource';

interface PastaTypeDisplaySettings {
  showImage: boolean;
  imageSize: string;
  showDescription: boolean;
  customDescription?: string;
  customFontColor?: string;
  customBgColor?: string;
}

interface PastaType {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
}

@Component({
  selector: 'app-pasta-type-display-dialog',
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
  templateUrl: './pasta-type-display-dialog.component.html',
  styleUrls: ['./pasta-type-display-dialog.component.scss']
})
export class PastaTypeDisplayDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() pastaType: PastaType | null = null;
  @Input() menuConnection: MenuConnection | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() settingsChange = new EventEmitter<PastaTypeDisplaySettings>();

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Form signals
  settings = signal<PastaTypeDisplaySettings>({
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
    // Set up effect to handle WebSocket responses
    effect(() => {
      const response = this.menuConnection?.responseMessages();
      if (!response) return;

      if (response.type === 'pastaTypeDisplaySettings') {
        this.settings.set(response.settings);
        this.loading.set(false);
      }
    });
  }

  ngOnInit() {
    if (this.visible && this.pastaType) {
      this.loadSettings();
    }
  }

  loadSettings() {
    if (!this.pastaType || !this.menuConnection) return;

    this.loading.set(true);
    const message: GetPastaTypeDisplaySettingsMessage = {
      type: 'getPastaTypeDisplaySettings',
      pastaTypeId: this.pastaType.id
    };
    this.menuConnection.sendUpdate(message);
  }

  saveSettings() {
    if (!this.pastaType || !this.menuConnection) return;

    this.saving.set(true);
    const message: UpdatePastaTypeDisplaySettingsMessage = {
      type: 'updatePastaTypeDisplaySettings',
      pastaTypeId: this.pastaType.id,
      settings: this.settings()
    };
    this.menuConnection.sendUpdate(message);

    // Emit settings change and close dialog
    this.settingsChange.emit(this.settings());
    this.saving.set(false);
    this.closeDialog();
  }

  updateSetting(key: keyof PastaTypeDisplaySettings, value: any) {
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
    return this.settings().customDescription || this.pastaType?.description || '';
  }
}
