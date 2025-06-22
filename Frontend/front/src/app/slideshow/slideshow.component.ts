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
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { SlideshowService } from '../services/slideshow.service';
import { Slideshow, SlideshowSlide } from '../shared/models/slideshow.model';
import { Subscription, interval } from 'rxjs';
import { menuConnection, MenuConnection } from '../webSocketResource';
import { environment } from '../../environments/environment.dynamic';

@Component({
	selector: 'app-slideshow',
	standalone: true,
	imports: [CommonModule, CarouselModule, ButtonModule],
	template: `
		@if (isActive()) {
		<div class="slideshow-container" [style.background]="backgroundStyle()">
			<div class="slideshow-content">
				<!-- Exit button -->
				<button
					pButton
					type="button"
					icon="pi pi-times"
					class="exit-button p-button-rounded p-button-outlined"
					(click)="exitSlideshow()"
					title="Chiudi slideshow"
				></button>

				<!-- Slideshow carousel -->
				@if (activeSlideshow()?.slides?.length) {
				<!-- Debug info -->
				<div
					style="position: absolute; top: 60px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 12px; z-index: 1000;"
				>
					<div>Active slideshow: {{ activeSlideshow()?.name }}</div>
					<div>Slides count: {{ activeSlideshow()?.slides?.length }}</div>
					<div>
						First slide URL: {{ activeSlideshow()?.slides?.[0]?.imageUrl }}
					</div>
					<div>Is Active: {{ isActive() }}</div>
				</div>

				<p-carousel
					[value]="activeSlideshow()!.slides"
					[autoplayInterval]="activeSlideshow()!.intervalMs"
					[circular]="true"
					[showIndicators]="true"
					[showNavigators]="false"
					[responsiveOptions]="responsiveOptions"
					[page]="currentSlideIndex()"
					(onPage)="onSlideChange($event)"
				>
					<ng-template pTemplate="item" let-slide>
						<div class="slide-content">
							<img
								[src]="slide.imageUrl"
								[alt]="slide.title || 'Slide'"
								class="slide-image"
							/>

							@if (slide.title) {
							<div class="slide-title">{{ slide.title }}</div>
							} @if (slide.description) {
							<div class="slide-description">{{ slide.description }}</div>
							}
						</div>
					</ng-template>
				</p-carousel>
				} @else {
				<div class="no-slides">
					<i class="pi pi-images text-6xl mb-4"></i>
					<h2>Nessuna slide disponibile</h2>
					<p>Lo slideshow è attivo ma non contiene immagini.</p>
				</div>
				}

				<!-- Time remaining indicator -->
				@if (shouldAutoExit()) {
				<div class="time-indicator">
					<i class="pi pi-clock mr-2"></i>
					Lo slideshow terminerà automaticamente alle
					{{ activeSlideshow()?.endTime }}
				</div>
				}
			</div>
		</div>
		}
	`,
	styles: [
		`
			.slideshow-container {
				position: fixed;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				z-index: 9999;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.slideshow-content {
				position: relative;
				width: 90%;
				height: 90%;
				max-width: 1200px;
				max-height: 800px;
			}

			.exit-button {
				position: absolute;
				top: 20px;
				right: 20px;
				z-index: 10;
				background: rgba(255, 255, 255, 0.9) !important;
				border: 2px solid #dc3545 !important;
				color: #dc3545 !important;
			}

			.exit-button:hover {
				background: #dc3545 !important;
				color: white !important;
			}

			:host ::ng-deep .p-carousel {
				height: 100%;
			}

			:host ::ng-deep .p-carousel-content {
				height: 100%;
			}

			:host ::ng-deep .p-carousel-container {
				height: 100%;
			}

			:host ::ng-deep .p-carousel-items-content {
				height: 100%;
			}

			:host ::ng-deep .p-carousel-item {
				height: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.slide-content {
				text-align: center;
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			.slide-image {
				max-width: 100%;
				max-height: 70%;
				object-fit: contain;
				border-radius: 12px;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
			}

			.slide-title {
				font-size: 2.5rem;
				font-weight: bold;
				color: white;
				margin: 20px 0 10px 0;
				text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
			}

			.slide-description {
				font-size: 1.2rem;
				color: rgba(255, 255, 255, 0.9);
				max-width: 600px;
				line-height: 1.5;
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
			}

			.no-slides {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				height: 100%;
				color: white;
				text-align: center;
			}

			.no-slides h2 {
				margin: 0 0 10px 0;
				font-size: 2rem;
			}

			.no-slides p {
				font-size: 1.1rem;
				opacity: 0.9;
			}

			.time-indicator {
				position: absolute;
				bottom: 20px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(0, 0, 0, 0.7);
				color: white;
				padding: 8px 16px;
				border-radius: 20px;
				font-size: 0.9rem;
				display: flex;
				align-items: center;
			}

			:host ::ng-deep .p-carousel-indicators {
				bottom: 60px;
			}

			:host ::ng-deep .p-carousel-indicator button {
				background: rgba(255, 255, 255, 0.5);
			}

			:host ::ng-deep .p-carousel-indicator.p-highlight button {
				background: white;
			}

			@media (max-width: 768px) {
				.slideshow-content {
					width: 95%;
					height: 95%;
				}

				.slide-title {
					font-size: 1.8rem;
				}

				.slide-description {
					font-size: 1rem;
				}

				.exit-button {
					top: 10px;
					right: 10px;
				}
			}
		`,
	],
})
export class SlideshowComponent implements OnInit, OnDestroy {
	private slideshowService = inject(SlideshowService);
	private router = inject(Router);
	private platformId = inject(PLATFORM_ID);
	private injector = inject(Injector);

	activeSlideshow = signal<Slideshow | null>(null);
	isActive = signal(false);
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

	backgroundStyle = computed(() => {
		// You can customize this based on slideshow settings
		return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
	});

	shouldAutoExit = computed(() => {
		const slideshow = this.activeSlideshow();
		return slideshow?.autoStart && slideshow?.endTime;
	});

	ngOnInit() {
		if (!isPlatformBrowser(this.platformId)) return;

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

		// Subscribe to slideshow status
		this.subscription.add(
			this.slideshowService.activeSlideshow$.subscribe((status) => {
				console.log('Slideshow status received:', status);
				console.log('Slideshow data:', status.slideshow);
				if (status.slideshow?.slides) {
					console.log('Slides data:', status.slideshow.slides);
					console.log(
						'First slide imageUrl:',
						status.slideshow.slides[0]?.imageUrl
					);
				}
				this.activeSlideshow.set(status.slideshow);

				// Update isActive based on both backend response and time constraints
				const shouldShow =
					status.isActive &&
					!!status.slideshow &&
					this.slideshowService.shouldShowSlideshow();
				console.log(
					'Should show slideshow:',
					shouldShow,
					'status.isActive:',
					status.isActive,
					'hasSlideshow:',
					!!status.slideshow
				);
				this.isActive.set(shouldShow);
			})
		);

		// Check time every minute to auto-exit slideshow
		this.timeCheckInterval = setInterval(() => {
			if (this.isActive() && !this.slideshowService.shouldShowSlideshow()) {
				console.log('Auto-exiting slideshow due to time limit');
				this.exitSlideshow();
			}
		}, 60000); // Check every minute

		// Initial load - Force refresh and then manually trigger an update
		console.log('Component initializing - forcing data refresh');
		this.slideshowService.refreshData().then(() => {
			console.log('Data refresh completed, checking slideshow status');
			const currentStatus = this.slideshowService.getCurrentSlideshowStatus();
			console.log('Current status after refresh:', currentStatus);
		});
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		if (this.timeCheckInterval) {
			clearInterval(this.timeCheckInterval);
		}
	}

	onSlideChange(event: any) {
		this.currentSlideIndex.set(event.page);
	}

	exitSlideshow() {
		this.slideshowService.deactivateSlideshow().subscribe({
			next: () => {
				this.isActive.set(false);
				console.log('Slideshow deactivated, staying on current page');
				// Don't navigate - just hide the slideshow overlay
			},
			error: (error) => {
				console.error('Error deactivating slideshow:', error);
			},
		});
	}

	private handleWebSocketResponse(message: any) {
		switch (message.type) {
			case 'slideshowActivated':
			case 'slideshowStatusUpdate':
				// Update slideshow service with new status
				this.slideshowService.updateSlideshowStatus({
					slideshow: message.slideshow,
					isActive: message.isActive !== false,
				});
				console.log('Slideshow status updated via WebSocket:', message);
				break;
			case 'slideshowDeactivated':
				this.slideshowService.updateSlideshowStatus({
					slideshow: null,
					isActive: false,
				});
				this.isActive.set(false);
				console.log('Slideshow deactivated via WebSocket');
				break;
			case 'slideshowUpdated':
				// Refresh slideshow data when slideshow is updated
				this.slideshowService.refreshData();
				console.log('Slideshow data updated via WebSocket');
				break;
		}
	}
}
