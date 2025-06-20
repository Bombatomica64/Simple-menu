import {
	Component,
	inject,
	signal,
	computed,
	input,
	OnInit,
	OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuSectionViewerComponent } from '../menu-section-viewer/menu-section-viewer.component';
import { MenuItem, MenuSection, Menu } from '../Menu/menu';
import { environment } from '../../environments/environment.dynamic';

@Component({
	selector: 'app-pasta',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		CardModule,
		DividerModule,
		PanelModule,
		ButtonModule,
		OverlayPanelModule,
		ToggleButtonModule,
		SelectButtonModule,
		ContextMenuModule,
		MenuSectionViewerComponent,
	],
	templateUrl: './pasta.component.html',
	styleUrls: ['./pasta.component.scss'],
})
export class PastaComponent implements OnInit, OnDestroy {
	menu = input<Menu | null | undefined>();
	private http = inject(HttpClient);

	// Background configuration
	backgroundConfig = signal<any>(null);
	backgroundStyle = computed(() => {
		const config = this.backgroundConfig();
		if (!config) return {};
		return {
			backgroundImage: config.backgroundImage
				? `url(${config.backgroundImage})`
				: 'none',
			backgroundColor: config.backgroundColor || '#ffffff',
			backgroundSize: config.backgroundSize || 'cover',
			backgroundPosition: config.backgroundPosition || 'center',
			backgroundRepeat: config.backgroundRepeat || 'no-repeat',
		};
	});

	// Section navigation
	currentSectionPage = signal(0);
	readonly MAX_SECTIONS_PER_PAGE = 4; // Max sections that fit in right column    // Global font sizes from menu - these override individual per-type font sizes
	pastaTypeFontSize = computed(() => {
		const currentMenu = this.menu();
		let fontSize = currentMenu?.globalPastaTypeFontSize ?? 1.5;
		const fontSizeStr = fontSize + 'rem';
		return fontSizeStr;
	});

	pastaSauceFontSize = computed(() => {
		const currentMenu = this.menu();
		let fontSize = currentMenu?.globalPastaSauceFontSize ?? 1.5;
		const fontSizeStr = fontSize + 'rem';
		return fontSizeStr;
	}); // Computed properties for template
	menuSections = computed(() => {
		const currentMenu = this.menu();
		const sections = currentMenu?.menuSections ?? [];

		// Convert MenuSection[] to the format expected by template
		return sections.map((section, index) => ({
			id: section.id || index + 1,
			name: section.name,
			position: section.position || index,
			menuId: currentMenu?.id ?? undefined,
			menuItems: section.menuItems || [],
		}));
	});

	totalSectionPages = computed(() => {
		const sections = this.menuSections();
		return Math.ceil(sections.length / this.MAX_SECTIONS_PER_PAGE);
	});

	currentPageSections = computed(() => {
		const sections = this.menuSections();
		const startIndex = this.currentSectionPage() * this.MAX_SECTIONS_PER_PAGE;
		return sections.slice(startIndex, startIndex + this.MAX_SECTIONS_PER_PAGE);
	});

	hasPrevPage = computed(() => {
		return this.currentSectionPage() > 0;
	});

	hasNextPage = computed(() => {
		return this.currentSectionPage() < this.totalSectionPages() - 1;
	}); // Computed properties for pasta data
	pastaTypes = computed(() => {
		const currentMenu = this.menu();
		if (!currentMenu?.pastaTypes) return [];

		return currentMenu.pastaTypes.map((entry) => entry.pastaType);
	});

	pastaSauces = computed(() => {
		const currentMenu = this.menu();
		if (!currentMenu?.pastaSauces) return [];

		return currentMenu.pastaSauces.map((entry) => entry.pastaSauce);
	});

	// Display settings
	showImages = computed(() => {
		// Use global settings from menu, default to true
		const currentMenu = this.menu();
		return currentMenu?.globalPastaTypeShowImage ?? true;
	});

	showDescriptions = computed(() => {
		// Use global settings from menu, default to true
		const currentMenu = this.menu();
		return currentMenu?.globalPastaTypeShowDescription ?? true;
	});

	// Color management based on new centralized color model
	getPastaTypesSectionBackgroundColor() {
		const currentMenu = this.menu();
		const color = currentMenu?.globalPastaTypeBackgroundColor || '#FFFACD';
		return color;
	}

	getPastaTypesSectionTextColor() {
		// Always use dark text for pasta types section
		return '#2c3e50';
	}

	getPastaSaucesSectionBackgroundColor() {
		const currentMenu = this.menu();
		const color = currentMenu?.globalPastaSauceBackgroundColor || '#FFE4E1';
		return color;
	}

	getPastaSaucesSectionTextColor() {
		// Always use dark text for pasta sauces section
		return '#2c3e50';
	}
	getSectionBackgroundColor(section: any) {
		// Default section colors based on section type
		const defaultColors: { [key: string]: string } = {
			pasta: '#FFFACD', // Giallino (yellowish)
			sauce: '#FFE4E1', // Rossino (reddish)
			insalatone: '#F0FFF0', // Verdolino (greenish)
			poke: '#FFE4E1', // Rossino (reddish)
			general: '#ffffff', // White
		};

		// Use section-specific background color if set, otherwise use default for section type
		return (
			section.backgroundColor || defaultColors[section.sectionType] || '#ffffff'
		);
	}

	getSectionTextColor(section: any) {
		// Use section-specific text color if set, otherwise default to dark
		return section.textColor || '#2c3e50';
	}

	ngOnInit() {
		// Add pasta-page class to body for fixed viewport
		document.body.classList.add('pasta-page');
		// Load background configuration
		this.loadBackgroundConfig();
	}

	ngOnDestroy() {
		// Remove pasta-page class when component is destroyed
		document.body.classList.remove('pasta-page');
	}

	private loadBackgroundConfig() {
		this.http
			.get<any>(`${environment.apiUrl}/api/backgrounds/pasta`)
			.subscribe({
				next: (config) => {
					this.backgroundConfig.set(config);
					console.log('✅ Background config loaded:', config);
				},
				error: (error) => {
					console.log('⚠️ No background config found, using default cream background');
					// Set default cream background config
					const defaultConfig = {
						backgroundColor: '#FDF5E6', // Cream color
						backgroundImage: null,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
					};
					this.backgroundConfig.set(defaultConfig);
				},
			});
	} // Section navigation methods
	get visibleSections() {
		const currentMenu = this.menu();
		if (!currentMenu?.menuSections) return [];

		const sections = currentMenu.menuSections;
		const startIndex = this.currentSectionPage() * this.MAX_SECTIONS_PER_PAGE;
		return sections.slice(startIndex, startIndex + this.MAX_SECTIONS_PER_PAGE);
	}

	get hasNextSectionPage(): boolean {
		const currentMenu = this.menu();
		if (!currentMenu?.menuSections) return false;

		const sections = currentMenu.menuSections;
		return (
			(this.currentSectionPage() + 1) * this.MAX_SECTIONS_PER_PAGE <
			sections.length
		);
	}

	get hasPreviousSectionPage(): boolean {
		return this.currentSectionPage() > 0;
	}

	nextSectionPage() {
		if (this.hasNextSectionPage) {
			this.currentSectionPage.update((page: number) => page + 1);
		}
	}

	previousSectionPage() {
		if (this.hasPrevPage()) {
			this.currentSectionPage.update((page: number) => page - 1);
		}
	}

	// Add alias method for template compatibility
	prevSectionPage() {
		this.previousSectionPage();
	} // Get items for a specific section (for MenuSectionViewerComponent)
	getItemsForSection(sectionId: number | undefined): MenuItem[] {
		const currentMenu = this.menu();
		if (!currentMenu?.menuSections || !sectionId) return [];

		const section = currentMenu.menuSections.find((s) => s.id === sectionId);
		if (!section?.menuItems) return [];

		return section.menuItems;
	}

	// Get pasta type font size style
	getPastaTypeFontStyle(pastaType: any): any {
		return {
			fontSize: `${this.pastaTypeFontSize()}%`,
		};
	}

	// Get pasta sauce font size style
	getPastaSauceFontStyle(sauce: any): any {
		return {
			fontSize: `${this.pastaSauceFontSize()}%`,
		};
	}

	// Context menu functionality
	pastaContextMenuItems: PrimeMenuItem[] = [
		{
			label: 'Mostra Dettagli',
			icon: 'pi pi-info-circle',
			command: () => {
				console.log('Show pasta details');
			},
		},
	];

	onPastaRightClick(event: Event, pastaType: any, contextMenu: ContextMenu) {
		contextMenu.show(event);
		event.preventDefault();
	}

	// Touch and context menu event handlers
	private touchStartTime = 0;
	private touchMoved = false;

	onItemTouchStart(event: TouchEvent, item: any, type: string) {
		this.touchStartTime = Date.now();
		this.touchMoved = false;
	}

	onItemTouchEnd() {
		const touchDuration = Date.now() - this.touchStartTime;
		if (!this.touchMoved && touchDuration > 500) {
			// Long press detected
			console.log('Long press detected');
		}
	}

	onItemTouchMove() {
		this.touchMoved = true;
	}

	onItemLongPress(event: Event, item: any, type: string) {
		event.preventDefault();
		console.log('Item long press:', item, type);
	}

	// Logo display methods
	getLogoSize(): string {
		const currentMenu = this.menu();
		if (!currentMenu?.logo) return '60px';

		const size = currentMenu.logo.size;
		switch (size) {
			case 'small':
				return '40px';
			case 'medium':
				return '60px';
			case 'large':
				return '80px';
			case 'extra-large':
				return '100px';
			default:
				return '60px';
		}
	}
}
