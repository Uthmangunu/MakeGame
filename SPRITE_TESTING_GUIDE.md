# 🎨 Sprite Generation Testing Guide

## Quick Start - Test Sprite Generation

You now have **AI sprite generation ready to go** using your existing OpenRouter credits!

---

## 🚀 How to Test

### Option 1: Via Frontend UI (When Creating a Game)

1. **Navigate to Create Game**:
   ```
   http://localhost:5173/create
   ```

2. **Enter a story prompt** (or use a template):
   ```
   "A brave knight must defeat a dark wizard to save the kingdom"
   ```

3. **Click "GENERATE_GAME >"**

4. **What happens**:
   - ✅ AI generates the story, characters, and levels
   - ✅ AI creates detailed visual descriptions for hero & villain
   - 🎨 **NEW:** Sprites are being generated in the background!
   - ⏱️ Game is immediately playable with emojis
   - 🖼️ Sprites will appear once generation completes (~10-30 seconds)

### Option 2: Direct Function Call (Manual Test)

You can manually trigger sprite generation for any existing game:

```typescript
// In Firebase Console or via your frontend:
const generateSprites = firebase.functions().httpsCallable('generateSprites');

const result = await generateSprites({
  gameId: 'mock_game_1',
  characters: [
    {
      id: 'hero_main',
      name: 'Test Hero',
      role: 'hero',
      visualDescription: 'A young knight with silver armor, blue cape, holding a golden sword, brown hair, heroic pose'
    },
    {
      id: 'villain_main',
      name: 'Dark Wizard',
      role: 'villain',
      visualDescription: 'An evil wizard in black robes with purple trim, holding a dark staff with glowing red orb, long white beard, menacing expression'
    }
  ]
});

console.log('Sprites generated:', result.data.sprites);
```

---

## 📋 The System Prompt We're Using

The sprite generator uses this optimized prompt structure:

```
Create a pixel art sprite: [CHARACTER DESCRIPTION]

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
- Neutral standing pose unless specified otherwise
```

This prompt is in [functions/src/generateSprites.ts:64](functions/src/generateSprites.ts#L64)

---

## 🎯 Good Character Description Examples

### ✅ GOOD Examples (AI will generate these well):

```typescript
"A young female mage with bright blue robes adorned with silver stars, holding a glowing wooden staff in right hand, confident smile, long red hair in high ponytail, pale skin, purple magical aura"

"A warrior knight in shining silver plate armor with red cape, wielding a golden longsword, short brown hair, determined expression, blue eyes"

"An evil dark sorcerer in flowing black robes with purple accents, holding a twisted dark staff topped with glowing red crystal, long white beard, glowing green eyes, menacing grin"

"A forest ranger in green leather armor, holding a wooden bow, quiver of arrows on back, blonde braided hair, friendly smile, tan skin"
```

### ❌ BAD Examples (Too vague or include background):

```typescript
"A mage" // Too vague

"A warrior standing in a castle" // Includes background - BAD

"Someone strong" // Not descriptive enough

"A hero with cool powers" // Too abstract
```

---

## 🔧 How It Works (Technical Flow)

```
1. User creates game with story prompt
   ↓
2. AI generates character descriptions (Stage 1)
   Example output:
   {
     "characters": [
       {
         "id": "hero_main",
         "visualDescription": "A young knight with silver armor..."
       }
     ]
   }
   ↓
3. generateSprites function is called
   ↓
4. For each character:
   - Build pixel art prompt
   - Call OpenRouter Image API (Google Imagen)
   - Download generated image
   - Upload to Firebase Storage
   - Get public URL
   ↓
5. Update game metadata with sprite URLs
   {
     "assets": {
       "heroUrl": "https://storage.googleapis.com/..."
     }
   }
   ↓
6. Frontend detects sprite URLs and loads them
   ↓
7. Player sees custom sprites instead of emojis!
```

---

## 📊 Cost Tracking

**Using OpenRouter with your existing credits:**

| Action | Cost | Your Credits |
|--------|------|--------------|
| Generate story (Gemini) | ~$0.002 | ✅ Covered |
| Generate 2 sprites (Imagen) | ~$0.08 | ✅ Covered |
| **Total per game** | ~$0.09 | ✅ Affordable |

**With 100 credits:**
- You can generate **~1,100 games** before running out!
- Each game = unique story + 2 custom sprites

---

## 🐛 Troubleshooting

### Sprites Not Appearing?

1. **Check the console**:
   ```javascript
   // In browser DevTools (F12):
   // Should see:
   "Loading hero sprite from: https://storage.googleapis.com/..."
   "✅ Using hero sprite"

   // If you see:
   "⚠️ Using fallback emoji player"
   // Then sprites haven't been generated yet or failed
   ```

2. **Check Firebase Storage**:
   - Go to Firebase Console → Storage
   - Look for `games/{gameId}/sprites/`
   - Sprites should be there as PNG files

3. **Check Firestore**:
   ```javascript
   // In Firestore console:
   games/{gameId}/assets.heroUrl
   // Should have a URL
   ```

### Sprites Generate But Don't Load?

**Common issue**: CORS or permissions

**Fix**: Make sure sprites are public
```typescript
// This is already in the code:
await file.makePublic();
```

---

## 🎨 Customizing the Sprite Style

Want different art styles? Edit the prompt in `generateSprites.ts`:

### For Anime Style:
```typescript
"Create an anime-style game sprite: ${visualDescription}
- Anime art style with expressive eyes
- Vibrant colors and clean linework
- ..."
```

### For 8-bit NES Style:
```typescript
"Create an 8-bit NES-style sprite: ${visualDescription}
- Limited to 4 colors per sprite
- Very simple, chunky pixels
- NES game aesthetic
- ..."
```

### For Modern Pixel Art:
```typescript
"Create a modern pixel art sprite: ${visualDescription}
- High-detail pixel art (128x128)
- More colors and shading
- Smooth anti-aliasing on edges
- ..."
```

---

## ✅ Next Steps

1. **Test it now**: Create a new game via the UI
2. **Watch the console**: See sprites being generated
3. **Refresh the game**: See custom sprites instead of emojis
4. **Iterate**: Try different character descriptions to get better results

---

## 📝 Function Endpoints

| Function | Purpose | Parameters |
|----------|---------|------------|
| `generateGameFromStory` | Create game from story prompt | `{ prompt: string }` |
| `generateSprites` | Generate sprites for characters | `{ gameId: string, characters: Character[] }` |

Both are deployed as Firebase Cloud Functions and accessible via:
```typescript
firebase.functions().httpsCallable('functionName')
```

---

## 🎯 Summary

✅ **Sprite generation is READY**
✅ **Uses your existing OpenRouter credits**
✅ **Automatically triggered when creating games**
✅ **Graceful fallback to emojis if generation fails**
✅ **~$0.09 per game (very affordable)**

**Test it now by creating a new game!** 🚀
