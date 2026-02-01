export type Dimension = 'matiere' | 'concept' | 'micro' | 'macro' | 'imaginaire';

export interface Item {
    id: string;
    emoji: string;
    name: string;
    era_unlock: number;
    is_pivot: boolean;
    is_ephemeral: boolean;
    dimension: Dimension;
    recipes: string[][]; // Array of recipe arrays, e.g. [['id1', 'id2'], ['id3', 'id4']]
}

export interface UserProgress {
    discoveredItems: string[]; // List of item IDs
    currentEra: number;
    inventory: string[]; // List of item IDs currently in deck
}

export enum ItemState {
    ACTIVE = 'active',
    EPHEMERAL = 'ephemeral',
    OBSOLETE = 'obsolete',
    HIBERNATION = 'hibernation'
}
