import { Component, input, output, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MenuItem } from '../Menu/menu';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToggleButtonModule
  ],
  templateUrl: './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss']
})
export class MenuItemCardComponent {
  // Input signals
  item = input.required<MenuItem>();
  sectionId = input<number>();

  // Model signal for two-way binding
  showImage = model<boolean>();

  // Output signals
  removeItem = output<number>();
  toggleShowImage = output<{itemId: number, showImage: boolean}>();
  openImageManager = output<MenuItem>();
  moveItem = output<MenuItem>();

  // Computed values
  currentItem = computed(() => this.item());
  imageUrl = computed(() => this.currentItem().imageUrl);
  itemName = computed(() => this.currentItem().name);
  itemPrice = computed(() => this.currentItem().price);
  hasAvailableImages = computed(() => {
    const item = this.currentItem();
    return item.availableImages && item.availableImages.length > 0;
  });

  // Computed property to get the effective showImage value
  effectiveShowImage = computed(() => this.showImage() ?? this.currentItem().showImage ?? false);

  onRemoveItem() {
    this.removeItem.emit(this.currentItem().id);
  }

  onToggleShowImage(showImage: boolean) {
    this.showImage.set(showImage);
    this.toggleShowImage.emit({ itemId: this.currentItem().id, showImage });
  }

  onOpenImageManager() {
    this.openImageManager.emit(this.currentItem());
  }

  onMoveItem() {
    this.moveItem.emit(this.currentItem());
  }
}
