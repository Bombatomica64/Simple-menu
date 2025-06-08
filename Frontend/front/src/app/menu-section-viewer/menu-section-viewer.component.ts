import { Component, input, computed } from '@angular/core';
import { MenuSection, MenuItem } from '../Menu/menu';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.dynamic';

@Component({
	selector: 'app-menu-section-viewer',
	standalone: true,
	imports: [CardModule, PanelModule, CommonModule],
	templateUrl: './menu-section-viewer.component.html',
	styleUrls: ['./menu-section-viewer.component.scss'],
})
export class MenuSectionViewerComponent {
	section = input.required<MenuSection>();
	items = input.required<MenuItem[]>();

	// Convert relative image URLs to full URLs for display
	itemsWithFullImageUrls = computed(() => {
		return this.items().map((item) => ({
			...item,
			imageUrl: item.imageUrl
				? environment.getFullImageUrl(item.imageUrl)
				: undefined,
		}));
	});
}
