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
	effect,
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
	CreatePastaTypeMessage,
	DeletePastaTypeMessage,
	CreatePastaSauceMessage,
	DeletePastaSauceMessage,
	MoveItemToSectionMessage,
	UpdateItemPositionsMessage,
	AddSectionMessage,
	RemoveSectionMessage,
	UpdateGlobalPastaDisplaySettingsMessage,
	GlobalPastaDisplaySettings,
	GetAvailableLogosMessage,
	SetMenuLogoMessage,
	UpdateLogoSettingsMessage,
	RemoveLogoMessage,
	DeleteLogoMessage,
	UpdateSectionColorsMessage,
	UpdatePastaTypesGlobalColorMessage,
	UpdatePastaSaucesGlobalColorMessage,
	UpdateBackgroundConfigMessage,
	DeleteBackgroundConfigMessage,
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
import { PastaDisplayManagementComponent } from './pasta-display-management/pasta-display-management.component'; // Import PastaDisplayManagementComponent
import { PastaSauceDisplayDialogComponent } from './pasta-sauce-display-dialog/pasta-sauce-display-dialog.component'; // Import PastaSauceDisplayDialogComponent
import { PastaTypeDisplayDialogComponent } from './pasta-type-display-dialog/pasta-type-display-dialog.component'; // Import PastaTypeDisplayDialogComponent
import { LogoUploadComponent } from '../logo-upload/logo-upload.component'; // Import LogoUploadComponent
import { ColorPaletteComponent } from '../color-palette/color-palette.component'; // Import ColorPaletteComponent
import { BackgroundPaletteComponent } from '../background-palette/background-palette.component'; // Import BackgroundPaletteComponent
import { SlideshowManagementComponent } from '../slideshow-management/slideshow-management.component'; // Import SlideshowManagementComponent
import {
	SectionOperations,
	LogoOperations,
} from '../services/menu-components.service'; // Import operation interfaces

// Define pasta sauce event interface for handling display settings
export interface PastaSauceEvent {
	type: 'openDisplaySettings' | 'delete' | 'edit' | 'deleteImage';
	pastaSauce: AppPastaSauce;
}

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
		PastaDisplayManagementComponent,
		PastaSauceDisplayDialogComponent,
		PastaTypeDisplayDialogComponent,
		LogoUploadComponent,
		ColorPaletteComponent,
		BackgroundPaletteComponent,
		SlideshowManagementComponent,
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
	@ViewChild(PastaDisplayManagementComponent)
	pastaDisplayManagement!: PastaDisplayManagementComponent;

	menuWsConnection: MenuConnection | null = null;

	// Operations for child components
	sectionOperations: SectionOperations = {
		addSection: (name: string, header?: string) =>
			this.addSection(name, header),
		removeSection: (sectionId: number) => this.removeSection(sectionId),
		updateSectionColors: (
			sectionId: number,
			backgroundColor: string,
			textColor: string
		) => this.updateSectionColors(sectionId, backgroundColor, textColor),
		resetSectionColors: (sectionId: number) =>
			this.resetSectionColors(sectionId),
	};

	logoOperations: LogoOperations = {
		uploadLogo: (file: File, name: string, position: string, size: string) =>
			this.uploadLogo(file, name, position, size),
		activateLogo: (logoId: number) => this.activateLogo(logoId),
		deleteLogo: (logoId: number) => this.deleteLogo(logoId),
		updateLogoSettings: (
			logoId: number,
			position: string,
			size: string,
			opacity: number
		) => this.updateLogoSettings(logoId, position, size, opacity),
	};
	// For adding new item
	newItemName: string = '';
	newItemDescription: string = '';
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
	uploadingNewPastaTypeImage = signal(false); // Computed signals for Pasta Type PickList
	pastaTypesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaTypeIds = new Set(
			currentMenu?.pastaTypes.map((pt) => pt.pastaType.id) || []
		);
		return this.allPastaTypes()
			.filter((pt) => !currentMenuPastaTypeIds.has(pt.id))
			.map((type) => ({
				...type,
				imageUrl: type.imageUrl
					? environment.getFullImageUrl(type.imageUrl)
					: type.imageUrl,
			}));
	});
	pastaTypesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return (
			currentMenu?.pastaTypes.map((ptEntry) => ({
				...ptEntry.pastaType,
				imageUrl: ptEntry.pastaType.imageUrl
					? environment.getFullImageUrl(ptEntry.pastaType.imageUrl)
					: ptEntry.pastaType.imageUrl,
			})) || []
		);
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
	// Display settings dialogs
	showPastaTypeDisplayDialog = signal(false);
	showPastaSauceDisplayDialog = signal(false);
	selectedPastaTypeForDisplay = signal<AppPastaType | null>(null);
	selectedPastaSauceForDisplay = signal<AppPastaSauce | null>(null);

	// Display settings
	pastaSauceDisplaySettings = signal<{
		showImages: boolean;
		showDescriptions: boolean;
		imageSize: 'small' | 'medium' | 'large';
		fontSize: 'small' | 'medium' | 'large';
	}>({
		showImages: true,
		showDescriptions: true,
		imageSize: 'medium',
		fontSize: 'medium',
	});

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
		{ label: 'Grandi (64px)', value: 'large' },
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
		return item?.currentImage
			? environment.getFullImageUrl(item.currentImage)
			: '';
	});

	selectedItemAvailableImagesUrls = computed(() => {
		const item = this.selectedItemForImages();
		return (
			item?.availableImages.map((imageUrl) =>
				environment.getFullImageUrl(imageUrl)
			) || []
		);
	});

	// Computed property for image size class
	imageSizeClass = computed(() => {
		return `size-${this.imageSizeOption()}`;
	});

	// Computed property for current image size label
	getCurrentImageSizeLabel = computed(() => {
		const option = this.imageSizeOptions.find(
			(o) => o.value === this.imageSizeOption()
		);
		return option?.label || 'Medie (48px)';
	});
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
				imageUrl: environment.getFullImageUrl(ps.imageUrl || ''),
			}));
	});
	pastaSaucesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return (
			currentMenu?.pastaSauces.map((psEntry) => ({
				...psEntry.pastaSauce,
				imageUrl: environment.getFullImageUrl(
					psEntry.pastaSauce.imageUrl || ''
				),
			})) || []
		);
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
				effect(() => {
					const lastMessage = this.menuWsConnection?.responseMessages();
					if (!lastMessage) return;

					if (lastMessage.type === 'pastaTypeCreated') {
						// Handle successful pasta type creation
						console.log(
							'Pasta type created successfully:',
							lastMessage.pastaType
						);
						this.loadAllPastaTypes(); // Refresh the list
						this.showNewPastaTypeDialog.set(false);
						this.resetNewPastaTypeForm();
					} else if (lastMessage.type === 'pastaSauceCreated') {
						// Handle successful pasta sauce creation
						console.log(
							'Pasta sauce created successfully:',
							lastMessage.pastaSauce
						);
						this.loadAllPastaSauces(); // Refresh the list
						this.showNewPastaSauceDialog.set(false);
						this.resetNewPastaSauceForm();
					} else if (lastMessage.type === 'error') {
						// Handle errors from WebSocket operations
						console.error('WebSocket error:', lastMessage.message);
						this.uploadingNewPastaTypeImage.set(false);
						this.uploadingNewPastaSauceImage.set(false);
						alert(`Errore: ${lastMessage.message}`);
					}
				});
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
	} // --- Menu Item Actions ---
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
				price: this.newItemPrice!, // Use non-null assertion since we validated above
				description: this.newItemDescription.trim() || undefined, // Only include if not empty
				sectionId: finalSectionId,
			},
		};
		this.menuWsConnection?.sendUpdate(message);

		// Clear the form
		this.newItemName = '';
		this.newItemDescription = '';
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

		this.uploadingNewPastaTypeImage.set(true);
		const selectedFile = this.newPastaTypeSelectedFile();

		// If there's an image file, upload it first, then create the pasta type
		if (selectedFile) {
			const formData = new FormData();
			formData.append('image', selectedFile);

			this.http.post<any>(`${this.apiUrl}/images/upload`, formData).subscribe({
				next: (response) => {
					console.log('Image uploaded successfully:', response);
					this.createPastaTypeWithImage(response.imageUrl);
				},
				error: (err) => {
					console.error('Failed to upload image:', err);
					alert(
						`Errore caricamento immagine: ${
							err.error?.error || 'Errore sconosciuto'
						}`
					);
					this.uploadingNewPastaTypeImage.set(false);
				},
			});
		} else {
			// Create pasta type without image
			this.createPastaTypeWithImage('');
		}
	}
	private createPastaTypeWithImage(imageUrl: string) {
		const message: CreatePastaTypeMessage = {
			type: 'createPastaType',
			pastaType: {
				name: this.newPastaTypeName(),
				description: this.newPastaTypeDescription() || undefined,
				basePrice: this.newPastaTypeBasePrice(),
				priceNote: this.newPastaTypePriceNote() || undefined,
				imageUrl: imageUrl,
			},
		};
		this.menuWsConnection?.sendUpdate(message);

		// Don't close immediately - wait for WebSocket response
		// Clear form and close dialog will happen in the WebSocket response handler
	}

	private resetNewPastaTypeForm() {
		this.newPastaTypeName.set('');
		this.newPastaTypeDescription.set('');
		this.newPastaTypeBasePrice.set(8.5);
		this.newPastaTypePriceNote.set('');
		this.newPastaTypeImageUrl.set('');
		this.newPastaTypeSelectedFile.set(null);
		this.uploadingNewPastaTypeImage.set(false);
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

		this.uploadingNewPastaSauceImage.set(true);
		const selectedFile = this.newPastaSauceSelectedFile();

		// If there's an image file, upload it first, then create the pasta sauce
		if (selectedFile) {
			const formData = new FormData();
			formData.append('image', selectedFile);

			this.http.post<any>(`${this.apiUrl}/images/upload`, formData).subscribe({
				next: (response) => {
					console.log('Image uploaded successfully:', response);
					this.createPastaSauceWithImage(response.imageUrl);
				},
				error: (err) => {
					console.error('Failed to upload image:', err);
					alert(
						`Errore caricamento immagine: ${
							err.error?.error || 'Errore sconosciuto'
						}`
					);
					this.uploadingNewPastaSauceImage.set(false);
				},
			});
		} else {
			// Create pasta sauce without image
			this.createPastaSauceWithImage('');
		}
	}
	private createPastaSauceWithImage(imageUrl: string) {
		const message: CreatePastaSauceMessage = {
			type: 'createPastaSauce',
			pastaSauce: {
				name: this.newPastaSauceName(),
				description: this.newPastaSauceDescription() || undefined,
				basePrice: this.newPastaSauceBasePrice(),
				priceNote: this.newPastaSaucePriceNote() || undefined,
				imageUrl: imageUrl,
			},
		};
		this.menuWsConnection?.sendUpdate(message);

		// Don't close immediately - wait for WebSocket response
		// Clear form and close dialog will happen in the WebSocket response handler
	}

	private resetNewPastaSauceForm() {
		this.newPastaSauceName.set('');
		this.newPastaSauceDescription.set('');
		this.newPastaSauceBasePrice.set(3.5);
		this.newPastaSaucePriceNote.set('');
		this.newPastaSauceImageUrl.set('');
		this.newPastaSauceSelectedFile.set(null);
		this.uploadingNewPastaSauceImage.set(false);
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

			this.http.post<any>(endpoint, { imageUrl }).subscribe({
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
						`Errore: ${err.error?.error || "Impossibile cambiare l'immagine."}`
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

			this.http.post<any>(endpoint, { imageUrl }).subscribe({
				next: (response) => {
					console.log('Image deleted successfully:', response);
					// Refresh the data
					this.loadAllPastaTypes();
					this.loadAllPastaSauces();
				},
				error: (error) => {
					console.error('Error deleting image:', error);
				},
			});
		}
	}
	// Pasta Sauce Display Settings Methods
	onPastaSauceEvent(event: PastaSauceEvent) {
		switch (event.type) {
			case 'openDisplaySettings':
				this.selectedPastaSauceForDisplay.set(event.pastaSauce);
				this.showPastaSauceDisplayDialog.set(true);
				break;
			case 'delete':
				this.deletePastaSauce(event.pastaSauce);
				break;
			case 'edit':
				this.openEditDialog(event.pastaSauce);
				break;
			case 'deleteImage':
				this.deletePastaSauceImage(event.pastaSauce);
				break;
		}
	}
	deletePastaSauce(pastaSauce: AppPastaSauce) {
		// Implement pasta sauce deletion via WebSocket
		if (
			confirm(`Sei sicuro di voler eliminare il sugo "${pastaSauce.name}"?`)
		) {
			const message: DeletePastaSauceMessage = {
				type: 'deletePastaSauce',
				pastaSauceId: pastaSauce.id,
			};
			this.menuWsConnection?.sendUpdate(message);
			// Refresh the list after deletion
			this.loadAllPastaSauces();
		}
	}

	openEditDialog(pastaSauce: AppPastaSauce) {
		// For now, just log - you can implement edit dialog later
		console.log('Opening edit dialog for pasta sauce:', pastaSauce);
		// TODO: Implement pasta sauce edit dialog
	}

	shouldShowPastaSauceImages(): boolean {
		const settings = this.pastaSauceDisplaySettings();
		return settings ? settings.showImages : true;
	}

	shouldShowPastaSauceDescriptions(): boolean {
		const settings = this.pastaSauceDisplaySettings();
		return settings ? settings.showDescriptions : true;
	}

	getPastaSauceImageSizeClass(): string {
		const settings = this.pastaSauceDisplaySettings();
		if (!settings) return 'medium-image';

		switch (settings.imageSize) {
			case 'small':
				return 'small-image';
			case 'large':
				return 'large-image';
			default:
				return 'medium-image';
		}
	}

	getPastaSauceFontSizeStyle(): any {
		const settings = this.pastaSauceDisplaySettings();
		if (!settings) return {};

		switch (settings.fontSize) {
			case 'small':
				return { 'font-size': '0.875rem' };
			case 'large':
				return { 'font-size': '1.25rem' };
			default:
				return { 'font-size': '1rem' };
		}
	}
	deletePastaSauceImage(pastaSauce: AppPastaSauce) {
		if (pastaSauce.id && pastaSauce.imageUrl) {
			this.http
				.post<any>(
					`${this.apiUrl}/images/pasta-sauces/${pastaSauce.id}/delete`,
					{
						imageUrl: pastaSauce.imageUrl,
					}
				)
				.subscribe({
					next: (response: any) => {
						console.log('Pasta sauce image deleted successfully:', response);
						// Refresh the data
						this.loadAllPastaSauces();
					},
					error: (error: any) => {
						console.error('Error deleting pasta sauce image:', error);
					},
				});
		}
	}
	openPastaSauceDisplaySettings() {
		this.showPastaSauceDisplayDialog.set(true);
	}

	openPastaTypeDisplaySettings(pastaType: AppPastaType) {
		this.selectedPastaTypeForDisplay.set(pastaType);
		this.showPastaTypeDisplayDialog.set(true);
	}
	onPastaSauceDisplaySettingsChange(settings: any) {
		this.pastaSauceDisplaySettings.set(settings);
		// Save settings to localStorage or backend as needed
		localStorage.setItem('pastaSauceDisplaySettings', JSON.stringify(settings));
	}

	onPastaTypeDisplaySettingsChange(settings: any) {
		// Update pasta type display settings when they change
		// You can implement pasta type specific settings here
		localStorage.setItem('pastaTypeDisplaySettings', JSON.stringify(settings));
	}

	// Pasta Type Display Settings Methods (similar to pasta sauce)
	shouldShowPastaTypeImages(): boolean {
		// For now, return true. You can add pasta type display settings later
		return true;
	}

	shouldShowPastaTypeDescriptions(): boolean {
		// For now, return true. You can add pasta type display settings later
		return true;
	}

	getPastaTypeImageSizeClass(): string {
		// For now, return medium. You can add pasta type display settings later
		return 'medium-image';
	}

	getPastaTypeFontSizeStyle(): any {
		// For now, return default font size. You can add pasta type display settings later
		return { 'font-size': '1rem' };
	}
	// Handle pasta display settings update from pasta-display-management component
	onPastaDisplaySettingsUpdate(settings: GlobalPastaDisplaySettings) {
		console.log('📡 Received pasta display settings update:', settings);

		const message: UpdateGlobalPastaDisplaySettingsMessage = {
			type: 'updateGlobalPastaDisplaySettings',
			settings: settings,
		};

		this.menuWsConnection?.sendUpdate(message);
	} // Section operations implementation
	addSection(name: string, header?: string) {
		if (!this.menuWsConnection) return;

		const message: AddSectionMessage = {
			type: 'addSection',
			section: { name },
		};
		this.menuWsConnection.sendUpdate(message);
	}

	removeSection(sectionId: number) {
		if (!this.menuWsConnection) return;

		const message: RemoveSectionMessage = {
			type: 'removeSection',
			sectionId,
		};
		this.menuWsConnection.sendUpdate(message);
	}

	updateSectionColors(
		sectionId: number,
		backgroundColor: string,
		textColor: string
	) {
		if (!this.menuWsConnection) return;

		// For now, use a generic message - we'll need to add proper WebSocket message types later
		this.menuWsConnection.sendUpdate({
			type: 'updateSectionColors',
			sectionId,
			backgroundColor,
			textColor,
		} as any);
	}

	resetSectionColors(sectionId: number) {
		if (!this.menuWsConnection) return;

		// For now, use a generic message - we'll need to add proper WebSocket message types later
		this.menuWsConnection.sendUpdate({
			type: 'resetSectionColors',
			sectionId,
		} as any);
	}
	// Pasta type color management
	updatePastaTypeColors(
		pastaTypeId: number,
		backgroundColor: string,
		textColor: string
	) {
		if (this.menuWsConnection) {
			this.menuWsConnection.sendUpdate({
				type: 'updatePastaTypeColors',
				pastaTypeId,
				backgroundColor,
				textColor,
			} as any);
		}
	}

	resetPastaTypeColors(pastaTypeId: number) {
		if (this.menuWsConnection) {
			this.menuWsConnection.sendUpdate({
				type: 'resetPastaTypeColors',
				pastaTypeId,
			} as any);
		}
	}

	// Pasta sauce color management
	updatePastaSauceColors(
		pastaSauceId: number,
		backgroundColor: string,
		textColor: string
	) {
		if (this.menuWsConnection) {
			this.menuWsConnection.sendUpdate({
				type: 'updatePastaSauceColors',
				pastaSauceId,
				backgroundColor,
				textColor,
			} as any);
		}
	}

	resetPastaSauceColors(pastaSauceId: number) {
		if (this.menuWsConnection) {
			this.menuWsConnection.sendUpdate({
				type: 'resetPastaSauceColors',
				pastaSauceId,
			} as any);
		}
	}
	// Logo operations implementation
	uploadLogo(file: File, name: string, position: string, size: string) {
		const formData = new FormData();
		formData.append('logo', file);
		formData.append('name', name);
		formData.append('position', position);
		formData.append('size', size);
		formData.append('opacity', '1.0');

		// Use HTTP request for file upload
		fetch(environment.apiUrl + '/logos/upload', {
			method: 'POST',
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					console.log('Logo uploaded successfully:', data.logo);
					// After successful upload, activate the logo via WebSocket
					if (data.logo?.id) {
						this.activateLogo(data.logo.id);
					}
				} else {
					console.error('Logo upload failed:', data.message);
				}
			})
			.catch((error) => {
				console.error('Logo upload error:', error);
			});
	}

	activateLogo(logoId: number) {
		const message: SetMenuLogoMessage = {
			type: 'setMenuLogo',
			logoId: logoId,
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	deleteLogo(logoId: number) {
		const message: DeleteLogoMessage = {
			type: 'deleteLogo',
			logoId: logoId,
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	updateLogoSettings(
		logoId: number,
		position: string,
		size: string,
		opacity: number
	) {
		const message: UpdateLogoSettingsMessage = {
			type: 'updateLogoSettings',
			logoSettings: {
				position,
				size,
				opacity,
			},
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	removeCurrentLogo() {
		const message: RemoveLogoMessage = {
			type: 'removeLogo',
		};
		this.menuWsConnection?.sendUpdate(message);
	}

	requestAvailableLogos() {
		const message: GetAvailableLogosMessage = {
			type: 'getAvailableLogos',
		};
		this.menuWsConnection?.sendUpdate(message);
	} // Event handlers for child components
	handleSectionColorUpdate(event: {
		sectionId: number;
		backgroundColor: string;
	}) {
		console.log('🎨 Submit component received section color update:', event);

		if (!this.menuWsConnection || !this.menuWsConnection.connected()) {
			console.error('❌ WebSocket connection not available');
			return;
		}

		const message: UpdateSectionColorsMessage = {
			type: 'updateSectionColors',
			sectionId: event.sectionId,
			backgroundColor: event.backgroundColor,
			textColor: '#000000', // Default text color
		};

		console.log('🎨 Sending WebSocket message:', message);
		this.menuWsConnection.sendUpdate(message);
		console.log('🎨 WebSocket message sent successfully');
	}

	handlePastaTypesColorUpdate(event: { backgroundColor: string }) {
		if (!this.menuWsConnection || !this.menuWsConnection.connected()) {
			console.error('WebSocket connection not available');
			return;
		}

		const message: UpdatePastaTypesGlobalColorMessage = {
			type: 'updatePastaTypesColor',
			backgroundColor: event.backgroundColor,
		};

		this.menuWsConnection.sendUpdate(message);
	}

	handlePastaSaucesColorUpdate(event: { backgroundColor: string }) {
		if (!this.menuWsConnection || !this.menuWsConnection.connected()) {
			console.error('WebSocket connection not available');
			return;
		}

		const message: UpdatePastaSaucesGlobalColorMessage = {
			type: 'updatePastaSaucesColor',
			backgroundColor: event.backgroundColor,
		};

		this.menuWsConnection.sendUpdate(message);
	}

	handleSectionColorReset(event: { itemId: number; itemType: string }) {
		switch (event.itemType) {
			case 'section':
				this.resetSectionColors(event.itemId);
				break;
			case 'pastaType':
				this.resetPastaTypeColors(event.itemId);
				break;
			case 'pastaSauce':
				this.resetPastaSauceColors(event.itemId);
				break;
		}
	}

	handleLogoUpload(event: {
		file: File;
		name: string;
		position: string;
		size: string;
	}) {
		this.uploadLogo(event.file, event.name, event.position, event.size);
	}

	handleLogoActivation(event: { logoId: number }) {
		this.activateLogo(event.logoId);
	}

	handleLogoDeletion(event: { logoId: number }) {
		this.deleteLogo(event.logoId);
	}
	handleLogoSettingsUpdate(event: {
		logoId: number;
		position: string;
		size: string;
		opacity: number;
	}) {
		this.updateLogoSettings(
			event.logoId,
			event.position,
			event.size,
			event.opacity
		);
	} // Background configuration handlers
	handleBackgroundConfigUpdate(config: any) {
		console.log('Background config updated:', config);
		console.log('Config properties:', Object.keys(config || {}));

		// Validate the config object
		if (!config) {
			console.error('Background config is null or undefined');
			return;
		}

		if (!config.value && !config.background) {
			console.error('Background config missing value/background property');
			return;
		}

		// Send the simplified background update through WebSocket to update the live menu
		if (this.menuWsConnection) {
			const message = {
				type: 'updateBackgroundConfig' as const,
				backgroundType: config.type || 'color',
				value: config.value || config.background,
			};
			console.log('Sending simplified background update message:', message);
			this.menuWsConnection.sendUpdate(message);
		}
	}
	handleBackgroundConfigDelete() {
		console.log('Background config deleted');

		// Send the simplified background deletion through WebSocket to update the live menu
		if (this.menuWsConnection) {
			const message = {
				type: 'deleteBackgroundConfig' as const,
			};
			this.menuWsConnection.sendUpdate(message);
		}
	}
}
