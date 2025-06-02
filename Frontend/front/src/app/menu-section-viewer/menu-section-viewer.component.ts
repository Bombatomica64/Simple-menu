import { Component, input } from '@angular/core';
import { MenuSection, MenuItem } from '../Menu/menu';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { CommonModule } from '@angular/common';

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
}
