const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [1440, 1100, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(/^https?:/, route => route.abort());
      await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
      assert.equal(await page.locator('.sticky-site-nav #musicToggle').count(), 1);
      assert.equal(await page.locator('.background-music').evaluate(node => getComputedStyle(node).position), 'static');
      const launcher = page.locator('#supportChatLauncher');
      await launcher.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      assert.equal(await launcher.locator('.chat-launcher-label').count(), 0);
      await page.locator('#supportChatNudge:not([hidden])').waitFor();
      assert.ok(!overlaps(await launcher.boundingBox(), await page.locator('#supportChatNudge').boundingBox()));
      assert.ok(await page.locator('#supportChatNudge').evaluate(node => node.getBoundingClientRect().left >= 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const music = await page.locator('#musicToggle').boundingBox();
      if (width > 760) {
        const menu = await page.locator('.nav-menu').boundingBox();
        assert.ok(Math.abs(music.y + music.height / 2 - menu.y - menu.height / 2) < 3, 'Music is centered on the desktop navigation row');
      }
      for (const control of await page.locator('.sticky-site-nav a:visible, .sticky-site-nav summary:visible, .nav-toggle:visible').all()) {
        assert.ok(!overlaps(music, await control.boundingBox()), 'Music clears navigation at ' + width);
      }
      await page.screenshot({ path: path.join(root, 'images/previews/chat-controls-' + width + '.png') });
      await launcher.hover();
      await page.waitForTimeout(220);
      assert.equal(await launcher.locator('.chat-robot-hover').evaluate(node => getComputedStyle(node).opacity), '1');
      if (width === 1440) await page.screenshot({ path: path.join(root, 'images/previews/chat-controls-hover.png') });
      await page.locator('#dismissChatNudge').click();
      assert.ok(await page.locator('#supportChatNudge').isHidden());
      await launcher.click();
      assert.equal(await launcher.getAttribute('aria-expanded'), 'true');
      await page.fill('#supportChatInput', 'Help me choose a laptop');
      await page.locator('#supportChatForm').getByRole('button', { name: 'Send', exact: true }).click();
      assert.match(await page.locator('#supportChatMessages').textContent(), /AI chat needs the store server/);
      await page.locator('#supportChatInput').press('Escape');
      assert.ok(await page.locator('#supportChatPanel').isHidden());
      assert.equal(await launcher.evaluate(node => document.activeElement === node), true);
      await page.evaluate(() => document.getElementById('backgroundMusic').pause());
      await page.click('#musicToggle');
      assert.equal(await page.evaluate(() => localStorage.getItem('bits-bytes-music')), 'on');
      await page.evaluate(() => showShoppingFeedback('Added to cart', 'Test product', 'cart'));
      if (width <= 560) assert.ok(!overlaps(await launcher.boundingBox(), await page.locator('#shoppingFeedback').boundingBox()));
      await page.reload();
      await page.waitForTimeout(2000);
      assert.ok(await page.locator('#supportChatNudge').isHidden(), 'Welcome is not repeated');
      await page.goto(pathToFileURL(path.join(root, 'pages/products.html')).href);
      assert.equal(await launcher.boundingBox().then(box => box.width), 64, 'Catalog CSS retains icon-only size');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await launcher.evaluate(node => getComputedStyle(node).transitionDuration), '0s');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Passed navigation music placement, five responsive widths, real robot images/hover, welcome dismissal/session behavior, working chat, keyboard close/focus, shopping-feedback spacing, catalog styling, and reduced motion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
