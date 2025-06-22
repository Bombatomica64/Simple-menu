import {
	Component,
	OnInit,
	OnDestroy,
	inject,
	signal,
	computed,
	PLATFORM_ID,
	Injector,
	runInInjectionContext,
	effect,
	resource,
	Resource,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { Slideshow, SlideshowSlide } from '../shared/models/slideshow.model';
import { Subscription, interval } from 'rxjs';
import { menuConnection, MenuConnection } from '../webSocketResource';
import { environment } from '../../environments/environment.dynamic';
import { AppImageComponent } from '../shared/components/app-image/app-image.component';

interface SlideshowStatus {
	slideshow: Slideshow | null;
	isActive: boolean;
}

@Component({
	selector: 'app-slideshow',
	standalone: true,
	imports: [CommonModule, CarouselModule, ButtonModule, AppImageComponent],
	templateUrl: './slideshow.component.html',
	styleUrls: ['./slideshow.component.scss'],
})
export class SlideshowComponent implements OnInit, OnDestroy {
	private http = inject(HttpClient);
	private router = inject(Router);
	private platformId = inject(PLATFORM_ID);
	private injector = inject(Injector);

	// Trigger for refreshing the resource
	private refreshTrigger = signal(0);

	// HttpResource for slideshow data (initialized in ngOnInit for SSR compatibility)
	slideshowResource: any = null;

	// Computed values from the resource
	activeSlideshowData = computed(() => {
		const data = this.slideshowResource?.value() as SlideshowStatus | undefined;
		console.log('Slideshow resource data:', data);
		return data?.slideshow || null;
	});

	isActive = computed(() => {
		const data = this.slideshowResource?.value() as SlideshowStatus | undefined;
		const shouldShow = data?.isActive && !!data?.slideshow && this.shouldShowSlideshow();
		console.log('Should show slideshow:', shouldShow, 'data:', data);
		return shouldShow || false;
	});

	currentSlideIndex = signal(0);
	menuConnection: MenuConnection | null = null;

	private subscription = new Subscription();
	private timeCheckInterval?: any;

	responsiveOptions = [
		{
			breakpoint: '1024px',
			numVisible: 1,
			numScroll: 1,
		},
		{
			breakpoint: '768px',
			numVisible: 1,
			numScroll: 1,
		},
	];

	// Computed interval - much slower for view-only mode
	slideshowInterval = computed(() => {
		const slideshow = this.activeSlideshowData();
		// Use 15 seconds (15000ms) or the slideshow's interval, whichever is longer
		return Math.max(slideshow?.intervalMs || 15000, 15000);
	});

	backgroundStyle = computed(() => {
		// You can customize this based on slideshow settings
		return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
	});

	shouldAutoExit = computed(() => {
		const slideshow = this.activeSlideshowData();
		return slideshow?.autoStart && slideshow?.endTime;
	});

	ngOnInit() {
		if (!isPlatformBrowser(this.platformId)) return;

		// Initialize resource only in browser environment for SSR compatibility
		this.slideshowResource = resource({
			loader: async () => {
				// Access the trigger to make this resource reactive
				this.refreshTrigger();
				console.log('Loading slideshow data...');
				const result = await this.http.get<SlideshowStatus>(`${environment.apiUrl}/api/slideshow/active`).toPromise();
				return result!;
			},
		});

		// Connect to WebSocket for real-time slideshow updates
		runInInjectionContext(this.injector, () => {
			this.menuConnection = menuConnection(environment.wsUrl);

			// Listen for slideshow update messages
			effect(() => {
				const responseMessage = this.menuConnection?.responseMessages();
				if (responseMessage) {
					this.handleWebSocketResponse(responseMessage);
				}
			});
		});

		// Check time every minute for auto-exit slideshow (view-only mode)
		this.timeCheckInterval = setInterval(() => {
			if (this.isActive() && !this.shouldShowSlideshow()) {
				console.log('Auto-hiding slideshow due to time limit - navigating to home');
				this.router.navigate(['/home']);
			}
		}, 60000); // Check every minute

		// Initial load
		console.log('Component initializing - starting with fresh resource load');
		this.refreshData();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		if (this.timeCheckInterval) {
			clearInterval(this.timeCheckInterval);
		}
	}

	// Helper method to refresh data
	refreshData() {
		console.log('Refreshing slideshow data...');
		if (this.slideshowResource) {
			// Trigger refresh by updating the signal
			this.refreshTrigger.update(val => val + 1);
		}
	}

	// Helper method to check time constraints
	shouldShowSlideshow(): boolean {
		const slideshow = this.activeSlideshowData();
		if (!slideshow) return false;

		// If slideshow is not set to auto-start, time constraints don't apply
		if (!slideshow.autoStart) return true;

		const now = new Date();
		const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

		// Check start time constraint
		if (slideshow.startTime && currentTime < slideshow.startTime) {
			return false;
		}

		// Check end time constraint
		if (slideshow.endTime && currentTime >= slideshow.endTime) {
			return false;
		}

		return true;
	}

	onSlideChange(event: any) {
		this.currentSlideIndex.set(event.page);
	}

	private handleWebSocketResponse(message: any) {
		switch (message.type) {
			case 'slideshowActivated':
			case 'slideshowStatusUpdate':
				console.log('Slideshow status updated via WebSocket:', message);
				// Refresh data when slideshow is activated/updated via WebSocket
				this.refreshData();
				break;
			case 'slideshowDeactivated':
				console.log('Slideshow deactivated via WebSocket - navigating to home');
				// Navigate to home when slideshow is deactivated
				this.router.navigate(['/home']);
				break;
			case 'slideshowUpdated':
				// Refresh slideshow data when slideshow is updated
				console.log('Slideshow data updated via WebSocket');
				this.refreshData();
				break;
		}
	}
}
