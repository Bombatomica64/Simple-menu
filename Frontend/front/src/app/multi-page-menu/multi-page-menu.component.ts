import { Component, computed, input, signal, effect, OnDestroy } from '@angular/core';
import { Menu, MenuItem, MenuSection, MenuPastaTypeEntry, MenuPastaSauceEntry } from '../Menu/menu';
import { MenuSectionViewerComponent } from '../menu-section-viewer/menu-section-viewer.component';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';

interface MenuPage {
  pastaTypes: { name: string; image?: string }[];
  pastaSauces: { name: string; image?: string }[];
  sections: MenuSection[];
  itemsWithoutSections: MenuItem[];
}

@Component({
  selector: 'app-multi-page-menu',
  standalone: true,
  imports: [MenuSectionViewerComponent, CardModule, DividerModule, PanelModule, CommonModule],
  templateUrl: './multi-page-menu.component.html',
  styleUrls: ['./multi-page-menu.component.scss'],
})
export class MultiPageMenuComponent implements OnDestroy {
  menu = input<Menu | null | undefined>();
  
  // Pagination state
  currentPageIndex = signal(0);
  isTransitioning = signal(false);
  private pageTimer: any = null;
  private readonly PAGE_TRANSITION_TIME = 20000; // 20 seconds
  private readonly MAX_SECTIONS_PER_PAGE = 4;

  constructor() {
    // Auto-advance pages when there are multiple pages
    effect(() => {
      const pages = this.menuPages();
      if (pages.length > 1) {
        this.startPageTimer();
      } else {
        this.stopPageTimer();
      }
    });
  }

  ngOnDestroy() {
    this.stopPageTimer();
  }

  // Computed signals for menu processing
  pastaTypes = computed<{ name: string; image?: string }[]>(() => {
    const currentMenu = this.menu();
    if (!currentMenu || !currentMenu.pastaTypes) {
      return [];
    }
    return currentMenu.pastaTypes.map((ptEntry: MenuPastaTypeEntry) => ({
      name: ptEntry.pastaType?.name || 'Unknown Pasta',
      image: ptEntry.pastaType?.imageUrl || 'assets/placeholder.png'
    }));
  });

  pastaSauces = computed<{ name: string; image?: string }[]>(() => {
    const currentMenu = this.menu();
    if (!currentMenu || !currentMenu.pastaSauces) {
      return [];
    }
    return currentMenu.pastaSauces.map((psEntry: MenuPastaSauceEntry) => ({
      name: psEntry.pastaSauce?.name || 'Unknown Sauce',
      image: psEntry.pastaSauce?.imageUrl || 'assets/placeholder.png'
    }));
  });

  menuItems = computed<MenuItem[]>(() => {
    const currentMenu = this.menu();
    return currentMenu?.menuItems || [];
  });

  menuSections = computed<MenuSection[]>(() => {
    const currentMenu = this.menu();
    return currentMenu?.menuSections || [];
  });

  // Computed for menu items without sections
  menuItemsWithoutSections = computed(() => {
    const items = this.menuItems();
    return items.filter(item => !item.sectionId);
  });

  // Create pages with pasta always first and max 3-4 sections per page
  menuPages = computed<MenuPage[]>(() => {
    const pastaTypes = this.pastaTypes();
    const pastaSauces = this.pastaSauces();
    const sections = this.menuSections();
    const itemsWithoutSections = this.menuItemsWithoutSections();

    if (sections.length === 0 && pastaTypes.length === 0 && pastaSauces.length === 0 && itemsWithoutSections.length === 0) {
      return [];
    }

    const pages: MenuPage[] = [];
    
    // First page always includes pasta if available
    const firstPage: MenuPage = {
      pastaTypes: pastaTypes,
      pastaSauces: pastaSauces,
      sections: [],
      itemsWithoutSections: []
    };

    // Add first few sections to first page
    const sectionsForFirstPage = sections.slice(0, this.MAX_SECTIONS_PER_PAGE);
    firstPage.sections = sectionsForFirstPage;
    
    // If there are items without sections and space on first page
    if (itemsWithoutSections.length > 0 && firstPage.sections.length < this.MAX_SECTIONS_PER_PAGE) {
      firstPage.itemsWithoutSections = itemsWithoutSections;
    }

    pages.push(firstPage);

    // Create additional pages for remaining sections
    const remainingSections = sections.slice(this.MAX_SECTIONS_PER_PAGE);
    for (let i = 0; i < remainingSections.length; i += this.MAX_SECTIONS_PER_PAGE) {
      const sectionsForPage = remainingSections.slice(i, i + this.MAX_SECTIONS_PER_PAGE);
      const page: MenuPage = {
        pastaTypes: [],
        pastaSauces: [],
        sections: sectionsForPage,
        itemsWithoutSections: []
      };

      // If this is the last page and we haven't placed items without sections yet
      if (i + this.MAX_SECTIONS_PER_PAGE >= remainingSections.length && 
          itemsWithoutSections.length > 0 && 
          firstPage.itemsWithoutSections.length === 0) {
        page.itemsWithoutSections = itemsWithoutSections;
      }

      pages.push(page);
    }

    // If we only have items without sections and no pasta/sections, create a page for them
    if (pages.length === 1 && firstPage.sections.length === 0 && 
        firstPage.pastaTypes.length === 0 && firstPage.pastaSauces.length === 0 &&
        itemsWithoutSections.length > 0) {
      firstPage.itemsWithoutSections = itemsWithoutSections;
    }

    return pages;
  });

  // Current page
  currentPage = computed(() => {
    const pages = this.menuPages();
    const index = this.currentPageIndex();
    return pages[index] || null;
  });

  // Page navigation
  totalPages = computed(() => this.menuPages().length);
  showPageIndicator = computed(() => this.totalPages() > 1);

  // Simple auto-transition without visual progress bar
  private startPageTimer() {
    this.stopPageTimer();
    
    this.pageTimer = setTimeout(() => {
      this.nextPage();
    }, this.PAGE_TRANSITION_TIME);
  }

  private stopPageTimer() {
    if (this.pageTimer) {
      clearTimeout(this.pageTimer);
      this.pageTimer = null;
    }
  }

  nextPage() {
    if (this.isTransitioning()) return;
    
    const totalPages = this.totalPages();
    if (totalPages <= 1) return;
    
    this.isTransitioning.set(true);
    this.stopPageTimer();
    
    setTimeout(() => {
      const currentIndex = this.currentPageIndex();
      const nextIndex = (currentIndex + 1) % totalPages;
      this.currentPageIndex.set(nextIndex);
      this.isTransitioning.set(false);
      
      if (totalPages > 1) {
        this.startPageTimer();
      }
    }, 300);
  }

  previousPage() {
    if (this.isTransitioning()) return;
    
    const totalPages = this.totalPages();
    if (totalPages <= 1) return;
    
    this.isTransitioning.set(true);
    this.stopPageTimer();
    
    setTimeout(() => {
      const currentIndex = this.currentPageIndex();
      const prevIndex = currentIndex === 0 ? totalPages - 1 : currentIndex - 1;
      this.currentPageIndex.set(prevIndex);
      this.isTransitioning.set(false);
      
      if (totalPages > 1) {
        this.startPageTimer();
      }
    }, 300);
  }

  goToPage(pageIndex: number) {
    if (this.isTransitioning() || pageIndex === this.currentPageIndex()) return;
    
    this.isTransitioning.set(true);
    this.stopPageTimer();
    
    setTimeout(() => {
      this.currentPageIndex.set(pageIndex);
      this.isTransitioning.set(false);
      
      if (this.totalPages() > 1) {
        this.startPageTimer();
      }
    }, 300);
  }

  pageTransitionTime() {
    return this.PAGE_TRANSITION_TIME;
  }

  // Method to get items for a specific section
  getItemsForSection(sectionId: number): MenuItem[] {
    const items = this.menuItems();
    return items.filter(item => item.sectionId === sectionId);
  }
}
