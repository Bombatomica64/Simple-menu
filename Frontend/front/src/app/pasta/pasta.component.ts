import { Component, computed, input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Menu, PastaType as SinglePastaType, PastaSauce as SinglePastaSauce, MenuItem, MenuPastaTypeEntry, MenuPastaSauceEntry, MenuSection } from '../Menu/menu';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { MenuSectionViewerComponent } from '../menu-section-viewer/menu-section-viewer.component';

@Component({
    selector: 'app-pasta',
    standalone: true,
    imports: [CommonModule, CardModule, DividerModule, PanelModule, ButtonModule, MenuSectionViewerComponent],
    templateUrl: './pasta.component.html',
    styleUrls: ['./pasta.component.scss'],
})
export class PastaComponent implements OnInit, OnDestroy {
    menu = input<Menu | null | undefined>();

    // Pagination for sections
    currentSectionPage = signal(0);
    readonly MAX_SECTIONS_PER_PAGE = 4; // Max sections that fit in right column

    ngOnInit() {
        // Add pasta-page class to body for fixed viewport
        document.body.classList.add('pasta-page');
    }

    ngOnDestroy() {
        // Remove pasta-page class when component is destroyed
        document.body.classList.remove('pasta-page');
    }

    pastaTypes = computed<{ name: string; image?: string; price: number; priceNote?: string; description: string; origin: string }[]>(() => {
        const currentMenu = this.menu();
        if (!currentMenu || !currentMenu.pastaTypes) {
            return [];
        }
        return currentMenu.pastaTypes.map((ptEntry: MenuPastaTypeEntry) => ({
            name: ptEntry.pastaType?.name || 'Pasta Sconosciuta',
            image: ptEntry.pastaType?.imageUrl || undefined,
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
        }
        return currentMenu.pastaSauces.map((psEntry: MenuPastaSauceEntry) => ({
            name: psEntry.pastaSauce?.name || 'Sugo Sconosciuto',
            image: psEntry.pastaSauce?.imageUrl || undefined,
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
    }

    // Get items for a specific section
    getItemsForSection(sectionId: number): MenuItem[] {
        const items = this.otherItems();
        return items.filter(item => item.sectionId === sectionId);
    }



    // Price calculation methods
    getMinPastaPrice(): string {
        const prices = this.pastaTypes().map(p => p.price);
        return prices.length > 0 ? Math.min(...prices).toFixed(2) : '8.50';
    }

    getMinSaucePrice(): string {
        const prices = this.pastaSauces().map(s => s.price);
        return prices.length > 0 ? Math.min(...prices).toFixed(2) : '3.50';
    }

    getMinTotalPrice(): string {
        const minPasta = parseFloat(this.getMinPastaPrice());
        const minSauce = parseFloat(this.getMinSaucePrice());
        return (minPasta + minSauce).toFixed(2);
    }
}
