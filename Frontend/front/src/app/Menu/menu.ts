export interface MenuItem {
    id: number; // Can be temporary in-memory ID or DB ID
    name: string;
    price: number;
    description?: string; // Optional description for the menu item
    position?: number; // Position within section or menu
    menuId?: number;
    sectionId?: number | null; // Reference to menu section
    imageUrl?: string;
    showImage?: boolean;
}

export interface MenuSection {
    id: number;
    name: string;
    position: number;
    menuId?: number;
    menuItems?: MenuItem[];
    header?: string; // Optional header text for the section
    sectionType?: string; // "general", "pasta", "sauce", "insalatone", "poke"
    backgroundColor?: string; // Optional background color for the section
    textColor?: string; // Optional text color for the section
}

export interface PastaType {
    id: number;
    name: string;
    imageUrl?: string;
    description?: string;
    basePrice: number;
    priceNote?: string;
    backgroundColor?: string; // Optional background color for the pasta type
    textColor?: string; // Optional text color for the pasta type
}

export interface PastaSauce {
    id: number;
    name: string;
    imageUrl?: string;
    description?: string;
    basePrice: number;
    priceNote?: string;
    backgroundColor?: string; // Optional background color for the pasta sauce
    textColor?: string; // Optional text color for the pasta sauce
}

// Represents the structure from MenuToPastaType include
export interface MenuPastaTypeEntry {
    id: number; // ID of the join table record
    menuId: number;
    pastaTypeId: number;
    pastaType: PastaType; // The actual PastaType details
}

// Represents the structure from MenuToPastaSauce include
export interface MenuPastaSauceEntry {
    id: number; // ID of the join table record
    menuId: number;
    pastaSauceId: number;
    pastaSauce: PastaSauce; // The actual PastaSauce details
}

// Background configuration interface
export interface BackgroundConfig {
    id: number;
    page?: string | null; // Optional since menus can have their own backgrounds
    type: string; // "color", "gradient", "image"
    value: string; // CSS background value (gradient, color, image url, etc.)
    background?: string; // Legacy field for backwards compatibility
    createdAt?: string;
    updatedAt?: string;
}

// Logo interface
export interface Logo {
    id: number;
    name: string;
    imageUrl: string;
    position: string;
    size: string;
    opacity: number;
    isActive: boolean;
    createdAt: string;
}

export class Menu {
    constructor(
        public id: number | null, // Can be null if not yet saved to DB
        public createdAt: string,
        public menuItems: MenuItem[],
        public menuSections: MenuSection[],
        public pastaTypes: MenuPastaTypeEntry[],
        public pastaSauces: MenuPastaSauceEntry[],
        public orientation: 'vertical' | 'horizontal' = 'vertical',
        public availableImages: string | null = null,
        public background: BackgroundConfig | null = null, // Background configuration
        public logo: Logo | null = null, // Logo configuration        // Global display preferences for pasta types
        public globalPastaTypeShowImage: boolean = true,
        public globalPastaTypeImageSize: string = 'size-medium',
        public globalPastaTypeShowDescription: boolean = true,
        public globalPastaTypeFontSize: number = 100,
        public globalPastaTypeBackgroundColor: string | null = null,

        // Global display preferences for pasta sauces
        public globalPastaSauceShowImage: boolean = true,
        public globalPastaSauceImageSize: string = 'size-medium',
        public globalPastaSauceShowDescription: boolean = true,
        public globalPastaSauceFontSize: number = 100,
        public globalPastaSauceBackgroundColor: string | null = null
    ) {}    static fromJson(json: any): Menu {
        return new Menu(
            json.id,
            json.createdAt,
            json.menuItems || [],
            json.menuSections || [],
            json.pastaTypes || [], // These are already MenuPastaTypeEntry from backend
            json.pastaSauces || [], // These are already MenuPastaSauceEntry from backend
            json.orientation || 'vertical',
            json.availableImages || null,
            json.background || null, // Background configuration from backend
            json.logo || null, // Logo configuration from backend            // Global display preferences
            json.globalPastaTypeShowImage ?? true,
            json.globalPastaTypeImageSize ?? 'size-medium',
            json.globalPastaTypeShowDescription ?? true,
            json.globalPastaTypeFontSize ?? 100,
            json.globalPastaTypeBackgroundColor ?? null,

            json.globalPastaSauceShowImage ?? true,
            json.globalPastaSauceImageSize ?? 'size-medium',
            json.globalPastaSauceShowDescription ?? true,
            json.globalPastaSauceFontSize ?? 100,
            json.globalPastaSauceBackgroundColor ?? null
        );
    }
}
