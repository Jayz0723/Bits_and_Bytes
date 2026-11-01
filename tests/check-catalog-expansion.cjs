const assert = require('node:assert/strict');
const path = require('node:path');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');

(async () => {
  const server = createStoreServer(':memory:');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    await page.goto(origin);
    const catalog = await page.evaluate(() => catalogProducts());
    assert.equal(catalog.length, 69);
    assert.equal(new Set(catalog.map(product => product.id)).size, 69);
    assert.deepEqual(await page.locator('.car-slide').first().locator('[data-catalog-brand]').evaluateAll(links => links.map(link => link.dataset.catalogBrand).sort()), [...new Set(catalog.map(product => product.brand))].sort());
    assert.equal(await page.locator('.car-slide').first().locator('[data-catalog-brand="Microsoft"]').getAttribute('href'), 'https://www.microsoft.com/');
    await page.locator('#viewPartners').click();
    assert.equal(await page.locator('#partnersDialog [data-catalog-brand]').count(), new Set(catalog.map(product => product.brand)).size);
    await page.locator('#closePartners').click();
    const footerLink = page.locator('.footer-bottom a[href="pages/contact.html"]');
    await footerLink.scrollIntoViewIfNeeded();
    await footerLink.hover();
    const line = await footerLink.locator('.footer-link-label').evaluate(label => ({
      width: label.getBoundingClientRect().width,
      link: label.parentElement.getBoundingClientRect().width,
      pseudo: getComputedStyle(label, '::after').width,
      transform: getComputedStyle(label, '::after').transform
    }));
    assert.ok(line.link > line.width + 20, 'Underline excludes link padding and divider');
    assert.ok(Math.abs(parseFloat(line.pseudo) - line.width) < 1);
    assert.equal(line.transform, 'matrix(1, 0, 0, 1, 0, 0)');

    const newIds = ['monitor-samsung-g3-24', 'monitor-samsung-g3-27', 'part-gpu-gtx-1650', 'part-gpu-rtx-3050', 'part-gpu-rtx-5080'];
    for (const id of newIds) {
      await page.goto(origin + '/pages/product.html?id=' + id);
      assert.ok((await page.locator('#detailProductDescription').textContent()).length > 100);
      assert.match(await page.locator('#catalogPriceReference').textContent(), /2026-10-31/);
      await page.getByRole('button', { name: 'Show Ports', exact: true }).click();
      await page.locator('#detailProductImage').evaluate(image => image.decode());
      assert.match(await page.locator('#detailProductImage').getAttribute('src'), /ports|view-8/);
    }
    const monitors = await page.evaluate(() => catalogProducts().filter(item => item.type === 'Monitor').flatMap(item => item.variants ? item.variants.options.map(option => productWithVariant(item, option.id)) : [item]));
    for (const monitor of monitors) {
      assert.ok(monitor.gallery.some(view => view.shortLabel === 'Ports'), monitor.name + ' has ports view');
      await page.goto(origin + '/pages/product.html?id=' + (monitor.baseProductId || monitor.id) + (monitor.variantId ? '&variant=' + monitor.variantId : ''));
      await page.getByRole('button', { name: 'Show Ports', exact: true }).click();
      await page.locator('#detailProductImage').evaluate(image => image.decode());
    }
    await page.goto(origin + '/pages/product.html?id=lap-microsoft-studio-2');
    assert.equal(await page.locator('#productGalleryThumbnails button').nth(1).textContent().then(text => text.trim().endsWith('Video')), true);
    await page.getByRole('button', { name: 'Show Video', exact: true }).click();
    assert.equal(await page.locator('.product-gallery-video').count(), 1);
    assert.equal(await page.locator('#detailProductImage').isVisible(), false);
    assert.equal(await page.locator('.product-gallery-video').evaluate(video => video.controls && video.paused && !video.autoplay), true);
    await page.locator('#galleryNext').click();
    assert.equal(await page.locator('.product-gallery-video').count(), 0);
    assert.equal(await page.locator('#detailProductImage').isVisible(), true);
    await page.locator('#productGalleryThumbnails button').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.product-gallery-video').count(), 1);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.product-gallery-video').count(), 0);

    await page.goto(origin + '/pages/components.html');
    assert.equal(await page.locator('.gpu-range-card').count(), 5);
    for (const part of ['radiator', 'tubes', 'gpupower', 'boardpower']) {
      await page.locator('.part-legend-button[data-part="' + part + '"]').click();
      assert.ok((await page.locator('#partInfo').textContent()).length > 100);
      assert.equal(await page.locator('#pcHardwareMap area[data-part="' + part + '"]').count(), 1);
    }
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const url of ['/pages/components.html', '/pages/products.html?part=gpu', '/pages/product.html?id=monitor-samsung-g3-24']) {
        await page.goto(origin + url);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, url + ' at ' + width);
      }
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/expanded-monitor-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed 69 products; all catalog brands in carousel/dialog; text-only underline; exact monitor ports; five new galleries/descriptions; second-position video and keyboard navigation; four added hotspots; GTX-to-RTX guide; four responsive widths; no page errors.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
