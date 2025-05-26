import {
	Component,
	inject,
	OnInit,
	PLATFORM_ID,
	signal,
	computed,
	Injector,
	runInInjectionContext,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Import HttpClient & HttpClientModule
import {
	menuConnection,
	MenuConnection,
	MenuUpdateMessage,
	AddPastaTypeMessage,
	RemovePastaTypeMessage,
	AddPastaSauceMessage,
	RemovePastaSauceMessage,
} from '../webSocketResource';
import {
	Menu,
	MenuItem,
	PastaType as AppPastaType,
	PastaSauce as AppPastaSauce,
	MenuPastaTypeEntry,
	MenuPastaSauceEntry,
} from '../Menu/menu';
import { PickListModule } from 'primeng/picklist'; // Import PickListModule
import { ButtonModule } from 'primeng/button'; // For pButton
import { InputTextModule } from 'primeng/inputtext'; // For pInputText
import { DialogModule } from 'primeng/dialog'; // For modal dialogs

@Component({
	selector: 'app-submit',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		PickListModule,
		ButtonModule,
		InputTextModule,
		DialogModule,
	],
	templateUrl: './submit.component.html',
	styleUrls: ['./submit.component.scss'],
})
export class SubmitComponent implements OnInit {
	private platformId = inject(PLATFORM_ID);
	private http = inject(HttpClient);
	private injector = inject(Injector);
	private apiUrl = 'http://localhost:3000';
	menuWsConnection!: MenuConnection;

	// For adding new item
	newItemName: string = '';
	newItemPrice: number | null = null;
	itemIdToRemove: number | null = null;

	// --- Pasta Types Management ---
	allPastaTypes = signal<AppPastaType[]>([]);
	// For creating new pasta type
	showNewPastaTypeDialog = signal(false);
	newPastaTypeName = signal('');
	newPastaTypeImageUrl = signal('');

	// Computed signals for Pasta Type PickList
	pastaTypesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaTypeIds = new Set(
			currentMenu?.pastaTypes.map((pt) => pt.pastaType.id) || []
		);
		return this.allPastaTypes().filter(
			(pt) => !currentMenuPastaTypeIds.has(pt.id)
		);
	});
	pastaTypesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaTypes.map((ptEntry) => ptEntry.pastaType) || [];
	});

	// --- Pasta Sauces Management ---
	allPastaSauces = signal<AppPastaSauce[]>([]);
	// For creating new pasta sauce
	showNewPastaSauceDialog = signal(false);
	newPastaSauceName = signal('');
	newPastaSauceImageUrl = signal('');

	// Computed signals for Pasta Sauce PickList
	pastaSaucesSource = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		const currentMenuPastaSauceIds = new Set(
			currentMenu?.pastaSauces.map((ps) => ps.pastaSauce.id) || []
		);
		return this.allPastaSauces().filter(
			(ps) => !currentMenuPastaSauceIds.has(ps.id)
		);
	});
	pastaSaucesTarget = computed(() => {
		const currentMenu = this.menuWsConnection?.resource.value();
		return currentMenu?.pastaSauces.map((psEntry) => psEntry.pastaSauce) || [];
	});

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			runInInjectionContext(this.injector, () => {
				this.menuWsConnection = menuConnection(
					'ws://localhost:3000/menu-updates'
				);
			});
			this.loadAllPastaTypes();
			this.loadAllPastaSauces();
		}
	}

	// --- Loaders ---
	loadAllPastaTypes() {
		this.http.get<AppPastaType[]>(`${this.apiUrl}/pasta-types`).subscribe({
			next: (types) => this.allPastaTypes.set(types),
			error: (err) => console.error('Failed to load pasta types', err),
		});
	}

	loadAllPastaSauces() {
		this.http.get<AppPastaSauce[]>(`${this.apiUrl}/pasta-sauces`).subscribe({
			next: (sauces) => this.allPastaSauces.set(sauces),
			error: (err) => console.error('Failed to load pasta sauces', err),
		});
	}

	// --- Menu Item Actions ---
	addItem() {
		/* ... existing logic ... */
	}
	removeItem() {
		/* ... existing logic ... */
	}

	// --- Pasta Type PickList Actions ---
	onPastaTypeMoveToTarget(event: { items: AppPastaType[] }) {
		event.items.forEach((pastaType) => {
			const message: AddPastaTypeMessage = {
				type: 'addPastaTypeToMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}
	onPastaTypeMoveToSource(event: { items: AppPastaType[] }) {
		event.items.forEach((pastaType) => {
			const message: RemovePastaTypeMessage = {
				type: 'removePastaTypeFromMenu',
				pastaTypeId: pastaType.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}

	// --- Create New Pasta Type ---
	openNewPastaTypeDialog() {
		this.newPastaTypeName.set('');
		this.newPastaTypeImageUrl.set('');
		this.showNewPastaTypeDialog.set(true);
	}
	saveNewPastaType() {
		if (!this.newPastaTypeName().trim()) {
			alert('Pasta type name is required.');
			return;
		}
		this.http
			.post<AppPastaType>(`${this.apiUrl}/pasta-types`, {
				name: this.newPastaTypeName(),
				imageUrl: this.newPastaTypeImageUrl(),
			})
			.subscribe({
				next: (newType) => {
					this.loadAllPastaTypes(); // Refresh list
					this.showNewPastaTypeDialog.set(false);
				},
				error: (err) => {
					console.error('Failed to create pasta type', err);
					alert(`Error: ${err.error?.error || 'Could not create pasta type.'}`);
				},
			});
	}

	// --- Pasta Sauce PickList Actions ---
	onPastaSauceMoveToTarget(event: { items: AppPastaSauce[] }) {
		event.items.forEach((pastaSauce) => {
			const message: AddPastaSauceMessage = {
				type: 'addPastaSauceToMenu',
				pastaSauceId: pastaSauce.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}
	onPastaSauceMoveToSource(event: { items: AppPastaSauce[] }) {
		event.items.forEach((pastaSauce) => {
			const message: RemovePastaSauceMessage = {
				type: 'removePastaSauceFromMenu',
				pastaSauceId: pastaSauce.id,
			};
			this.menuWsConnection?.sendUpdate(message);
		});
	}

	// --- Create New Pasta Sauce ---
	openNewPastaSauceDialog() {
		this.newPastaSauceName.set('');
		this.newPastaSauceImageUrl.set('');
		this.showNewPastaSauceDialog.set(true);
	}
	saveNewPastaSauce() {
		if (!this.newPastaSauceName().trim()) {
			alert('Pasta sauce name is required.');
			return;
		}
		this.http
			.post<AppPastaSauce>(`${this.apiUrl}/pasta-sauces`, {
				name: this.newPastaSauceName(),
				imageUrl: this.newPastaSauceImageUrl(),
			})
			.subscribe({
				next: (newSauce) => {
					this.loadAllPastaSauces(); // Refresh list
					this.showNewPastaSauceDialog.set(false);
				},
				error: (err) => {
					console.error('Failed to create pasta sauce', err);
					alert(
						`Error: ${err.error?.error || 'Could not create pasta sauce.'}`
					);
				},
			});
	}

	get currentMenuItemsForDisplay(): MenuItem[] {
		const menu = this.menuWsConnection?.resource.value();
		return menu?.menuItems || [];
	}
}
