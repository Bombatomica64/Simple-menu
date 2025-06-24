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
import { MenuItem, MenuSection, Menu } from '../Menu/menu';
import { AppImageComponent } from '../shared/components/app-image/app-image.component';

@Component({
	selector: 'app-pasta',
	standalone: true,	imports: [
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
		AppImageComponent,
	],
	templateUrl: './pasta.component.html',
	styleUrls: ['./pasta.component.scss'],
})
export class PastaComponent implements OnInit, OnDestroy {
	menu = input<Menu | null | undefined>();

	// Global font sizes from menu - these override individual per-type font sizes
	pastaTypeFontSize = computed(() => {
		const currentMenu = this.menu();
		const fontSize = currentMenu?.globalPastaTypeFontSize ?? 1.5;
		return fontSize + 'rem';
	});
	pastaSauceFontSize = computed(() => {
		const currentMenu = this.menu();
		const fontSize = currentMenu?.globalPastaSauceFontSize ?? 1.5;
		return fontSize + 'rem';
	});

	// Computed properties for pasta data
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
			Pokè: '#FFE4E1', // Rossino (reddish)
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
	}	ngOnDestroy() {
		// Remove pasta-page class when component is destroyed
		document.body.classList.remove('pasta-page');
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
	getLogoSize(): string {		const currentMenu = this.menu();
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
