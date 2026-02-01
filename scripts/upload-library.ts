import { db } from "../src/lib/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import items from "../src/data/items.json";
import { Item } from "../src/types/game";

async function uploadLibrary() {
    const itemsLib = items as Item[];
    const collectionRef = collection(db, "items_library");

    // Firestore batches are limited to 500 operations
    const BATCH_SIZE = 500;

    for (let i = 0; i < itemsLib.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = itemsLib.slice(i, i + BATCH_SIZE);

        chunk.forEach(item => {
            const docRef = doc(collectionRef, item.id);
            // Firestore doesn't support nested arrays, so we flatten recipes
            const firestoreData = {
                ...item,
                recipes: item.recipes.map(r => r.join('+'))
            };
            batch.set(docRef, firestoreData);
        });

        await batch.commit();
        console.log(`Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1} / ${Math.ceil(itemsLib.length / BATCH_SIZE)}`);
    }

    console.log("Upload complete!");
}

uploadLibrary().catch(console.error);
