// Verify the catalog against local files without depending on an external server.
const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const assert = require('node:assert/strict');
const { chromium } = require('./browser.cjs');

(async () => {
  const root = projectRoot;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://**/*', route => route.abort());
    await page.route('http://shop.test/**', route => {
      const file = path.resolve(root, decodeURIComponent(new URL(route.request().url()).pathname.slice(1)));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
        return route.fulfill({ status: 404, body: 'Missing file' });
      }
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    for (const [index, width] of [1440, 390, 320].entries()) {
      console.log('Checking catalog layout at ' + width + 'px');
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://shop.test/pages/products.html');
      await page.locator('.product-card').first().waitFor();
      assert.ok(await page.locator('.product-card').count() > 10);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': No horizontal page overflow');
      assert.ok(await page.locator('.store-toolbar .cart-pill').isVisible(), 'Cart is always visible');
      if (width === 1440) {
        const centers = await page.locator('.store-toolbar .cart-pill,.store-toolbar .wishlist-pill,.store-toolbar select').evaluateAll(elements => elements.map(element => { const rect = element.getBoundingClientRect(); return rect.y + rect.height / 2; }));
        assert.ok(Math.max(...centers) - Math.min(...centers) < 1, 'Navigation controls share a baseline');
      } else {
        await page.locator('.nav-toggle').click();
        assert.ok(await page.locator('.nav-home').isVisible(), 'Mobile menu opens');
        await page.keyboard.press('Escape');
        assert.ok(!(await page.locator('.nav-home').isVisible()), 'Mobile menu closes');
      }
      const brokenImages = await page.evaluate(async () => {
        const images = [...document.querySelectorAll('.product-card img')];
        images.forEach(image => { image.loading = 'eager'; });
        return (await Promise.all(images.map(async image => {
          try { await image.decode(); return null; } catch { return image.src; }
        }))).filter(Boolean);
      });
      assert.deepEqual(brokenImages, []);
      await page.screenshot({ path: path.join(root, 'images/previews/shop-' + width + '.png'), fullPage: true });
      await page.screenshot({ path: path.join(root, 'images/previews/shop-top-' + width + '.png') });
      await page.locator('#computer-products').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(root, 'images/previews/shop-catalog-' + width + '.png') });
      if (width < 761) await page.locator('#toggleFilters').click();
      await page.selectOption('#typeFilter', 'Laptop');
      assert.equal(await page.locator('.product-collection:visible').count(), 1);
      assert.ok(await page.locator('#laptops').isVisible());
      await page.click('#resetFilters');
      assert.equal(await page.locator('.product-collection:visible').count(), 4);
      if (width < 761) await page.locator('#toggleFilters').click();
      await page.locator('[data-add-product]').first().click();
      assert.equal(await page.evaluate(() => getCart().reduce((sum, item) => sum + item.quantity, 0)), index + 1);
      await page.locator('[data-wishlist-product]').first().click();
      assert.equal(await page.locator('[data-wishlist-product]').first().getAttribute('aria-pressed'), index % 2 === 0 ? 'true' : 'false');
      await page.locator('[data-product-detail]').first().click();
      assert.equal(await page.locator('dialog[open]').count(), 1);
      await page.keyboard.press('Escape');
    }
    // Capacities must change prices, persist through reload, and remain separate cart lines.
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://shop.test/pages/products.html');
    await page.evaluate(() => localStorage.removeItem('bitsAndBytesCart'));
    await page.locator('.shopping-extra').filter({ has: page.locator('#quickOrderForm') }).locator('summary').click();
    await page.selectOption('#quickOrderProduct', 'part-ssd-1tb-nvme');
    assert.ok((await page.locator('#quickOrderImage').getAttribute('src')).endsWith('kingston-nv3-1000gb.png'));
    await page.locator('.shopping-extra').filter({ has: page.locator('#quickOrderForm') }).locator('summary').click();
    const ramCard = page.locator('[data-product-id="part-ram-32gb-ddr5"]');
    await ramCard.locator('select').selectOption('8gb');
    assert.ok((await ramCard.locator('.current-price').innerText()).includes('1,995'));
    await ramCard.locator('[data-add-product]').click();
    await ramCard.locator('[data-add-product]').click();
    await ramCard.locator('select').selectOption('16gb');
    await ramCard.locator('[data-add-product]').click();
    await page.reload();
    let cart = await page.evaluate(() => getCart());
    assert.equal(cart.length, 2);
    assert.equal(cart.find(item => item.variantId === '8gb').quantity, 2);
    assert.equal(cart.find(item => item.variantId === '16gb').price, 4295);
    assert.ok(cart.find(item => item.variantId === '8gb').image.endsWith('kingston-fury-8gb-cutout.png'));
    assert.ok(cart.find(item => item.variantId === '16gb').image.endsWith('kingston-fury-16gb.png'));
    await ramCard.locator('[data-product-detail]').click();
    await page.selectOption('#quickViewVariant', '64gb');
    await page.locator('dialog [data-detail-add]').click();
    assert.equal(await page.evaluate(() => getCart().find(item => item.variantId === '64gb').price), 12995);
    await page.keyboard.press('Escape');
    for (const productId of ['part-ram-32gb-ddr5', 'part-kingston-fury-32', 'part-ssd-1tb-nvme', 'part-ssd-kingston-kc600']) {
      console.log('Checking capacity photos: ' + productId);
      const card = page.locator('[data-product-id="' + productId + '"]');
      const variants = await page.evaluate(id => catalogProducts().find(item => item.id === id).variants.options, productId);
      for (const variant of variants) {
        await card.locator('select').selectOption(variant.id);
        assert.equal(await card.locator('img').getAttribute('src'), variant.image);
        assert.ok((await card.locator('.product-photo-capacity').innerText()).startsWith(variant.label));
        await card.locator('img').evaluate(image => { image.loading = 'eager'; return image.decode(); });
      }
    }
    await page.locator('#computer-parts').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'images/previews/shop-capacities-desktop.png') });
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.locator('[data-product-id="part-ssd-kingston-kc600"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(root, 'images/previews/shop-capacities-mobile.png') });

    await page.goto('http://shop.test/pages/product.html?id=part-ssd-kingston-kc600&variant=256gb');
    assert.equal(await page.locator('#detailVariant').inputValue(), '256gb');
    assert.ok((await page.locator('#detailProductPrice').innerText()).includes('1,695'));
    await page.selectOption('#detailVariant', '2tb');
    assert.ok((await page.locator('#detailProductImage').getAttribute('src')).endsWith('kingston-kc600-2048gb-cutout.png'));
    assert.equal(await page.locator('#detailPhotoCapacity .product-photo-capacity').innerText(), '2TB');
    await page.locator('#productGalleryThumbnails button').first().click();
    assert.ok((await page.locator('#detailProductImage').getAttribute('alt')).includes('2TB'));
    assert.ok((await page.locator('#configTotal').innerText()).includes('7,295'));
    await page.locator('[data-config-tab="upgrades"]').click();
    await page.locator('input[name="upgrade"][value="warranty-extended"]').check();
    await page.locator('[data-config-tab="checkout"]').click();
    await page.locator('#addConfiguredProduct').click();
    await page.reload();
    cart = await page.evaluate(() => getCart());
    const configured = cart.find(item => item.baseProductId === 'part-ssd-kingston-kc600');
    assert.equal(configured.variantId, '2tb');
    assert.equal(configured.price, 9290, 'Configuration price survives reload');
    assert.ok(configured.specs.includes('2TB'));
    assert.ok(configured.image.endsWith('kingston-kc600-2048gb-cutout.png'));

    await page.goto('http://shop.test/pages/product.html?id=part-corsair-psu-850&variant=650w');
    await page.selectOption('#detailVariant', '1000w');
    assert.ok((await page.locator('#detailProductImage').getAttribute('src')).endsWith('corsair-rm1000e.webp'));
    await page.locator('#detailProductImage').evaluate(image => { image.loading = 'eager'; return image.decode(); });
    // Audit every catalog item and capacity, not just the first visible row.
    await page.goto('http://shop.test/pages/products.html');
    const cases = await page.evaluate(() => catalogProducts().flatMap(base =>
      (base.variants ? base.variants.options.map(variant => productWithVariant(base, variant.id)) : [base])
        .map(product => ({ id: base.id, variant: product.variantId, name: product.name, brand: product.brand, image: product.image, gallery: productGallery(product) }))
    ));
    for (const item of cases) {
      console.log('Checking gallery: ' + item.id + (item.variant ? ' / ' + item.variant : ''));
      assert.ok(!/Bits and Bytes|ViewMax|KeyLite|SwiftClick/.test(item.brand), item.name + ': real brand');
      assert.ok(item.gallery.length >= 2, item.name + ': useful alternative view');
      for (const photo of [{ src: item.image }, ...item.gallery]) {
        assert.ok(!/placeholder|\.svg$/.test(photo.src), item.name + ': no placeholder');
        assert.ok(fs.existsSync(path.join(root, photo.src)), item.name + ': photo exists');
      }
      await page.goto('http://shop.test/pages/product.html?id=' + item.id + (item.variant ? '&variant=' + item.variant : ''));
      assert.equal(await page.locator('#detailProductImage').getAttribute('src'), item.image);
      await page.locator('#detailProductImage').evaluate(image => { image.loading = 'eager'; return image.decode(); });
      for (const [index, photo] of item.gallery.entries()) {
        await page.locator('#productGalleryThumbnails button').nth(index).click();
        assert.equal(await page.locator('#detailProductImage').getAttribute('src'), photo.src);
        await page.locator('#detailProductImage').evaluate(image => { image.loading = 'eager'; return image.decode(); });
        const zoom = await page.locator('#detailProductImage').evaluate(image => image.style.transform);
        assert.equal(zoom, 'scale(' + (photo.zoom || 1) + ')');
      }
      assert.ok(!(await page.locator('#productOverview').innerText()).includes('coming soon'));
    }
    await page.goto('http://shop.test/pages/product.html?id=part-ssd-kingston-kc600');
    await page.selectOption('#detailVariant', '2tb');
    await page.locator('#productGalleryThumbnails button').filter({ hasText: 'Close-up' }).click();
    assert.ok((await page.locator('#detailProductImage').getAttribute('src')).endsWith('kingston-kc600-2048gb-cutout.png'));
    await page.screenshot({ path: path.join(root, 'images/previews/catalog-ssd-gallery-mobile.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('http://shop.test/pages/product.html?id=pc-creator');
    await page.screenshot({ path: path.join(root, 'images/previews/catalog-proart-gallery.png') });
    console.log('Audited ' + cases.length + ' product/configuration photo galleries.');
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto('http://shop.test/pages/build.html');
    await page.locator('[data-build-preset="gaming"]').click();
    await page.selectOption('#ram', { label: '8GB DDR5 5600 - \u20b11,995' });
    await page.selectOption('#storage', '4');
    await page.selectOption('#psu', '4');
    assert.ok((await page.locator('#compatibilityBox').innerText()).includes('compatible'));
    assert.ok((await page.locator('#buildList').innerText()).includes('512GB'));

    await page.goto('http://shop.test/pages/product.html?id=part-cooler-master-240');
    await page.locator('#productGalleryThumbnails button').nth(1).click();
    assert.ok((await page.locator('#detailProductImage').getAttribute('src')).endsWith('cooler-master-ml240l-side.png'));
    await page.locator('#detailProductImage').evaluate(image => { image.loading = 'eager'; return image.decode(); });
    const mapped = await page.evaluate(() => catalogProducts().find(product => product.id === 'part-cpu-i5-14600k').image);
    assert.equal(mapped, 'images/products/intel-core-i5-14600k-cutout.png');
    for (const file of ['index.html', 'pages/build.html', 'pages/components.html', 'pages/about.html', 'pages/contact.html', 'pages/cart.html', 'pages/wishlist.html', 'pages/login.html']) {
      await page.goto('http://shop.test/' + file);
      assert.ok(await page.locator('.store-toolbar .cart-pill').isVisible(), file + ' cart remains visible');
      assert.ok(await page.locator('.sticky-site-nav').evaluate(header => header.scrollWidth <= innerWidth), file + ' navigation fits mobile');
    }
    assert.deepEqual(errors, []);
    console.log('Passed desktop/mobile layout, images, navigation, filters, capacity prices, variant cart persistence, configured totals, galleries, and builder capacity checks.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
