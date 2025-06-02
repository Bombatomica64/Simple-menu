import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	signal,
	computed,
	effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
	MenuConnection,
	SaveCurrentMenuMessage,
	LoadSavedMenuMessage,
	DeleteSavedMenuMessage,
	GetAllSavedMenusMessage,
	SavedMenu,
	MenuResponseMessage,
} from '../webSocketResource';

@Component({
	selector: 'app-saved-menus',
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		TableModule,
		ConfirmDialogModule,
		ToastModule,
	],
	providers: [ConfirmationService, MessageService],
	templateUrl: './saved-menus.component.html',
	styleUrl: './saved-menus.component.scss',
})
export class SavedMenusComponent implements OnInit, OnDestroy {
	@Input() menuConnection!: MenuConnection;

	savedMenus = signal<SavedMenu[]>([]);
	showSaveDialog = signal(false);
	newMenuName = signal('');
	loading = signal(false);
	constructor(
		private confirmationService: ConfirmationService,
		private messageService: MessageService
	) {
		// Watch for WebSocket response messages
		effect(() => {
			const response = this.menuConnection?.responseMessages();
			if (response) {
				this.handleResponseMessage(response);
			}
		});

		// Watch for connection state changes and load saved menus when connected
		effect(() => {
			if (this.menuConnection?.connected()) {
				this.loadSavedMenus();
			}
		});
	}
	ngOnInit() {
		// Connection watching is handled by effects
	}

	ngOnDestroy() {
		// Clean up if needed
	}

	loadSavedMenus() {
		if (!this.menuConnection) return;

		const message: GetAllSavedMenusMessage = {
			type: 'getAllSavedMenus',
		};
		this.menuConnection.sendUpdate(message);
	}

	openSaveDialog() {
		this.newMenuName.set('');
		this.showSaveDialog.set(true);
	}

	saveCurrentMenu() {
		const name = this.newMenuName().trim();
		if (!name) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Nome Richiesto',
				detail: 'Inserisci un nome per il menu salvato.',
			});
			return;
		}

		this.loading.set(true);
		const message: SaveCurrentMenuMessage = {
			type: 'saveCurrentMenu',
			name: name,
		};
		this.menuConnection.sendUpdate(message);
	}
	loadSavedMenu(savedMenu: SavedMenu) {
		this.confirmationService.confirm({
			message: `Sei sicuro di voler caricare il menu "${savedMenu.name}"? Il menu attuale verrà sostituito.`,
			header: 'Carica Menu Salvato',
			icon: 'pi pi-question-circle',
			accept: () => {
				const message: LoadSavedMenuMessage = {
					type: 'loadSavedMenu',
					savedMenuId: savedMenu.id,
				};
				this.menuConnection.sendUpdate(message);
				this.messageService.add({
					severity: 'success',
					summary: 'Menu Caricato',
					detail: `Menu "${savedMenu.name}" caricato con successo.`,
				});
			},
		});
	}
	deleteSavedMenu(savedMenu: SavedMenu) {
		this.confirmationService.confirm({
			message: `Sei sicuro di voler eliminare il menu salvato "${savedMenu.name}"? Questa azione non può essere annullata.`,
			header: 'Elimina Menu Salvato',
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
				const message: DeleteSavedMenuMessage = {
					type: 'deleteSavedMenu',
					savedMenuId: savedMenu.id,
				};
				this.menuConnection.sendUpdate(message);
			},
		});
	}

	private handleResponseMessage(response: MenuResponseMessage) {
		switch (response.type) {
			case 'menuSaved':
				this.loading.set(false);
				this.showSaveDialog.set(false);
				this.messageService.add({
					severity: 'success',
					summary: 'Menu Salvato',
					detail: `Menu "${response.savedMenu.name}" salvato con successo.`,
				});
				this.loadSavedMenus();
				break;

			case 'menuDeleted':
				this.messageService.add({
					severity: 'success',
					summary: 'Menu Eliminato',
					detail: 'Menu salvato eliminato con successo.',
				});
				this.loadSavedMenus();
				break;

			case 'savedMenusList':
				this.savedMenus.set(response.savedMenus);
				break;

			case 'error':
				this.loading.set(false);
				this.messageService.add({
					severity: 'error',
					summary: 'Errore',
					detail: response.message,
				});
				break;
		}
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString('it-IT');
	}
}
