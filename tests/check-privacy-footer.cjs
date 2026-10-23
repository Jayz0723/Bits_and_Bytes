const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    const files = ['index.html', ...fs.readdirSync(path.join(root, 'pages')).filter(file => file.endsWith('.html')).map(file => 'pages/' + file)];
    for (const file of files) {
      if (!fs.readFileSync(path.join(root, file), 'utf8').includes('class="site-footer"')) continue;
      await page.goto(pathToFileURL(path.join(root, file)).href);
      assert.equal(await page.locator('.footer-legal nav a[href="pages/privacy.html"]').count(), 1, file + ' has a Privacy link');
    }
    await page.setViewportSize({ width: 390, height: 900 });
    await page.locator('.footer-legal nav a[href="pages/privacy.html"]').click();
    assert.ok(page.url().endsWith('/pages/privacy.html'));
    assert.equal(await page.locator('main h1').textContent(), 'Privacy');
    assert.equal(await page.locator('.policy-sections section').count(), 6);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.deepEqual(errors, []);
    console.log('Passed Privacy footer links across every store page, working navigation, privacy content, and desktop/mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
