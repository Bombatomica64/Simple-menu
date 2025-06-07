import { computed, resource, ResourceRef, signal, Signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Menu } from './Menu/menu';

export interface AddItemMessage {
	type: 'addItem';
	item: { name: string; price: number; sectionId?: number | null };
}
export interface RemoveItemMessage {
	type: 'removeItem';
	itemId: number;
}
export interface UpdateMenuItemImageMessage {
	type: 'updateMenuItemImage';
	itemId: number;
	imageUrl: string;
}
export interface ToggleMenuItemShowImageMessage {
	type: 'toggleMenuItemShowImage';
	itemId: number;
	showImage: boolean;
}
export interface AddImageToMenuItemMessage {
	type: 'addImageToMenuItem';
	itemId: number;
	imageUrl: string;
}
export interface RemoveImageFromMenuItemMessage {
	type: 'removeImageFromMenuItem';
	itemId: number;
	imageUrl: string;
}
export interface AddPastaTypeMessage {
	type: 'addPastaTypeToMenu';
	pastaTypeId: number;
}
export interface RemovePastaTypeMessage {
	type: 'removePastaTypeFromMenu';
	pastaTypeId: number;
}
export interface AddPastaSauceMessage {
	type: 'addPastaSauceToMenu';
	pastaSauceId: number;
}
export interface RemovePastaSauceMessage {
	type: 'removePastaSauceFromMenu';
	pastaSauceId: number;
}

// Section management message types
export interface AddSectionMessage {
	type: 'addSection';
	section: { name: string };
}
export interface RemoveSectionMessage {
	type: 'removeSection';
	sectionId: number;
}
export interface UpdateSectionOrderMessage {
	type: 'updateSectionOrder';
	sectionUpdates: { id: number; position: number }[];
}
export interface MoveItemToSectionMessage {
	type: 'moveItemToSection';
	itemId: number;
	sectionId: number | null;
	position?: number;
}
export interface UpdateItemPositionsMessage {
	type: 'updateItemPositions';
	itemUpdates: { itemId: number; position: number; sectionId?: number | null }[];
}

// Menu configuration message types
export interface UpdateMenuOrientationMessage {
	type: 'updateMenuOrientation';
	orientation: 'vertical' | 'horizontal';
}
export interface UpdateMenuAvailableImagesMessage {
	type: 'updateMenuAvailableImages';
	availableImages: string | null;
}

// Saved menu message types
export interface SaveCurrentMenuMessage {
	type: 'saveCurrentMenu';
	name: string;
}
export interface LoadSavedMenuMessage {
	type: 'loadSavedMenu';
	savedMenuId: number;
}
export interface DeleteSavedMenuMessage {
	type: 'deleteSavedMenu';
	savedMenuId: number;
}
export interface GetAllSavedMenusMessage {
	type: 'getAllSavedMenus';
}

// Response message types from server
export interface SavedMenu {
	id: number;
	name: string;
	savedAt: string;
	menu: Menu;
}

export interface MenuSavedResponse {
	type: 'menuSaved';
	savedMenu: SavedMenu;
}
export interface MenuDeletedResponse {
	type: 'menuDeleted';
	savedMenuId: number;
}
export interface SavedMenusListResponse {
	type: 'savedMenusList';
	savedMenus: SavedMenu[];
}
export interface ErrorResponse {
	type: 'error';
	message: string;
}

export type MenuUpdateMessage =
	| AddItemMessage
	| RemoveItemMessage
	| UpdateMenuItemImageMessage
	| ToggleMenuItemShowImageMessage
	| AddImageToMenuItemMessage
	| RemoveImageFromMenuItemMessage
	| AddPastaTypeMessage
	| RemovePastaTypeMessage
	| AddPastaSauceMessage
	| RemovePastaSauceMessage
	| AddSectionMessage
	| RemoveSectionMessage
	| UpdateSectionOrderMessage
	| MoveItemToSectionMessage
	| UpdateItemPositionsMessage
	| UpdateMenuOrientationMessage
	| UpdateMenuAvailableImagesMessage
	| SaveCurrentMenuMessage
	| LoadSavedMenuMessage
	| DeleteSavedMenuMessage
	| GetAllSavedMenusMessage;

export type MenuResponseMessage =
	| MenuSavedResponse
	| MenuDeletedResponse
	| SavedMenusListResponse
	| ErrorResponse;

export type SendUpdateFn = (message: MenuUpdateMessage) => void;

// Type for items in the resource stream
export type ResourceStreamItem<T> = { value: T | undefined; error?: Error };

export type MenuConnection = {
	resource: ResourceRef<Menu | undefined>;
	connected: () => boolean;
	sendUpdate: SendUpdateFn;
	responseMessages: Signal<MenuResponseMessage | null>;
};

export function menuConnection(websocketUrl: string): MenuConnection {
	const platformId = inject(PLATFORM_ID);
	let wsConnectionInstance: WebSocket | null = null; // Store the active WebSocket instance
	const connected = signal(false);
	const responseMessages = signal<MenuResponseMessage | null>(null);
	let currentMenu: Menu | undefined = undefined;

	const menuResource: ResourceRef<Menu | undefined> = resource({
		stream: () => {
			return new Promise<Signal<ResourceStreamItem<Menu | undefined>>>((resolve) => {
				const resourceResult = signal<ResourceStreamItem<Menu | undefined>>({
					value: undefined,
				});

				// Only create WebSocket in browser environment
				if (!isPlatformBrowser(platformId)) {
					console.log('[WebSocket] Server-side rendering detected, skipping WebSocket connection');
					resolve(resourceResult);
					return;
				}

				// Close existing connection if any
				if (wsConnectionInstance) {
					wsConnectionInstance.close();
				}

				wsConnectionInstance = new WebSocket(websocketUrl);

				wsConnectionInstance.onopen = () => {
					console.log('[WebSocket open] Connected to menu updates');
					connected.set(true);
					resourceResult.update(current => ({
						...current,
						value: currentMenu
					}));
				};

				wsConnectionInstance.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);

						// Check if it's a menu update or a response message
						if (data.type && ['menuSaved', 'menuDeleted', 'savedMenusList', 'error'].includes(data.type)) {
							// Handle response messages
							console.log('[WebSocket response] Response received:', data);
							responseMessages.set(data as MenuResponseMessage);
						} else {
							// Handle menu updates
							const menuData = data as Menu;
							console.log('[WebSocket message] Menu update received:', menuData);
							currentMenu = Menu.fromJson(menuData);
							resourceResult.update(current => ({
								...current,
								value: currentMenu,
								error: undefined
							}));
						}
					} catch (err) {
						console.error('[WebSocket parse error]', err);
						resourceResult.update(current => ({
							...current,
							error: new Error('Failed to parse menu data')
						}));
					}
				};

				wsConnectionInstance.onerror = (event) => {
					console.error('[WebSocket error]', event);
					connected.set(false);
					resourceResult.update(current => ({
						...current,
						error: new Error('WebSocket connection error')
					}));
				};

				wsConnectionInstance.onclose = () => {
					console.log('[WebSocket closed] Disconnected from menu updates');
					connected.set(false);
					wsConnectionInstance = null;

					// Attempt reconnection after 3 seconds
					setTimeout(() => {
						console.log('[WebSocket] Attempting to reconnect...');
						// The resource stream will handle reconnection automatically
					}, 3000);
				};

				resolve(resourceResult);
			});
		},
	});

	const sendUpdate: SendUpdateFn = (message: MenuUpdateMessage) => {
		if (!isPlatformBrowser(platformId)) {
			console.log('[WebSocket] Cannot send message during server-side rendering');
			return;
		}

		if (
			wsConnectionInstance &&
			wsConnectionInstance.readyState === WebSocket.OPEN
		) {
			wsConnectionInstance.send(JSON.stringify(message));
		} else {
			console.error(
				'WebSocket not connected or instance unavailable. Cannot send message.'
			);
		}
	};

	return {
		connected,
		resource: menuResource,
		sendUpdate,
		responseMessages,
	};
}
