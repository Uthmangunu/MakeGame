# 🔧 Troubleshooting Guide - Game Not Working

## Current Issue
Game doesn't appear to be working when you try to play it.

## Diagnostic Steps

### 1. Check if Server is Running
- Server URL: http://localhost:5173/
- Status: ✅ RUNNING (confirmed)

### 2. Test the Mock Game
Navigate to: http://localhost:5173/play/mock_game_1

**Expected behavior:**
1. Tutorial overlay appears (dark background with white card)
2. Click "START_PLAYING >" button
3. See colored squares (game tiles):
   - Black squares = walls
   - Gray squares = floor
   - Green square = player
   - Red square (position 3,3) = NPC
   - Gold square (position 6,6) = Item
   - Brown square = Door

### 3. What to Check in Browser Console (F12)

Open Developer Tools and look for:

**Console Tab:**
```
✅ Good signs:
- "🎮 Initializing game: mock_game_1"
- "✅ Game metadata loaded"
- "✅ Start level loaded"
- "Phaser v3.90.0"

❌ Bad signs:
- Red error messages
- "Cannot read property"
- "undefined is not a function"
- Network errors (404, 500)
```

**Network Tab:**
- Check if any requests are failing

### 4. Common Issues & Fixes

#### Issue: Blank screen
**Possible causes:**
1. Phaser not loading
2. Game container div not found
3. React component not rendering

**Fix:** Check console for errors

#### Issue: Tutorial shows but game doesn't render
**Possible causes:**
1. Phaser initialization failed
2. GameScene has errors
3. Mock data not loading

**Fix:** Look for Phaser errors in console

#### Issue: Controls don't work
**Possible causes:**
1. Event listeners not attached
2. Keyboard focus not on game
3. GameScene update loop not running

**Fix:** Click on the game canvas first

### 5. Manual Test Commands

Open browser console (F12) and try:

```javascript
// Check if gameState is loaded
window.gameState = require('./game/gameState').gameState;
console.log(gameState.getCurrentLevel());

// Check if mock data exists
import('./game/mockData').then(m => console.log(m.LEVEL_1));
```

### 6. Quick Fixes to Try

1. **Hard Refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```
3. **Restart dev server:**
   ```bash
   # Kill the server (Ctrl+C)
   cd /Users/uthmansadiqumar/MakeGame/frontend
   npm run dev
   ```

### 7. If Still Not Working

**Collect this info:**
1. What do you see when you visit http://localhost:5173/ ?
2. What do you see when you click "PLAY >" on Mock Adventure?
3. What errors appear in Console (F12)?
4. Does the tutorial overlay appear?
5. Can you see ANY colored squares?

**Then I can diagnose the specific issue!**

---

## Most Likely Issues

Based on the symptoms ("game doesn't work"), here are the top suspects:

### 1. Phaser Canvas Not Rendering (80% likely)
- **Symptom:** Tutorial shows, but no game tiles
- **Cause:** `parent: 'game-container'` div not found or Phaser scene error
- **Fix:** Check if `<div id="game-container">` exists in GameCanvas.tsx

### 2. Mock Data Not Loading (15% likely)
- **Symptom:** Blank screen or error about missing level
- **Cause:** Import path issue or DEMO_MODE not working
- **Fix:** Check gameService.ts returns mock data

### 3. Event System Broken (5% likely)
- **Symptom:** Game renders but interactions don't work
- **Cause:** Phaser events not connected to React
- **Fix:** Check game.events.emit/on in GameCanvas and GameScene

---

## Next Steps

1. Visit http://localhost:5173/play/mock_game_1
2. Open Console (F12)
3. Tell me:
   - What you see on screen
   - What errors appear in console
   - Whether tutorial overlay shows

Then I can give you a targeted fix!
