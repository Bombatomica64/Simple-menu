export interface MenuItem {
    id: number; // Can be temporary in-memory ID or DB ID
    name: string;
    price: number;
    menuId?: number;
}

export interface PastaType {
    id: number;
    name: string;
    imageUrl?: string;
    availableImages?: string;
}

export interface PastaSauce {
    id: number;
    name: string;
    imageUrl?: string;
    availableImages?: string;
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
        public pastaTypes: MenuPastaTypeEntry[],
        public pastaSauces: MenuPastaSauceEntry[]
    ) {}

    static fromJson(json: any): Menu {
        return new Menu(
            json.id,
            json.createdAt,
            json.menuItems || [],
            json.pastaTypes || [], // These are already MenuPastaTypeEntry from backend
            json.pastaSauces || []  // These are already MenuPastaSauceEntry from backend
        );
    }
}
