// Local browser regression checks for the shared header and new arrivals.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'shop.test') return route.abort();
      const file = path.resolve(root, decodeURIComponent(url.pathname.slice(1)));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    for (const width of [1920, 1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      for (const file of ['index.html', 'pages/components.html', 'pages/products.html', 'pages/cart.html']) {
        await page.goto('https://shop.test/' + file);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${file} fits ${width}px`);
        assert.ok(await page.locator('.store-toolbar .cart-pill').isVisible());
        assert.equal(await page.locator('.store-browse-bar').count(), 0, 'Extra navigation row removed');
        if (file === 'index.html') {
          const expandedHeight = (await page.locator('.sticky-site-nav').boundingBox()).height;
          await page.evaluate(() => scrollTo({ top: 800, behavior: 'instant' }));
          await page.waitForFunction(() => document.querySelector('.sticky-site-nav').classList.contains('is-compact'));
          assert.ok((await page.locator('.sticky-site-nav').boundingBox()).height < expandedHeight);
          assert.equal((await page.locator('.sticky-site-nav').boundingBox()).y, 0, 'Navigation stays at the top');
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.waitForFunction(() => !document.querySelector('.sticky-site-nav').classList.contains('is-compact'));
        }
        assert.equal(await page.locator('.cart-pill').getAttribute('aria-label'), 'Cart, 0 items');
        if (file === 'pages/products.html' && width < 761) {
          assert.ok(await page.locator('#filterControls').isHidden(), 'Mobile filters start collapsed');
          await page.click('#toggleFilters');
          assert.ok(await page.locator('#typeFilter').isVisible());
          await page.selectOption('#typeFilter', 'Laptop');
          await page.click('#toggleFilters');
          assert.ok((await page.locator('.product-card h3').count()) > 0);
          await page.click('#resetFilters');
          await page.evaluate(() => scrollTo(0, 0));
        }
        if (file === 'pages/components.html' || file === 'index.html') {
          const banner = await page.locator(file === 'index.html' ? '#promoCarousel .promo-slide > img' : '.site-header > img').first().boundingBox();
          assert.ok(Math.abs(banner.width - width) < 1 && banner.height >= 200, 'Full-width banner has a useful height');
        }
        assert.ok(!/\bdemo\b/i.test(await page.locator('body').innerText()), 'No demo wording in storefront copy');
        await page.screenshot({ path: path.join(root, 'images/previews/refresh-' + path.basename(file, '.html') + '-' + width + '.png') });
      }
    }

    // Older secondary pages must load the same header styles as the catalog.
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 960 });
      for (const file of ['about', 'build', 'downloads', 'terms', 'warranty', 'wishlist']) {
        await page.goto('https://shop.test/pages/' + file + '.html');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), file + ' fits ' + width);
        assert.ok(await page.locator('.cart-icon').isVisible(), file + ' has the cart icon');
        assert.ok(await page.locator('.cart-icon').evaluate(icon => icon.complete && icon.naturalWidth > 0));
        await page.screenshot({ path: path.join(root, 'images/previews/refresh-' + file + '-' + width + '.png') });
      }
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto('https://shop.test/index.html');
    await page.locator('.nav-brand').evaluate(link => link.addEventListener('click', event => event.preventDefault(), { once: true }));
    await page.locator('.nav-brand').click();
    assert.equal(await page.locator('.nav-brand').evaluate(link => getComputedStyle(link).outlineStyle), 'none', 'No pointer outline on the logo');
    await page.reload();
    await page.keyboard.press('Tab');
    await page.locator('.nav-brand').focus();
    assert.notEqual(await page.locator('.nav-brand').evaluate(link => getComputedStyle(link).outlineStyle), 'none', 'Keyboard focus remains visible');
    assert.equal(await page.locator('.promo-slide').count(), 5);
    await page.locator('[data-promo-slide="4"]').click();
    assert.equal(await page.locator('.microsoft-promo').getAttribute('aria-hidden'), 'false');
    await page.locator('.microsoft-promo').screenshot({ path: path.join(root, 'images/previews/refresh-microsoft-slide.png') });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.reload();
    await page.locator('.home-video').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.getElementById('surfaceVideo').currentTime > .3);
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.muted && video.playsInline && video.loop && video.videoWidth > 0), 'Video plays silently inside the page');
    await page.screenshot({ path: path.join(root, 'images/previews/refresh-video.png') });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.locator('.home-video').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.getElementById('surfaceVideo').paused);
    await page.screenshot({ path: path.join(root, 'images/previews/refresh-video-mobile.png') });
    await page.click('#toggleSurfaceVideo');
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.paused));
    await page.click('#toggleSurfaceVideo');
    await page.waitForFunction(() => !document.getElementById('surfaceVideo').paused);
    assert.equal(await page.locator('.home-video iframe, .home-video a[href*="youtube"]').count(), 0, 'No YouTube redirects or iframe');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.paused));
    await page.goto('https://shop.test/pages/products.html?brand=Microsoft');
    assert.ok(await page.locator('[data-brand-filter][value="Microsoft"]').isChecked());
    assert.equal(await page.locator('.product-card').count(), 1);
    assert.match(await page.locator('.product-card h3').innerText(), /Microsoft Surface/);
    await page.click('#resetFilters');
    await page.locator('[data-catalog-type="Laptop"]').click();
    assert.equal(await page.locator('#typeFilter').inputValue(), 'Laptop');
    assert.ok(await page.locator('[data-catalog-type="Laptop"]').getAttribute('aria-pressed') === 'true');
    assert.equal(await page.locator('.product-collection:visible').count(), 1);
    await page.click('#resetFilters');
    await page.locator('#productSearch').fill('Mac mini');
    assert.equal(await page.locator('.product-card').count(), 1);
    await page.locator('[data-add-product]').click();
    assert.equal(await page.locator('#cartCount').innerText(), '1');
    assert.equal(await page.locator('.cart-pill').getAttribute('aria-label'), 'Cart, 1 item');

    for (const id of ['lap-microsoft-studio-2', 'lap-dell-xps-13', 'pc-hp-omen-35l', 'pc-apple-mac-mini-m4']) {
      await page.goto('https://shop.test/pages/product.html?id=' + id);
      const photos = await page.evaluate(() => productGallery(catalogProducts().find(product => product.id === new URLSearchParams(location.search).get('id'))));
      assert.ok(photos.length >= 4 && photos.some(photo => photo.shortLabel === 'Close-up'));
      const broken = await page.evaluate(async photos => {
        const results = await Promise.all(photos.map(photo => new Promise(resolve => {
          const image = new Image();
          image.onload = () => resolve(image.naturalWidth > 100 ? null : photo.src);
          image.onerror = () => resolve(photo.src);
          image.src = photo.src;
        })));
        return results.filter(Boolean);
      }, photos);
      assert.deepEqual(broken, [], id + ' has working photos');
      await page.screenshot({ path: path.join(root, 'images/previews/refresh-' + id + '.png') });
    }
    const { pathToFileURL } = require('node:url');
    await page.unroute('**/*');
    await page.route(/^https?:/, route => route.abort());
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
    await page.locator('.home-video').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.getElementById('surfaceVideo').currentTime > .3);
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.muted && !video.paused), 'Silent autoplay also works from local HTML');
    assert.deepEqual(errors, []);
    console.log('Passed responsive expanding navigation, native muted autoplay (web and local files), pause control, reduced motion, catalog categories, search, cart, and product galleries.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
