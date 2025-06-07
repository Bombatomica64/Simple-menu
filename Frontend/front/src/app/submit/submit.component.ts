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
import { environment } from '../../environments/environment.dynamic';
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
	MoveItemToSectionMessage,
	UpdateItemPositionsMessage,	AddSectionMessage,
	RemoveSectionMessage,
	UpdateMenuOrientationMessage,
	UpdateMenuAvailableImagesMessage,
} from '../webSocketResource';
import {
	Menu,
	MenuItem,
	MenuSection,
	PastaType as AppPastaType,
	PastaSauce as AppPastaSauce,
	MenuPastaTypeEntry,
	MenuPastaSauceEntry,
} from '../Menu/menu';
import { PickListModule } from 'primeng/picklist'; // Import PickListModule
import { ButtonModule } from 'primeng/button'; // For pButton
import { InputTextModule } from 'primeng/inputtext'; // For pInputText
import { InputNumberModule } from 'primeng/inputnumber'; // For pInputNumber
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog'; // For modal dialogs
import { FileUploadModule } from 'primeng/fileupload'; // For file upload
import { GalleriaModule } from 'primeng/galleria'; // For image gallery
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // For confirmation dialogs
import { ToggleButtonModule } from 'primeng/togglebutton'; // For toggle switch
import { SelectModule } from 'primeng/select'; // For select
import { ScrollerModule } from 'primeng/scroller'; // For virtual scrolling
import { OverlayModule } from 'primeng/overlay'; // For overlay components
import { ConfirmationService } from 'primeng/api'; // For confirmation service
import { SavedMenusComponent } from '../saved-menus/saved-menus.component'; // Import SavedMenusComponent
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // For toggle switch
import { MenuSectionsComponent } from '../menu-sections/menu-sections.component'; // Import MenuSectionsComponent

@Component({
	selector: 'app-submit',
	standalone: true,
	imports: [
		FormsModule,
		PickListModule,
		ButtonModule,
		InputTextModule,
		InputNumberModule,
		TextareaModule,
		DialogModule,
		FileUploadModule,
		GalleriaModule,
		ConfirmDialogModule,
		ToggleSwitchModule,
		SelectModule,
		ScrollerModule,
		OverlayModule,
		SavedMenusComponent,
		MenuSectionsComponent,
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
	private apiUrl = environment.apiUrl;

	@ViewChild(SavedMenusComponent) savedMenusComponent!: SavedMenusComponent;

	menuWsConnection: MenuConnection | null = null;
	// For adding new item
	newItemName: string = '';
	newItemPrice: number | null = null;
	newItemSectionId: number | null = null;

	// --- Pasta Types Management ---
	allPastaTypes = signal<AppPastaType[]>([]);
	// For creating new pasta type
	showNewPastaTypeDialog = signal(false);
	newPastaTypeName = signal('');
	newPastaTypeDescription = signal('');
	newPastaTypeBasePrice = signal<number>(8.5);
	newPastaTypePriceNote = signal('');
	newPastaTypeImageUrl = signal('');
	newPastaTypeSelectedFile = signal<File | null>(null);
	uploadingNewPastaTypeImage = signal(false);	// Computed signals for Pasta Type PickList
	pastaTypesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaTypeIds = new Set(
			currentMenu?.pastaTypes.map((pt) => pt.pastaType.id) || []
		);
		return this.allPastaTypes()
			.filter((pt) => !currentMenuPastaTypeIds.has(pt.id))
			.map(type => ({
				...type,
				imageUrl: type.imageUrl ? environment.getFullImageUrl(type.imageUrl) : type.imageUrl
			}));
	});
	pastaTypesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaTypes.map((ptEntry) => ({
			...ptEntry.pastaType,
			imageUrl: ptEntry.pastaType.imageUrl ? environment.getFullImageUrl(ptEntry.pastaType.imageUrl) : ptEntry.pastaType.imageUrl
		})) || [];
	});

	// --- Pasta Sauces Management ---
	allPastaSauces = signal<AppPastaSauce[]>([]); // For creating new pasta sauce
	showNewPastaSauceDialog = signal(false);
	newPastaSauceName = signal('');
	newPastaSauceDescription = signal('');
	newPastaSauceBasePrice = signal<number>(3.5);
	newPastaSaucePriceNote = signal('');
	newPastaSauceImageUrl = signal('');
	newPastaSauceSelectedFile = signal<File | null>(null);
	uploadingNewPastaSauceImage = signal(false);

	// Image management
	showImageManagerDialog = signal(false);

	// Image visibility toggles
	showPastaTypeImages = signal(true);
	showPastaSauceImages = signal(true);
	imageSizeOption = signal<'small' | 'medium' | 'large'>('medium');

	// Image size options
	imageSizeOptions = [
		{ label: 'Piccole (32px)', value: 'small' },
		{ label: 'Medie (48px)', value: 'medium' },
		{ label: 'Grandi (64px)', value: 'large' }
	];

	selectedItemForImages = signal<{
		type: 'pastaType' | 'pastaSauce' | 'menuItem';
		id: number;
		name: string;
		availableImages: string[];
		currentImage: string;
	} | null>(null);
	uploadingImage = signal(false);

	// Computed properties for image manager with full URLs
	selectedItemCurrentImageUrl = computed(() => {
		const item = this.selectedItemForImages();
		return item?.currentImage ? environment.getFullImageUrl(item.currentImage) : '';
	});

	selectedItemAvailableImagesUrls = computed(() => {
		const item = this.selectedItemForImages();
		return item?.availableImages.map(imageUrl => environment.getFullImageUrl(imageUrl)) || [];
	});

	// Computed property for image size class
	imageSizeClass = computed(() => {
		return `size-${this.imageSizeOption()}`;
	});

	// Computed property for current image size label
	getCurrentImageSizeLabel = computed(() => {
		const option = this.imageSizeOptions.find(o => o.value === this.imageSizeOption());
		return option?.label || 'Medie (48px)';
	});

	// --- Background Configuration Management ---
	showBackgroundConfigDialog = signal(false);
	backgroundConfigs = signal<
		{ id: number; page: string; background: string }[]
	>([]);
	selectedPage = signal('');
	newBackgroundValue = signal('');
	backgroundPages = [
		{ label: 'Pasta Page', value: 'pasta' },
		{ label: 'Main Page', value: 'main' },
		{ label: 'Sections Page', value: 'sections' },
		{ label: 'Menu Page', value: 'menu' },
	];
	uploadingBackground = signal(false);

	// --- Menu Configuration Management ---
	showMenuConfigDialog = signal(false);
	selectedOrientation = signal<'vertical' | 'horizontal'>('vertical');
	availableImagesText = signal<string>('');

	// Computed properties for current menu configuration
	currentMenuOrientation = computed(() => {
		const menu = this.menuWsConnection?.resource?.value();
		return menu?.orientation || 'vertical';
	});

	currentMenuAvailableImages = computed(() => {
		const menu = this.menuWsConnection?.resource?.value();
		return menu?.availableImages;
	});

	orientationOptions = [
		{ label: 'Verticale', value: 'vertical' },
		{ label: 'Orizzontale', value: 'horizontal' },
	];
	// Helper method to check if menu item has available images
	hasAvailableImages(item: MenuItem): boolean {
		const menu = this.menuWsConnection?.resource?.value();
		if (!menu?.availableImages) return false;
		try {
			const images = JSON.parse(menu.availableImages);
			return Array.isArray(images) && images.length > 0;
		} catch {
			return false;
		}
	}

	// Helper method to get available images count
	getAvailableImagesCount(item: MenuItem): number {
		const menu = this.menuWsConnection?.resource?.value();
		if (!menu?.availableImages) return 0;
		try {
			const images = JSON.parse(menu.availableImages);
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
	// Handle sections changes - sync with backend
	onSectionsChanged(sections: MenuSection[]) {
		console.log('Sections changed:', sections);

		const currentMenu = this.menuWsConnection?.resource.value();
		if (!currentMenu) return;

		const existingSections = currentMenu.menuSections || [];
		const existingSectionIds = new Set(existingSections.map((s) => s.id));
		const newSectionIds = new Set(sections.map((s) => s.id));

		// Find new sections (sections that exist in the new list but not in existing)
		const newSections = sections.filter((s) => !existingSectionIds.has(s.id));

		// Find removed sections (sections that exist in existing but not in new list)
		const removedSections = existingSections.filter(
			(s) => !newSectionIds.has(s.id)
		);

		// Send new sections to backend
		newSections.forEach((section) => {
			const message: AddSectionMessage = {
				type: 'addSection',
				section: { name: section.name },
			};
			this.menuWsConnection?.sendUpdate(message);
		});

		// Send section removals to backend
		removedSections.forEach((section) => {
			const message: RemoveSectionMessage = {
				type: 'removeSection',
				sectionId: section.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}

	// Handle moving item to different section
	onMoveItemToSection(event: {
		itemId: number;
		sectionId: number | null;
		position?: number;
	}) {
		const message: MoveItemToSectionMessage = {
			type: 'moveItemToSection',
			itemId: event.itemId,
			sectionId: event.sectionId,
			position: event.position,
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	// Handle updating item positions within sections
	onUpdateItemPositions(event: {
		itemUpdates: {
			itemId: number;
			position: number;
			sectionId?: number | null;
		}[];
	}) {
		const message: UpdateItemPositionsMessage = {
			type: 'updateItemPositions',
			itemUpdates: event.itemUpdates,
		};
		this.menuWsConnection?.sendUpdate(message);
	}
	// Computed signals for Pasta Sauce PickList
	pastaSaucesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaSauceIds = new Set(
			currentMenu?.pastaSauces.map((ps) => ps.pastaSauce.id) || []
		);
		return this.allPastaSauces()
			.filter((ps) => !currentMenuPastaSauceIds.has(ps.id))
			.map((ps) => ({
				...ps,
				imageUrl: environment.getFullImageUrl(ps.imageUrl || '')
			}));
	});
	pastaSaucesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaSauces.map((psEntry) => ({
			...psEntry.pastaSauce,
			imageUrl: environment.getFullImageUrl(psEntry.pastaSauce.imageUrl || '')
		})) || [];
	});

	// Computed signal for available sections (for dropdown when adding items)
	availableSections = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const sections = currentMenu?.menuSections || [];
		return [
			{ label: 'No Section', value: null },
			...sections.map((section) => ({
				label: section.name,
				value: section.id,
			})),
		];
	});

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			runInInjectionContext(this.injector, () => {
				this.menuWsConnection = menuConnection(environment.wsUrl);
			});
			this.loadAllPastaTypes();
			this.loadAllPastaSauces();
			this.loadBackgroundConfigs();
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
	}	// --- Menu Item Actions ---
	addItem() {
		// Validation with better error messages
		const errors: string[] = [];

		if (!this.newItemName.trim()) {
			errors.push('Il nome della voce è obbligatorio');
		}

		if (this.newItemPrice === null || this.newItemPrice === undefined) {
			errors.push('Il prezzo è obbligatorio');
		} else if (this.newItemPrice <= 0) {
			errors.push('Il prezzo deve essere maggiore di 0');
		}

		if (errors.length > 0) {
			alert('Errori di validazione:\n' + errors.join('\n'));
			return;
		}

		// Get available sections from current menu
		const currentMenu = this.menuWsConnection?.resource.value();
		const sections = currentMenu?.menuSections || [];

		// Prevent item creation if no sections exist
		if (sections.length === 0) {
			alert(
				'Non è possibile aggiungere voci al menu. Crea prima almeno una sezione.'
			);
			return;
		}

		// Determine section ID: use selected section or default to first section
		let finalSectionId = this.newItemSectionId;
		if (!finalSectionId) {
			// Default to first section if no section is selected
			finalSectionId = sections[0].id;
		}
		const message: AddItemMessage = {
			type: 'addItem',
			item: {
				name: this.newItemName.trim(),
				price: this.newItemPrice!,  // Use non-null assertion since we validated above
				sectionId: finalSectionId,
			},
		};
		this.menuWsConnection?.sendUpdate(message);

		// Clear the form
		this.newItemName = '';
		this.newItemPrice = null;
		this.newItemSectionId = null;
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
		const menu = this.menuWsConnection?.resource?.value();
		let availableImages: string[] = [];
		try {
			availableImages = menu?.availableImages
				? JSON.parse(menu.availableImages)
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
		this.newPastaTypeDescription.set('');
		this.newPastaTypeBasePrice.set(8.5);
		this.newPastaTypePriceNote.set('');
		this.newPastaTypeImageUrl.set('');
		this.newPastaTypeSelectedFile.set(null);
		this.uploadingNewPastaTypeImage.set(false);
		this.showNewPastaTypeDialog.set(true);
	}

	onNewPastaTypeImageSelect(event: any) {
		const file = event.files[0];
		if (file) {
			this.newPastaTypeSelectedFile.set(file);
		}
	}

	saveNewPastaType() {
		if (!this.newPastaTypeName().trim()) {
			alert('Il nome del tipo di pasta è obbligatorio.');
			return;
		}

		// Create pasta type first without image
		this.http
			.post<AppPastaType>(`${this.apiUrl}/pasta-types`, {
				name: this.newPastaTypeName(),
				description: this.newPastaTypeDescription() || null,
				basePrice: this.newPastaTypeBasePrice(),
				priceNote: this.newPastaTypePriceNote() || null,
				imageUrl: '', // Start with empty image
			})
			.subscribe({
				next: (newType) => {
					// If there's a selected file, upload it
					const selectedFile = this.newPastaTypeSelectedFile();
					if (selectedFile) {
						this.uploadingNewPastaTypeImage.set(true);
						const formData = new FormData();
						formData.append('image', selectedFile);

						this.http
							.post<any>(
								`${this.apiUrl}/images/pasta-types/${newType.id}/upload`,
								formData
							)
							.subscribe({
								next: (uploadResponse) => {
									console.log(
										'Image uploaded for new pasta type:',
										uploadResponse
									);
									this.uploadingNewPastaTypeImage.set(false);
									this.loadAllPastaTypes(); // Refresh list
									this.showNewPastaTypeDialog.set(false);
								},
								error: (uploadErr) => {
									console.error(
										'Failed to upload image for pasta type',
										uploadErr
									);
									this.uploadingNewPastaTypeImage.set(false);
									// Still close dialog since pasta type was created successfully
									this.loadAllPastaTypes();
									this.showNewPastaTypeDialog.set(false);
									alert(
										`Tipo di pasta creato ma errore nel caricamento immagine: ${
											uploadErr.error?.error || 'Errore sconosciuto'
										}`
									);
								},
							});
					} else {
						this.loadAllPastaTypes(); // Refresh list
						this.showNewPastaTypeDialog.set(false);
					}
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
		this.newPastaSauceDescription.set('');
		this.newPastaSauceBasePrice.set(3.5);
		this.newPastaSaucePriceNote.set('');
		this.newPastaSauceImageUrl.set('');
		this.newPastaSauceSelectedFile.set(null);
		this.uploadingNewPastaSauceImage.set(false);
		this.showNewPastaSauceDialog.set(true);
	}

	onNewPastaSauceImageSelect(event: any) {
		const file = event.files[0];
		if (file) {
			this.newPastaSauceSelectedFile.set(file);
		}
	}
	saveNewPastaSauce() {
		if (!this.newPastaSauceName().trim()) {
			alert('Il nome del sugo per pasta è obbligatorio.');
			return;
		}

		// Create pasta sauce first without image
		this.http
			.post<AppPastaSauce>(`${this.apiUrl}/pasta-sauces`, {
				name: this.newPastaSauceName(),
				description: this.newPastaSauceDescription() || null,
				basePrice: this.newPastaSauceBasePrice(),
				priceNote: this.newPastaSaucePriceNote() || null,
				imageUrl: '', // Start with empty image
			})
			.subscribe({
				next: (newSauce) => {
					// If there's a selected file, upload it
					const selectedFile = this.newPastaSauceSelectedFile();
					if (selectedFile) {
						this.uploadingNewPastaSauceImage.set(true);
						const formData = new FormData();
						formData.append('image', selectedFile);

						this.http
							.post<any>(
								`${this.apiUrl}/images/pasta-sauces/${newSauce.id}/upload`,
								formData
							)
							.subscribe({
								next: (uploadResponse) => {
									console.log(
										'Image uploaded for new pasta sauce:',
										uploadResponse
									);
									this.uploadingNewPastaSauceImage.set(false);
									this.loadAllPastaSauces(); // Refresh list
									this.showNewPastaSauceDialog.set(false);
								},
								error: (uploadErr) => {
									console.error(
										'Failed to upload image for pasta sauce',
										uploadErr
									);
									this.uploadingNewPastaSauceImage.set(false);
									// Still close dialog since pasta sauce was created successfully
									this.loadAllPastaSauces();
									this.showNewPastaSauceDialog.set(false);
									alert(
										`Sugo per pasta creato ma errore nel caricamento immagine: ${
											uploadErr.error?.error || 'Errore sconosciuto'
										}`
									);
								},
							});
					} else {
						this.loadAllPastaSauces(); // Refresh list
						this.showNewPastaSauceDialog.set(false);
					}
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
	}	switchToImage(imageUrl: string) {
		if (!this.selectedItemForImages()) return;

		const selectedItem = this.selectedItemForImages()!;

		if (selectedItem.type === 'menuItem') {
			// Handle menu items via WebSocket
			const message: UpdateMenuItemImageMessage = {
				type: 'updateMenuItemImage',
				itemId: selectedItem.id,
				imageUrl: imageUrl,
			};
			this.menuWsConnection?.sendUpdate(message);
		} else {
			// Handle pasta types and sauces via HTTP
			const endpoint =
				selectedItem.type === 'pastaType'
					? `${this.apiUrl}/images/pasta-types/${selectedItem.id}/switch`
					: `${this.apiUrl}/images/pasta-sauces/${selectedItem.id}/switch`;

			this.http
				.post<any>(endpoint, { imageUrl })
								.subscribe({
					next: (response) => {
						console.log('Image switched successfully:', response);
						// Refresh the data
						this.loadAllPastaTypes();
						this.loadAllPastaSauces();
						// Update the selected item
						const updatedItem = response.pastaType || response.pastaSauce;
						this.selectedItemForImages.set({
							...selectedItem,
							currentImage: updatedItem.imageUrl || '',
						});
					},
					error: (err) => {
						console.error('Failed to switch image:', err);
						alert(
							`Errore: ${
								err.error?.error || "Impossibile cambiare l'immagine."
							}`
						);
					},
				});
		}
	}

	deleteImage(imageUrl: string) {
		if (!this.selectedItemForImages()) return;

		const selectedItem = this.selectedItemForImages()!;

		if (selectedItem.type === 'menuItem') {
			// Handle menu items via WebSocket
			const message: RemoveImageFromMenuItemMessage = {
				type: 'removeImageFromMenuItem',
				itemId: selectedItem.id,
				imageUrl: imageUrl,
			};
			this.menuWsConnection?.sendUpdate(message);
		} else {
			// Handle pasta types and sauces via HTTP
			const endpoint =
				selectedItem.type === 'pastaType'
					? `${this.apiUrl}/images/pasta-types/${selectedItem.id}/delete`
					: `${this.apiUrl}/images/pasta-sauces/${selectedItem.id}/delete`;

			this.http
				.post<any>(endpoint, { imageUrl })
				.subscribe({
					next: (response) => {
						console.log('Image deleted successfully:', response);
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
		}	}

	// --- Background Configuration Methods ---
	loadBackgroundConfigs() {
		this.http.get<any[]>(`${this.apiUrl}/api/backgrounds`).subscribe({
			next: (configs) => this.backgroundConfigs.set(configs),
			error: (err) => console.error('Failed to load background configs', err),
		});
	}

	openBackgroundConfigDialog() {
		this.selectedPage.set('');
		this.newBackgroundValue.set('');
		this.showBackgroundConfigDialog.set(true);
	}

	saveBackgroundConfig() {
		if (!this.selectedPage() || !this.newBackgroundValue()) {
			alert('Seleziona una pagina e inserisci un valore per lo sfondo.');
			return;
		}
		this.http
			.post(`${this.apiUrl}/api/backgrounds`, {
				page: this.selectedPage(),
				background: this.newBackgroundValue(),
			})
			.subscribe({
				next: () => {
					this.loadBackgroundConfigs();
					this.showBackgroundConfigDialog.set(false);
				},
				error: (err) => {
					console.error('Failed to save background config', err);
					alert('Errore nel salvare la configurazione dello sfondo.');
				},
			});
	}
	deleteBackgroundConfig(page: string) {
		this.http.delete(`${this.apiUrl}/api/backgrounds/page/${page}`).subscribe({
			next: () => this.loadBackgroundConfigs(),
			error: (err) => {
				console.error('Failed to delete background config', err);
				alert('Errore nel eliminare la configurazione dello sfondo.');
			},
		});
	}

	onBackgroundImageUpload(event: any) {
		const file = event.files[0];
		if (!file) return;

		this.uploadingBackground.set(true);
		const formData = new FormData();
		formData.append('background', file);
		this.http
			.post<any>(`${this.apiUrl}/api/backgrounds/upload`, formData)
			.subscribe({
				next: (response) => {
					this.newBackgroundValue.set(response.backgroundUrl);
					this.uploadingBackground.set(false);
				},
				error: (err) => {
					console.error('Failed to upload background', err);
					alert('Errore nel caricare lo sfondo.');
					this.uploadingBackground.set(false);
				},
			});
	}

	// --- Menu Configuration Methods ---
	openMenuConfigDialog() {
		this.selectedOrientation.set(this.currentMenuOrientation());
		this.availableImagesText.set(this.currentMenuAvailableImages() || '');
		this.showMenuConfigDialog.set(true);
	}

	closeMenuConfigDialog() {
		this.showMenuConfigDialog.set(false);
	}
	saveMenuConfiguration() {
		const orientationMessage: UpdateMenuOrientationMessage = {
			type: 'updateMenuOrientation',
			orientation: this.selectedOrientation(),
		};
		this.menuWsConnection?.sendUpdate(orientationMessage);

		const availableImagesMessage: UpdateMenuAvailableImagesMessage = {
			type: 'updateMenuAvailableImages',
			availableImages: this.availableImagesText() || null,
		};
		this.menuWsConnection?.sendUpdate(availableImagesMessage);

		this.showMenuConfigDialog.set(false);
	}
}
