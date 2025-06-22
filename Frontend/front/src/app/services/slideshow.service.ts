import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.dynamic';
import { Slideshow, SlideshowSlide, SlideshowStatus } from '../shared/models/slideshow.model';

@Injectable({
  providedIn: 'root'
})
export class SlideshowService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}/api/slideshow`;

  private activeSlideshowSubject = new BehaviorSubject<SlideshowStatus>({ slideshow: null, isActive: false });
  public activeSlideshow$ = this.activeSlideshowSubject.asObservable();

  private allSlideshowsSubject = new BehaviorSubject<Slideshow[]>([]);
  public allSlideshows$ = this.allSlideshowsSubject.asObservable();

  constructor() {
    // Only load data in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.loadActiveSlideshow();
      this.loadAllSlideshows();
    }
  }

  // Get active slideshow
  getActiveSlideshow(): Observable<SlideshowStatus> {
    return this.http.get<SlideshowStatus>(`${this.apiUrl}/active`).pipe(
      catchError(error => {
        console.error('Error loading active slideshow:', error);
        return of({ slideshow: null, isActive: false });
      })
    );
  }

  // Load active slideshow and update subject
  private async loadActiveSlideshow() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      console.log('SlideshowService: loading active slideshow...');
      const status = await this.getActiveSlideshow().toPromise();
      console.log('SlideshowService: active slideshow loaded:', status);
      if (status) {
        this.activeSlideshowSubject.next(status);
        console.log('SlideshowService: activeSlideshowSubject updated');
      }
    } catch (error) {
      console.error('Error loading active slideshow:', error);
    }
  }

  // Get all slideshows
  getAllSlideshows(): Observable<Slideshow[]> {
    return this.http.get<Slideshow[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error loading all slideshows:', error);
        return of([]);
      })
    );
  }

  // Load all slideshows and update subject
  private async loadAllSlideshows() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const slideshows = await this.getAllSlideshows().toPromise();
      if (slideshows) {
        this.allSlideshowsSubject.next(slideshows);
      }
    } catch (error) {
      console.error('Error loading all slideshows:', error);
    }
  }

  // Create new slideshow
  createSlideshow(slideshowData: Partial<Slideshow>): Observable<Slideshow> {
    return this.http.post<Slideshow>(this.apiUrl, slideshowData);
  }

  // Update slideshow
  updateSlideshow(id: number, updates: Partial<Slideshow>): Observable<Slideshow> {
    return this.http.put<Slideshow>(`${this.apiUrl}/${id}`, updates);
  }

  // Activate slideshow
  activateSlideshow(id: number): Observable<Slideshow> {
    return this.http.post<Slideshow>(`${this.apiUrl}/${id}/activate`, {});
  }

  // Deactivate all slideshows
  deactivateSlideshow(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/deactivate`, {});
  }

  // Add slide to slideshow
  addSlideToSlideshow(slideshowId: number, slideData: Partial<SlideshowSlide>): Observable<SlideshowSlide> {
    return this.http.post<SlideshowSlide>(`${this.apiUrl}/${slideshowId}/slides`, slideData);
  }

  // Remove slide from slideshow
  removeSlideFromSlideshow(slideId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/slides/${slideId}`);
  }

  // Update slide order
  updateSlideOrder(slideshowId: number, slideOrders: { id: number }[]): Observable<Slideshow> {
    return this.http.put<Slideshow>(`${this.apiUrl}/${slideshowId}/slides/order`, { slideOrders });
  }

  // Check if slideshow should be shown based on time
  shouldShowSlideshow(): boolean {
    const status = this.activeSlideshowSubject.value;
    if (!status.slideshow || !status.isActive) return false;

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // If it's after 12:30, don't show slideshow
    if (status.slideshow.endTime && currentTime >= status.slideshow.endTime) {
      return false;
    }

    return true;
  }

  // Refresh data from server
  async refreshData() {
    if (!isPlatformBrowser(this.platformId)) return;

    console.log('SlideshowService: refreshData called');
    await Promise.all([
      this.loadActiveSlideshow(),
      this.loadAllSlideshows()
    ]);
    console.log('SlideshowService: refreshData completed');
  }

  // Get current active slideshow status
  getCurrentSlideshowStatus(): SlideshowStatus {
    return this.activeSlideshowSubject.value;
  }

  // Update local slideshow status (for WebSocket updates)
  updateSlideshowStatus(status: SlideshowStatus) {
    this.activeSlideshowSubject.next(status);
  }

  // Update local slideshows list (for WebSocket updates)
  updateSlideshowsList(slideshows: Slideshow[]) {
    this.allSlideshowsSubject.next(slideshows);
  }

  // Send WebSocket message to activate slideshow (if WebSocket connection is available)
  sendSlideshowActivation(slideshowId: number) {
    // This will be called by components that have access to WebSocket connection
    // The actual WebSocket sending should be done by the component with menuConnection
    console.log('Slideshow activation request for ID:', slideshowId);
  }

  // Send WebSocket message to deactivate slideshow
  sendSlideshowDeactivation() {
    console.log('Slideshow deactivation request');
  }
}
