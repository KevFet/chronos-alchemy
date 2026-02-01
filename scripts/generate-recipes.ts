import { Item, Dimension } from '../src/types/game';

const ERAS = [
    'Préhistoire', 'Antiquité', 'Moyen-Âge', 'Renaissance', 'Révolution Industrielle',
    'Âge Atomique', 'Ère Numérique', 'Âge Spatial', 'Ère de l\'IA', 'Bio-Ingénierie',
    'Nano-Ère', 'Ère Quantique', 'Ère Galactique', 'Ère Post-Humaine', 'La Singularité'
];

const DIMENSIONS: Dimension[] = ['matiere', 'concept', 'micro', 'macro', 'imaginaire'];

function generateInitialItems(): Item[] {
    const items: Item[] = [
        {
            id: 'terre',
            emoji: '🌍',
            name: 'Terre',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: []
        },
        {
            id: 'eau',
            emoji: '💧',
            name: 'Eau',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: []
        },
        {
            id: 'feu',
            emoji: '🔥',
            name: 'Feu',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: []
        },
        {
            id: 'air',
            emoji: '💨',
            name: 'Air',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: []
        },
        {
            id: 'boue',
            emoji: '💩', // Using this for mud as a placeholder or search better
            name: 'Boue',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: [['terre', 'eau']]
        },
        {
            id: 'vapeur',
            emoji: '💨',
            name: 'Vapeur',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: [['eau', 'feu']]
        },
        {
            id: 'energie',
            emoji: '⚡',
            name: 'Énergie',
            era_unlock: 0,
            is_pivot: false,
            is_ephemeral: true,
            dimension: 'concept',
            recipes: [['vapeur', 'feu']]
        },
        {
            id: 'pave_pierre',
            emoji: '🪨',
            name: 'Outil en Pierre',
            era_unlock: 0,
            is_pivot: true,
            is_ephemeral: false,
            dimension: 'matiere',
            recipes: [['terre', 'feu']] // Simple recipe for testing
        }
    ];

    // Logic to scale to 5000:
    // We can procedurally generate "complex" items by combining existing ones.
    // For the sake of this script, I'll generate placeholders to show the scale.

    for (let i = items.length; i < 5000; i++) {
        const era = Math.floor((i / 5000) * 15);
        const dim = DIMENSIONS[i % DIMENSIONS.length];
        const ingredient1 = items[Math.floor(Math.random() * i)].id;
        const ingredient2 = items[Math.floor(Math.random() * i)].id;

        items.push({
            id: `item_${i}`,
            emoji: '✨',
            name: `Objet ${i}`,
            era_unlock: era,
            is_pivot: i % 300 === 0, // Every 300th item is a pivot
            is_ephemeral: Math.random() > 0.8,
            dimension: dim,
            recipes: [[ingredient1, ingredient2]]
        });
    }

    return items;
}

const allItems = generateInitialItems();
console.log(`Généré ${allItems.length} objets.`);
// In a real scenario, this would write to Firestore.
// For now, I'll export it as a JSON for the app to use.
import fs from 'fs';
fs.writeFileSync('/Users/kevin/.gemini/antigravity/scratch/alchemy-game/src/data/items.json', JSON.stringify(allItems, null, 2));
