import {
	Component,
	OnInit,
	OnDestroy,
	inject,
	signal,
	PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { DragDropModule } from 'primeng/dragdrop';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SlideshowService } from '../services/slideshow.service';
import { Slideshow, SlideshowSlide } from '../shared/models/slideshow.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.dynamic';

@Component({
	selector: 'app-slideshow-management',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		CardModule,
		DialogModule,
		InputTextModule,
		InputNumberModule,
		CheckboxModule,
		FileUploadModule,
		ConfirmDialogModule,
		ToastModule,
		CalendarModule,
		DragDropModule,
		ProgressBarModule,
	],
	providers: [ConfirmationService, MessageService],
	template: `
		<div class="slideshow-management">
			<div class="management-header">
				<h2><i class="pi pi-images mr-2"></i>Gestione Slideshow</h2>
				<div class="header-actions">
					<button
						pButton
						type="button"
						label="Nuovo Slideshow"
						icon="pi pi-plus"
						class="p-button-primary"
						(click)="openCreateDialog()"
					></button>

					@if (activeSlideshow()) {
					<div class="active-slideshow-info">
						<span class="current-slideshow">{{ activeSlideshow()!.name }}</span>
						<button
							pButton
							type="button"
							[label]="
								activeSlideshowStatus()
									? 'Disattiva Slideshow'
									: 'Riattiva Slideshow'
							"
							[icon]="activeSlideshowStatus() ? 'pi pi-stop' : 'pi pi-play'"
							[class]="
								activeSlideshowStatus() ? 'p-button-danger' : 'p-button-success'
							"
							(click)="toggleSlideshow()"
						></button>
					</div>
					}
				</div>
			</div>

			<!-- Slideshow List -->
			<div class="slideshows-grid">
				@for (slideshow of allSlideshows(); track slideshow.id) {
				<div class="slideshow-card">
					<p-card>
						<ng-template pTemplate="header">
							<div class="card-header">
								<span class="slideshow-name">{{ slideshow.name }}</span>
								@if (slideshow.isActive) {
								<span class="active-badge">ATTIVO</span>
								}
							</div>
						</ng-template>

						<div class="slideshow-info">
							<div class="info-item">
								<i class="pi pi-clock mr-2"></i>
								<span>Intervallo: {{ slideshow.intervalMs / 1000 }}s</span>
							</div>

							@if (slideshow.endTime) {
							<div class="info-item">
								<i class="pi pi-calendar mr-2"></i>
								<span>Termina alle: {{ slideshow.endTime }}</span>
							</div>
							}

							<div class="info-item">
								<i class="pi pi-images mr-2"></i>
								<span>{{ slideshow.slides.length || 0 }} slide</span>
							</div>
						</div>

						<ng-template pTemplate="footer">
							<div class="card-actions">
								<button
									pButton
									type="button"
									icon="pi pi-cog"
									class="p-button-outlined p-button-sm"
									(click)="editSlideshow(slideshow)"
									title="Modifica"
								></button>

								<button
									pButton
									type="button"
									icon="pi pi-images"
									class="p-button-outlined p-button-sm"
									(click)="manageSlides(slideshow)"
									title="Gestisci slide"
								></button>

								@if (slideshow.isActive) {
								<button
									pButton
									type="button"
									icon="pi pi-stop"
									class="p-button-danger p-button-sm"
									(click)="deactivateSlideshow(slideshow)"
									title="Disattiva"
								></button>
								} @else {
								<button
									pButton
									type="button"
									icon="pi pi-play"
									class="p-button-success p-button-sm"
									(click)="activateSlideshow(slideshow)"
									title="Attiva"
								></button>
								}
							</div>
						</ng-template>
					</p-card>
				</div>
				}
			</div>

			<!-- Create/Edit Slideshow Dialog -->
			<p-dialog
				[(visible)]="showCreateDialog"
				[modal]="true"
				[style]="{ width: '500px', height: '100%' }"
				[header]="editingSlideshow() ? 'Modifica Slideshow' : 'Nuovo Slideshow'"
			>
				<div class="dialog-form">
					<div class="field">
						<label for="name">Nome</label>
						<input
							pInputText
							id="name"
							[(ngModel)]="slideshowForm.name"
							placeholder="Nome del slideshow"
						/>
					</div>

					<div class="field">
						<label for="interval">Intervallo (secondi)</label>
						<p-inputNumber
							id="interval"
							[(ngModel)]="slideshowFormInterval"
							[min]="1"
							[max]="60"
							placeholder="Secondi tra le slide"
						>
						</p-inputNumber>
					</div>

					<div class="field">
						<label for="endTime">Ora di termine (opzionale)</label>
						<p-calendar
							id="endTime"
							[(ngModel)]="endTimeDate"
							[timeOnly]="true"
							[showTime]="true"
							hourFormat="24"
							placeholder="Seleziona ora (es. 12:30)"
							(onSelect)="onTimeChange($event)"
						>
						</p-calendar>
					</div>

					<div class="field-checkbox">
						<p-checkbox
							[(ngModel)]="slideshowForm.autoStart"
							binary="true"
							inputId="autoStart"
						>
						</p-checkbox>
						<label for="autoStart">Avvio automatico</label>
					</div>
				</div>

				<ng-template pTemplate="footer">
					<button
						pButton
						type="button"
						label="Annulla"
						icon="pi pi-times"
						class="p-button-text"
						(click)="closeCreateDialog()"
					></button>
					<button
						pButton
						type="button"
						[label]="editingSlideshow() ? 'Aggiorna' : 'Crea'"
						icon="pi pi-check"
						(click)="saveSlideshow()"
					></button>
				</ng-template>
			</p-dialog>

			<!-- Slide Management Dialog -->
			<p-dialog
				[(visible)]="showSlidesDialog"
				[modal]="true"
				[style]="{ width: '800px' }"
				header="Gestione Slide"
			>
				<div class="slides-management">
					<div class="upload-section">
						<h3><i class="pi pi-cloud-upload mr-2"></i>Carica Immagini</h3>
						<p class="upload-help">
							Seleziona una o più immagini da aggiungere allo slideshow
						</p>

						<p-fileUpload
							name="image"
							[url]="uploadUrl"
							accept="image/*"
							[maxFileSize]="10000000"
							[multiple]="true"
							[auto]="false"
							chooseLabel="Seleziona Immagini"
							uploadLabel="Carica Tutte"
							cancelLabel="Annulla"
							(onUpload)="onMultipleImageUpload($event)"
							(onError)="onUploadError($event)"
							(onSelect)="onImagesSelected($event)"
							(onProgress)="onUploadProgress($event)"
							(onBeforeUpload)="onBeforeUpload($event)"
							[showUploadButton]="selectedFiles().length > 0"
							[showCancelButton]="selectedFiles().length > 0"
						>
							<ng-template pTemplate="content">
								@if (selectedFiles().length > 0) {
								<div class="upload-preview">
									<h4>Immagini selezionate ({{ selectedFiles().length }})</h4>
									<div class="preview-grid">
										@for (file of selectedFiles(); track $index) {
										<div class="preview-item">
											<img [src]="getFilePreview(file)" [alt]="file.name" />
											<div class="preview-info">
												<span class="file-name">{{ file.name }}</span>
												<span class="file-size">{{
													formatFileSize(file.size)
												}}</span>
											</div>
											<button
												pButton
												type="button"
												icon="pi pi-times"
												class="p-button-danger p-button-sm remove-file-btn"
												(click)="removeSelectedFile($index)"
												title="Rimuovi"
											></button>
										</div>
										}
									</div>
								</div>
								}
							</ng-template>
						</p-fileUpload>

						@if (uploadProgress() > 0 && uploadProgress() < 100) {
						<div class="upload-progress">
							<p-progressBar [value]="uploadProgress()"></p-progressBar>
							<p>Caricamento in corso... {{ uploadProgress() }}%</p>
						</div>
						}
					</div>

					@if (selectedSlideshow()?.slides?.length) {
					<div class="slides-grid">
						@for (slide of selectedSlideshow()!.slides; track slide.id) {
						<div class="slide-item">
							<div class="slide-preview">
								<img
									[src]="slide.imageUrl"
									[alt]="slide.title || 'Slide'"
									style="width: 200px; height: 150px; object-fit: cover;"
								/>
								<div class="slide-overlay">
									<button
										pButton
										type="button"
										icon="pi pi-trash"
										class="p-button-danger p-button-sm"
										(click)="removeSlide(slide)"
										title="Rimuovi"
									></button>
								</div>
							</div>

							@if (slide.title) {
							<div class="slide-title">{{ slide.title }}</div>
							}
						</div>
						}
					</div>
					} @else {
					<div class="no-slides">
						<i class="pi pi-images text-4xl mb-3"></i>
						<p>Nessuna slide presente. Carica la prima immagine!</p>
					</div>
					}
				</div>

				<ng-template pTemplate="footer">
					<button
						pButton
						type="button"
						label="Chiudi"
						icon="pi pi-times"
						(click)="closeSlidesDialog()"
					></button>
				</ng-template>
			</p-dialog>
		</div>

		<p-toast></p-toast>
		<p-confirmDialog></p-confirmDialog>
	`,
	styles: [
		`
			.slideshow-management {
				padding: 20px;
			}

			.management-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30px;
			}

			.header-actions {
				display: flex;
				gap: 10px;
				align-items: center;
			}

			.active-slideshow-info {
				display: flex;
				align-items: center;
				gap: 10px;
			}

			.current-slideshow {
				background: #f0f9ff;
				border: 1px solid #0ea5e9;
				color: #0ea5e9;
				padding: 8px 12px;
				border-radius: 6px;
				font-weight: 500;
				font-size: 0.9rem;
			}

			.slideshows-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
				gap: 20px;
			}

			.slideshow-card {
				height: 100%;
			}

			.card-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 15px;
			}

			.slideshow-name {
				font-weight: bold;
				font-size: 1.2rem;
			}

			.active-badge {
				background: #4caf50;
				color: white;
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 0.8rem;
				font-weight: bold;
			}

			.slideshow-info {
				margin-bottom: 15px;
			}

			.info-item {
				display: flex;
				align-items: center;
				margin-bottom: 8px;
			}

			.card-actions {
				display: flex;
				gap: 8px;
				justify-content: flex-end;
			}

			.dialog-form {
				display: flex;
				flex-direction: column;
				gap: 20px;
			}

			.field {
				display: flex;
				flex-direction: column;
				gap: 5px;
			}

			.field label {
				font-weight: bold;
			}

			.field-checkbox {
				display: flex;
				align-items: center;
				gap: 10px;
			}

			.slides-management {
				max-height: 60vh;
				overflow-y: auto;
			}

			.upload-section {
				margin-bottom: 20px;
				padding: 15px;
				border: 2px dashed #ddd;
				border-radius: 8px;
				text-align: center;
			}

			.slides-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
				gap: 15px;
			}

			.slide-item {
				position: relative;
			}

			.slide-preview {
				position: relative;
				aspect-ratio: 16/9;
				overflow: hidden;
				border-radius: 8px;
			}

			.slide-preview img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			.slide-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.5);
				display: flex;
				align-items: center;
				justify-content: center;
				opacity: 0;
				transition: opacity 0.3s;
			}

			.slide-preview:hover .slide-overlay {
				opacity: 1;
			}

			.slide-title {
				text-align: center;
				font-size: 0.9rem;
				margin-top: 5px;
				font-weight: 500;
			}

			.no-slides {
				text-align: center;
				padding: 40px;
				color: #666;
			}

			@media (max-width: 768px) {
				.management-header {
					flex-direction: column;
					gap: 15px;
					align-items: stretch;
				}

				.header-actions {
					justify-content: center;
				}

				.slideshows-grid {
					grid-template-columns: 1fr;
				}
			}
		`,
	],
})
export class SlideshowManagementComponent implements OnInit, OnDestroy {
	private slideshowService = inject(SlideshowService);
	private http = inject(HttpClient);
	private router = inject(Router);
	private confirmationService = inject(ConfirmationService);
	private messageService = inject(MessageService);
	private platformId = inject(PLATFORM_ID);

	allSlideshows = signal<Slideshow[]>([]);
	activeSlideshow = signal<Slideshow | null>(null);
	activeSlideshowStatus = signal(false);
	selectedSlideshow = signal<Slideshow | null>(null);
	editingSlideshow = signal<Slideshow | null>(null);

	showCreateDialog = false;
	showSlidesDialog = false;

	uploadUrl = `${environment.apiUrl}/images/upload-multiple`;

	slideshowForm = {
		name: '',
		intervalMs: 5000,
		endTime: '',
		autoStart: false,
	};

	slideshowFormInterval = 5; // Helper for inputNumber
	endTimeDate: Date | null = null; // Helper for time picker
	selectedFiles = signal<File[]>([]);
	uploadProgress = signal(0);
	private filePreviewCache = new Map<File, string>(); // Cache for blob URLs

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			this.loadData();
		}
	}

	ngOnDestroy() {
		// Clean up blob URLs
		this.filePreviewCache.forEach((url) => URL.revokeObjectURL(url));
		this.filePreviewCache.clear();
	}

	private loadData() {
		// Load all slideshows
		this.slideshowService.allSlideshows$.subscribe((slideshows) => {
			this.allSlideshows.set(slideshows);
		});

		// Load active slideshow status
		this.slideshowService.activeSlideshow$.subscribe((status) => {
			this.activeSlideshow.set(status.slideshow);
			this.activeSlideshowStatus.set(status.isActive);
		});

		// Initial load
		this.slideshowService.refreshData();
	}

	openCreateDialog() {
		this.editingSlideshow.set(null);
		this.slideshowForm = {
			name: '',
			intervalMs: 5000,
			endTime: '',
			autoStart: false,
		};
		this.slideshowFormInterval = 5;
		this.endTimeDate = null;
		this.showCreateDialog = true;
	}

	editSlideshow(slideshow: Slideshow) {
		this.editingSlideshow.set(slideshow);
		this.slideshowForm = {
			name: slideshow.name,
			intervalMs: slideshow.intervalMs,
			endTime: slideshow.endTime || '',
			autoStart: slideshow.autoStart,
		};
		this.slideshowFormInterval = slideshow.intervalMs / 1000;

		// Set time picker value
		if (slideshow.endTime) {
			const [hours, minutes] = slideshow.endTime.split(':');
			this.endTimeDate = new Date();
			this.endTimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
		} else {
			this.endTimeDate = null;
		}

		this.showCreateDialog = true;
	}

	closeCreateDialog() {
		this.showCreateDialog = false;
		this.editingSlideshow.set(null);
		this.endTimeDate = null;
	}

	onTimeChange(event: any) {
		if (event && event instanceof Date) {
			const hours = event.getHours().toString().padStart(2, '0');
			const minutes = event.getMinutes().toString().padStart(2, '0');
			this.slideshowForm.endTime = `${hours}:${minutes}`;
		} else {
			this.slideshowForm.endTime = '';
		}
	}

	saveSlideshow() {
		this.slideshowForm.intervalMs = this.slideshowFormInterval * 1000;

		const editing = this.editingSlideshow();
		if (editing) {
			// Update existing slideshow
			this.slideshowService
				.updateSlideshow(editing.id, this.slideshowForm)
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Successo',
							detail: 'Slideshow aggiornato',
						});
						this.closeCreateDialog();
						this.slideshowService.refreshData();
					},
					error: (error) => {
						console.error('Error updating slideshow:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Errore',
							detail: "Errore nell'aggiornamento dello slideshow",
						});
					},
				});
		} else {
			// Create new slideshow
			this.slideshowService.createSlideshow(this.slideshowForm).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Successo',
						detail: 'Slideshow creato',
					});
					this.closeCreateDialog();
					this.slideshowService.refreshData();
				},
				error: (error) => {
					console.error('Error creating slideshow:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Errore',
						detail: 'Errore nella creazione dello slideshow',
					});
				},
			});
		}
	}

	activateSlideshow(slideshow: Slideshow) {
		this.slideshowService.activateSlideshow(slideshow.id).subscribe({
			next: (activatedSlideshow) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Successo',
					detail: 'Slideshow attivato',
				});

				// Send WebSocket message for real-time activation
				this.sendWebSocketActivation(activatedSlideshow);

				this.slideshowService.refreshData();

				// Navigate to slideshow page
				this.router.navigate(['/slideshow']);
			},
			error: (error) => {
				console.error('Error activating slideshow:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Errore',
					detail: "Errore nell'attivazione dello slideshow",
				});
			},
		});
	}

	deactivateSlideshow(slideshow: Slideshow) {
		this.slideshowService.deactivateSlideshow().subscribe({
			next: () => {
				this.messageService.add({
					severity: 'info',
					summary: 'Info',
					detail: `Slideshow "${slideshow.name}" disattivato`,
				});

				// Send WebSocket deactivation message
				this.sendWebSocketDeactivation();

				this.slideshowService.refreshData();
			},
			error: (error) => {
				console.error('Error deactivating slideshow:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Errore',
					detail: 'Errore nella disattivazione dello slideshow',
				});
			},
		});
	}

	toggleSlideshow() {
		if (this.activeSlideshowStatus()) {
			this.slideshowService.deactivateSlideshow().subscribe({
				next: () => {
					this.messageService.add({
						severity: 'info',
						summary: 'Info',
						detail: 'Slideshow disattivato',
					});

					// Send WebSocket deactivation message
					this.sendWebSocketDeactivation();

					this.slideshowService.refreshData();

					// Navigate back to home if currently on slideshow page
					if (this.router.url === '/slideshow') {
						this.router.navigate(['/home']);
					}
				},
				error: (error) => {
					console.error('Error deactivating slideshow:', error);
				},
			});
		} else if (this.activeSlideshow()) {
			// This will trigger navigation through activateSlideshow method
			this.activateSlideshow(this.activeSlideshow()!);
		}
	}

	manageSlides(slideshow: Slideshow) {
		this.selectedSlideshow.set(slideshow);
		this.showSlidesDialog = true;
	}

	closeSlidesDialog() {
		this.showSlidesDialog = false;
		this.selectedSlideshow.set(null);
	}
	onImageUpload(event: any) {
		const response = JSON.parse(event.xhr.response);
		if (response.success && this.selectedSlideshow()) {
			this.slideshowService
				.addSlideToSlideshow(this.selectedSlideshow()!.id, {
					imageUrl: response.imageUrl,
				})
				.subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Successo',
							detail: 'Immagine aggiunta allo slideshow',
						});
						this.slideshowService.refreshData();
						// Update selected slideshow
						this.selectedSlideshow.set(
							this.allSlideshows().find(
								(s) => s.id === this.selectedSlideshow()?.id
							) || null
						);
					},
					error: (error) => {
						console.error('Error adding slide:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Errore',
							detail: "Errore nell'aggiunta dell'immagine",
						});
					},
				});
		}
	}  onMultipleImageUpload(event: any) {
    try {
      console.log('Upload event:', event);

      // Handle PrimeNG FileUpload event structure
      let response: any;

      if (event.originalEvent && event.originalEvent.body) {
        // PrimeNG FileUpload with HttpClient response
        response = event.originalEvent.body;
      } else if (event.xhr && event.xhr.response) {
        // Traditional XMLHttpRequest response
        response = JSON.parse(event.xhr.response);
      } else if (event.xhr && event.xhr.responseText) {
        response = JSON.parse(event.xhr.responseText);
      } else if (event.response) {
        response = typeof event.response === 'string' ? JSON.parse(event.response) : event.response;
      } else if (typeof event === 'string') {
        response = JSON.parse(event);
      } else {
        throw new Error('Unable to parse upload response - unknown event structure');
      }

      console.log('Parsed response:', response);

			if (response.success && this.selectedSlideshow()) {
				// Add all uploaded images as slides
				const uploadPromises = response.images.map((image: any) =>
					this.slideshowService
						.addSlideToSlideshow(this.selectedSlideshow()!.id, {
							imageUrl: image.imageUrl,
						})
						.toPromise()
				);

				Promise.all(uploadPromises)
					.then(() => {
						this.messageService.add({
							severity: 'success',
							summary: 'Successo',
							detail: `${response.images.length} immagini aggiunte allo slideshow`,
						});
						this.slideshowService.refreshData();
						// Update selected slideshow
						this.selectedSlideshow.set(
							this.allSlideshows().find(
								(s) => s.id === this.selectedSlideshow()?.id
							) || null
						);
						// Clear selected files
						this.selectedFiles.set([]);
						this.uploadProgress.set(0);
						// Clear blob URL cache
						this.filePreviewCache.forEach((url) => URL.revokeObjectURL(url));
						this.filePreviewCache.clear();
					})
					.catch((error) => {
						console.error('Error adding slides:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Errore',
							detail: "Errore nell'aggiunta delle immagini",
						});
					});
			} else {
				throw new Error(response.error || 'Upload failed');
			}
		} catch (error) {
			console.error('Upload response parsing error:', error);
			this.messageService.add({
				severity: 'error',
				summary: 'Errore',
				detail: 'Errore nel caricamento delle immagini: ' + error,
			});
		}
	}

	onUploadProgress(event: any) {
		if (event.progress) {
			this.uploadProgress.set(event.progress);
		}
	}

	onBeforeUpload(event: any) {
		this.uploadProgress.set(0);
	}

	onUploadError(event: any) {
		console.error('Upload error:', event);
		this.messageService.add({
			severity: 'error',
			summary: 'Errore',
			detail: "Errore nel caricamento dell'immagine",
		});
	}

	removeSlide(slide: SlideshowSlide) {
		this.confirmationService.confirm({
			message: 'Sei sicuro di voler rimuovere questa slide?',
			header: 'Conferma rimozione',
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
				this.slideshowService.removeSlideFromSlideshow(slide.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Successo',
							detail: 'Slide rimossa',
						});
						this.slideshowService.refreshData();
						// Update selected slideshow
						this.selectedSlideshow.set(
							this.allSlideshows().find(
								(s) => s.id === this.selectedSlideshow()?.id
							) || null
						);
					},
					error: (error) => {
						console.error('Error removing slide:', error);
						this.messageService.add({
							severity: 'error',
							summary: 'Errore',
							detail: 'Errore nella rimozione della slide',
						});
					},
				});
			},
		});
	}

	// Multiple image upload methods
	onImagesSelected(event: any) {
		// Clear previous cache when new files are selected
		this.filePreviewCache.forEach((url) => URL.revokeObjectURL(url));
		this.filePreviewCache.clear();

		this.selectedFiles.set(Array.from(event.files || []));
		this.uploadProgress.set(0);
	}

	getFilePreview(file: File): string {
		// Return cached URL if it exists
		if (this.filePreviewCache.has(file)) {
			return this.filePreviewCache.get(file)!;
		}

		// Create new blob URL and cache it
		const url = URL.createObjectURL(file);
		this.filePreviewCache.set(file, url);
		return url;
	}

	formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	removeSelectedFile(index: number) {
		const files = this.selectedFiles();
		const fileToRemove = files[index];

		// Revoke blob URL for the removed file
		if (this.filePreviewCache.has(fileToRemove)) {
			URL.revokeObjectURL(this.filePreviewCache.get(fileToRemove)!);
			this.filePreviewCache.delete(fileToRemove);
		}

		files.splice(index, 1);
		this.selectedFiles.set([...files]);
	}

	// WebSocket communication methods
	private sendWebSocketActivation(slideshow: Slideshow) {
		// Send message to all connected clients about slideshow activation
		// This will be handled by the backend WebSocket when the slideshow is activated
		// The backend should broadcast the activation to all clients
		console.log('Slideshow activated, backend should broadcast:', slideshow);
	}

	private sendWebSocketDeactivation() {
		// Send message to all connected clients about slideshow deactivation
		console.log('Slideshow deactivated, backend should broadcast');
	}
}
