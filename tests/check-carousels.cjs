// Regression: hovering must not pause one copy and separate the logo strips.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    await page.route(/^https?:/, route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname, '../index.html')).href);
    const expected = ['Microsoft', 'AMD', 'Cooler Master', 'Corsair', 'Gigabyte', 'Intel', 'Kingston', 'NVIDIA', 'HP', 'MSI', 'ASUS', 'Lenovo', 'Dell', 'Apple'];
    assert.deepEqual(await page.locator('.car-slide').first().locator('img').evaluateAll(images => images.map(image => image.alt)), expected);
    const copies = await page.locator('.car-slide').evaluateAll(strips => strips.map(strip => [...strip.querySelectorAll('img')].map(image => image.getAttribute('src'))));
    assert.deepEqual(copies[0], copies[1], 'Both copies contain every brand in the same order');
    await page.locator('.brand-strip .carousel').hover();
    const before = await page.locator('.car-slide').evaluateAll(strips => strips.map(strip => strip.getAnimations()[0].currentTime));
    await page.waitForTimeout(400);
    const after = await page.locator('.car-slide').evaluateAll(strips => strips.map(strip => strip.getAnimations()[0].currentTime));
    assert.ok(after.every((time, index) => time > before[index] + 250), 'Both copies continue moving while hovered');
    assert.ok(Math.abs(after[0] - after[1]) < 34, 'Copies remain synchronized');
    await page.locator('#viewPartners').click();
    assert.deepEqual(await page.locator('.partner-card span').allTextContents(), expected);
    await page.keyboard.press('Escape');
    await page.locator('#promoCarousel').hover();
    const firstSlide = await page.locator('.promo-carousel-dots .active').getAttribute('data-promo-slide');
    await page.waitForTimeout(5300);
    assert.notEqual(await page.locator('.promo-carousel-dots .active').getAttribute('data-promo-slide'), firstSlide, 'Promotion autoplay continues while hovered');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('.brand-strip').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/carousel-fixed-' + width + '.png') });
    }
    console.log('Passed continuous hover playback, synchronized logo copies, all 14 brands, Microsoft labels, and responsive carousel layouts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
