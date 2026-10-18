const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    const detail = pathToFileURL(path.resolve(__dirname, '../pages/product.html')).href;
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const query of ['id=pc-msi-codex-6-14', 'id=part-ssd-1tb-nvme&variant=2tb', 'id=lap-apple-creator&variant=silver']) {
        await page.goto(detail + '?' + query);
        const link = page.locator('#configureProductLink');
        const target = new URL(await link.getAttribute('href'));
        assert.equal(target.search, '?' + query);
        assert.equal(target.hash, '#configureProduct');
        // A normal anchor jump must not reload the page or reset chosen upgrades.
        await page.evaluate(() => { window.configureNavigationSentinel = true; });
        await link.click();
        assert.equal(await page.evaluate(() => window.configureNavigationSentinel), true);
        assert.equal(new URL(page.url()).search, '?' + query);
        assert.equal(new URL(page.url()).hash, '#configureProduct');
        assert.equal(await page.locator('#productNotFound').isVisible(), false);
        assert.equal(await page.locator('#configureProduct').isVisible(), true);
        await page.waitForTimeout(350);
        const bounds = await page.evaluate(() => ({
          section: document.querySelector('#configureProduct').getBoundingClientRect().top,
          nav: document.querySelector('.sticky-site-nav').getBoundingClientRect().bottom
        }));
        assert.ok(bounds.section >= bounds.nav - 1, 'Configuration heading clears navigation');
        await page.reload();
        assert.equal(await page.locator('#productNotFound').isVisible(), false);
      }
      await page.goto(detail + '?id=monitor-27');
      await page.selectOption('#detailVariant', '32inch');
      await page.locator('#configureProductLink').click();
      assert.equal(new URL(page.url()).searchParams.get('variant'), '32inch');
      assert.match(await page.locator('#configSummaryName').textContent(), /PA329CV/);
      await page.goto(detail + '?id=not-a-real-product');
      assert.equal(await page.locator('#productNotFound').isVisible(), true);
    }
    assert.deepEqual(errors, []);
    console.log('Passed Configure This Product navigation, retained product/variant, no reload, refresh, invalid-product handling, and desktop/mobile heading visibility.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
