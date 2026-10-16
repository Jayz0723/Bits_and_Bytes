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
    assert.equal(await page.locator('.upgrade-glossary dfn').count(), 3);
    assert.equal(await page.locator('.upgrade-glossary ruby rt').textContent(), 'ram');
    assert.equal(await page.locator('.purchase-checklist ol li').count(), 3);
    assert.equal(await page.locator('.purchase-checklist ul li').count(), 3);
    assert.deepEqual(await page.locator('.lesson-table tbody th[scope="row"]').allTextContents(), ['CPU', 'RAM', 'SSD', 'GPU']);
    assert.equal(await page.locator('.lesson-table thead th[scope="col"]').count(), 2);
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('.component-notes').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const section = await page.locator('.component-notes').boundingBox();
      const table = await page.locator('.lesson-table').boundingBox();
      assert.ok(Math.abs(section.width - table.width) <= 2, 'Checklist table aligns with the section');
      for (const selector of ['.upgrade-glossary', '.upgrade-use-cases', '.purchase-checklist', '.lesson-table']) {
        assert.ok(await page.locator(selector).evaluate(element => element.scrollWidth <= element.clientWidth + 1));
      }
      await page.locator('.component-notes').screenshot({ path: path.resolve(__dirname, '../images/previews/upgrade-notes-' + width + '.png') });
    }
    await page.locator('#laptopReveal').click();
    assert.ok(await page.locator('#pc').isHidden());
    await page.locator('#laptopReveal').click();
    assert.ok(await page.locator('#pc').isVisible());
    assert.deepEqual(errors, []);
    console.log('Passed aligned guidance and compatibility table at five widths, preserved dfn/ruby/ol/ul/table elements, and working laptop reveal.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
