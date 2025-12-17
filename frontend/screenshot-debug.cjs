const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    console.log('🔍 Starting Puppeteer diagnostic...');

    const browser = await puppeteer.launch({
        headless: false, // Show browser so we can see what's happening
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    try {
        console.log('\n📸 Screenshot 1: Dashboard (/)');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'screenshot-1-dashboard.png', fullPage: true });
        console.log('✅ Saved: screenshot-1-dashboard.png');

        console.log('\n📸 Screenshot 2: Debug Page (/debug)');
        await page.goto('http://localhost:5173/debug', { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(r => setTimeout(r, 3000)); // Wait for async data to load
        await page.screenshot({ path: 'screenshot-2-debug.png', fullPage: true });
        console.log('✅ Saved: screenshot-2-debug.png');

        console.log('\n📸 Screenshot 3: Game Page - Initial Load (/play/mock_game_1)');
        await page.goto('http://localhost:5173/play/mock_game_1', { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'screenshot-3-game-initial.png', fullPage: true });
        console.log('✅ Saved: screenshot-3-game-initial.png');

        console.log('\n📸 Screenshot 4: After Clicking "START_PLAYING"');
        // Click the START_PLAYING button
        const clicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const startBtn = buttons.find(btn => btn.textContent.includes('START_PLAYING'));
            if (startBtn) {
                startBtn.click();
                return true;
            }
            return false;
        });
        console.log(clicked ? '✅ Clicked START_PLAYING button' : '⚠️ Button not found');
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: 'screenshot-4-game-after-tutorial.png', fullPage: true });
        console.log('✅ Saved: screenshot-4-game-after-tutorial.png');

        console.log('\n📸 Screenshot 5: After Pressing SPACE key');
        await page.keyboard.press('Space');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshot-5-after-space.png', fullPage: true });
        console.log('✅ Saved: screenshot-5-after-space.png');

        console.log('\n📸 Screenshot 6: After Moving with W key');
        await page.keyboard.press('KeyW');
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: 'screenshot-6-after-movement.png', fullPage: true });
        console.log('✅ Saved: screenshot-6-after-movement.png');

        console.log('\n📸 Screenshot 7: After Pressing I for inventory');
        await page.keyboard.press('KeyI');
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: 'screenshot-7-inventory.png', fullPage: true });
        console.log('✅ Saved: screenshot-7-inventory.png');

        console.log('\n✅ All screenshots captured!');
        console.log('\n📁 Screenshots saved in: /Users/uthmansadiqumar/MakeGame/frontend/');
        console.log('\n🔍 Check the screenshots to see what\'s happening visually.');

    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
        await page.screenshot({ path: 'screenshot-error.png', fullPage: true });
    } finally {
        await browser.close();
        console.log('\n🏁 Browser closed.');
    }
})();
