export interface MenuItem {
    id: number; // Can be temporary in-memory ID or DB ID
    name: string;
    price: number;
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
}

export interface PastaType {
    id: number;
    name: string;
    imageUrl?: string;
    description?: string;
    basePrice: number;
    priceNote?: string;
}

export interface PastaSauce {
    id: number;
    name: string;
    imageUrl?: string;
    description?: string;
    basePrice: number;
    priceNote?: string;
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

        // Global display preferences for pasta types
        public globalPastaTypeShowImage: boolean = true,
        public globalPastaTypeImageSize: string = 'size-medium',
        public globalPastaTypeShowDescription: boolean = true,
        public globalPastaTypeFontSize: number = 100,

        // Global display preferences for pasta sauces
        public globalPastaSauceShowImage: boolean = true,
        public globalPastaSauceImageSize: string = 'size-medium',
        public globalPastaSauceShowDescription: boolean = true,
        public globalPastaSauceFontSize: number = 100
    ) {}

    static fromJson(json: any): Menu {
        return new Menu(
            json.id,
            json.createdAt,
            json.menuItems || [],
            json.menuSections || [],
            json.pastaTypes || [], // These are already MenuPastaTypeEntry from backend
            json.pastaSauces || [], // These are already MenuPastaSauceEntry from backend
            json.orientation || 'vertical',
            json.availableImages || null,

            // Global display preferences
            json.globalPastaTypeShowImage ?? true,
            json.globalPastaTypeImageSize ?? 'size-medium',
            json.globalPastaTypeShowDescription ?? true,
            json.globalPastaTypeFontSize ?? 100,

            json.globalPastaSauceShowImage ?? true,
            json.globalPastaSauceImageSize ?? 'size-medium',
            json.globalPastaSauceShowDescription ?? true,
            json.globalPastaSauceFontSize ?? 100
        );
    }
}
