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
	imports: [MultiPageMenuComponent],
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
						isActive: true
					});

					// Navigate to slideshow page or trigger slideshow display
					console.log('Slideshow activated, switching view');
					// The slideshow component will automatically show based on the service update
				}
				break;
			case 'slideshowDeactivated':
				this.slideshowService.updateSlideshowStatus({
					slideshow: null,
					isActive: false
				});
				console.log('Slideshow deactivated');
				break;
		}
	}
}
