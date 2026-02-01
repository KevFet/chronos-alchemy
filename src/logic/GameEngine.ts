import { Item, ItemState, UserProgress } from '../types/game';

export class GameEngine {
    private items: Map<string, Item>;

    constructor(items: Item[]) {
        this.items = new Map(items.map(item => [item.id, item]));
    }

    /**
     * Attempts to fuse two items.
     * Returns the resulting Item if a recipe exists, otherwise null.
     */
    public fuse(item1Id: string, item2Id: string, progress: UserProgress): Item | null {
        const ids = [item1Id, item2Id].sort();

        for (const item of this.items.values()) {
            // Time Lock (Verrou Temporel): If item belongs to a future era, it can't be created yet
            if (item.era_unlock > progress.currentEra) continue;

            for (const recipe of item.recipes) {
                const sortedRecipe = [...recipe].sort();
                if (
                    sortedRecipe.length === 2 &&
                    sortedRecipe[0] === ids[0] &&
                    sortedRecipe[1] === ids[1]
                ) {
                    return item;
                }
            }
        }

        return null;
    }

    /**
     * Determines the state of an item for a given user progress.
     */
    public getItemState(itemId: string, progress: UserProgress): ItemState {
        const item = this.items.get(itemId);
        if (!item) throw new Error(`Item ${itemId} not found`);

        // 1. Hibernation: Next recipe belongs to a future era not yet unlocked
        if (item.era_unlock > progress.currentEra) {
            return ItemState.HIBERNATION;
        }

        // 2. Active: Discovered and usable
        const isDiscovered = progress.discoveredItems.includes(itemId);
        if (isDiscovered) {
            // Check for Obsolete: No future recipes possible in current or future reachable eras
            if (this.isObsolete(itemId, progress)) {
                return ItemState.OBSOLETE;
            }
            return ItemState.ACTIVE;
        }

        return ItemState.HIBERNATION; // Default for undiscovered items? Actually, and undiscovered item shouldn't be in the deck usually.
    }

    /**
     * Checks if an item is obsolete.
     * Obsolete: No more recipes can use this item in the future.
     */
    private isObsolete(itemId: string, progress: UserProgress): boolean {
        // Check if this item is an ingredient in ANY remaining undiscovered recipes.
        for (const item of this.items.values()) {
            // If the item itself is undiscovered, it might still be needed
            if (!progress.discoveredItems.includes(item.id)) {
                for (const recipe of item.recipes) {
                    if (recipe.includes(itemId)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Verifies if the current era can be advanced.
     * Advancement is blocked until the "Pivot" item of the current era is created.
     */
    public canAdvanceEra(progress: UserProgress): boolean {
        const pivotsInCurrentEra = Array.from(this.items.values()).filter(
            item => item.era_unlock === progress.currentEra && item.is_pivot
        );

        return pivotsInCurrentEra.every(pivot => progress.discoveredItems.includes(pivot.id));
    }
}
