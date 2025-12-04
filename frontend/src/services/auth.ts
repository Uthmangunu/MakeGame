import { useState, useEffect } from 'react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth';
import { auth, DEMO_MODE } from '../firebase';

// Demo user for when Firebase is not available
const DEMO_USER = {
    uid: 'demo_user_123',
    displayName: 'Demo User',
    email: 'demo@storymode.dev',
    photoURL: null,
} as unknown as User;

// State for demo mode
let demoUserState: User | null = null;
let demoListeners: ((user: User | null) => void)[] = [];

export const signInWithGoogle = async () => {
    if (DEMO_MODE) {
        console.log("DEMO_MODE: Fake login as Demo User");
        demoUserState = DEMO_USER;
        demoListeners.forEach(fn => fn(DEMO_USER));
        return DEMO_USER;
    }

    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signOut = async () => {
    if (DEMO_MODE) {
        console.log("DEMO_MODE: Fake logout");
        demoUserState = null;
        demoListeners.forEach(fn => fn(null));
        return;
    }

    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(DEMO_MODE ? demoUserState : null);
    const [loading, setLoading] = useState(!DEMO_MODE);

    useEffect(() => {
        if (DEMO_MODE) {
            // For demo mode, subscribe to our fake listener
            demoListeners.push(setUser);
            setLoading(false);
            return () => {
                demoListeners = demoListeners.filter(fn => fn !== setUser);
            };
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
};

