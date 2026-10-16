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
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/terms.html')).href);
    assert.equal(await page.locator('.policy-sections section').count(), 12);
    assert.match(await page.locator('#orders').textContent(), /does not send an order, charge a card, or transfer money/);
    assert.match(await page.locator('#returns').textContent(), /repair, replacement, or refund/);
    assert.match(await page.locator('#updates').textContent(), /Nothing in these terms limits rights/);
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const links = page.locator('.policy-contents a');
      for (let index = 0; index < await links.count(); index++) {
        const href = await links.nth(index).getAttribute('href');
        const hash = href.slice(href.indexOf('#'));
        await links.nth(index).click();
        await page.waitForURL(url => url.hash === hash);
        assert.equal(await page.locator(hash).count(), 1);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/terms-expanded-' + width + '.png') });
    }
    assert.equal(await page.locator('.policy-sections a[href="pages/privacy.html"]').count(), 1);
    assert.equal(await page.locator('.policy-sections a[href="pages/warranty.html"]').count(), 1);
    assert.equal(await page.locator('.footer-bottom a[href="pages/terms.html"]').count(), 1);
    assert.deepEqual(errors, []);
    console.log('Passed 12 terms sections, checkout disclosures, consumer-rights safeguards, section navigation, related policy links, and responsive layouts at four widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
