import { computed, resource, ResourceRef, signal } from '@angular/core';
import { Menu } from './Menu/menu';

export interface AddItemMessage {
	type: 'addItem';
	item: { name: string; price: number };
}
export interface RemoveItemMessage {
	type: 'removeItem';
	itemId: number;
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

export type MenuUpdateMessage =
	| AddItemMessage
	| RemoveItemMessage
	| AddPastaTypeMessage
	| RemovePastaTypeMessage
	| AddPastaSauceMessage
	| RemovePastaSauceMessage;
export type SendUpdateFn = (message: MenuUpdateMessage) => void;

// Type for items in the resource stream
export type ResourceStreamItem<T> = { value: T | undefined; error?: Error };

export type MenuConnection = {
	resource: ResourceRef<Menu | undefined>;
	connected: () => boolean;
	sendUpdate: SendUpdateFn;
};

export function menuConnection(websocketUrl: string): MenuConnection {
	let wsConnectionInstance: WebSocket | null = null; // Store the active WebSocket instance
	const connected = signal(false);
	const menuResource: ResourceRef<Menu | undefined> = resource({
		loader: async ({ abortSignal }) => {
			let currentMenu: Menu | undefined;

			return new Promise<Menu | undefined>((resolve, reject) => {
				if (
					wsConnectionInstance &&
					wsConnectionInstance.readyState === WebSocket.OPEN
				) {
					wsConnectionInstance.close(); // Close previous connection if any
				}
				wsConnectionInstance = new WebSocket(websocketUrl);

				wsConnectionInstance.onopen = () => {
					console.log('[WebSocket open] Connected to menu updates');
					connected.set(true);
					resolve(currentMenu); // Send current or undefined
				};

				wsConnectionInstance.onmessage = (event) => {
					try {
						const menuData = JSON.parse(event.data) as Menu;
						console.log('[WebSocket message] Menu update received:', menuData);
						currentMenu = Menu.fromJson(menuData); // Use fromJson if needed
						resolve(currentMenu);
					} catch (err) {
						console.error('[WebSocket parse error]', err);
						reject(new Error('Failed to parse menu data'));
					}
				};

				wsConnectionInstance.onerror = (event) => {
					console.error('[WebSocket error]', event);
					connected.set(false); // Set connected to false on error
					reject(new Error('WebSocket connection error'));
				};

				wsConnectionInstance.onclose = () => {
					console.log('[WebSocket closed] Disconnected from menu updates');
					connected.set(false);
					wsConnectionInstance = null; // Clear instance on close
					// Reconnect logic (resource will re-trigger stream on request change or if configured)
					// For explicit reconnect, you might need to manage 'request' signal
					setTimeout(() => {
						if (abortSignal.aborted) return;
						console.log(
							'[WebSocket] Attempting to re-evaluate resource for reconnect...'
						);
						// Forcing re-evaluation might involve changing the 'request' signal
						// or relying on the resource's built-in retry/refresh mechanisms if any.
						// A simple way is to hope the resource re-triggers if 'request' changes or on next access.
					}, 3000);
				};

				abortSignal.addEventListener('abort', () => {
					console.log('[WebSocket cleanup] Closing connection');
					if (wsConnectionInstance) {
						wsConnectionInstance.close();
						wsConnectionInstance = null;
					}
					connected.set(false);
				});
			});
		},
	});

	const sendUpdate: SendUpdateFn = (message: MenuUpdateMessage) => {
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
	};
}
