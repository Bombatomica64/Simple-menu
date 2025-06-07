import { Component, input, output, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PickListModule } from 'primeng/picklist';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import	onMoveToTarget(event: any	openNewPastaTypeDialog() {
		this.resetForm();
		this.showNewDialog.set(true);
	}

	onMoveToTarget(event: any) {
		event.items.forEach((pastaType: PastaType) => {
			const message: AddPastaTypeMessage = {
				type: 'addPastaTypeToMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuConnection()?.sendUpdate(message);
		});
		this.emitSelectionChanged();
	}

	onMoveToSource(event: any) {
		event.items.forEach((pastaType: PastaType) => {
			const message: RemovePastaTypeMessage = {
				type: 'removePastaTypeFromMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuConnection()?.sendUpdate(message);
		});
		this.emitSelectionChanged();
	}

	onImageManage(pastaType: PastaType) {
		this.openImageManager.emit(pastaType);
	}

	private emitSelectionChanged() {
		this.pastaTypeSelectionChanged.emit({
			available: this.availablePastaTypes(),
			selected: this.selectedPastaTypes()
		});
	}rEach((pastaType: PastaType) => {
			const message: AddPastaTypeMessage = {
				type: 'addPastaTypeToMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuConnection()?.sendUpdate(message);
		});
		this.emitSelectionChanged();
	}

	onMoveToSource(event: any) {
		event.items.forEach((pastaType: PastaType) => {
			const message: RemovePastaTypeMessage = {
				type: 'removePastaTypeFromMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuConnection()?.sendUpdate(message);
		});
		this.emitSelectionChanged();
	}

	onImageManage(pastaType: PastaType) {
		this.openImageManager.emit(pastaType);
	}

	private emitSelectionChanged() {
		this.pastaTypeSelectionChanged.emit({
			available: this.availablePastaTypes(),
			selected: this.selectedPastaTypes()
		});
	}le } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { environment } from '../../../environments/environment.dynamic';
import {
	MenuConnection,
	AddPastaTypeMessage,
	RemovePastaTypeMessage
} from '../../webSocketResource';

export interface PastaType {
	id: string;
	name: string;
	description?: string;
	imageUrl?: string;
	basePrice?: number;
	priceNote?: string;
}

export interface PastaTypeEvent {
	type: 'add' | 'moveToTarget' | 'moveToSource' | 'imageManage';
	pastaType: PastaType;
}

@Component({
	selector: 'app-pasta-type-management',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		PickListModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		InputNumberModule,
		TextareaModule,
		FileUploadModule,
	],
	template: `
		<div class="pasta-type-management">
			<div class="section-header">
				<h3>
					<i class="pi pi-star mr-2"></i>
					Tipi di Pasta
				</h3>
				<button
					pButton
					type="button"
					label="Nuovo Tipo"
					icon="pi pi-plus"
					(click)="openNewPastaTypeDialog()"
					class="create-button"
					title="Crea un nuovo tipo di pasta"
				></button>
			</div>

			<div class="picklist-container">
				<p-pickList
					[source]="availablePastaTypes()"
					[target]="selectedPastaTypes()"
					sourceHeader="Tipi di Pasta Disponibili"
					targetHeader="Selezionati per il Menu"
					[dragdrop]="true"
					[responsive]="true"
					[sourceStyle]="{ height: '300px' }"
					[targetStyle]="{ height: '300px' }"
					filterBy="name"
					sourceFilterPlaceholder="Cerca per nome"
					targetFilterPlaceholder="Cerca per nome"
					(onMoveToTarget)="onMoveToTarget($event)"
					(onMoveToSource)="onMoveToSource($event)"
					[breakpoint]="'768px'"
				>
					<ng-template let-type pTemplate="item">
						<div class="pasta-type-item">
							<div class="type-image">
								@if (type.imageUrl) {
									<img
										class="type-thumbnail"
										[src]="type.imageUrl"
										[alt]="type.name + ' pasta type'"
										title="Pasta type image"
									/>
								} @else {
									<i
										class="pi pi-image placeholder-icon"
										title="Nessuna immagine disponibile"
									></i>
								}
							</div>

							<div class="type-info">
								<span class="type-name">{{ type.name }}</span>
								@if (type.description) {
									<small class="type-description">{{ type.description }}</small>
								}
								@if (type.basePrice) {
									<span class="type-price">€{{ type.basePrice | number:'1.2-2' }}</span>
								}
							</div>

							<div class="type-actions">
								<button
									pButton
									type="button"
									icon="pi pi-images"
									class="p-button-sm p-button-text action-button"
									(click)="openImageManager(type)"
									title="Gestisci immagini"
									[attr.aria-label]="'Gestisci immagini per ' + type.name"
								></button>
							</div>
						</div>
					</ng-template>
				</p-pickList>
			</div>
		</div>

		<!-- New Pasta Type Dialog -->
		<p-dialog
			header="Crea Nuovo Tipo di Pasta"
			[visible]="showNewDialog()"
			(visibleChange)="showNewDialog.set($event)"
			[modal]="true"
			[style]="{ width: '90vw', maxWidth: '500px', minHeight: '400px' }"
			[draggable]="false"
			[resizable]="false"
			styleClass="create-pasta-type-dialog large-dialog"
			[breakpoints]="{ '960px': '95vw', '640px': '98vw' }"
		>
			<div class="p-fluid dialog-content">
				<div class="form-field">
					<label for="newPastaTypeName">Nome *</label>
					<input
						id="newPastaTypeName"
						type="text"
						pInputText
						[(ngModel)]="newTypeName"
						placeholder="Es. Penne, Spaghetti, Gnocchi"
						required
					/>
				</div>

				<div class="form-field">
					<label for="newPastaTypeDescription">Descrizione</label>
					<textarea
						id="newPastaTypeDescription"
						pInputTextarea
						rows="3"
						[(ngModel)]="newTypeDescription"
						placeholder="Descrivi questo tipo di pasta..."
					></textarea>
				</div>

				<div class="form-field">
					<label for="newPastaTypeBasePrice">Prezzo Base (€)</label>
					<p-inputNumber
						id="newPastaTypeBasePrice"
						[(ngModel)]="newTypeBasePrice"
						mode="currency"
						currency="EUR"
						locale="it-IT"
						[min]="0"
						[max]="100"
						[step]="0.50"
						placeholder="0.00"
					></p-inputNumber>
				</div>

				<div class="form-field">
					<label for="newPastaTypePriceNote">Nota Prezzi</label>
					<input
						id="newPastaTypePriceNote"
						type="text"
						pInputText
						[(ngModel)]="newTypePriceNote"
						placeholder="es. per porzione extra, con supplemento"
					/>
				</div>

				<div class="form-field">
					<label for="newPastaTypeImage">Immagine</label>
					<p-fileUpload
						mode="basic"
						name="image"
						accept="image/*"
						[maxFileSize]="10000000"
						[auto]="false"
						chooseLabel="Scegli Immagine"
						(onSelect)="onImageSelect($event)"
						[disabled]="uploadingImage()"
					></p-fileUpload>
					@if (uploadingImage()) {
						<p class="upload-status">
							<i class="pi pi-spin pi-spinner mr-2"></i> Caricamento...
						</p>
					}
					@if (selectedImageFile()) {
						<p class="upload-success">
							<i class="pi pi-check mr-2"></i> Immagine selezionata: {{ selectedImageFile()?.name }}
						</p>
					}
				</div>
			</div>

			<ng-template pTemplate="footer">
				<div class="dialog-footer">
					<button
						pButton
						type="button"
						label="Annulla"
						icon="pi pi-times"
						(click)="cancelNewType()"
						class="p-button-text cancel-button"
						title="Annulla creazione tipo di pasta"
					></button>
					<button
						pButton
						type="button"
						label="Salva"
						icon="pi pi-check"
						(click)="saveNewType()"
						[disabled]="!newTypeName().trim()"
						class="save-button"
						title="Salva nuovo tipo di pasta"
					></button>
				</div>
			</ng-template>
		</p-dialog>
	`,
	styles: [`
		.pasta-type-management {
			background: var(--surface-card);
			border: 1px solid var(--surface-border);
			border-radius: 8px;
			overflow: hidden;
		}

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 1.5rem;
			background: var(--surface-section);
			border-bottom: 1px solid var(--surface-border);

			h3 {
				margin: 0;
				color: var(--primary-color);
				font-weight: 600;
				display: flex;
				align-items: center;
			}

			@media (max-width: 640px) {
				flex-direction: column;
				gap: 1rem;
				align-items: stretch;

				.create-button {
					width: 100%;
				}
			}
		}

		.picklist-container {
			padding: 1.5rem;

			// Override PrimeNG styles for better mobile experience
			:host ::ng-deep {
				.p-picklist {
					.p-picklist-list-wrapper {
						@media (max-width: 768px) {
							width: 100% !important;
							margin-bottom: 1rem;

							&:last-child {
								margin-bottom: 0;
							}
						}
					}

					.p-picklist-controls {
						@media (max-width: 768px) {
							width: 100% !important;
							flex-direction: row !important;
							justify-content: center !important;
							padding: 0.75rem !important;
							gap: 0.5rem !important;
						}
					}
				}
			}
		}

		.pasta-type-item {
			display: flex;
			align-items: center;
			gap: 1rem;
			padding: 0.75rem;
			width: 100%;

			.type-image {
				.type-thumbnail {
					width: 48px;
					height: 48px;
					object-fit: cover;
					border-radius: 6px;
					border: 1px solid var(--surface-border);
				}

				.placeholder-icon {
					font-size: 2rem;
					color: var(--text-color-secondary);
					padding: 0.5rem;
					background: var(--surface-section);
					border: 2px dashed var(--surface-border);
					border-radius: 6px;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 48px;
					height: 48px;
				}
			}

			.type-info {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 0.25rem;

				.type-name {
					font-weight: 600;
					color: var(--text-color);
					font-size: 0.95rem;
				}

				.type-description {
					color: var(--text-color-secondary);
					font-size: 0.8rem;
					line-height: 1.3;
				}

				.type-price {
					color: var(--primary-color);
					font-weight: 600;
					font-size: 0.9rem;
				}
			}

			.type-actions {
				.action-button {
					color: var(--primary-color) !important;

					&:hover {
						background: var(--primary-50) !important;
						color: var(--primary-600) !important;
					}
				}
			}

			@media (max-width: 640px) {
				padding: 1rem 0.5rem;

				.type-info {
					.type-name {
						font-size: 0.9rem;
					}
				}
			}
		}

		.dialog-content {
			padding: 0.5rem 0;
		}

		.form-field {
			margin-bottom: 1.5rem;

			&:last-child {
				margin-bottom: 0;
			}

			label {
				display: block;
				margin-bottom: 0.5rem;
				font-weight: 500;
				color: var(--text-color);
			}
		}

		.upload-status {
			margin-top: 0.5rem;
			color: var(--primary-color);
			font-size: 0.875rem;
		}

		.upload-success {
			margin-top: 0.5rem;
			color: var(--green-600);
			font-size: 0.875rem;
		}

		.dialog-footer {
			display: flex;
			justify-content: flex-end;
			gap: 0.75rem;

			@media (max-width: 640px) {
				flex-direction: column;

				button {
					width: 100%;
				}
			}
		}

		.create-button {
			background: var(--blue-500) !important;
			border-color: var(--blue-500) !important;
			color: white !important;

			&:hover {
				background: var(--blue-600) !important;
				border-color: var(--blue-600) !important;
			}
		}

		.cancel-button {
			color: var(--text-color-secondary) !important;
			border-color: var(--surface-border) !important;

			&:hover {
				background: var(--surface-hover) !important;
				color: var(--text-color) !important;
			}
		}

		.save-button {
			background: var(--green-500) !important;
			border-color: var(--green-500) !important;
			color: white !important;

			&:hover:not([disabled]) {
				background: var(--green-600) !important;
				border-color: var(--green-600) !important;
			}

			&[disabled] {
				opacity: 0.6 !important;
			}
		}
	`]
})
export class PastaTypeManagementComponent {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// Signal inputs
	availablePastaTypes = input.required<PastaType[]>();
	selectedPastaTypes = input.required<PastaType[]>();
	menuConnection = input.required<MenuConnection | null>();

	// Signal outputs
	pastaTypeSelectionChanged = output<{ available: PastaType[], selected: PastaType[] }>();
	openImageManager = output<PastaType>();

	// Internal signals
	showNewDialog = signal(false);
	newTypeName = signal('');
	newTypeDescription = signal('');
	newTypeBasePrice = signal<number | null>(null);
	newTypePriceNote = signal('');
	selectedImageFile = signal<File | null>(null);
	uploadingImage = signal(false);

	openNewPastaTypeDialog() {
		this.resetForm();
		this.showNewDialog.set(true);
	}

	onMoveToTarget(event: any) {
		event.items.forEach((pastaType: PastaType) => {
			this.pastaTypeEvent.emit({ type: 'moveToTarget', pastaType });
		});
	}

	onMoveToSource(event: any) {
		event.items.forEach((pastaType: PastaType) => {
			this.pastaTypeEvent.emit({ type: 'moveToSource', pastaType });
		});
	}

	openImageManager(pastaType: PastaType) {
		this.pastaTypeEvent.emit({ type: 'imageManage', pastaType });
	}

	onImageSelect(event: any) {
		this.uploadingImage.set(true);

		// Simulate upload delay
		setTimeout(() => {
			const file = event.files?.[0] || event.currentFiles?.[0];
			this.selectedImageFile.set(file);
			this.uploadingImage.set(false);
		}, 500);
	}

	saveNewType() {
		if (!this.newTypeName().trim()) {
			alert('Il nome del tipo di pasta è obbligatorio.');
			return;
		}

		// Create pasta type via HTTP
		this.http.post<PastaType>(`${this.apiUrl}/pasta-types`, {
			name: this.newTypeName().trim(),
			description: this.newTypeDescription().trim() || null,
			basePrice: this.newTypeBasePrice() || null,
			priceNote: this.newTypePriceNote().trim() || null,
			imageUrl: '', // Start with empty image
		}).subscribe({
			next: (newType) => {
				// If there's a selected file, upload it
				const selectedFile = this.selectedImageFile();
				if (selectedFile) {
					this.uploadingImage.set(true);
					const formData = new FormData();
					formData.append('image', selectedFile);

					this.http.post<any>(`${this.apiUrl}/images/pasta-types/${newType.id}/upload`, formData)
						.subscribe({
							next: (uploadResponse) => {
								console.log('Image uploaded for new pasta type:', uploadResponse);
								this.uploadingImage.set(false);
								this.emitSelectionChanged(); // Refresh parent data
								this.showNewDialog.set(false);
								this.resetForm();
							},
							error: (uploadErr) => {
								console.error('Failed to upload image for pasta type', uploadErr);
								this.uploadingImage.set(false);
								// Still close dialog since pasta type was created successfully
								this.emitSelectionChanged();
								this.showNewDialog.set(false);
								this.resetForm();
								alert(`Tipo di pasta creato ma errore nel caricamento immagine: ${uploadErr.error?.error || 'Errore sconosciuto'}`);
							},
						});
				} else {
					this.emitSelectionChanged(); // Refresh parent data
					this.showNewDialog.set(false);
					this.resetForm();
				}
			},
			error: (err) => {
				console.error('Failed to create pasta type', err);
				alert(`Errore: ${err.error?.error || 'Impossibile creare il tipo di pasta.'}`);
			},
		});
	}

	cancelNewType() {
		this.showNewDialog.set(false);
		this.resetForm();
	}

	private resetForm() {
		this.newTypeName.set('');
		this.newTypeDescription.set('');
		this.newTypeBasePrice.set(null);
		this.newTypePriceNote.set('');
		this.selectedImageFile.set(null);
		this.uploadingImage.set(false);
	}
}
