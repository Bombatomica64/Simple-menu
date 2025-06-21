export interface Slideshow {
  id: number;
  name: string;
  isActive: boolean;
  intervalMs: number;
  autoStart: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  slides: SlideshowSlide[];
}

export interface SlideshowSlide {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  slideshowId: number;
}

export interface SlideshowStatus {
  slideshow: Slideshow | null;
  isActive: boolean;
}
