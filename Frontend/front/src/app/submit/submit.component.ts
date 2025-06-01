import {
	Component,
	inject,
	OnInit,
	PLATFORM_ID,
	signal,
	computed,
	Injector,
	runInInjectionContext,
	ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Import HttpClient & HttpClientModule
import {
	menuConnection,
	MenuConnection,
	MenuUpdateMessage,
	AddItemMessage,
	RemoveItemMessage,
	UpdateMenuItemImageMessage,
	ToggleMenuItemShowImageMessage,
	AddImageToMenuItemMessage,
	RemoveImageFromMenuItemMessage,
	AddPastaTypeMessage,
	RemovePastaTypeMessage,
	AddPastaSauceMessage,
	RemovePastaSauceMessage,
} from '../webSocketResource';
import {
	Menu,
	MenuItem,
	PastaType as AppPastaType,
	PastaSauce as AppPastaSauce,
	MenuPastaTypeEntry,
	MenuPastaSauceEntry,
} from '../Menu/menu';
import { PickListModule } from 'primeng/picklist'; // Import PickListModule
import { ButtonModule } from 'primeng/button'; // For pButton
import { InputTextModule } from 'primeng/inputtext'; // For pInputText
import { DialogModule } from 'primeng/dialog'; // For modal dialogs
import { FileUploadModule } from 'primeng/fileupload'; // For file upload
import { GalleriaModule } from 'primeng/galleria'; // For image gallery
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // For confirmation dialogs
import { ToggleButtonModule } from 'primeng/togglebutton'; // For toggle switch
import { ConfirmationService } from 'primeng/api'; // For confirmation service
import { SavedMenusComponent } from '../saved-menus/saved-menus.component'; // Import SavedMenusComponent

@Component({
	selector: 'app-submit',
	standalone: true,
	imports: [
		FormsModule,
		PickListModule,
		ButtonModule,
		InputTextModule,
		DialogModule,
		FileUploadModule,
		GalleriaModule,
		ConfirmDialogModule,
		ToggleButtonModule,
		SavedMenusComponent,
	],
	templateUrl: './submit.component.html',
	styleUrls: ['./submit.component.scss'],
	providers: [ConfirmationService],
})
export class SubmitComponent implements OnInit {
	private platformId = inject(PLATFORM_ID);
	private http = inject(HttpClient);
	private injector = inject(Injector);
	private confirmationService = inject(ConfirmationService);
	private apiUrl = 'http://localhost:3000';

	@ViewChild(SavedMenusComponent) savedMenusComponent!: SavedMenusComponent;

	menuWsConnection: MenuConnection | null = null;
	// For adding new item
	newItemName: string = '';
	newItemPrice: number | null = null;

	// --- Pasta Types Management ---
	allPastaTypes = signal<AppPastaType[]>([]);
	// For creating new pasta type
	showNewPastaTypeDialog = signal(false);
	newPastaTypeName = signal('');
	newPastaTypeImageUrl = signal('');
	// Computed signals for Pasta Type PickList
	pastaTypesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaTypeIds = new Set(
			currentMenu?.pastaTypes.map((pt) => pt.pastaType.id) || []
		);
		return this.allPastaTypes().filter(
			(pt) => !currentMenuPastaTypeIds.has(pt.id)
		);
	});
	pastaTypesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaTypes.map((ptEntry) => ptEntry.pastaType) || [];
	});

	// --- Pasta Sauces Management ---
	allPastaSauces = signal<AppPastaSauce[]>([]); // For creating new pasta sauce
	showNewPastaSauceDialog = signal(false);
	newPastaSauceName = signal('');
	newPastaSauceImageUrl = signal('');

	// Image management
	showImageManagerDialog = signal(false);
	selectedItemForImages = signal<{
		type: 'pastaType' | 'pastaSauce' | 'menuItem';
		id: number;
		name: string;
		availableImages: string[];
		currentImage: string;
	} | null>(null);
	uploadingImage = signal(false);

	// Helper method to check if menu item has available images
	hasAvailableImages(item: MenuItem): boolean {
		if (!item.availableImages) return false;
		try {
			const images = JSON.parse(item.availableImages);
			return Array.isArray(images) && images.length > 0;
		} catch {
			return false;
		}
	}

	// Helper method to get available images count
	getAvailableImagesCount(item: MenuItem): number {
		if (!item.availableImages) return 0;
		try {
			const images = JSON.parse(item.availableImages);
			return Array.isArray(images) ? images.length : 0;
		} catch {
			return 0;
		}
	}

	// Method to trigger save menu dialog
	openSaveMenuDialog() {
		if (this.savedMenusComponent) {
			this.savedMenusComponent.openSaveDialog();
		}
	}

	// Computed signals for Pasta Sauce PickList
	pastaSaucesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaSauceIds = new Set(
			currentMenu?.pastaSauces.map((ps) => ps.pastaSauce.id) || []
		);
		return this.allPastaSauces().filter(
			(ps) => !currentMenuPastaSauceIds.has(ps.id)
		);
	});
	pastaSaucesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaSauces.map((psEntry) => psEntry.pastaSauce) || [];
	});

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			runInInjectionContext(this.injector, () => {
				this.menuWsConnection = menuConnection(
					'ws://localhost:3000/menu-updates'
				);
			});
			this.loadAllPastaTypes();
			this.loadAllPastaSauces();
		}
	}

	// --- Loaders ---
	loadAllPastaTypes() {
		this.http.get<AppPastaType[]>(`${this.apiUrl}/pasta-types`).subscribe({
			next: (types) => this.allPastaTypes.set(types),
			error: (err) => console.error('Failed to load pasta types', err),
		});
	}

	loadAllPastaSauces() {
		this.http.get<AppPastaSauce[]>(`${this.apiUrl}/pasta-sauces`).subscribe({
			next: (sauces) => this.allPastaSauces.set(sauces),
			error: (err) => console.error('Failed to load pasta sauces', err),
		});
	}
	// --- Menu Item Actions ---
	addItem() {
		if (
			!this.newItemName.trim() ||
			this.newItemPrice === null ||
			this.newItemPrice <= 0
		) {
			alert('Inserisci un nome valido e un prezzo per la voce.');
			return;
		}

		const message: AddItemMessage = {
			type: 'addItem',
			item: {
				name: this.newItemName.trim(),
				price: this.newItemPrice,
			},
		};
		this.menuWsConnection?.sendUpdate(message);

		// Clear the form
		this.newItemName = '';
		this.newItemPrice = null;
	}
	removeItemById(itemId: number) {
		const message: RemoveItemMessage = {
			type: 'removeItem',
			itemId: itemId,
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	// --- Menu Item Image Management ---
	toggleMenuItemShowImage(itemId: number, showImage: boolean) {
		const message: ToggleMenuItemShowImageMessage = {
			type: 'toggleMenuItemShowImage',
			itemId: itemId,
			showImage: showImage,
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	openMenuItemImageManager(item: MenuItem) {
		let availableImages: string[] = [];
		try {
			availableImages = item.availableImages
				? JSON.parse(item.availableImages)
				: [];
		} catch (e) {
			availableImages = [];
		}

		this.selectedItemForImages.set({
			type: 'menuItem',
			id: item.id,
			name: item.name,
			availableImages: availableImages,
			currentImage: item.imageUrl || '',
		});
		this.showImageManagerDialog.set(true);
	}

	// --- Pasta Type PickList Actions ---
	onPastaTypeMoveToTarget(event: { items: AppPastaType[] }) {
		event.items.forEach((pastaType) => {
			const message: AddPastaTypeMessage = {
				type: 'addPastaTypeToMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}
	onPastaTypeMoveToSource(event: { items: AppPastaType[] }) {
		event.items.forEach((pastaType) => {
			const message: RemovePastaTypeMessage = {
				type: 'removePastaTypeFromMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}

	// --- Create New Pasta Type ---
	openNewPastaTypeDialog() {
		this.newPastaTypeName.set('');
		this.newPastaTypeImageUrl.set('');
		this.showNewPastaTypeDialog.set(true);
	}

	saveNewPastaType() {
		if (!this.newPastaTypeName().trim()) {
			alert('Il nome del tipo di pasta è obbligatorio.');
			return;
		}
		this.http
			.post<AppPastaType>(`${this.apiUrl}/pasta-types`, {
				name: this.newPastaTypeName(),
				imageUrl: this.newPastaTypeImageUrl(),
			})
			.subscribe({
				next: (newType) => {
					this.loadAllPastaTypes(); // Refresh list
					this.showNewPastaTypeDialog.set(false);
				},
				error: (err) => {
					console.error('Failed to create pasta type', err);
					alert(
						`Errore: ${
							err.error?.error || 'Impossibile creare il tipo di pasta.'
						}`
					);
				},
			});
	}

	// --- Pasta Sauce PickList Actions ---
	onPastaSauceMoveToTarget(event: { items: AppPastaSauce[] }) {
		event.items.forEach((pastaSauce) => {
			const message: AddPastaSauceMessage = {
				type: 'addPastaSauceToMenu',
				pastaSauceId: pastaSauce.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}
	onPastaSauceMoveToSource(event: { items: AppPastaSauce[] }) {
		event.items.forEach((pastaSauce) => {
			const message: RemovePastaSauceMessage = {
				type: 'removePastaSauceFromMenu',
				pastaSauceId: pastaSauce.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}

	// --- Create New Pasta Sauce ---
	openNewPastaSauceDialog() {
		this.newPastaSauceName.set('');
		this.newPastaSauceImageUrl.set('');
		this.showNewPastaSauceDialog.set(true);
	}
	saveNewPastaSauce() {
		if (!this.newPastaSauceName().trim()) {
			alert('Il nome del sugo per pasta è obbligatorio.');
			return;
		}
		this.http
			.post<AppPastaSauce>(`${this.apiUrl}/pasta-sauces`, {
				name: this.newPastaSauceName(),
				imageUrl: this.newPastaSauceImageUrl(),
			})
			.subscribe({
				next: (newSauce) => {
					this.loadAllPastaSauces(); // Refresh list
					this.showNewPastaSauceDialog.set(false);
				},
				error: (err) => {
					console.error('Failed to create pasta sauce', err);
					alert(
						`Errore: ${
							err.error?.error || 'Impossibile creare il sugo per pasta.'
						}`
					);
				},
			});
	}
	get currentMenuItemsForDisplay(): MenuItem[] {
		const menu = this.menuWsConnection?.resource.value();
		return menu?.menuItems || [];
	}

	// --- Image Management ---
	openImageManager(
		type: 'pastaType' | 'pastaSauce',
		item: AppPastaType | AppPastaSauce
	) {
		this.selectedItemForImages.set({
			type,
			id: item.id,
			name: item.name,
			availableImages: JSON.parse((item as any).availableImages || '[]'),
			currentImage: item.imageUrl || '',
		});
		this.showImageManagerDialog.set(true);
	}
	onImageUpload(event: any) {
		const file = event.files[0];
		if (!file || !this.selectedItemForImages()) return;

		this.uploadingImage.set(true);
		const selectedItem = this.selectedItemForImages()!;
		const formData = new FormData();
		formData.append('image', file);
		if (selectedItem.type === 'menuItem') {
			// Handle menu item via upload to images endpoint and then add to menu item
			this.http
				.post<any>(`${this.apiUrl}/images/menu-items/upload`, formData)
				.subscribe({
					next: (response) => {
						console.log('Image uploaded successfully:', response);
						const imageUrl = response.imageUrl;

						// Add the image to the menu item via WebSocket
						const message: AddImageToMenuItemMessage = {
							type: 'addImageToMenuItem',
							itemId: selectedItem.id,
							imageUrl: imageUrl,
						};
						this.menuWsConnection?.sendUpdate(message);

						// Update the selected item immediately for UI feedback
						const updatedImages = [...selectedItem.availableImages, imageUrl];
						const newCurrentImage = selectedItem.currentImage || imageUrl;
						this.selectedItemForImages.update((item) =>
							item
								? {
										...item,
										availableImages: updatedImages,
										currentImage: newCurrentImage,
								  }
								: null
						);

						this.uploadingImage.set(false);
					},
					error: (err) => {
						console.error('Failed to upload image:', err);
						alert(
							`Errore: ${
								err.error?.error || "Impossibile caricare l'immagine."
							}`
						);
						this.uploadingImage.set(false);
					},
				});
		} else {
			// Handle pasta types and sauces via HTTP
			const endpoint =
				selectedItem.type === 'pastaType'
					? `${this.apiUrl}/images/pasta-types/${selectedItem.id}/upload`
					: `${this.apiUrl}/images/pasta-sauces/${selectedItem.id}/upload`;

			this.http.post<any>(endpoint, formData).subscribe({
				next: (response) => {
					console.log('Image uploaded successfully:', response);
					// Refresh the data
					this.loadAllPastaTypes();
					this.loadAllPastaSauces();
					// Update the selected item
					const updatedItem = response.pastaType || response.pastaSauce;
					this.selectedItemForImages.set({
						...selectedItem,
						availableImages: JSON.parse(updatedItem.availableImages || '[]'),
						currentImage: updatedItem.imageUrl || '',
					});
					this.uploadingImage.set(false);
				},
				error: (err) => {
					console.error('Failed to upload image:', err);
					alert(
						`Errore: ${err.error?.error || "Impossibile caricare l'immagine."}`
					);
					this.uploadingImage.set(false);
				},
			});
		}
	}
	switchToImage(imageUrl: string) {
		if (!this.selectedItemForImages()) return;

		const selectedItem = this.selectedItemForImages()!;

		if (selectedItem.type === 'menuItem') {
			// Handle menu item via WebSocket
			const message: UpdateMenuItemImageMessage = {
				type: 'updateMenuItemImage',
				itemId: selectedItem.id,
				imageUrl: imageUrl,
			};
			this.menuWsConnection?.sendUpdate(message);
			// Update the selected item immediately for UI feedback
			this.selectedItemForImages.update((item) =>
				item ? { ...item, currentImage: imageUrl } : null
			);
		} else {
			// Handle pasta types and sauces via HTTP
			const endpoint =
				selectedItem.type === 'pastaType'
					? `${this.apiUrl}/images/pasta-types/${selectedItem.id}/switch`
					: `${this.apiUrl}/images/pasta-sauces/${selectedItem.id}/switch`;

			this.http.put<any>(endpoint, { imageUrl }).subscribe({
				next: (response) => {
					console.log('Image switched successfully:', response);
					// Refresh the data
					this.loadAllPastaTypes();
					this.loadAllPastaSauces();
					// Update the selected item
					this.selectedItemForImages.update((item) =>
						item ? { ...item, currentImage: imageUrl } : null
					);
				},
				error: (err) => {
					console.error('Failed to switch image:', err);
					alert(
						`Errore: ${err.error?.error || 'Impossibile cambiare immagine.'}`
					);
				},
			});
		}
	}	deleteImage(imageUrl: string) {
		if (!this.selectedItemForImages()) return;

		this.confirmationService.confirm({
			message:
				'Sei sicuro di voler eliminare questa immagine? Questa azione non può essere annullata.',
			header: 'Elimina Immagine',
			icon: 'pi pi-exclamation-triangle',
			styleClass: 'confirmation-dialog',
			accept: () => {
				const selectedItem = this.selectedItemForImages()!;
				if (selectedItem.type === 'menuItem') {
					// Handle menu item via WebSocket
					const message: RemoveImageFromMenuItemMessage = {
						type: 'removeImageFromMenuItem',
						itemId: selectedItem.id,
						imageUrl: imageUrl,
					};
					this.menuWsConnection?.sendUpdate(message);
					// Update the selected item immediately for UI feedback
					const updatedImages = selectedItem.availableImages.filter(
						(img) => img !== imageUrl
					);
					const newCurrentImage =
						selectedItem.currentImage === imageUrl
							? updatedImages.length > 0
								? updatedImages[0]
								: ''
							: selectedItem.currentImage;
					this.selectedItemForImages.update((item) =>
						item
							? {
									...item,
									availableImages: updatedImages,
									currentImage: newCurrentImage,
							  }
							: null
					);
				} else {
					// Handle pasta types and sauces via HTTP
					const endpoint =
						selectedItem.type === 'pastaType'
							? `${this.apiUrl}/images/pasta-types/${selectedItem.id}/delete`
							: `${this.apiUrl}/images/pasta-sauces/${selectedItem.id}/delete`;

					this.http.delete<any>(endpoint, { body: { imageUrl } }).subscribe({
						next: (response) => {
							console.log('Image deleted successfully:', response);
							// Refresh the data
							this.loadAllPastaTypes();
							this.loadAllPastaSauces();
							// Update the selected item
							const updatedItem = response.pastaType || response.pastaSauce;
							this.selectedItemForImages.set({
								...selectedItem,
								availableImages: JSON.parse(
									updatedItem.availableImages || '[]'
								),
								currentImage: updatedItem.imageUrl || '',
							});
						},
						error: (err) => {
							console.error('Failed to delete image:', err);
							alert(
								`Errore: ${
									err.error?.error || "Impossibile eliminare l'immagine."
								}`
							);
						},
					});
				}
			},
		});
	}
}
