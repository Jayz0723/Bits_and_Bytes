const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const assert = require('node:assert/strict');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('http://shop.test/**', route => {
      const file = path.resolve(projectRoot, decodeURIComponent(new URL(route.request().url()).pathname.slice(1)));
      if (!file.startsWith(projectRoot + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    for (const width of [1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [file, label] of [['index.html', 'home'], ['pages/products.html', 'catalog'], ['pages/product.html?id=pc-creator', 'product'], ['pages/contact.html', 'contact']]) {
        await page.goto('http://shop.test/' + file);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ' ' + label + ': fits viewport');
        assert.ok(await page.locator('.store-toolbar .cart-pill').isVisible());
        await page.screenshot({ path: path.join(projectRoot, 'images/previews/refined-' + label + '-' + width + '.png') });
        if (label === 'home') {
          assert.equal(await page.locator('.guide-preview').count(), 0);
          assert.equal(await page.locator('iframe[src="pages/contact.html"]').count(), 0);
          await page.locator('.home-support').scrollIntoViewIfNeeded();
          const frame = page.frameLocator('.home-support iframe');
          await frame.locator('#name').fill('Gallery test');
          await frame.locator('#email').fill('test@example.com');
          await frame.locator('#message').fill('<img src=x onerror=alert(1)> Could you check my build?');
          await frame.locator('button[type=submit]').click();
          assert.ok(await frame.locator('.support-draft').isVisible());
          assert.ok((await frame.locator('.support-draft p').innerText()).includes('<img src=x'));
          assert.equal(await frame.locator('.support-draft img').count(), 0);
          await page.waitForTimeout(150);
          assert.ok(await page.locator('.home-support iframe').evaluate(element => element.clientHeight > 600));
          await page.screenshot({ path: path.join(projectRoot, 'images/previews/refined-support-' + width + '.png') });
        }
        if (label === 'product') {
          const views = await page.evaluate(() => productGallery(catalogProducts().find(item => item.id === 'pc-creator')));
          assert.ok(views.some(view => view.shortLabel === 'Close-up'), 'Close-up retained alongside genuine angles');
          await page.locator('#galleryNext').click();
          assert.equal(await page.locator('#detailProductImage').getAttribute('src'), views[1].src);
          await page.locator('#galleryPrevious').click();
          assert.equal(await page.locator('#galleryImageCount').innerText(), '1 / ' + views.length);
          await page.locator('#productGalleryThumbnails button').last().click();
          assert.equal(await page.locator('#detailProductImage').evaluate(image => image.style.transform), 'scale(1.45)');
        }
      }
    }
    await page.goto('http://shop.test/pages/contact.html');
    await page.fill('#name', 'Contact test');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Can you help with an order?');
    await page.locator('[data-support-form] button[type=submit]').click();
    assert.ok(await page.locator('.support-draft').isVisible());
    assert.deepEqual(errors, []);
    console.log('Passed responsive storefront, retained gallery close-ups, focused support iframe, safe draft forms, and homepage cleanup.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
