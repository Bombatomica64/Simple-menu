import {
	Component,
	inject,
	OnInit,
	OnDestroy,
	PLATFORM_ID,
	Injector,
	runInInjectionContext,
	signal,
	effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiPageMenuComponent } from '../multi-page-menu/multi-page-menu.component';
import { Menu } from '../Menu/menu';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { menuConnection, MenuConnection } from '../webSocketResource';
import { SlideshowService } from '../services/slideshow.service';
import { environment } from '../../environments/environment.dynamic';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, MultiPageMenuComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
	private platformId = inject(PLATFORM_ID);
	private injector = inject(Injector);
	private router = inject(Router);
	private slideshowService = inject(SlideshowService);
	menuConnection: MenuConnection | null = null;
	showConnectionStatus = signal(true);

	constructor() {
		// Hide connection status after 1 second when connected
		effect(() => {
			if (this.menuConnection?.connected()) {
				setTimeout(() => {
					this.showConnectionStatus.set(false);
				}, 1000);
			}
		});
	}
	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			// Connect to WebSocket for real-time menu updates
			runInInjectionContext(this.injector, () => {
				this.menuConnection = menuConnection(environment.wsUrl);

				// Listen for slideshow activation messages
				effect(() => {
					const responseMessage = this.menuConnection?.responseMessages();
					if (responseMessage) {
						this.handleWebSocketResponse(responseMessage);
					}
				});

				// Listen for menu data changes
				effect(() => {
					const menuData = this.menuConnection?.resource.value();
					if (menuData) {
						console.log('[Home] Menu data updated:', menuData);
						console.log('[Home] Background in menu:', menuData.background);
					}
				});
			});
		}
	}

	ngOnDestroy() {
		// Cleanup will be handled by the WebSocket connection itself
	}
	private handleWebSocketResponse(message: any) {
		switch (message.type) {
			case 'slideshowActivated':
			case 'slideshowStatusUpdate':
				if (message.isActive !== false) {
					// Update slideshow service with new status
					this.slideshowService.updateSlideshowStatus({
						slideshow: message.slideshow,
						isActive: true,
					});

					// Only navigate to slideshow if we're on a public page (not admin pages)
					const currentUrl = this.router.url;
					const isAdminPage =
						currentUrl.includes('/submit') ||
						currentUrl.includes('/menu-sections') ||
						currentUrl.includes('/slideshow-management') ||
						currentUrl.includes('/admin');

					if (!isAdminPage) {
						console.log('Slideshow activated, navigating to slideshow');
						this.router.navigate(['/slideshow']);
					} else {
						console.log(
							'Slideshow activated but staying on admin page:',
							currentUrl
						);
					}
				}
				break;
			case 'slideshowDeactivated':
				this.slideshowService.updateSlideshowStatus({
					slideshow: null,
					isActive: false,
				});
				console.log('Slideshow deactivated, staying on current page');
				// Optionally navigate back to home if currently on slideshow page
				if (this.router.url === '/slideshow') {
					this.router.navigate(['/home']);
				}
				break;
			default:
				console.log('Unhandled WebSocket message type:', message.type);
		}
	}

	// Background style method for the menu
	getBackgroundStyle(menu: Menu) {
		const background = menu?.background;

		// Add debugging
		console.log('[Home] getBackgroundStyle called with menu:', menu);
		console.log('[Home] Background data:', background);

		// Default cream background if no background is set
		if (!background?.type || !background?.value) {
			console.log('[Home] Using default cream background - no background set');
			return {
				backgroundColor: '#FDF5E6', // Cream color
				backgroundImage: 'none',
				minHeight: '100vh',
			};
		}

		// Apply the background from menu based on type
		switch (background.type) {
			case 'color':
				return {
					backgroundColor: background.value,
					backgroundImage: 'none',
					minHeight: '100vh',
				};
			case 'gradient':
				return {
					background: background.value,
					backgroundImage: 'none',
					minHeight: '100vh',
				};
			case 'image':
				return {
					backgroundImage: `url('${background.value}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					minHeight: '100vh',
				};
			default:
				// Fallback to legacy format if exists
				if (background.background) {
					return {
						background: background.background,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						minHeight: '100vh',
					};
				}
				return {
					backgroundColor: '#FDF5E6', // Cream color
					backgroundImage: 'none',
					minHeight: '100vh',
				};
		}
	}
}
