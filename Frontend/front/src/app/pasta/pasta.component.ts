import { Component, computed, input, OnInit, OnDestroy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { Menu, PastaType as SinglePastaType, PastaSauce as SinglePastaSauce, MenuItem, MenuPastaTypeEntry, MenuPastaSauceEntry, MenuSection } from '../Menu/menu';
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
import { PastaCustomizationComponent, PastaCustomization } from '../pasta-customization/pasta-customization.component';
import { environment } from '../../environments/environment.dynamic';

@Component({
    selector: 'app-pasta',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, DividerModule, PanelModule, ButtonModule, OverlayPanelModule, ToggleButtonModule, SelectButtonModule, ContextMenuModule, MenuSectionViewerComponent, PastaCustomizationComponent],
    templateUrl: './pasta.component.html',
    styleUrls: ['./pasta.component.scss'],
})
export class PastaComponent implements OnInit, OnDestroy {
    menu = input<Menu | null | undefined>();
    private http = inject(HttpClient);

    @ViewChild('contextMenu') contextMenu!: ContextMenu;

    // Context menu data
    selectedItem = signal<any>(null);
    contextMenuItems = signal<PrimeMenuItem[]>([]);

    // Long press handling
    private longPressTimer: any = null;
    private readonly LONG_PRESS_DURATION = 500; // milliseconds// Pagination for sections
    currentSectionPage = signal(0);
    readonly MAX_SECTIONS_PER_PAGE = 4; // Max sections that fit in right column    // Customization settings
    customization = signal<PastaCustomization>({
        showImages: true,
        showDescriptions: true,
        fontSize: 'medium'
    });

    // Computed properties for template access
    showImages = computed(() => this.customization().showImages);
    showDescriptions = computed(() => this.customization().showDescriptions);
    fontSize = computed(() => this.customization().fontSize);    // Load customization from localStorage or API
    private loadCustomization() {
        // First try to load from backend
        this.http.get<PastaCustomization>(`${environment.apiUrl}/api/user/pasta-customization`).subscribe({
            next: (backendCustomization) => {
                this.customization.set(backendCustomization);
                // Also save to localStorage as backup
                localStorage.setItem('pastaCustomization', JSON.stringify(backendCustomization));
            },
            error: (error) => {
                console.warn('Failed to load customization from backend, using localStorage:', error);
                // Fallback to localStorage
                const saved = localStorage.getItem('pastaCustomization');
                if (saved) {
                    try {
                        const parsedCustomization = JSON.parse(saved);
                        this.customization.set(parsedCustomization);
                    } catch (parseError) {
                        console.warn('Failed to parse saved customization:', parseError);
                    }
                }
            }
        });
    }

    // Save customization to localStorage and API
    private saveCustomization(customization: PastaCustomization) {
        localStorage.setItem('pastaCustomization', JSON.stringify(customization));
        this.customization.set(customization);        // Save to backend
        this.http.post(`${environment.apiUrl}/api/user/pasta-customization`, customization).subscribe({
            next: () => console.log('Customization saved to backend'),
            error: (error) => console.warn('Failed to save customization to backend:', error)
        });
    }

    // Handle customization changes from the child component
    onCustomizationChange(newCustomization: PastaCustomization) {
        this.saveCustomization(newCustomization);
    }    ngOnInit() {
        // Add pasta-page class to body for fixed viewport
        document.body.classList.add('pasta-page');
        // Load background configuration
        this.loadBackgroundConfig();
        // Load customization settings
        this.loadCustomization();
    }

    ngOnDestroy() {
        // Remove pasta-page class when component is destroyed
        document.body.classList.remove('pasta-page');
    }    private loadBackgroundConfig() {
        this.http.get<{background: string}>(`${environment.apiUrl}/api/backgrounds/pasta`).subscribe({
            next: (config) => {
                document.documentElement.style.setProperty('--pasta-bg', config.background);
            },
            error: () => {
                // Fallback to default background if API fails
                document.documentElement.style.setProperty('--pasta-bg', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)');
            }
        });
    }

    pastaTypes = computed<{ name: string; image?: string; price: number; priceNote?: string; description: string; origin: string }[]>(() => {
        const currentMenu = this.menu();
        if (!currentMenu || !currentMenu.pastaTypes) {
            return [];
        }        return currentMenu.pastaTypes.map((ptEntry: MenuPastaTypeEntry) => ({
            name: ptEntry.pastaType?.name || 'Pasta Sconosciuta',
            image: ptEntry.pastaType?.imageUrl ? environment.getFullImageUrl(ptEntry.pastaType.imageUrl) : undefined,
            price: ptEntry.pastaType?.basePrice || 8.50,
            priceNote: ptEntry.pastaType?.priceNote,
            description: ptEntry.pastaType?.description || this.getPastaDescription(ptEntry.pastaType?.name || ''),
            origin: 'Italia'
        }));
    });

    pastaSauces = computed<{ name: string; image?: string; price: number; priceNote?: string; description: string; origin: string }[]>(() => {
        const currentMenu = this.menu();
        if (!currentMenu || !currentMenu.pastaSauces) {
            return [];
        }        return currentMenu.pastaSauces.map((psEntry: MenuPastaSauceEntry) => ({
            name: psEntry.pastaSauce?.name || 'Sugo Sconosciuto',
            image: psEntry.pastaSauce?.imageUrl ? environment.getFullImageUrl(psEntry.pastaSauce.imageUrl) : undefined,
            price: psEntry.pastaSauce?.basePrice || 3.50,
            priceNote: psEntry.pastaSauce?.priceNote,
            description: psEntry.pastaSauce?.description || this.getSauceDescription(psEntry.pastaSauce?.name || ''),
            origin: 'Italia'
        }));
    });

    private getPastaDescription(name: string): string {
        const descriptions: { [key: string]: string } = {
            'Spaghetti': 'Pasta lunga e sottile, perfetta per ogni sugo',
            'Penne': 'Pasta corta a tubo, ideale per sughi corposi',
            'Fusilli': 'Pasta a spirale che trattiene perfettamente il condimento',
            'Rigatoni': 'Pasta corta rigata, ottima per sughi ricchi',
            'Tagliatelle': 'Pasta fresca all\'uovo, tradizione emiliana',
            'Gnocchi': 'Deliziosi gnocchi di patate fatti in casa',
            'Pici': 'Pasta tipica toscana, fatta a mano',
            'Trofie': 'Pasta ligure tradizionale, perfetta con il pesto'
        };
        return descriptions[name] || 'Pasta artigianale di alta qualità';
    }

    private getSauceDescription(name: string): string {
        const descriptions: { [key: string]: string } = {
            'Pomodoro': 'Classico sugo di pomodoro fresco e basilico',
            'Carbonara': 'Uova, pecorino, guanciale e pepe nero',
            'Amatriciana': 'Pomodoro, guanciale e pecorino romano',
            'Cacio e Pepe': 'Pecorino romano e pepe nero macinato fresco',
            'Pesto': 'Basilico genovese, pinoli, parmigiano e olio EVO',
            'Arrabbiata': 'Pomodoro piccante con aglio e peperoncino',
            'Aglio e Olio': 'Olio extravergine, aglio e prezzemolo',
            'Bolognese': 'Ragù di carne tradizionale bolognese'
        };
        return descriptions[name] || 'Sugo preparato con ingredienti freschi';
    }

    otherItems = computed<MenuItem[]>(() => {
        const currentMenu = this.menu();
        return currentMenu?.menuItems || [];
    });

    menuSections = computed<MenuSection[]>(() => {
        const currentMenu = this.menu();
        return currentMenu?.menuSections || [];
    });

    // Get sections for current page
    currentPageSections = computed<MenuSection[]>(() => {
        const sections = this.menuSections();
        const startIndex = this.currentSectionPage() * this.MAX_SECTIONS_PER_PAGE;
        return sections.slice(startIndex, startIndex + this.MAX_SECTIONS_PER_PAGE);
    });

    // Check if there are more pages
    hasNextPage = computed<boolean>(() => {
        const sections = this.menuSections();
        return (this.currentSectionPage() + 1) * this.MAX_SECTIONS_PER_PAGE < sections.length;
    });

    hasPrevPage = computed<boolean>(() => {
        return this.currentSectionPage() > 0;
    });

    totalSectionPages = computed<number>(() => {
        const sections = this.menuSections();
        return Math.ceil(sections.length / this.MAX_SECTIONS_PER_PAGE);
    });

    // Navigation methods
    nextSectionPage() {
        if (this.hasNextPage()) {
            this.currentSectionPage.update(page => page + 1);
        }
    }

    prevSectionPage() {
        if (this.hasPrevPage()) {
            this.currentSectionPage.update(page => page - 1);
        }
    }    // Get items for a specific section
    getItemsForSection(sectionId: number): MenuItem[] {
        const items = this.otherItems();
        return items.filter(item => item.sectionId === sectionId);
    }

    // Touch and long press event handlers
    onItemLongPress(event: Event, item: any, type: 'pasta' | 'sauce') {
        event.preventDefault();
        this.showContextMenu(event, item, type);
    }

    onItemTouchStart(event: TouchEvent, item: any, type: 'pasta' | 'sauce') {
        this.clearLongPressTimer();
        this.longPressTimer = setTimeout(() => {
            this.showContextMenu(event, item, type);
        }, this.LONG_PRESS_DURATION);
    }

    onItemTouchEnd() {
        this.clearLongPressTimer();
    }

    onItemTouchMove() {
        this.clearLongPressTimer();
    }

    private clearLongPressTimer() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    private showContextMenu(event: Event, item: any, type: 'pasta' | 'sauce') {
        this.selectedItem.set(item);

        // Create context menu items based on type
        const menuItems: PrimeMenuItem[] = [
            {
                label: `Info su ${item.name}`,
                icon: 'pi pi-info-circle',
                command: () => this.showItemInfo(item, type)
            }
        ];

        this.contextMenuItems.set(menuItems);

        // Show context menu if available
        if (this.contextMenu) {
            this.contextMenu.show(event);
        }
    }

    private showItemInfo(item: any, type: 'pasta' | 'sauce') {
        // You can implement a dialog or toast to show item information
        console.log(`Showing info for ${type}:`, item);
        // For now, just log the information
        // You could add a dialog component to show detailed information
    }
}
