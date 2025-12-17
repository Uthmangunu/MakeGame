# 🔧 DEBUG INSTRUCTIONS - Find Out Why Game Won't Work

I've created a diagnostic tool to help you find the issue!

## ✅ Step 1: Visit the Debug Page

Open your browser and go to:
```
http://localhost:5173/debug
```

This page will:
- ✅ Test if DEMO_MODE is enabled
- ✅ Test if game data loads correctly
- ✅ Show all system logs in real-time
- ✅ Display the loaded game data
- ✅ Check if Phaser library loaded

## 📋 Step 2: What to Look For

On the debug page, you'll see a **green terminal-style console**. Look for these messages:

### ✅ **GOOD SIGNS** (Everything Working):
```
🔍 Starting diagnostic...
DEMO_MODE: true
📦 Testing getGameMeta("mock_game_1")...
✅ Meta loaded: {"gameId":"mock_game_1", ...}
📦 Testing getLevel("mock_game_1", "level_1")...
✅ Level loaded: The Hall
   - Width: 10, Height: 10
   - Tileset keys: 0, 1, 2, 3, 4, 5
   - Interactions: 2 defined
   - Spawn points: start, from_level_2
✅ All data loaded successfully!
```

### ❌ **BAD SIGNS** (Something Broken):
```
❌ ERROR: Cannot read property...
❌ Meta is null
❌ ERROR: Module not found
```

## 📸 Step 3: Take Screenshots

1. Take a screenshot of the **entire debug page**
2. Take a screenshot of the **browser console** (press F12 → Console tab)
3. Tell me what you see

## 🎮 Step 4: Try the Game

After seeing the debug results, click the **"TRY PLAYING THE GAME →"** button

Or manually visit:
```
http://localhost:5173/play/mock_game_1
```

## 🔍 Step 5: Describe What You See

Tell me EXACTLY what you see when you visit `/play/mock_game_1`:

### Option A: Tutorial Overlay Shows
```
I see:
☑ Dark overlay covering screen
☑ White card with "WELCOME_TO_YOUR_GAME!"
☑ Instructions about WASD, SPACE, I keys
☑ "START_PLAYING >" button

But when I click "START_PLAYING >":
□ Nothing happens
□ Black screen
□ White screen
□ Colored squares appear (GOOD!)
```

### Option B: No Tutorial, Blank Screen
```
I see:
□ Completely white screen
□ Completely black screen
□ Just the loading spinner forever
□ Red error message saying: "___________"
```

### Option C: Error Message
```
I see an error that says:
"[paste error message here]"
```

## 🔴 Common Issues & What They Mean

### Issue 1: "No game ID provided"
- **Meaning:** Routing broken or gameId param missing
- **Fix:** Check if URL is exactly `/play/mock_game_1`

### Issue 2: "Game not found"
- **Meaning:** gameService can't load mock data
- **Fix:** Check if DEMO_MODE = true in firebase.ts

### Issue 3: Blank screen after tutorial
- **Meaning:** Phaser canvas not rendering
- **Fix:** Check browser console for Phaser errors

### Issue 4: Tutorial shows, then freezes
- **Meaning:** Game loaded but scene crashed
- **Fix:** Check console for GameScene errors

## 📝 Report Template

Copy this and fill it out:

```
DEBUG REPORT
============

1. Debug page (/debug) shows:
   - System Status: DEMO_MODE is [ENABLED/DISABLED]
   - Phaser Status: [LOADED/NOT LOADED]
   - Console Logs: [paste last 3-5 log lines]
   - Any errors: [YES/NO - paste if yes]

2. Game page (/play/mock_game_1) shows:
   - Tutorial overlay: [YES/NO]
   - After clicking START_PLAYING: [describe what happens]
   - Any colored squares: [YES/NO]
   - Browser console errors: [paste errors]

3. Screenshot attached: [YES/NO]
```

---

## 🚨 Most Likely Causes

Based on "game doesn't work", here are the top 3 suspects:

### 1. **Phaser Not Initializing** (70% likely)
**Symptoms:**
- Tutorial shows
- No colored squares appear
- Console says "Cannot find parent 'game-container'"

**Quick Test:**
Open browser console (F12) and type:
```javascript
document.getElementById('game-container')
```
If it returns `null`, the div doesn't exist!

### 2. **GameScene Crashing** (20% likely)
**Symptoms:**
- Tutorial shows
- Click "START_PLAYING >" and nothing changes
- Console shows red Phaser errors

**Quick Test:**
Look for red errors mentioning "GameScene" or "Phaser"

### 3. **Mock Data Not Loading** (10% likely)
**Symptoms:**
- Blank screen immediately
- Error says "Game not found" or "Level not found"
- Debug page shows errors

**Quick Test:**
Debug page will clearly show if data loads

---

## ⚡ Quick Fixes to Try NOW

Before debugging, try these:

### Fix 1: Hard Refresh
- **Mac:** Cmd + Shift + R
- **Windows:** Ctrl + Shift + R

### Fix 2: Clear Everything
Open console (F12) and paste:
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Fix 3: Restart Server
In terminal:
```bash
# Press Ctrl+C to stop
cd /Users/uthmansadiqumar/MakeGame/frontend
npm run dev
```

---

## 📞 What to Tell Me

After visiting `/debug` and `/play/mock_game_1`, tell me:

1. **What the debug page shows** (paste the console logs)
2. **What the game page shows** (describe or screenshot)
3. **Any red errors** in browser console (F12)

Then I can give you the EXACT fix! 🎯
