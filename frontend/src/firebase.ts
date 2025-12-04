import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// TODO: Replace with your actual Firebase project config
// or use environment variables: VITE_FIREBASE_API_KEY, etc.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock_project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock_project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock_project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators if running locally
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log("Using local Firebase Emulators");
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, '127.0.0.1', 8085);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
