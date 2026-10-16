const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const expected = ['real-desktop-setup.jpg', 'real-laptop-workspace.jpg', 'real-pc-components.jpg'];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const images = page.locator('.editorial-media img');
      assert.equal(await images.count(), 3);
      for (let index = 0; index < 3; index++) {
        const image = images.nth(index);
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
        assert.ok((await image.getAttribute('src')).endsWith(expected[index]));
        assert.equal(await image.evaluate(element => element.naturalWidth), 1600);
        const box = await image.boundingBox();
        assert.ok(box.width > 200 && box.height > 150, 'Photo is visibly sized');
        const row = page.locator('.editorial-row').nth(index);
        await row.screenshot({ path: path.resolve(__dirname, '../images/previews/home-photo-' + index + '-' + width + '.png') });
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      for (const file of expected) {
        assert.equal(await page.locator('.catalog-gateway img[src$="' + file + '"]').count(), 1, 'Matching collection tile uses the real photo');
      }
    }
    assert.deepEqual(errors, []);
    console.log('Passed all three local photographs, 1600px resolution, collection tiles, offline image loading, and desktop/mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
