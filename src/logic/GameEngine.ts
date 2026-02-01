import { Item, ItemState, UserProgress } from '../types/game';

export class GameEngine {
    private items: Map<string, Item>;
    private recipeMap: Map<string, string> = new Map(); // key: "sorted_id1+sorted_id2", value: resultId
    private ingredientToResultMap: Map<string, Set<string>> = new Map(); // key: ingredientId, value: Set of resultIds

    constructor(items: Item[]) {
        this.items = new Map(items.map(item => [item.id, item]));
        this.buildLookups();
    }

    private buildLookups() {
        for (const item of this.items.values()) {
            for (const recipe of item.recipes) {
                if (recipe.length === 2) {
                    const key = [...recipe].sort().join('+');
                    this.recipeMap.set(key, item.id);

                    // Build reverse map for obsolescence
                    recipe.forEach(ing => {
                        if (!this.ingredientToResultMap.has(ing)) {
                            this.ingredientToResultMap.set(ing, new Set());
                        }
                        this.ingredientToResultMap.get(ing)!.add(item.id);
                    });
                }
            }
        }
    }

    /**
     * Attempts to fuse two items.
     * Returns the resulting Item if a recipe exists, otherwise null.
     */
    public fuse(item1Id: string, item2Id: string, progress: UserProgress): Item | null {
        const key = [item1Id, item2Id].sort().join('+');
        const resultId = this.recipeMap.get(key);

        if (!resultId) return null;

        const resultItem = this.items.get(resultId);
        if (!resultItem || resultItem.era_unlock > progress.currentEra) return null;

        return resultItem;
    }

    /**
     * Determines the state of an item for a given user progress.
     */
    public getItemState(itemId: string, progress: UserProgress): ItemState {
        const item = this.items.get(itemId);
        if (!item) throw new Error(`Item ${itemId} not found`);

        if (item.era_unlock > progress.currentEra) {
            return ItemState.HIBERNATION;
        }

        const isDiscovered = progress.discoveredItems.includes(itemId);
        if (isDiscovered) {
            if (this.isObsolete(itemId, progress)) {
                return ItemState.OBSOLETE;
            }
            return ItemState.ACTIVE;
        }

        return ItemState.HIBERNATION;
    }

    /**
     * Checks if an item is obsolete.
     * Obsolete: All items it can produce are already discovered.
     */
    private isObsolete(itemId: string, progress: UserProgress): boolean {
        const possibleResults = this.ingredientToResultMap.get(itemId);
        if (!possibleResults) return true; // Can't produce anything

        for (const resultId of possibleResults) {
            if (!progress.discoveredItems.includes(resultId)) {
                return false; // Still needed for at least one undiscovered item
            }
        }
        return true;
    }

    /**
     * Verifies if the current era can be advanced.
     */
    public canAdvanceEra(progress: UserProgress): boolean {
        // This is still O(N) but over a much smaller set usually. 
        // Could be optimized but likely not the bottleneck.
        const eraItems = Array.from(this.items.values()).filter(i => i.era_unlock === progress.currentEra && i.is_pivot);
        if (eraItems.length === 0) return true;
        return eraItems.every(pivot => progress.discoveredItems.includes(pivot.id));
    }
}
