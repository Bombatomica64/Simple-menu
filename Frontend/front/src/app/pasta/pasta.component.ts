import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Menu, PastaType as SinglePastaType, PastaSauce as SinglePastaSauce, MenuItem, MenuPastaTypeEntry, MenuPastaSauceEntry } from '../Menu/menu';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';

@Component({
    selector: 'app-pasta',
    standalone: true,
    imports: [CommonModule, CardModule, DividerModule, PanelModule],
    templateUrl: './pasta.component.html',
    styleUrls: ['./pasta.component.scss'],
})
export class PastaComponent {
    menu = input<Menu | null | undefined>();

    pastaTypes = computed<{ name: string; image?: string }[]>(() => { // Return type for mapped pasta
        const currentMenu = this.menu();
        if (!currentMenu || !currentMenu.pastaTypes) {
            return [];
        }
        return currentMenu.pastaTypes.map((ptEntry: MenuPastaTypeEntry) => ({
            name: ptEntry.pastaType?.name || 'Unknown Pasta',
            image: ptEntry.pastaType?.imageUrl || 'assets/placeholder.png'
        }));
    });

    pastaSauces = computed<{ name: string; image?: string }[]>(() => { // Return type for mapped sauce
        const currentMenu = this.menu();
        if (!currentMenu || !currentMenu.pastaSauces) {
            return [];
        }
        return currentMenu.pastaSauces.map((psEntry: MenuPastaSauceEntry) => ({
            name: psEntry.pastaSauce?.name || 'Unknown Sauce',
            image: psEntry.pastaSauce?.imageUrl || 'assets/placeholder.png'
        }));
    });

    otherItems = computed<MenuItem[]>(() => {
        const currentMenu = this.menu();
        return currentMenu?.menuItems || [];
    });
}
