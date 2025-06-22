import { Component, input, computed, effect } from '@angular/core';
import { MenuSection, MenuItem } from '../Menu/menu';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.dynamic';
import { AppImageComponent } from '../shared/components/app-image/app-image.component';

@Component({
	selector: 'app-menu-section-viewer',
	standalone: true,
	imports: [CardModule, PanelModule, CommonModule, AppImageComponent],
	templateUrl: './menu-section-viewer.component.html',
	styleUrls: ['./menu-section-viewer.component.scss'],
})
export class MenuSectionViewerComponent {
	section = input.required<MenuSection>();
	items = input.required<MenuItem[]>();

	constructor() {
		// Debug effect to track when section input changes
		effect(() => {
			const section = this.section();
			console.log('MenuSectionViewerComponent: section updated', section);
		});

		// Debug effect to track when items input changes
		effect(() => {
			const items = this.items();
			console.log('MenuSectionViewerComponent: items updated', items.length, 'items');
		});
	}

	// Convert relative image URLs to full URLs for display
	itemsWithFullImageUrls = computed(() => {
		return this.items().map((item) => ({
			...item,
			imageUrl: item.imageUrl
				? environment.getFullImageUrl(item.imageUrl)
				: undefined,
		}));
	});
	// Get section background color with defaults based on section type
	getSectionBackgroundColor(): string {
		const section = this.section();

		// If section has explicit backgroundColor, use it
		if (section.backgroundColor) {
			return section.backgroundColor;
		}

		// Default section colors based on section type
		const defaultColors: { [key: string]: string } = {
			pasta: '#FFFACD', // Giallino (yellowish)
			sauce: '#FFE4E1', // Rossino (reddish)
			insalatone: '#F0FFF0', // Verdolino (greenish)
			poke: '#FFE4E1', // Rossino (reddish)
			general: '#ffffff', // White
		};

		const defaultColor =
			defaultColors[section.sectionType || 'general'] || '#f8f9fa';
		return defaultColor;
	}

	// Get section text color with default
	getSectionTextColor(): string {
		const section = this.section();
		// Use section-specific text color if set, otherwise default to dark
		return section.textColor || '#2c3e50';
	}
}
