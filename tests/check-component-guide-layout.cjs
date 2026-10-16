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
    const ids = ['CPU', 'GPU', 'RAM', 'SSD'];
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const id of ids) {
        const row = page.locator('#guide' + id);
        const image = row.locator('img');
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(element => element.decode());
        const picture = await image.boundingBox();
        const copy = await row.locator('.focused-component-copy').boundingBox();
        assert.ok(Math.abs(picture.width - picture.height) < 1, 'Square map is not cropped');
        if (width > 760) {
          assert.ok(copy.x >= picture.x + picture.width - 1, 'Consistent image-left and details-right');
        } else {
          assert.ok(copy.y >= picture.y + picture.height - 1, 'Mobile image sits above details');
        }
        assert.ok(await row.evaluate(element => element.scrollWidth <= element.clientWidth));
        const coords = await row.locator('area').getAttribute('coords');
        const original = await row.locator('area').getAttribute('data-original-coords');
        const scale = await image.evaluate(element => [element.clientWidth / element.naturalWidth, element.clientHeight / element.naturalHeight]);
        assert.deepEqual(coords.split(',').map(Number), original.split(',').map((value, index) => Math.round(Number(value) * scale[index % 2])));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('#guideGPU').screenshot({ path: path.resolve(__dirname, '../images/previews/component-guide-gpu-' + width + '.png') });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const id of ids) {
      const image = page.locator('#guide' + id + ' img');
      await image.scrollIntoViewIfNeeded();
      const box = await image.boundingBox();
      const coords = (await page.locator('#guide' + id + ' area').getAttribute('coords')).split(',').map(Number);
      await page.mouse.click(box.x + (coords[0] + coords[2]) / 2, box.y + (coords[1] + coords[3]) / 2);
      await page.waitForURL(url => url.hash === '#guide' + id + 'Info', { timeout: 5000 });
    }
    assert.deepEqual(await page.locator('.component-shop-link').evaluateAll(links => links.map(link => new URL(link.href).searchParams.get('part'))), ['cpu', 'gpu', 'ram', 'storage']);
    assert.equal(await page.locator('.device-map-card').count(), 2, 'Full desktop and laptop maps retained');
    assert.deepEqual(errors, []);
    console.log('Passed consistent layouts at five widths, uncropped square maps, rescaled hotspots, all four real hotspot clicks, category links, and retained device maps.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
