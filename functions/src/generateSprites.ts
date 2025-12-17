import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

// Extended type for OpenRouter's image generation response
interface OpenRouterChatCompletionMessage {
    role: string;
    content: string;
    images?: string[]; // Base64-encoded data URLs
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize OpenAI client for OpenRouter (reuse existing setup)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: OPENROUTER_API_KEY,
});

/**
 * Cloud Function to generate pixel art sprites using Google's Imagen via OpenRouter
 * Takes character descriptions and generates transparent pixel art sprites
 */
export const generateSprites = functions.https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to generate sprites');
    }

    const { gameId, characters } = data;

    if (!gameId || !characters || !Array.isArray(characters)) {
        throw new functions.https.HttpsError('invalid-argument', 'Must provide gameId and characters array');
    }

    try {
        console.log(`🎨 Generating sprites for game: ${gameId}`);
        const spriteUrls: { [characterId: string]: string } = {};

        for (const character of characters) {
            console.log(`🖼️ Generating sprite for: ${character.name} (${character.role})`);

            // Build optimized pixel art prompt
            const imagePrompt = buildPixelArtPrompt(character.visualDescription);

            console.log(`📝 Prompt: ${imagePrompt.substring(0, 100)}...`);

            // Generate image using Imagen 3 via OpenRouter
            const imageUrl = await generateImageWithImagen(imagePrompt);

            // Upload to Firebase Storage
            const spriteUrl = await uploadSpriteToStorage(imageUrl, gameId, character.id);

            spriteUrls[character.id] = spriteUrl;
            console.log(`✅ Sprite generated for ${character.name}: ${spriteUrl}`);
        }

        // Update game metadata with sprite URLs
        await db.collection('games').doc(gameId).update({
            'assets.heroUrl': spriteUrls['hero_main'] || null,
            'assets.villainUrl': spriteUrls['villain_main'] || null,
            'assets.npcSprites': Object.fromEntries(
                Object.entries(spriteUrls).filter(([id]) => id.startsWith('npc_'))
            )
        });

        console.log(`🎉 All sprites generated for game ${gameId}`);

        return {
            success: true,
            sprites: spriteUrls,
            message: `Generated ${Object.keys(spriteUrls).length} sprites successfully`
        };

    } catch (error) {
        console.error('❌ Error generating sprites:', error);
        throw new functions.https.HttpsError('internal', `Failed to generate sprites: ${error}`);
    }
});

/**
 * Build a pixel art optimized prompt from character description
 */
function buildPixelArtPrompt(visualDescription: string): string {
    return `Create a pixel art sprite: ${visualDescription}

Style requirements:
- 16-bit retro game sprite style (like Pokemon FireRed or GBA RPGs)
- Clean pixel art with sharp edges and clear outlines
- Vibrant, saturated colors with good contrast
- Character should be centered and facing forward
- Full body visible from head to feet
- Simple, iconic design suitable for a 32x32 or 64x64 game sprite
- Transparent or white background
- No shadows, keep it flat 2D pixel art
- Clear silhouette, easy to recognize at small size
- Retro game aesthetic, NOT realistic

Technical specs:
- Square aspect ratio (1:1)
- Clean pixel boundaries
- Limited color palette (like classic sprite art)
- Character takes up 70-80% of frame
- Neutral standing pose unless specified otherwise`;
}

/**
 * Generate image using Flux 2 Pro via OpenRouter
 * OpenRouter uses chat completions endpoint with modalities for image generation
 */
async function generateImageWithImagen(prompt: string): Promise<string> {
    try {
        console.log('🎨 Generating pixel art sprite with Flux 2 Pro...');

        // OpenRouter's image generation uses chat completions with modalities
        const response = await openai.chat.completions.create({
            model: "black-forest-labs/flux.2-pro", // Flux 2 Pro
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            modalities: ["image", "text"] as any, // Required for image generation
        });

        const message = response.choices[0]?.message as OpenRouterChatCompletionMessage;
        const images = message?.images;
        if (!images || images.length === 0) {
            throw new Error('No images in response');
        }

        // Images are returned as base64-encoded data URLs
        const base64Image = images[0];
        console.log('✅ Sprite generated with Flux 2 Pro');
        return base64Image;

    } catch (error: any) {
        console.error('❌ Flux 2 Pro generation failed:', error.message);

        // Fallback 1: Try Flux 2 Flex (cheaper, faster)
        try {
            console.log('⚠️ Trying Flux 2 Flex (faster model)...');
            const flexResponse = await openai.chat.completions.create({
                model: "black-forest-labs/flux.2-flex",
                messages: [{ role: "user", content: prompt }],
                modalities: ["image", "text"] as any,
            });

            const flexMessage = flexResponse.choices[0]?.message as OpenRouterChatCompletionMessage;
            const flexImages = flexMessage?.images;
            if (flexImages && flexImages.length > 0) {
                console.log('✅ Sprite generated with Flux 2 Flex');
                return flexImages[0];
            }
        } catch (flexError) {
            console.error('❌ Flux 2 Flex also failed:', flexError);
        }

        // Fallback 2: Try Gemini 2.5 Flash (with image generation)
        try {
            console.log('⚠️ Final fallback to Gemini 2.5 Flash...');
            const geminiResponse = await openai.chat.completions.create({
                model: "google/gemini-2.5-flash-image-preview",
                messages: [{ role: "user", content: prompt }],
                modalities: ["image", "text"] as any,
            });

            const geminiMessage = geminiResponse.choices[0]?.message as OpenRouterChatCompletionMessage;
            const geminiImages = geminiMessage?.images;
            if (geminiImages && geminiImages.length > 0) {
                console.log('✅ Sprite generated with Gemini 2.5 Flash');
                return geminiImages[0];
            }
        } catch (geminiError) {
            console.error('❌ Gemini 2.5 Flash also failed:', geminiError);
        }

        // All fallbacks failed
        throw new Error(`All image generation attempts failed. Original error: ${error.message}`);
    }
}

/**
 * Convert base64 data URL to buffer and upload to Firebase Storage
 */
async function uploadSpriteToStorage(
    base64DataUrl: string,
    gameId: string,
    characterId: string
): Promise<string> {
    try {
        // Convert base64 data URL to buffer
        // Format: "data:image/png;base64,iVBORw0KGgo..."
        const base64Data = base64DataUrl.split(',')[1] || base64DataUrl;
        const buffer = Buffer.from(base64Data, 'base64');

        // Create file path
        const fileName = `games/${gameId}/sprites/${characterId}.png`;
        const file = bucket.file(fileName);

        // Upload to Firebase Storage
        await file.save(buffer, {
            metadata: {
                contentType: 'image/png',
                metadata: {
                    gameId: gameId,
                    characterId: characterId,
                    generatedAt: new Date().toISOString()
                }
            }
        });

        // Make file publicly accessible
        await file.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        return publicUrl;

    } catch (error) {
        console.error('Error uploading sprite:', error);
        throw new Error(`Failed to upload sprite: ${error}`);
    }
}
