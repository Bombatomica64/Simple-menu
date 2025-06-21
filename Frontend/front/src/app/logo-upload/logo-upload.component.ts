import {
	Component,
	input,
	output,
	signal,
	computed,
	inject,
	effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../environments/environment.dynamic';
import { MenuConnection } from '../webSocketResource';
import { LogoOperations } from '../services/menu-components.service';
import { Logo } from '../Menu/menu';

interface UploadResponse {
	success: boolean;
	logo?: Logo;
	logoUrl?: string;
	filename?: string;
	message: string;
}

@Component({
	selector: 'app-logo-upload',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		FileUploadModule,
		DialogModule,
		SelectModule,
		CardModule,
		ToastModule,
	],
	providers: [MessageService],
	template: `
		<p-toast></p-toast>

		<div class="logo-upload-container">
			<div class="header">
				<h3>
					<i class="pi pi-image mr-2"></i>
					Gestione Logo
				</h3>
				<p-button
					label="Carica Nuovo Logo"
					icon="pi pi-upload"
					(click)="showUploadDialog.set(true)"
					class="p-button-outlined"
				>
				</p-button>
			</div>

			<!-- Current Logo Display -->
			@if (currentLogo()) {
			<div class="current-logo-section">
				<h4>Logo Attuale</h4>
				<div class="logo-preview-card">
					<img
						[src]="getFullImageUrl(currentLogo()!.imageUrl)"
						[alt]="currentLogo()!.name"
						class="logo-preview"
						[class]="'logo-' + currentLogo()!.size"
					/>
					<div class="logo-info">
						<p><strong>Nome:</strong> {{ currentLogo()!.name }}</p>
						<p>
							<strong>Posizione:</strong>
							{{ getPositionLabel(currentLogo()!.position) }}
						</p>
						<p>
							<strong>Dimensione:</strong>
							{{ getSizeLabel(currentLogo()!.size) }}
						</p>
						<div class="logo-actions">
							<p-button
								label="Modifica Impostazioni"
								icon="pi pi-cog"
								class="p-button-sm p-button-outlined"
								(click)="openSettingsDialog()"
							>
							</p-button>
							<p-button
								label="Rimuovi Logo"
								icon="pi pi-trash"
								class="p-button-sm p-button-danger p-button-outlined"
								(click)="removeLogo()"
							>
							</p-button>
						</div>
					</div>
				</div>
			</div>
			} @else {
			<div class="no-logo-section">
				<div class="empty-state">
					<i class="pi pi-image empty-icon"></i>
					<p>Nessun logo configurato</p>
					<p class="text-muted">
						Carica un logo per personalizzare il tuo menu
					</p>
				</div>
			</div>
			}

			<!-- Available Logos -->
			@if (availableLogos().length > 0) {
			<div class="available-logos-section">
				<h4>Loghi Disponibili</h4>
				<div class="logos-grid">
					@for (logo of availableLogos(); track logo.id) {
					<div class="logo-card" [class.active]="logo.id === currentLogo()?.id">
						<img
							[src]="getFullImageUrl(logo.imageUrl)"
							[alt]="logo.name"
							class="logo-thumbnail"
						/>
						<div class="logo-card-content">
							<p class="logo-name">{{ logo.name }}</p>
							<div class="logo-card-actions">
								@if (logo.id !== currentLogo()?.id) {
								<p-button
									label="Usa"
									icon="pi pi-check"
									class="p-button-sm"
									(click)="setActiveLogo(logo)"
								>
								</p-button>
								} @else {
								<span class="active-badge">
									<i class="pi pi-check-circle"></i> Attivo
								</span>
								}
								<p-button
									icon="pi pi-trash"
									class="p-button-sm p-button-danger p-button-text"
									(click)="deleteLogo(logo)"
								>
								</p-button>
							</div>
						</div>
					</div>
					}
				</div>
			</div>
			}
		</div>

		<!-- Upload Dialog -->
		<p-dialog
			header="Carica Nuovo Logo"
			[(visible)]="showUploadDialog"
			[modal]="true"
			[closable]="true"
			[style]="{ width: '500px' }"
			class="upload-dialog"
		>
			<div class="upload-content">
				<p-fileUpload
					name="logo"
					[url]="uploadUrl()"
					accept="image/*"
					[maxFileSize]="5000000"
					[auto]="false"
					[showUploadButton]="false"
					[showCancelButton]="false"
					(onSelect)="onFileSelect($event)"
					(onUpload)="onUploadComplete($event)"
					(onError)="onUploadError($event)"
					#fileUpload
				>
					<ng-template pTemplate="content">
						<div class="upload-area">
							@if (!selectedFile()) {
							<div class="upload-placeholder">
								<i class="pi pi-cloud-upload upload-icon"></i>
								<p>Clicca per selezionare un'immagine</p>
								<p class="text-muted">
									Supportati: JPG, PNG, SVG, WebP (max 5MB)
								</p>
							</div>
							} @else {
							<div class="file-preview">
								<img
									[src]="filePreviewUrl()"
									alt="Preview"
									class="preview-image"
								/>
								<p>{{ selectedFile()!.name }}</p>
								<p class="text-muted">
									{{ formatFileSize(selectedFile()!.size) }}
								</p>
							</div>
							}
						</div>
					</ng-template>
				</p-fileUpload>

				<div class="logo-settings-form">
					<div class="form-group">
						<label for="logoName">Nome Logo:</label>
						<input
							id="logoName"
							type="text"
							pInputText
							[(ngModel)]="newLogoName"
							placeholder="Es: Logo Ristorante"
							class="w-full"
						/>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="logoPosition">Posizione:</label>
							<p-select
								id="logoPosition"
								[(ngModel)]="newLogoPosition"
								[options]="positionOptions"
								placeholder="Seleziona posizione"
								class="w-full"
							>
							</p-select>
						</div>

						<div class="form-group">
							<label for="logoSize">Dimensione:</label>
							<p-select
								id="logoSize"
								[(ngModel)]="newLogoSize"
								[options]="sizeOptions"
								placeholder="Seleziona dimensione"
								class="w-full"
							>
							</p-select>
						</div>
					</div>
				</div>
			</div>

			<ng-template pTemplate="footer">
				<div class="dialog-footer">
					<p-button
						label="Annulla"
						icon="pi pi-times"
						class="p-button-text"
						(click)="cancelUpload()"
					>
					</p-button>
					<p-button
						label="Carica e Usa"
						icon="pi pi-upload"
						[disabled]="
							!selectedFile() || !newLogoName().trim() || isUploading()
						"
						[loading]="isUploading()"
						(click)="uploadLogo()"
					>
					</p-button>
				</div>
			</ng-template>
		</p-dialog>

		<!-- Settings Dialog -->
		<p-dialog
			header="Impostazioni Logo"
			[(visible)]="showSettingsDialog"
			[modal]="true"
			[closable]="true"
			[style]="{ width: '400px' }"
		>
			<div class="settings-preview">
				<h5>Anteprima:</h5>
				@if (currentLogo()) {
				<img
					[src]="getFullImageUrl(currentLogo()!.imageUrl)"
					[alt]="currentLogo()!.name"
					class="settings-preview-image"
					[class]="'logo-' + settingsSize()"
				/>
				}
			</div>

			<ng-template pTemplate="footer">
				<div class="dialog-footer">
					<p-button
						label="Annulla"
						icon="pi pi-times"
						class="p-button-text"
						(click)="cancelSettings()"
					>
					</p-button>
					<p-button label="Salva" icon="pi pi-check" (click)="saveSettings()">
					</p-button>
				</div>
			</ng-template>
		</p-dialog>
	`,
	styleUrls: ['./logo-upload.component.scss'],
})
export class LogoUploadComponent {
	// Angular 19+ input signals
	menuConnection = input<MenuConnection | null>(null);
	logoOperations = input<LogoOperations | null>(null);

	// Output signals for events
	logoUploadRequested = output<{
		file: File;
		name: string;
		position: string;
		size: string;
	}>();
	logoActivationRequested = output<{ logoId: number }>();
	logoDeletionRequested = output<{ logoId: number }>();
	logoSettingsUpdateRequested = output<{
		logoId: number;
		position: string;
		size: string;
		opacity: number;
	}>();

	private http = inject(HttpClient);
	private messageService = inject(MessageService);

	// State signals
	currentLogo = signal<Logo | null>(null);
	availableLogos = signal<Logo[]>([]);
	showUploadDialog = signal(false);
	showSettingsDialog = signal(false);
	selectedFile = signal<File | null>(null);
	filePreviewUrl = signal<string>('');
	isUploading = signal(false);

	// Form signals
	newLogoName = signal('');
	newLogoPosition = signal('top-left');
	newLogoSize = signal('medium');
	settingsPosition = signal('top-left');
	settingsSize = signal('medium');

	// Computed values
	uploadUrl = computed(() => `${environment.apiUrl}/api/logos/upload`);

	// Options
	positionOptions = [
		{ label: 'In alto a sinistra', value: 'top-left' },
		{ label: 'In alto al centro', value: 'top-center' },
		{ label: 'In alto a destra', value: 'top-right' },
	];

	sizeOptions = [
		{ label: 'Piccolo', value: 'small' },
		{ label: 'Medio', value: 'medium' },
		{ label: 'Grande', value: 'large' },
	];

	constructor() {
		// Listen for WebSocket responses
		effect(() => {
			const connection = this.menuConnection();
			if (connection) {
				const lastMessage = connection.responseMessages();
				if (lastMessage) {
					this.handleWebSocketResponse(lastMessage);
				}
			}
		});

		// Listen for menu updates to get logo information
		effect(() => {
			const connection = this.menuConnection();
			if (connection) {
				const menu = connection.resource.value();
				if (menu?.logo) {
					this.currentLogo.set(menu.logo);
				} else {
					this.currentLogo.set(null);
				}
			}
		});

		// Request available logos when component initializes
		this.requestAvailableLogos();
	}

	private loadLogos() {
		// Load current active logo
		this.http.get<Logo>(`${environment.apiUrl}/api/logos/current`).subscribe({
			next: (logo) => this.currentLogo.set(logo),
			error: (err) => console.log('No current logo set'),
		});

		// Load all available logos
		this.http
			.get<{ success: boolean; logos: Logo[] }>(
				`${environment.apiUrl}/api/logos/list`
			)
			.subscribe({
				next: (response) => {
					if (response.success) {
						this.availableLogos.set(response.logos);
					}
				},
				error: (err) => console.error('Failed to load logos:', err),
			});
	}

	onFileSelect(event: any) {
		const file = event.files[0];
		if (file) {
			this.selectedFile.set(file);

			// Create preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				this.filePreviewUrl.set(e.target?.result as string);
			};
			reader.readAsDataURL(file);

			// Auto-generate name from filename
			const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
			this.newLogoName.set(nameWithoutExt);
		}
	}

	uploadLogo() {
		const file = this.selectedFile();
		if (!file || !this.newLogoName().trim()) return;

		this.isUploading.set(true);
		const formData = new FormData();
		formData.append('logo', file);
		formData.append('name', this.newLogoName());
		formData.append('position', this.newLogoPosition());
		formData.append('size', this.newLogoSize());

		this.http.post<UploadResponse>(this.uploadUrl(), formData).subscribe({
			next: (response) => {
				if (response.success && response.logo) {
					// Add to available logos
					const currentLogos = this.availableLogos();
					this.availableLogos.set([response.logo, ...currentLogos]);

					// Automatically activate the uploaded logo via WebSocket
					const operations = this.logoOperations();
					if (operations) {
						operations.activateLogo(response.logo.id);
					}

					this.showUploadDialog.set(false);
					this.resetUploadForm();
					this.messageService.add({
						severity: 'success',
						summary: 'Successo',
						detail: 'Logo caricato e attivato con successo',
					});
				}
				this.isUploading.set(false);
			},
			error: (err) => {
				console.error('Upload failed:', err);
				this.isUploading.set(false);
				this.messageService.add({
					severity: 'error',
					summary: 'Errore',
					detail: 'Errore nel caricamento del logo',
				});
			},
		});
	}

	setActiveLogo(logo: Logo) {
		const operations = this.logoOperations();
		if (operations) {
			operations.activateLogo(logo.id);
			this.messageService.add({
				severity: 'success',
				summary: 'Successo',
				detail: 'Logo attivato con successo',
			});
		}
	}

	deleteLogo(logo: Logo) {
		if (confirm(`Sei sicuro di voler eliminare il logo "${logo.name}"?`)) {
			// Logo deletion is still done via REST API for file cleanup
			this.http.delete(`${environment.apiUrl}/api/logos/${logo.id}`).subscribe({
				next: () => {
					// Removal from UI will be handled by WebSocket response
					this.messageService.add({
						severity: 'success',
						summary: 'Successo',
						detail: 'Logo eliminato con successo',
					});
				},
				error: (err) => {
					console.error('Failed to delete logo:', err);
					this.messageService.add({
						severity: 'error',
						summary: 'Errore',
						detail: "Errore nell'eliminazione del logo",
					});
				},
			});
		}
	}

	removeLogo() {
		if (confirm('Sei sicuro di voler rimuovere il logo attuale?')) {
			const operations = this.logoOperations();
			if (operations) {
				const connection = this.menuConnection();
				if (connection) {
					connection.sendUpdate({ type: 'removeLogo' });
					this.messageService.add({
						severity: 'success',
						summary: 'Successo',
						detail: 'Logo rimosso con successo',
					});
				}
			}
		}
	}

	openSettingsDialog() {
		const current = this.currentLogo();
		if (current) {
			this.settingsPosition.set(current.position);
			this.settingsSize.set(current.size);
			this.showSettingsDialog.set(true);
		}
	}

	saveSettings() {
		const current = this.currentLogo();
		if (!current) return;

		const operations = this.logoOperations();
		if (operations) {
			operations.updateLogoSettings(
				current.id,
				this.settingsPosition(),
				this.settingsSize(),
				current.opacity // Keep current opacity
			);
			this.showSettingsDialog.set(false);
			this.messageService.add({
				severity: 'success',
				summary: 'Successo',
				detail: 'Impostazioni logo aggiornate',
			});
		}
	}

	cancelUpload() {
		this.showUploadDialog.set(false);
		this.resetUploadForm();
	}

	cancelSettings() {
		this.showSettingsDialog.set(false);
	}

	private resetUploadForm() {
		this.selectedFile.set(null);
		this.filePreviewUrl.set('');
		this.newLogoName.set('');
		this.newLogoPosition.set('top-left');
		this.newLogoSize.set('medium');
	}

	onUploadComplete(event: any) {
		console.log('Upload complete:', event);
	}

	onUploadError(event: any) {
		console.error('Upload error:', event);
		this.messageService.add({
			severity: 'error',
			summary: 'Errore',
			detail: 'Errore nel caricamento del file',
		});
	}

	getFullImageUrl(url: string | undefined): string {
		if (!url) return '';
		if (url.startsWith('http')) return url;
		return `${environment.apiUrl}${url}`;
	}

	getPositionLabel(position: string): string {
		const option = this.positionOptions.find((opt) => opt.value === position);
		return option?.label || position;
	}

	getSizeLabel(size: string): string {
		const option = this.sizeOptions.find((opt) => opt.value === size);
		return option?.label || size;
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	private handleWebSocketResponse(message: any) {
		switch (message.type) {
			case 'availableLogos':
				this.availableLogos.set(message.logos);
				break;
			case 'logoDeleted':
				// Remove deleted logo from available logos
				const currentLogos = this.availableLogos();
				this.availableLogos.set(
					currentLogos.filter((logo) => logo.id !== message.logoId)
				);

				// Clear current logo if it was deleted
				if (this.currentLogo()?.id === message.logoId) {
					this.currentLogo.set(null);
				}

				this.messageService.add({
					severity: 'success',
					summary: 'Successo',
					detail: 'Logo eliminato con successo',
				});
				break;
			case 'error':
				this.messageService.add({
					severity: 'error',
					summary: 'Errore',
					detail: message.message,
				});
				break;
		}
	}

	private requestAvailableLogos() {
		const operations = this.logoOperations();
		if (operations) {
			// Request via WebSocket through parent component
			const connection = this.menuConnection();
			if (connection) {
				connection.sendUpdate({ type: 'getAvailableLogos' });
			}
		}
	}
}
