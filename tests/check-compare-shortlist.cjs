const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const edition of ['', 'frontend-html/']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(/^https?:/, route => route.abort());
      await page.goto(url(edition + 'pages/products.html'));
      const cards = page.locator('.product-card');
      await page.locator('.shortlist-toggle').first().waitFor();
      assert.equal(await page.locator('.shortlist-toggle').count(), await cards.count());
      const before = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([name]) => /cart|wishlist/i.test(name))));
      for (let i = 0; i < 3; i++) await cards.nth(i).locator('.shortlist-toggle').click();
      await cards.nth(3).locator('.shortlist-toggle').click();
      assert.match(await cards.nth(3).locator('.shortlist-card-feedback').textContent(), /full/);
      await cards.first().locator('.shortlist-view').click();
      const dialog = page.locator('#shortlistDialog');
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await dialog.evaluate(node => node.scrollTop), 0, 'Comparison opens at its heading');
      assert.equal(await dialog.locator('thead img').count(), 3);
      await dialog.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      assert.equal(await dialog.locator('tbody tr').count(), 6);
      await page.getByLabel('Show differences only', { exact: true }).check();
      assert.ok(await dialog.locator('tbody tr').count() < 6);
      await page.getByLabel('Show differences only', { exact: true }).uncheck();
      await dialog.evaluate(node => { node.scrollTop = 0; });
      await dialog.screenshot({ path: path.join(root, 'images/previews/compare-' + (edition ? 'html' : 'main') + '-desktop.png') });
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const bounds = await dialog.boundingBox();
      assert.ok(bounds.width <= 390 && bounds.x >= 0);
      assert.ok(await page.locator('.shortlist-table-wrap').evaluate(node => node.scrollWidth > node.clientWidth));
      await dialog.evaluate(node => { node.scrollTop = 0; });
      await dialog.screenshot({ path: path.join(root, 'images/previews/compare-' + (edition ? 'html' : 'main') + '-mobile.png') });
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), false);
      assert.ok(await cards.first().locator('.shortlist-view').evaluate(node => node === document.activeElement));
      await page.reload();
      assert.equal(await page.locator('.shortlist-toggle[aria-pressed="true"]').count(), 3);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.getByRole('button', { name: 'Compare products', exact: true }).click();
      await dialog.getByRole('button', { name: /^Remove / }).first().click();
      assert.equal(await dialog.locator('thead img').count(), 2);
      const target = await dialog.locator('thead a').first().getAttribute('href');
      assert.ok(target.includes('/pages/product.html?id='));
      const after = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([name]) => /cart|wishlist/i.test(name))));
      assert.deepEqual(after, before);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
      assert.equal(await page.locator('.shortlist-toggle[aria-pressed="true"]').count(), 0);
      if (!edition) {
        const colorCard = cards.filter({ has: page.locator('[data-product-color]') }).first();
        await colorCard.locator('.shortlist-toggle').click();
        await colorCard.locator('[data-product-color]').nth(1).click();
        assert.equal(await colorCard.locator('.shortlist-toggle').getAttribute('aria-pressed'), 'false');
        await colorCard.locator('.shortlist-toggle').click();
        await colorCard.locator('.shortlist-view').click();
        assert.equal(await dialog.locator('thead a').count(), 2);
        const links = await dialog.locator('thead a').evaluateAll(nodes => nodes.map(node => node.href));
        assert.notEqual(links[0], links[1], 'Different colors remain separate configurations');
        await page.keyboard.press('Escape');
        // The original dropdown comparison remains usable alongside the new UI.
        await page.locator('#comparisonTool').evaluate(node => node.open = true);
        await page.locator('#compareOne').selectOption({ index: 1 }, { force: true });
        await page.locator('#compareTwo').selectOption({ index: 2 }, { force: true });
        assert.equal(await page.locator('#comparisonResults table').count(), 1);
      }
      await page.goto(url(edition + 'index.html'));
      await page.locator('.shortlist-toggle').first().waitFor();
      assert.ok(await page.locator('.shortlist-toggle').count() > 0);
      assert.deepEqual(errors, [], 'No browser errors in ' + (edition || 'main'));
      await context.close();
    }
    console.log('Comparison passed in both editions: limits, persistence, differences, photos, mobile, keyboard, selected colors, and existing comparison controls.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
