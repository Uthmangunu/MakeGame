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
        // 2. Call OpenRouter (Gemini Pro 1.5) - STAGE 1: Narrative Engine
        const systemPrompt = `
        You are the Narrative Director for a retro RPG game engine. Your job is to take a user's short idea and expand it into a structured game plan.

        You MUST output valid JSON only. The structure must include:

        Output a JSON object with this EXACT structure:
        {
            "gameMeta": {
                "title": "The Crystal of Zarthos",
                "summary": "A young mage must reclaim the Crystal of Zarthos from an evil sorcerer...",
                "startLevelId": "level_1",
                "initialFlags": {},
                "characters": [
                    {
                        "id": "hero_main",
                        "name": "Elara",
                        "role": "hero",
                        "visualDescription": "A young female mage with blue robes, holding a wooden staff, determined expression, red hair in a ponytail, white skin, full body, neutral stance"
                    },
                    {
                        "id": "villain_main",
                        "name": "Zarthos",
                        "role": "villain",
                        "visualDescription": "A dark sorcerer in black and purple armor, green glowing eyes, holding a jagged iron sword, menacing stance, full body, dark cloak"
                    }
                ],
                "settingVisuals": "Dark dungeon with stone brick walls and flickering torchlight"
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
                        { "x": 3, "y": 3, "type": "npc", "npcId": "guard_1", "tileCode": 4 },
                        { "x": 4, "y": 4, "type": "item", "itemId": "key_ancient", "tileCode": 5 },
                        { "x": 5, "y": 5, "type": "door", "doorTargetLevelId": "level_2", "doorTargetSpawnPointId": "start_2" }
                    ],
                    "interactions": {
                        "4": {
                            "trigger": "on_talk",
                            "dialogue": "Hello traveler! Welcome to our village.",
                            "setFlag": "met_guard"
                        },
                        "5": {
                            "trigger": "on_use",
                            "message": "You found an Ancient Key!",
                            "giveItemFlag": "key_ancient",
                            "setFlag": "has_ancient_key"
                        }
                    }
                }
            }
        }

        CRITICAL RULES FOR CHARACTER VISUAL DESCRIPTIONS:
        1. Each "visualDescription" must be HIGHLY DETAILED for pixel art generation.
        2. Include: clothing colors, held items, facial expression, hair style/color, skin tone, body posture.
        3. Always end with: "full body, neutral stance" for sprites.
        4. DO NOT include background details in character descriptions (no "standing in a dungeon").
        5. Focus on the CHARACTER ONLY - their appearance, outfit, and what they're holding.
        6. Use clear color descriptions: "blue robes", "red hair", "green glowing eyes".
        7. The visualDescription will be used to generate a 16-bit pixel art sprite.

        Example good visualDescription:
        "A young female mage with bright blue robes, wooden staff in right hand, confident smile, long red hair in ponytail, pale skin, full body, neutral stance"

        Example bad visualDescription:
        "A mage in a dungeon" (too vague, includes background)

        LEVEL DESIGN RULES:
        - Tile types: "floor", "wall", "door", "start", "npc", "item".
        - "start" tiles MUST have a "spawnPointId".
        - "door" tiles MUST have "doorTargetLevelId" and "doorTargetSpawnPointId".
        - "npc" tiles MUST have "npcId" and a unique "tileCode" (use numbers 4+).
        - "item" tiles MUST have "itemId" and a unique "tileCode" (use numbers 4+).
        - Each level MUST have interactions object with at least one NPC dialogue.
        - Create NPCs that fit the story theme and advance the narrative.
        - Add at least 2 NPCs with dialogue per level.
        - Include items that serve as quest objectives or keys.
        - Use "requirementFlag" in interactions to create puzzle sequences (e.g., need key to open chest).
        - Trigger types: "on_step" (automatic when walking on tile), "on_talk" (press SPACE on NPC), "on_use" (press SPACE on item).
        - Ensure levels are connected if there are multiple.
        - Create at least 1 level (2-3 is better for story progression).

        SETTING VISUALS:
        - Provide a short description of floor/wall textures for the environment
        - Example: "Stone brick dungeon walls" or "Forest grass and trees"

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

        // 6. Trigger sprite generation in background (non-blocking)
        // Import and call generateSprites after game is created
        // Trigger sprite generation asynchronously (don't await - let it run in background)
        if (gameData.gameMeta.characters && gameData.gameMeta.characters.length > 0) {
            console.log('🎨 Triggering sprite generation for characters...');

            // Import and call generateSprites function
            // This will run in the background while user starts playing with emojis
            (async () => {
                try {
                    const { generateSprites } = await import('./generateSprites');
                    await generateSprites.run({
                        gameId,
                        characters: gameData.gameMeta.characters
                    }, {
                        auth: context.auth,
                        instanceIdToken: context.instanceIdToken,
                        rawRequest: context.rawRequest
                    } as any);
                    console.log('✅ Sprites generated successfully for game:', gameId);
                } catch (spriteError) {
                    console.error('❌ Background sprite generation failed:', spriteError);
                    // Don't throw - let the game be playable with emojis
                }
            })();
        }

        return {
            gameId,
            message: 'Game created! Sprites are being generated in the background...'
        };

    } catch (error) {
        console.error("Error generating game:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate game.');
    }
});
