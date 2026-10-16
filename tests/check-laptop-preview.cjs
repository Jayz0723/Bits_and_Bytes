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
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/components.html')).href);
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('.laptop-preview').scrollIntoViewIfNeeded();
      await page.locator('#pc img').evaluate(image => image.decode());
      assert.equal(await page.locator('.laptop-preview').evaluate(element => getComputedStyle(element).backgroundImage), 'none');
      assert.equal(await page.locator('#laptopReveal').evaluate(element => getComputedStyle(element).borderImageSource), 'none');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const before = await page.locator('.laptop-preview-stage').boundingBox();
      await page.locator('#laptopReveal').click();
      assert.ok(await page.locator('#pc').isHidden());
      assert.equal(await page.locator('#laptopReveal').getAttribute('aria-expanded'), 'false');
      assert.ok(await page.locator('.laptop-preview-hidden').isVisible());
      const after = await page.locator('.laptop-preview-stage').boundingBox();
      assert.ok(Math.abs(before.height - after.height) < 1, 'Hide/show keeps preview dimensions stable');
      await page.locator('#laptopReveal').click();
      assert.ok(await page.locator('#pc').isVisible());
      assert.equal(await page.locator('#laptopReveal').getAttribute('aria-expanded'), 'true');
      assert.ok(await page.locator('.laptop-preview-hidden').isHidden());
      assert.equal(await page.locator('.laptop-preview-actions a').getAttribute('href'), 'pages/products.html#laptops');
      await page.locator('.laptop-preview-section').screenshot({ path: path.resolve(__dirname, '../images/previews/laptop-preview-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed clean preview styling at five widths, local photo loading, show/hide controls, stable framing, and laptop shop link.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
