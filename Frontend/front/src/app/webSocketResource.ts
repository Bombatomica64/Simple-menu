import { computed, resource, ResourceRef, signal, Signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Menu } from './Menu/menu';

export interface AddItemMessage {
	type: 'addItem';
	item: { name: string; price: number; description?: string; sectionId?: number | null };
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

// Pasta types/sauces creation and deletion message types
export interface CreatePastaTypeMessage {
	type: 'createPastaType';
	pastaType: {
		name: string;
		description?: string;
		basePrice?: number;
		priceNote?: string;
		imageUrl?: string;
	};
}
export interface DeletePastaTypeMessage {
	type: 'deletePastaType';
	pastaTypeId: number;
}
export interface CreatePastaSauceMessage {
	type: 'createPastaSauce';
	pastaSauce: {
		name: string;
		description?: string;
		basePrice?: number;
		priceNote?: string;
		imageUrl?: string;
	};
}
export interface DeletePastaSauceMessage {
	type: 'deletePastaSauce';
	pastaSauceId: number;
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

// Display settings message types
export interface PastaSauceDisplaySettings {
	showImage: boolean;
	imageSize: string;
	showDescription: boolean;
	customDescription?: string;
	customFontColor?: string;
	customBgColor?: string;
}

export interface UpdatePastaSauceDisplaySettingsMessage {
	type: 'updatePastaSauceDisplaySettings';
	pastaSauceId: number;
	settings: PastaSauceDisplaySettings;
}

export interface GetPastaSauceDisplaySettingsMessage {
	type: 'getPastaSauceDisplaySettings';
	pastaSauceId: number;
}

export interface PastaTypeDisplaySettings {
	showImage: boolean;
	imageSize: string;
	showDescription: boolean;
	customDescription?: string;
	customFontColor?: string;
	customBgColor?: string;
}

export interface UpdatePastaTypeDisplaySettingsMessage {
	type: 'updatePastaTypeDisplaySettings';
	pastaTypeId: number;
	settings: PastaTypeDisplaySettings;
}

export interface GetPastaTypeDisplaySettingsMessage {
	type: 'getPastaTypeDisplaySettings';
	pastaTypeId: number;
}

// Global display settings message types
export interface GlobalPastaDisplaySettings {
	pastaTypeShowImage: boolean;
	pastaTypeImageSize: string;
	pastaTypeShowDescription: boolean;
	pastaTypeFontSize: number;
	pastaSauceShowImage: boolean;
	pastaSauceImageSize: string;
	pastaSauceShowDescription: boolean;
	pastaSauceFontSize: number;
}

export interface UpdateGlobalPastaDisplaySettingsMessage {
	type: 'updateGlobalPastaDisplaySettings';
	settings: GlobalPastaDisplaySettings;
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

// Background configuration message types
export interface BackgroundConfig {
	id: number;
	page?: string; // Optional since menus can have their own backgrounds
	type: string; // "color", "gradient", "image"
	value: string; // CSS background value (gradient, color, image url, etc.)
	background?: string; // Legacy field for backwards compatibility
	createdAt?: string;
	updatedAt?: string;
}

export interface UpdateBackgroundConfigMessage {
	type: 'updateBackgroundConfig';
	backgroundType: string; // 'color', 'gradient', 'image'
	value: string; // CSS background value
}

export interface DeleteBackgroundConfigMessage {
	type: 'deleteBackgroundConfig';
}

export interface GetBackgroundConfigMessage {
	type: 'getBackgroundConfig';
	page: string;
}

export interface GetAllBackgroundConfigsMessage {
	type: 'getAllBackgroundConfigs';
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

// Pasta creation response message types
export interface PastaTypeCreatedResponse {
	type: 'pastaTypeCreated';
	pastaType: any; // You can define a proper PastaType interface if needed
}

export interface PastaSauceCreatedResponse {
	type: 'pastaSauceCreated';
	pastaSauce: any; // You can define a proper PastaSauce interface if needed
}

// Display settings response message types
export interface PastaSauceDisplaySettingsResponse {
	type: 'pastaSauceDisplaySettings';
	pastaSauceId: number;
	settings: PastaSauceDisplaySettings;
}

export interface PastaTypeDisplaySettingsResponse {
	type: 'pastaTypeDisplaySettings';
	pastaTypeId: number;
	settings: PastaTypeDisplaySettings;
}

// Background configuration response message types
export interface BackgroundConfigResponse {
	type: 'backgroundConfig';
	page: string;
	config: BackgroundConfig;
}

export interface AllBackgroundConfigsResponse {
	type: 'allBackgroundConfigs';
	configs: BackgroundConfig[];
}

export interface BackgroundConfigDeletedResponse {
	type: 'backgroundConfigDeleted';
	page: string;
}

// Color management message types
export interface UpdatePastaTypeColorsMessage {
	type: 'updatePastaTypeColors';
	pastaTypeId: number;
	backgroundColor: string;
	textColor: string;
}

export interface ResetPastaTypeColorsMessage {
	type: 'resetPastaTypeColors';
	pastaTypeId: number;
}

export interface UpdatePastaSauceColorsMessage {
	type: 'updatePastaSauceColors';
	pastaSauceId: number;
	backgroundColor: string;
	textColor: string;
}

export interface ResetPastaSauceColorsMessage {
	type: 'resetPastaSauceColors';
	pastaSauceId: number;
}

// Global pasta types and sauces color management
export interface UpdatePastaTypesGlobalColorMessage {
	type: 'updatePastaTypesColor';
	backgroundColor: string;
}

export interface UpdatePastaSaucesGlobalColorMessage {
	type: 'updatePastaSaucesColor';
	backgroundColor: string;
}

export interface UpdateSectionColorsMessage {
	type: 'updateSectionColors';
	sectionId: number;
	backgroundColor: string;
	textColor: string;
}

export interface ResetSectionColorsMessage {
	type: 'resetSectionColors';
	sectionId: number;
}

// Color update response message types
export interface PastaTypeColorsUpdatedResponse {
	type: 'pastaTypeColorsUpdated';
	pastaTypeId: number;
	backgroundColor: string;
	textColor: string;
}

export interface PastaSauceColorsUpdatedResponse {
	type: 'pastaSauceColorsUpdated';
	pastaSauceId: number;
	backgroundColor: string;
	textColor: string;
}

export interface SectionColorsUpdatedResponse {
	type: 'sectionColorsUpdated';
	sectionId: number;
	backgroundColor: string;
	textColor: string;
}

// Logo management message types
export interface GetAvailableLogosMessage {
	type: 'getAvailableLogos';
}

export interface SetMenuLogoMessage {
	type: 'setMenuLogo';
	logoId: number;
}

export interface UpdateLogoSettingsMessage {
	type: 'updateLogoSettings';
	logoSettings: {
		position?: string;
		size?: string;
		opacity?: number;
		name?: string;
	};
}

export interface RemoveLogoMessage {
	type: 'removeLogo';
}

export interface DeleteLogoMessage {
	type: 'deleteLogo';
	logoId: number;
}

// Slideshow message types
export interface ActivateSlideshowMessage {
	type: 'activateSlideshow';
	slideshowId: number;
}

export interface DeactivateSlideshowMessage {
	type: 'deactivateSlideshow';
}

export interface SlideshowUpdatedMessage {
	type: 'slideshowUpdated';
	slideshow: any; // Replace with proper Slideshow type
}

export interface SlideshowActivatedResponse {
	type: 'slideshowActivated';
	slideshow: any; // Replace with proper Slideshow type
}

export interface SlideshowDeactivatedResponse {
	type: 'slideshowDeactivated';
}

export interface SlideshowStatusUpdateResponse {
	type: 'slideshowStatusUpdate';
	slideshow: any; // Replace with proper Slideshow type
	isActive: boolean;
}

// Menu update response message types
export interface UpdateItemPositionsResponse {
	type: 'updateItemPositions';
	itemUpdates: { itemId: number; position: number; sectionId?: number | null }[];
}

export interface UpdateSectionOrderResponse {
	type: 'updateSectionOrder';
	sectionUpdates: { id: number; position: number }[];
}

export interface AddSectionResponse {
	type: 'addSection';
	section: any; // You can define a proper Section interface if needed
}

export interface RemoveSectionResponse {
	type: 'removeSection';
	sectionId: number;
}

export interface AddItemResponse {
	type: 'addItem';
	item: any; // You can define a proper MenuItem interface if needed
}

export interface RemoveItemResponse {
	type: 'removeItem';
	itemId: number;
}

export interface MoveItemToSectionResponse {
	type: 'moveItemToSection';
	itemId: number;
	sectionId: number | null;
	position?: number;
}

// Additional menu update response message types
export interface MenuUpdatedResponse {
	type: 'menuUpdated';
	menu?: any;
}

export interface SectionUpdatedResponse {
	type: 'sectionUpdated';
	section?: any;
}

export interface ItemAddedResponse {
	type: 'itemAdded';
	item?: any;
}

export interface ItemUpdatedResponse {
	type: 'itemUpdated';
	item?: any;
}

export interface ItemDeletedResponse {
	type: 'itemDeleted';
	itemId?: number;
}

export interface SectionColorUpdatedResponse {
	type: 'sectionColorUpdated';
	sectionId?: number;
	backgroundColor?: string;
	textColor?: string;
}

export interface LogoUpdatedResponse {
	type: 'logoUpdated';
	logo?: any;
}

export interface MenuItemImageUpdatedResponse {
	type: 'menuItemImageUpdated';
	itemId?: number;
	imageUrl?: string;
}

export interface ToggleMenuItemShowImageResponse {
	type: 'toggleMenuItemShowImage';
	itemId?: number;
	showImage?: boolean;
}

export interface AddImageToMenuItemResponse {
	type: 'addImageToMenuItem';
	itemId?: number;
	imageUrl?: string;
}

export interface RemoveImageFromMenuItemResponse {
	type: 'removeImageFromMenuItem';
	itemId?: number;
	imageUrl?: string;
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
	| CreatePastaTypeMessage
	| DeletePastaTypeMessage
	| CreatePastaSauceMessage
	| DeletePastaSauceMessage
	| AddSectionMessage
	| RemoveSectionMessage
	| UpdateSectionOrderMessage
	| MoveItemToSectionMessage
	| UpdateItemPositionsMessage
	| UpdateMenuOrientationMessage
	| UpdateMenuAvailableImagesMessage
	| UpdatePastaSauceDisplaySettingsMessage
	| GetPastaSauceDisplaySettingsMessage
	| UpdatePastaTypeDisplaySettingsMessage
	| GetPastaTypeDisplaySettingsMessage	| SaveCurrentMenuMessage
	| LoadSavedMenuMessage
	| DeleteSavedMenuMessage
	| GetAllSavedMenusMessage
	| UpdateBackgroundConfigMessage
	| DeleteBackgroundConfigMessage
	| GetBackgroundConfigMessage
	| GetAllBackgroundConfigsMessage
	| UpdateGlobalPastaDisplaySettingsMessage
	| UpdatePastaTypeColorsMessage
	| ResetPastaTypeColorsMessage
	| UpdatePastaSauceColorsMessage
	| ResetPastaSauceColorsMessage
	| UpdatePastaTypesGlobalColorMessage
	| UpdatePastaSaucesGlobalColorMessage
	| UpdateSectionColorsMessage
	| ResetSectionColorsMessage
	| GetAvailableLogosMessage
	| SetMenuLogoMessage
	| UpdateLogoSettingsMessage
	| RemoveLogoMessage	| DeleteLogoMessage
	| ActivateSlideshowMessage
	| DeactivateSlideshowMessage
	| SlideshowUpdatedMessage;

export type MenuResponseMessage =
	| MenuSavedResponse
	| MenuDeletedResponse
	| SavedMenusListResponse
	| PastaSauceDisplaySettingsResponse
	| PastaTypeDisplaySettingsResponse
	| BackgroundConfigResponse
	| AllBackgroundConfigsResponse
	| BackgroundConfigDeletedResponse
	| PastaTypeCreatedResponse
	| PastaSauceCreatedResponse
	| PastaTypeColorsUpdatedResponse
	| PastaSauceColorsUpdatedResponse
	| SectionColorsUpdatedResponse
	| AvailableLogosResponse
	| LogoDeletedResponse
	| SlideshowActivatedResponse
	| SlideshowDeactivatedResponse
	| SlideshowStatusUpdateResponse
	| UpdateItemPositionsResponse
	| UpdateSectionOrderResponse
	| AddSectionResponse
	| RemoveSectionResponse
	| AddItemResponse
	| RemoveItemResponse
	| MoveItemToSectionResponse
	| MenuUpdatedResponse
	| SectionUpdatedResponse
	| ItemAddedResponse
	| ItemUpdatedResponse
	| ItemDeletedResponse
	| SectionColorUpdatedResponse
	| LogoUpdatedResponse
	| MenuItemImageUpdatedResponse
	| ToggleMenuItemShowImageResponse
	| AddImageToMenuItemResponse
	| RemoveImageFromMenuItemResponse
	| ErrorResponse;

// Logo response message types
export interface AvailableLogosResponse {
	type: 'availableLogos';
	logos: any[]; // You can define a proper Logo interface if needed
}

export interface LogoDeletedResponse {
	type: 'logoDeleted';
	logoId: number;
}

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
				};				wsConnectionInstance.onmessage = (event) => {
					try {
						const data = JSON.parse(event.data);						// Check if it's a menu update or a response message
						if (data.type && [
							'menuSaved', 'menuDeleted', 'savedMenusList',
							'pastaSauceDisplaySettings', 'pastaTypeDisplaySettings',
							'backgroundConfig', 'allBackgroundConfigs', 'backgroundConfigDeleted',
							'pastaTypeColorsUpdated', 'pastaSauceColorsUpdated', 'sectionColorsUpdated',
							'availableLogos', 'logoDeleted',
							'slideshowActivated', 'slideshowDeactivated', 'slideshowStatusUpdate',
							'updateItemPositions', 'updateSectionOrder', 'addSection', 'removeSection',
							'addItem', 'removeItem', 'moveItemToSection',
							'pastaTypeCreated', 'pastaSauceCreated',
							'menuUpdated', 'sectionUpdated', 'itemAdded', 'itemUpdated', 'itemDeleted',
							'sectionColorUpdated', 'logoUpdated', 'menuItemImageUpdated',
							'toggleMenuItemShowImage', 'addImageToMenuItem', 'removeImageFromMenuItem',
							'error'
						].includes(data.type)) {
							// Handle response messages
							console.log('[WebSocket response] Response received:', data);
							responseMessages.set(data as MenuResponseMessage);						} else {
							// Handle menu updates
							const menuData = data as Menu;
							console.log('[WebSocket message] Menu update received:', menuData);
							console.log('[WebSocket message] Previous menu:', currentMenu);
							currentMenu = Menu.fromJson(menuData);
							console.log('[WebSocket message] New menu after parsing:', currentMenu);
							resourceResult.update(current => ({
								...current,
								value: currentMenu,
								error: undefined
							}));
							console.log('[WebSocket message] Resource updated successfully');
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
