import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { UserProgress, Item } from "../types/game";

const PROGRESS_COLLECTION = "user_progress";
const ITEMS_COLLECTION = "items_library";

export const saveUserProgress = async (userId: string, progress: UserProgress) => {
    const userRef = doc(db, PROGRESS_COLLECTION, userId);
    await setDoc(userRef, progress, { merge: true });
};

export const loadUserProgress = async (userId: string): Promise<UserProgress | null> => {
    const userRef = doc(db, PROGRESS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as UserProgress) : null;
};

export const fetchItemsLibrary = async (): Promise<Item[]> => {
    // Try to load from localStorage first for optimization
    if (typeof window !== "undefined") {
        const cached = localStorage.getItem("items_library");
        if (cached) {
            return JSON.parse(cached);
        }
    }

    const itemsRef = collection(db, ITEMS_COLLECTION);
    const snap = await getDocs(itemsRef);
    const items = snap.docs.map(doc => doc.data() as Item);

    // Cache in localStorage
    if (typeof window !== "undefined") {
        localStorage.setItem("items_library", JSON.stringify(items));
    }

    return items;
};
