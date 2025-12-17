# 🎨 AI Sprite Generation System - Complete Guide

## Overview: "Story-to-Sprite" Architecture

This system transforms user story prompts into fully playable games with AI-generated pixel art sprites in **three distinct stages**.

---

## 🗺️ The Three Stages

### **Stage 1: The Narrative Engine** ✅ IMPLEMENTED
**Goal:** Lock down the story structure before generating expensive images.

**Input:** User's story prompt (e.g., "A young mage must defeat an evil sorcerer")

**Output:** Structured JSON with character descriptions

**JSON Structure:**
```json
{
  "gameMeta": {
    "title": "The Crystal of Zarthos",
    "summary": "A young mage must reclaim the Crystal...",
    "characters": [
      {
        "id": "hero_main",
        "name": "Elara",
        "role": "hero",
        "visualDescription": "A young female mage with blue robes, holding a wooden staff, determined expression, red hair in a ponytail, pale skin, full body, neutral stance"
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
  "levels": { ... }
}
```

**Implementation:**
- ✅ Type definitions added to `shared/types.ts` (Character, GameAssets interfaces)
- ✅ Backend updated in `functions/src/generateGame.ts` with detailed visual description prompts
- ✅ AI instructed to create pixel-art-optimized character descriptions

---

### **Stage 2: The Art Engine** 🔜 TODO
**Goal:** Convert text descriptions into transparent PNG sprites.

**Tech Stack:**
- **Generator:** Stable Diffusion XL via API (Replicate or Stability AI)
- **Model:** Pixel Art LoRA or fine-tune (or standard SDXL with good prompting)
- **Background Removal:** `rembg` Python library or Remove.bg API

**Image Prompt Template:**
```text
pixel art sprite of {visualDescription},
white background,
16-bit snes style,
pokemon firered art style,
full body shot,
neutral stance,
clean sharp lines,
flat 2d,
no shadow
```

**Example Visual Description:**
```
"A young female mage with bright blue robes, wooden staff in right hand, confident smile, long red hair in ponytail, pale skin, full body, neutral stance"
```

**Process:**
1. Take `visualDescription` from Stage 1
2. Inject into image prompt template
3. Generate image with Stable Diffusion XL (on white background)
4. Remove background using `rembg` to create transparent PNG
5. Upload to Firebase Storage
6. Save URL to `gameMeta.assets.heroUrl` / `villainUrl`

**Implementation Checklist:**
- [ ] Create Cloud Function: `generateSprites`
- [ ] Integrate Stable Diffusion API (Replicate or Stability AI)
- [ ] Add background removal step
- [ ] Upload to Firebase Storage
- [ ] Update GameMeta with sprite URLs

---

### **Stage 3: The Level Logic** ✅ PARTIALLY IMPLEMENTED
**Goal:** Place generated sprites into the game grid.

**Current Status:**
- ✅ Phaser GameScene can load dynamic sprites via URLs
- ✅ Fallback to emoji rendering if sprites not available
- ✅ Sprite scaling and positioning system implemented

**How It Works:**
```typescript
// GameScene receives asset URLs via init()
this.scene.start('GameScene', {
  heroSpriteUrl: gameMeta.assets.heroUrl,
  villainSpriteUrl: gameMeta.assets.villainUrl
});

// Phaser dynamically loads the sprites
preload() {
  if (this.heroSpriteUrl) {
    this.load.image('hero_sprite', this.heroSpriteUrl);
  }
}

// Then creates sprite instead of emoji
create() {
  this.player = this.add.sprite(x, y, 'hero_sprite');
  this.player.setDisplaySize(32, 32); // Scale to tile size
}
```

---

## 🛠️ Implementation Guide

### For Backend Developers

**Step 1: Implement Stage 2 (Image Generation)**

Create a new Cloud Function:

```typescript
// functions/src/generateSprites.ts
import * as functions from 'firebase-functions';
import Replicate from 'replicate';
import * as admin from 'firebase-admin';
import { removeBackground } from 'rembg'; // Or use API

export const generateSprites = functions.https.onCall(async (data, context) => {
  const { gameId, characters } = data;

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY
  });

  const spriteUrls: { [characterId: string]: string } = {};

  for (const character of characters) {
    // Build the prompt
    const prompt = `pixel art sprite of ${character.visualDescription}, white background, 16-bit snes style, pokemon firered art style, full body shot, neutral stance, clean sharp lines, flat 2d, no shadow`;

    // Generate image
    const output = await replicate.run(
      "stability-ai/sdxl:...",
      { input: { prompt } }
    );

    // Download image, remove background, upload to Storage
    const imageUrl = output[0];
    const processedImage = await removeBackgroundAndUpload(imageUrl, gameId, character.id);

    spriteUrls[character.id] = processedImage;
  }

  // Update GameMeta in Firestore
  await admin.firestore().collection('games').doc(gameId).update({
    'assets.heroUrl': spriteUrls['hero_main'],
    'assets.villainUrl': spriteUrls['villain_main']
  });

  return { success: true, sprites: spriteUrls };
});
```

**Step 2: Update Game Creation Flow**

```typescript
// functions/src/generateGame.ts (after saving game)
// Call sprite generation as a background task
await generateSprites({ gameId, characters: gameMeta.characters });
```

### For Frontend Developers

**Step 1: Pass Sprite URLs to GameScene**

```typescript
// components/GameCanvas.tsx
useEffect(() => {
  if (!gameLoaded || phaserGame) return;

  const game = new Phaser.Game({
    // ... config
    scene: [GameScene]
  });

  // Fetch game metadata
  const gameMeta = await getGameMeta(gameId);

  // Pass sprite URLs to scene
  game.scene.start('GameScene', {
    heroSpriteUrl: gameMeta.assets?.heroUrl,
    villainSpriteUrl: gameMeta.assets?.villainUrl
  });
});
```

**Step 2: Test with Mock Sprites**

For testing without AI generation, use placeholder Pokémon sprites:

```typescript
// mockData.ts
export const MOCK_GAME_META: GameMeta = {
  // ... existing fields
  characters: [
    {
      id: 'hero_main',
      name: 'Test Hero',
      role: 'hero',
      visualDescription: 'test description',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' // Bulbasaur
    }
  ],
  assets: {
    heroUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    villainUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' // Mewtwo
  }
};
```

---

## 🎯 Next Steps

### Immediate (Test with Mock Data)
1. ✅ Update `mockData.ts` with test sprite URLs
2. ✅ Launch game and verify sprites load correctly
3. ✅ Test fallback to emojis when no sprites provided

### Short Term (Implement Stage 2)
1. [ ] Set up Replicate or Stability AI account
2. [ ] Implement `generateSprites` Cloud Function
3. [ ] Integrate background removal
4. [ ] Test full pipeline: prompt → narrative → sprites → game

### Long Term (Production Polish)
1. [ ] Add loading indicators for sprite generation
2. [ ] Implement retry logic for failed generations
3. [ ] Cache generated sprites
4. [ ] Add image quality validation
5. [ ] Implement NPC and item sprite generation (extend beyond hero/villain)

---

## 📊 Cost Estimation

**Per Game Generated:**
- Stage 1 (Narrative): ~$0.002 (Gemini Pro 1.5)
- Stage 2 (2 Sprites): ~$0.10 (SDXL via Replicate)
- Storage: ~$0.001/month (Firebase)
- **Total per game:** ~$0.11

**Scaling:**
- 100 games/day = $11/day = $330/month
- 1000 games/day = $110/day = $3,300/month

---

## 🚀 Testing the Current System

Try it now with WASD keys:
```bash
# The game is already running!
# Visit: http://localhost:5173/play/mock_game_1
# Press W/A/S/D to move
# Currently shows emoji fallbacks
```

Next step: Add mock sprite URLs to test the sprite loading system!
