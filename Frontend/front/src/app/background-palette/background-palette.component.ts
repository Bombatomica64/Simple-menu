import {
	Component,
	input,
	output,
	signal,
	computed,
	inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TabViewModule } from 'primeng/tabview';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { MenuConnection } from '../webSocketResource';
import { environment } from '../../environments/environment.dynamic';

export type BackgroundType = 'color' | 'gradient' | 'image';

export interface BackgroundConfig {
	id?: number;
	type: BackgroundType;
	value: string; // color hex, gradient CSS, or image URL
	createdAt?: string;
	updatedAt?: string;
}

// Predefined gradient options
const GRADIENT_PRESETS = [
	{
		name: 'Sunset',
		value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	},
	{
		name: 'Ocean',
		value:
			'linear-gradient(135deg, #667db6 0%, #0082c8 0%, #0082c8 0%, #667db6 100%)',
	},
	{ name: 'Warm', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
	{ name: 'Cool', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
	{
		name: 'Forest',
		value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
	},
	{ name: 'Night', value: 'linear-gradient(135deg, #434343 0%, black 100%)' },
];

@Component({
	selector: 'app-background-palette',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		DialogModule,
		ToastModule,
		FileUploadModule,
		TabViewModule,
		SelectModule,
	],
	templateUrl: './background-palette.component.html',
	styleUrls: ['./background-palette.component.scss'],
	providers: [MessageService],
})
export class BackgroundPaletteComponent {
	// Angular 19+ input signals
	menuConnection = input<MenuConnection | null>(null);
	// Output signals for events
	backgroundConfigUpdated = output<BackgroundConfig>();
	backgroundConfigDeleted = output<void>(); // No longer need page name since there's only one

	private http = inject(HttpClient);
	private messageService = inject(MessageService);
	private apiUrl = environment.apiUrl;

	// Signals
	loading = signal(false);
	uploading = signal(false);
	showConfigDialog = signal(false);
	activeTabIndex = signal(0);

	// Current configurations
	backgroundConfigs = signal<BackgroundConfig[]>([]);
	// Dialog state - removed page selection since we only target pasta page
	selectedType = signal<BackgroundType>('color');
	selectedColor = signal('#ffffff');
	selectedGradient = signal(GRADIENT_PRESETS[2].value); // Default to warm
	selectedImageFile = signal<File | null>(null);
	selectedImageUrl = signal<string>('');

	// Available options
	gradientPresets = GRADIENT_PRESETS;

	// Computed properties
	currentBackgroundValue = computed(() => {
		const type = this.selectedType();
		switch (type) {
			case 'color':
				return this.selectedColor();
			case 'gradient':
				return this.selectedGradient();
			case 'image':
				return this.selectedImageUrl()
					? `url('${this.selectedImageUrl()}')`
					: '';
			default:
				return '';
		}
	});

	previewStyle = computed(() => {
		const value = this.currentBackgroundValue();
		if (!value) return {};

		if (this.selectedType() === 'image') {
			return {
				background: value,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			};
		} else {
			return { background: value };
		}
	});

	// Methods
	async ngOnInit() {
		await this.loadBackgroundConfigs();
	}
	// Public method to open dialog from external components
	openBackgroundDialog() {
		this.resetDialogState();
		this.showConfigDialog.set(true);
	}

	async loadBackgroundConfigs() {
		this.loading.set(true);
		try {
			const response = await this.http
				.get<BackgroundConfig[]>(`${this.apiUrl}/api/backgrounds`)
				.toPromise();
			this.backgroundConfigs.set(response || []);
		} catch (error) {
			console.error('Error loading background configs:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Errore',
				detail: 'Errore nel caricamento delle configurazioni sfondo',
			});
		} finally {
			this.loading.set(false);
		}
	}

	openConfigDialog() {
		this.resetDialogState();
		this.showConfigDialog.set(true);
	}

	closeDialog() {
		this.showConfigDialog.set(false);
		this.resetDialogState();
	}
	resetDialogState() {
		this.selectedType.set('color');
		this.selectedColor.set('#ffffff');
		this.selectedGradient.set(GRADIENT_PRESETS[2].value);
		this.selectedImageFile.set(null);
		this.selectedImageUrl.set('');
	}

	onTypeChange(type: BackgroundType) {
		this.selectedType.set(type);
	}

	onColorChange(event: Event) {
		const input = event.target as HTMLInputElement;
		this.selectedColor.set(input.value);
	}

	onGradientChange(gradientValue: string) {
		this.selectedGradient.set(gradientValue);
	}

	onImageUpload(event: any) {
		const file = event.files[0];
		if (!file) return;

		this.uploading.set(true);
		this.selectedImageFile.set(file);

		const formData = new FormData();
		formData.append('backgroundImage', file);

		this.http
			.post<any>(`${this.apiUrl}/api/backgrounds/upload`, formData)
			.subscribe({
				next: (response) => {
					console.log('Background image uploaded:', response);
					this.selectedImageUrl.set(response.imageUrl);
					this.uploading.set(false);

					this.messageService.add({
						severity: 'success',
						summary: 'Successo',
						detail: 'Immagine caricata con successo',
					});
				},
				error: (error) => {
					console.error('Error uploading image:', error);
					this.uploading.set(false);
					this.messageService.add({
						severity: 'error',
						summary: 'Errore',
						detail: "Errore nel caricamento dell'immagine",
					});
				},
			});
	}
	async saveBackgroundConfig() {
		const value = this.currentBackgroundValue();

		if (!value) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Attenzione',
				detail: 'Configura uno sfondo prima di salvare',
			});
			return;
		}

		this.loading.set(true);
		try {
			const config: BackgroundConfig = {
				type: this.selectedType(),
				value,
			};
			const response = await this.http
				.post<BackgroundConfig>(`${this.apiUrl}/api/backgrounds`, config)
				.toPromise();

			// Create the complete config object for emission
			const completeConfig: BackgroundConfig = {
				...response!,
				type: this.selectedType(),
				value: value,
			};

			// Update local state (since there's only one config, replace the entire array)
			this.backgroundConfigs.set([completeConfig]);

			console.log('Emitting simplified background config:', completeConfig);
			this.backgroundConfigUpdated.emit(completeConfig);
			this.closeDialog();
			this.messageService.add({
				severity: 'success',
				summary: 'Successo',
				detail: `Sfondo configurato`,
			});
		} catch (error) {
			console.error('Error saving background config:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Errore',
				detail: 'Errore nel salvataggio della configurazione',
			});
		} finally {
			this.loading.set(false);
		}
	}
	async deleteBackgroundConfig() {
		if (
			!confirm(`Sei sicuro di voler eliminare la configurazione dello sfondo?`)
		) {
			return;
		}

		this.loading.set(true);
		try {
			await this.http.delete(`${this.apiUrl}/api/backgrounds`).toPromise();

			// Update local state (clear all configs since there's only one)
			this.backgroundConfigs.set([]);

			this.backgroundConfigDeleted.emit();

			this.messageService.add({
				severity: 'success',
				summary: 'Successo',
				detail: `Configurazione sfondo eliminata`,
			});
		} catch (error) {
			console.error('Error deleting background config:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Errore',
				detail: "Errore nell'eliminazione della configurazione",
			});
		} finally {
			this.loading.set(false);
		}
	}

	getBackgroundPreviewStyle(config: BackgroundConfig) {
		if (config.type === 'image') {
			return {
				background: config.value,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			};
		} else {
			return { background: config.value };
		}
	}

	getTypeLabel(type: BackgroundType): string {
		switch (type) {
			case 'color':
				return 'Colore';
			case 'gradient':
				return 'Gradiente';
			case 'image':
				return 'Immagine';
			default:
				return type;
		}
	}
}
