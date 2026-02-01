import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        if (!auth.app.options.apiKey || auth.app.options.apiKey === "dummy-key") {
            throw new Error("Firebase API Key is missing. Please configure .env.local");
        }
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        alert(error instanceof Error ? error.message : "Erreur de connexion");
        throw error;
    }
};

export const logout = () => signOut(auth);
