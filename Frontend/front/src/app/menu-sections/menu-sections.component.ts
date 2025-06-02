import { Component, input, output, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MenuItem, MenuSection } from '../Menu/menu';

// Extended type for drag and drop to ensure menuItems is always present
interface MenuSectionWithItems extends MenuSection {
  menuItems: MenuItem[];
}
import { MenuItemCardComponent } from '../menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-menu-sections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    DragDropModule,
    MenuItemCardComponent
  ],
  templateUrl: './menu-sections.component.html',
  styleUrls: ['./menu-sections.component.scss']
})
export class MenuSectionsComponent implements OnInit {
  // Input signals
  menuItems = input<MenuItem[]>([]);

  // Output signals
  removeItem = output<number>();
  toggleShowImage = output<{itemId: number, showImage: boolean}>();
  openImageManager = output<MenuItem>();
  sectionsChanged = output<MenuSection[]>();
  moveItemToSection = output<{itemId: number, sectionId: number | null, position?: number}>();
  updateItemPositions = output<{itemUpdates: {itemId: number, position: number, sectionId?: number | null}[]}>();

  // Sections management
  sections = signal<MenuSection[]>([]);
  showAddSectionDialog = signal(false);
  showManageSectionsDialog = signal(false);
  showMoveItemDialog = signal(false);
  newSectionName = signal('');
  selectedItemForMove = signal<MenuItem | null>(null);

  // Available sections for dropdown (computed)
  availableSectionsForMove = computed(() => {
    return this.sections().map(section => ({
      label: section.name,
      value: section.id
    }));
  });

  // Computed values
  sectionsWithItems = computed((): MenuSectionWithItems[] => {
    const currentSections = this.sections();
    const currentMenuItems = this.menuItems();

    if (currentSections.length === 0) {
      // If no sections, create a default section with all items
      return [{
        id: 1,
        name: 'Menu Principale',
        position: 1,
        menuItems: currentMenuItems
      }];
    }

    // Distribute items to sections
    return currentSections.map(section => ({
      ...section,
      menuItems: currentMenuItems.filter(item =>
        item.sectionId === section.id || (!item.sectionId && section.id === 1)
      )
    })).sort((a, b) => a.position - b.position);
  });

  constructor() {
    // Effect to initialize sections when menu items change
    effect(() => {
      const items = this.menuItems();
      if (items.length > 0 && this.sections().length === 0) {
        this.initializeDefaultSection();
      }
    });
  }

  ngOnInit() {
    // Initialize with a default section if no sections exist
    if (this.sections().length === 0) {
      this.initializeDefaultSection();
    }
  }

  private initializeDefaultSection() {
    const defaultSection: MenuSection = {
      id: 1,
      name: 'Menu Principale',
      position: 1,
      menuItems: []
    };
    this.sections.set([defaultSection]);
  }

  // Section management methods
  openAddSectionDialog() {
    this.newSectionName.set('');
    this.showAddSectionDialog.set(true);
  }

  addSection() {
    const name = this.newSectionName().trim();
    if (!name) return;

    const currentSections = this.sections();
    const maxPosition = Math.max(0, ...currentSections.map(s => s.position));
    const newSection: MenuSection = {
      id: Date.now(), // Simple ID generation
      name,
      position: maxPosition + 1,
      menuItems: []
    };

    this.sections.update(sections => [...sections, newSection]);
    this.showAddSectionDialog.set(false);
    this.sectionsChanged.emit(this.sections());
  }

  removeSection(sectionId: number) {
    const currentSections = this.sections();
    if (currentSections.length <= 1) return; // Don't allow removing the last section

    const sectionToRemove = currentSections.find(s => s.id === sectionId);
    if (!sectionToRemove) return;

    // Move items from removed section to the first remaining section
    const remainingSections = currentSections.filter(s => s.id !== sectionId);
    if (remainingSections.length > 0 && sectionToRemove.menuItems && sectionToRemove.menuItems.length > 0) {
      if (!remainingSections[0].menuItems) {
        remainingSections[0].menuItems = [];
      }
      remainingSections[0].menuItems.push(...sectionToRemove.menuItems);
    }

    this.sections.set(remainingSections);
    this.sectionsChanged.emit(this.sections());
  }

  openManageSectionsDialog() {
    this.showManageSectionsDialog.set(true);
  }

  // Ordering methods
  moveSectionUp(sectionId: number) {
    const currentSections = [...this.sections()];
    const sectionIndex = currentSections.findIndex(s => s.id === sectionId);

    if (sectionIndex > 0) {
      // Swap with previous section
      [currentSections[sectionIndex - 1], currentSections[sectionIndex]] =
      [currentSections[sectionIndex], currentSections[sectionIndex - 1]];

      // Update position values
      currentSections.forEach((section, index) => {
        section.position = index + 1;
      });

      this.sections.set(currentSections);
      this.sectionsChanged.emit(this.sections());
    }
  }

  moveSectionDown(sectionId: number) {
    const currentSections = [...this.sections()];
    const sectionIndex = currentSections.findIndex(s => s.id === sectionId);

    if (sectionIndex < currentSections.length - 1) {
      // Swap with next section
      [currentSections[sectionIndex], currentSections[sectionIndex + 1]] =
      [currentSections[sectionIndex + 1], currentSections[sectionIndex]];

      // Update position values
      currentSections.forEach((section, index) => {
        section.position = index + 1;
      });

      this.sections.set(currentSections);
      this.sectionsChanged.emit(this.sections());
    }
  }

  // Event handlers for dialogs
  onSectionNameInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newSectionName.set(target.value);
  }

  // Event handlers for menu items
  onRemoveItem(itemId: number) {
    this.removeItem.emit(itemId);
  }

  onToggleShowImage(data: {itemId: number, showImage: boolean}) {
    this.toggleShowImage.emit(data);
  }

  onOpenImageManager(item: MenuItem) {
    this.openImageManager.emit(item);
  }

  // Helper methods
  getSectionById(id: number): MenuSection | undefined {
    return this.sections().find(s => s.id === id);
  }

  getSortedSections(): MenuSection[] {
    return [...this.sections()].sort((a, b) => a.position - b.position);
  }

  // Drag & Drop Methods
  onSectionDrop(event: CdkDragDrop<MenuSectionWithItems[]>) {
    if (event.previousIndex !== event.currentIndex) {
      const sections = [...this.sectionsWithItems()];
      moveItemInArray(sections, event.previousIndex, event.currentIndex);

      // Update positions
      sections.forEach((section, index) => {
        section.position = index + 1;
      });

      // Update the base sections signal
      const updatedBaseSections = sections.map(s => ({
        id: s.id,
        name: s.name,
        position: s.position,
        menuId: s.menuId
      } as MenuSection));

      this.sections.set(updatedBaseSections);
      this.sectionsChanged.emit(updatedBaseSections);
    }
  }

  onItemDrop(event: CdkDragDrop<any>, targetSectionId: number) {
    const draggedItemId = parseInt(event.item.element.nativeElement.getAttribute('data-item-id') || '0');
    const draggedItem = this.menuItems().find(item => item.id === draggedItemId);

    if (!draggedItem) return;

    if (event.previousContainer === event.container) {
      // Reordering within the same section
      const sectionItems = [...event.container.data] as MenuItem[];
      moveItemInArray(sectionItems, event.previousIndex, event.currentIndex);

      // Update positions for items in this section
      const itemUpdates = sectionItems.map((item, index) => ({
        itemId: item.id,
        position: index + 1,
        sectionId: targetSectionId
      }));

      this.updateItemPositions.emit({ itemUpdates });
    } else {
      // Moving between sections
      const previousSectionId = parseInt(event.previousContainer.id.replace('section-', ''));

      // Move item to target section at specific position
      this.moveItemToSection.emit({
        itemId: draggedItemId,
        sectionId: targetSectionId,
        position: event.currentIndex + 1
      });
    }
  }

  // Manual item movement methods
  openMoveItemDialog(item: MenuItem) {
    this.selectedItemForMove.set(item);
    this.showMoveItemDialog.set(true);
  }

  moveItemManually(targetSectionId: number) {
    const item = this.selectedItemForMove();
    if (!item) return;

    this.moveItemToSection.emit({
      itemId: item.id,
      sectionId: targetSectionId,
      position: undefined // Let backend determine position
    });

    this.showMoveItemDialog.set(false);
    this.selectedItemForMove.set(null);
  }

  // Get drag drop connection IDs for sections
  getSectionConnectedTo(): string[] {
    return this.sections().map(section => `section-${section.id}`);
  }
}
