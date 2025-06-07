import { Component, input, output, model, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MenuItem } from '../Menu/menu';
import { environment } from '../../environments/environment.dynamic';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToggleSwitchModule
  ],
  templateUrl: './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss']
})
export class MenuItemCardComponent {  // Input signals
  item = input.required<MenuItem>();
  sectionId = input<number>();
  hasAvailableImages = input<boolean>(false);

  // Model signal for two-way binding
  showImage = model<boolean>();

  // Output signals
  removeItem = output<number>();
  toggleShowImage = output<{itemId: number, showImage: boolean}>();
  openImageManager = output<MenuItem>();
  moveItem = output<MenuItem>();  // Computed values
  currentItem = computed(() => this.item());
  imageUrl = computed(() => environment.getFullImageUrl(this.currentItem().imageUrl || ''));
  itemName = computed(() => this.currentItem().name);
  itemPrice = computed(() => this.currentItem().price);

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
