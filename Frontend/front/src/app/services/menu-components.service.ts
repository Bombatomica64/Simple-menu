import { Injectable, signal, computed } from '@angular/core';
import {
  Menu,
  MenuItem,
  MenuSection,
  PastaType as AppPastaType,
  PastaSauce as AppPastaSauce,
} from '../Menu/menu';

// Shared interfaces for component communication
export interface MenuItemOperations {
  addItem: (name: string, price: number, sectionId?: number) => void;
  removeItem: (itemId: number) => void;
  updateItemImage: (itemId: number, imageUrl: string) => void;
  toggleItemShowImage: (itemId: number, showImage: boolean) => void;
}

export interface SectionOperations {
  addSection: (name: string, header?: string) => void;
  removeSection: (sectionId: number) => void;
  updateSectionColors: (sectionId: number, backgroundColor: string, textColor: string) => void;
  resetSectionColors: (sectionId: number) => void;
}

export interface LogoOperations {
  uploadLogo: (file: File, name: string, position: string, size: string) => void;
  activateLogo: (logoId: number) => void;
  deleteLogo: (logoId: number) => void;
  updateLogoSettings: (logoId: number, position: string, size: string, opacity: number) => void;
}

export interface PastaOperations {
  addPastaType: (pastaTypeId: number) => void;
  removePastaType: (pastaTypeId: number) => void;
  addPastaSauce: (pastaSauceId: number) => void;
  removePastaSauce: (pastaSauceId: number) => void;
  createPastaType: (pastaType: Partial<AppPastaType>) => void;
  createPastaSauce: (pastaSauce: Partial<AppPastaSauce>) => void;
}

// Color themes for sections
export interface ColorTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuComponentsService {

  // Predefined color themes for sections
  static readonly COLOR_THEMES: ColorTheme[] = [
    {
      id: 'classic',
      name: 'Classico',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      description: 'Bianco e nero classico'
    },
    {
      id: 'warm',
      name: 'Caldo',
      backgroundColor: '#fdf2e9',
      textColor: '#7c2d12',
      description: 'Toni caldi e accoglienti'
    },
    {
      id: 'elegant',
      name: 'Elegante',
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      description: 'Grigio scuro elegante'
    },
    {
      id: 'fresh',
      name: 'Fresco',
      backgroundColor: '#ecfdf5',
      textColor: '#065f46',
      description: 'Verde fresco e naturale'
    },
    {
      id: 'italian',
      name: 'Italiano',
      backgroundColor: '#fee2e2',
      textColor: '#991b1b',
      description: 'Rosso italiano tradizionale'
    },
    {
      id: 'ocean',
      name: 'Oceano',
      backgroundColor: '#eff6ff',
      textColor: '#1e40af',
      description: 'Blu oceano rilassante'
    },
  ];

  // Logo position options
  static readonly LOGO_POSITIONS = [
    { label: 'Alto Sinistra', value: 'top-left' },
    { label: 'Alto Centro', value: 'top-center' },
    { label: 'Alto Destra', value: 'top-right' },
    { label: 'Basso Sinistra', value: 'bottom-left' },
    { label: 'Basso Centro', value: 'bottom-center' },
    { label: 'Basso Destra', value: 'bottom-right' },
  ];

  // Logo size options
  static readonly LOGO_SIZES = [
    { label: 'Piccolo', value: 'small' },
    { label: 'Medio', value: 'medium' },
    { label: 'Grande', value: 'large' },
    { label: 'Extra Grande', value: 'extra-large' },
  ];

  // Utility methods
  static getContrastRatio(backgroundColor: string, textColor: string): number {
    const bgLum = MenuComponentsService.getLuminance(backgroundColor);
    const textLum = MenuComponentsService.getLuminance(textColor);
    const ratio = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
    return Math.round(ratio * 100) / 100;
  }

  static hasGoodContrast(backgroundColor: string, textColor: string): boolean {
    const ratio = MenuComponentsService.getContrastRatio(backgroundColor, textColor);
    return ratio >= 4.5;
  }

  private static getLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }
}
