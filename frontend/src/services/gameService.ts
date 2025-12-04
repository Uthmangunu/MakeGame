import { db, storage } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import type { GameMeta, Level } from '@shared/types';
import { MOCK_GAME_META, MOCK_LEVELS } from '../game/mockData';

export const getUserGames = async (userId: string): Promise<GameMeta[]> => {
    try {
        const q = query(collection(db, 'games'), where('ownerUserId', '==', userId));
        const querySnapshot = await getDocs(q);
        const games: GameMeta[] = [];
        querySnapshot.forEach((doc) => {
            games.push(doc.data() as GameMeta);
        });

        // Fallback for demo if no games found (or if using mock auth)
        if (games.length === 0) {
            return [MOCK_GAME_META];
        }

        return games;
    } catch (error) {
        console.error("Error fetching user games:", error);
        // Return mock for now to unblock UI dev
        return [MOCK_GAME_META];
    }
};

export const getGameMeta = async (gameId: string): Promise<GameMeta | null> => {
    if (gameId === 'mock_game_1') return MOCK_GAME_META;

    try {
        // Try Firestore first for meta
        const docRef = doc(db, 'games', gameId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as GameMeta;
        } else {
            // Try storage? Usually meta is in Firestore for querying.
            // But spec said meta.json in storage. Let's try fetching from storage if doc missing?
            // For MVP, assume Firestore has the meta record.
            return null;
        }
    } catch (error) {
        console.error("Error fetching game meta:", error);
        return null;
    }
};

export const getLevel = async (gameId: string, levelId: string): Promise<Level> => {
    if (gameId === 'mock_game_1') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_LEVELS[levelId as keyof typeof MOCK_LEVELS]);
            }, 100);
        });
    }

    try {
        // Fetch from Firebase Storage
        // Path: games/{gameId}/levels/{levelId}.json
        const levelRef = ref(storage, `games/${gameId}/levels/${levelId}.json`);
        const url = await getDownloadURL(levelRef);
        const response = await fetch(url);
        const levelData = await response.json();
        return levelData as Level;
    } catch (error) {
        console.error(`Error fetching level ${levelId}:`, error);
        throw error;
    }
};
