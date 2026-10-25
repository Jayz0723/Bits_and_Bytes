const assert = require('node:assert/strict');
const path = require('node:path');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');
let PNG;
try { ({ PNG } = require('pngjs')); }
catch { ({ PNG } = require(path.join(process.env.USERPROFILE || process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'))); }

function backgroundDifference(first, second) {
  const a = PNG.sync.read(first), b = PNG.sync.read(second);
  let change = 0, count = 0, brightness = 0, chroma = 0;
  // The outer gutter contains only the backdrop, not text, images or chat controls.
  for (let y = 220; y < 800; y += 4) for (let x = 3; x < 12; x += 2) {
    const pixel = (y * a.width + x) * 4;
    const color = Array.from(b.data.subarray(pixel, pixel + 3));
    chroma = Math.max(chroma, Math.max(...color) - Math.min(...color));
    for (let channel = 0; channel < 3; channel++) {
      change += Math.abs(a.data[pixel + channel] - b.data[pixel + channel]);
      brightness += b.data[pixel + channel];
      count++;
    }
  }
  return { change: change / count, brightness: brightness / count, chroma };
}

(async () => {
  const server = createStoreServer(':memory:');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
      await page.goto(origin + '/pages/articles.html');
      await page.locator('.journal-image img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
      const firstLayer = await page.locator('body').evaluate(node => ({ before: getComputedStyle(node, '::before').transform, after: getComputedStyle(node, '::after').transform }));
      const before = await page.screenshot({ path: path.join(__dirname, '../images/previews/flowing-gradient-before-' + width + '.png') });
      await page.waitForTimeout(2200);
      const after = await page.screenshot({ path: path.join(__dirname, '../images/previews/flowing-gradient-after-' + width + '.png') });
      const nextLayer = await page.locator('body').evaluate(node => ({ before: getComputedStyle(node, '::before').transform, after: getComputedStyle(node, '::after').transform }));
      assert.notEqual(firstLayer.before, nextLayer.before, 'Base colors travel');
      assert.notEqual(firstLayer.after, nextLayer.after, 'Second layer moves independently');
      const pixels = backgroundDifference(before, after);
      assert.ok(pixels.change > 2.5, 'Visible charcoal shades change: ' + JSON.stringify(pixels));
      assert.ok(pixels.brightness < 40, 'Backdrop stays close to the dark card surfaces: ' + JSON.stringify(pixels));
      assert.ok(pixels.chroma <= 25, 'Backdrop avoids saturated color shifts: ' + JSON.stringify(pixels));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.click('#siteSearchToggle');
      await page.fill('#siteSearchInput', 'memory');
      assert.ok(await page.locator('.site-search-result').count() > 0, 'Backdrop never intercepts controls');
      await page.press('#siteSearchInput', 'Escape');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const pseudo of ['::before', '::after']) assert.equal(await page.locator('body').evaluate((node, pseudo) => getComputedStyle(node, pseudo).animationName, pseudo), 'none');
      const still = await page.screenshot();
      await page.waitForTimeout(300);
      assert.equal(backgroundDifference(still, await page.screenshot()).change, 0, 'Reduced-motion backdrop is static');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Passed independently flowing layers, measured visible pixel changes, dark brightness, search interaction, mobile framing and fully static reduced motion.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
