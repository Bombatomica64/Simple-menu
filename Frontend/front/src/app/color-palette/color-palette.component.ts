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

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MenuConnection } from '../webSocketResource';
import { SectionOperations } from '../services/menu-components.service';
import { MenuSection } from '../Menu/menu';

// Simplified types for color management
export type ColorableItemType = 'section' | 'pastaTypes' | 'pastaSauces';

export interface ColorableItem {
	id?: number;
	name: string;
	backgroundColor?: string;
}

@Component({
	selector: 'app-color-palette',
	standalone: true,
	imports: [CommonModule, FormsModule, ButtonModule, DialogModule, ToastModule],
	templateUrl: './color-palette.component.html',
	styleUrls: ['./color-palette.component.scss'],
	providers: [MessageService],
})
export class ColorPaletteComponent {
	// Angular 19+ input signals
	menuConnection = input<MenuConnection | null>(null);
	sectionOperations = input<SectionOperations | null>(null);

	// Output signals for events
	sectionColorUpdateRequested = output<{
		sectionId: number;
		backgroundColor: string;
	}>();
	pastaTypesColorUpdateRequested = output<{ backgroundColor: string }>();
	pastaSaucesColorUpdateRequested = output<{ backgroundColor: string }>();

	private messageService = inject(MessageService);

	// Signals
	loading = signal(false);
	showColorDialog = signal(false);
	selectedItem = signal<ColorableItem | null>(null);
	selectedItemType = signal<ColorableItemType>('section');
	selectedColor = signal('#ffffff');

	// Data computed from menu connection
	sections = computed(() => {
		const menu = this.menuConnection()?.resource.value();
		const sections = menu?.menuSections || [];
		console.log('🎨 Color palette sections loaded:', sections);
		return sections;
	});

	// Pasta types and sauces global background colors - Default colors per requirements
	// Pasta: Giallino (yellowish), Sughi: Rossino (reddish), Insalatone: Verdolino (greenish), Pokè: Rossino (reddish)
	pastaTypesBackgroundColor = signal('#FFFACD'); // Lemon chiffon (giallino)
	pastaSaucesBackgroundColor = signal('#FFE4E1'); // Misty rose (rossino)

	// Computed properties
	selectedItemName = computed(() => {
		return this.selectedItem()?.name || '';
	});

	// Methods
	openColorPicker(item: ColorableItem, type: ColorableItemType) {
		this.selectedItem.set(item);
		this.selectedItemType.set(type);

		// Set current color
		let currentColor = '#ffffff';
		if (type === 'section') {
			currentColor = item.backgroundColor || '#ffffff';
		} else if (type === 'pastaTypes') {
			currentColor = this.pastaTypesBackgroundColor();
		} else if (type === 'pastaSauces') {
			currentColor = this.pastaSaucesBackgroundColor();
		}

		this.selectedColor.set(currentColor);
		this.showColorDialog.set(true);
	}

	onColorChange(event: Event) {
		const input = event.target as HTMLInputElement;
		this.selectedColor.set(input.value);
	}

	onHexChange(event: Event) {
		const input = event.target as HTMLInputElement;
		let value = input.value;

		// Ensure it starts with #
		if (!value.startsWith('#')) {
			value = '#' + value;
		}

		// Validate hex color format
		if (/^#[0-9A-F]{6}$/i.test(value)) {
			this.selectedColor.set(value);
		}
	}

	saveColor() {
		const item = this.selectedItem();
		const type = this.selectedItemType();
		const color = this.selectedColor();

		if (!item) return;

		console.log('🎨 Color palette saving color:', { item, type, color });

		if (type === 'section' && item.id) {
			console.log('🎨 Emitting section color update:', {
				sectionId: item.id,
				backgroundColor: color,
			});
			console.log('🎨 About to emit section color update event...');
			this.sectionColorUpdateRequested.emit({
				sectionId: item.id,
				backgroundColor: color,
			});
			console.log('🎨 Section color update event emitted successfully');
		} else if (type === 'pastaTypes') {
			console.log('🎨 Emitting pasta types color update:', {
				backgroundColor: color,
			});
			this.pastaTypesColorUpdateRequested.emit({
				backgroundColor: color,
			});
			this.pastaTypesBackgroundColor.set(color);
		} else if (type === 'pastaSauces') {
			console.log('🎨 Emitting pasta sauces color update:', {
				backgroundColor: color,
			});
			this.pastaSaucesColorUpdateRequested.emit({
				backgroundColor: color,
			});
			this.pastaSaucesBackgroundColor.set(color);
		}

		this.closeDialog();

		this.messageService.add({
			severity: 'success',
			summary: 'Successo',
			detail: `Colore aggiornato per ${item.name}`,
		});
	}

	removeColor() {
		const item = this.selectedItem();
		const type = this.selectedItemType();

		if (!item) return;

		if (type === 'section' && item.id) {
			this.sectionColorUpdateRequested.emit({
				sectionId: item.id,
				backgroundColor: '#ffffff',
			});
		} else if (type === 'pastaTypes') {
			this.pastaTypesColorUpdateRequested.emit({
				backgroundColor: '#ffffff',
			});
			this.pastaTypesBackgroundColor.set('#ffffff');
		} else if (type === 'pastaSauces') {
			this.pastaSaucesColorUpdateRequested.emit({
				backgroundColor: '#ffffff',
			});
			this.pastaSaucesBackgroundColor.set('#ffffff');
		}

		this.closeDialog();

		this.messageService.add({
			severity: 'info',
			summary: 'Colore Rimosso',
			detail: `Colore rimosso per ${item.name}`,
		});
	}

	closeDialog() {
		this.showColorDialog.set(false);
		this.selectedItem.set(null);
		this.selectedColor.set('#ffffff');
	}
}
