import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();
// import Ajv from 'ajv';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize OpenAI client for OpenRouter
// Note: In production, use functions.config().openrouter.key or Secret Manager
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
});

// const ajv = new Ajv();

// Define Schema for Validation (Simplified for brevity, but should match shared types)
// We can also use Gemini's responseSchema to enforce this.
// const gameSchema = { ... };


export const generateGameFromStory = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const storyPrompt = data.prompt;
    if (!storyPrompt || typeof storyPrompt !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "prompt" argument.');
    }

    try {
        // 2. Call OpenRouter (Gemini Pro 1.5)
        const systemPrompt = `
        You are a game designer. Create a top-down grid-based game based on the user's story.
        
        Output a JSON object with this structure:
        {
            "gameMeta": {
                "title": "Game Title",
                "summary": "Short summary",
                "startLevelId": "level_1",
                "initialFlags": {}
            },
            "levels": {
                "level_1": {
                    "levelId": "level_1",
                    "width": 10,
                    "height": 10,
                    "tiles": [
                        { "x": 0, "y": 0, "type": "wall" },
                        { "x": 1, "y": 1, "type": "floor" },
                        { "x": 2, "y": 2, "type": "start", "spawnPointId": "start_main" },
                        { "x": 5, "y": 5, "type": "door", "doorTargetLevelId": "level_2", "doorTargetSpawnPointId": "start_2" }
                    ],
                    "interactions": []
                }
            }
        }
        
        Rules:
        - Tile types: "floor", "wall", "door", "start".
        - "start" tiles MUST have a "spawnPointId".
        - "door" tiles MUST have "doorTargetLevelId" and "doorTargetSpawnPointId".
        - Ensure levels are connected if there are multiple.
        - Create at least 1 level.
        - Output ONLY valid JSON. Do not include markdown code blocks.
        `;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-pro-1.5",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: storyPrompt }
            ],
            response_format: { type: "json_object" } // Gemini via OpenRouter might support this, or we rely on prompt
        });

        const responseText = completion.choices[0].message.content;
        if (!responseText) {
            throw new Error("No response from AI");
        }

        // Clean up markdown code blocks if present (common issue even with instructions)
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const gameData = JSON.parse(cleanJson);

        // 3. Validate (Basic)
        // const validate = ajv.compile(gameSchema);
        // if (!validate(gameData)) {
        //    throw new Error("Invalid game data generated");
        // }

        // 4. Save to Firebase
        const gameId = db.collection('games').doc().id;
        const userId = context.auth.uid;

        // Save Meta
        await db.collection('games').doc(gameId).set({
            ...gameData.gameMeta,
            gameId,
            ownerUserId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Save Levels to Storage (or Firestore subcollection for easier access? Spec said Storage)
        // Let's use Firestore subcollection for MVP simplicity if allowed, or Storage as planned.
        // Plan said Storage.
        // But for "Reader" to read it, it needs public URL or signed URL.
        // Firestore is easier for "Reader" if we use client SDK.
        // Let's stick to Storage as per spec, but maybe just Firestore for now to speed up?
        // The spec said "Reader is a dumb JSON interpreter".
        // Let's use Firestore 'levels' subcollection. It's much easier to query/fetch.
        // Wait, the plan said "Write Level JSONs to Storage".
        // Okay, let's do Storage.

        const levels = gameData.levels;
        for (const [levelId, levelData] of Object.entries(levels)) {
            const file = bucket.file(`games/${gameId}/levels/${levelId}.json`);
            await file.save(JSON.stringify(levelData), {
                contentType: 'application/json',
                public: true // Make public for easy fetching? Or use signed URLs.
            });
            // Note: Making it public is risky for real app, but for MVP it's fine.
            // Alternatively, use getDownloadURL on client.
        }

        return { gameId };

    } catch (error) {
        console.error("Error generating game:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate game.');
    }
});
