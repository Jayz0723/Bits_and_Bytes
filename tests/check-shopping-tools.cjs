// Run with Node. The browser serves local files, so no public hosting is needed.
const fs = require('node:fs');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
const assert = require('node:assert/strict');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--unsafely-treat-insecure-origin-as-secure=http://shop.test'] });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'shop.test') return route.abort();
      const file = path.resolve(projectRoot, decodeURIComponent(url.pathname.slice(1)));
      if (!file.startsWith(projectRoot + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    await page.goto('http://shop.test/pages/products.html');
    assert.equal(await page.locator('#productSuggestions option').count(), 26);
    await page.fill('#productSearch', 'kingston 2tb');
    const names = await page.locator('.product-card h3').allTextContents();
    assert.ok(names.length >= 2 && names.every(name => /Kingston/i.test(name)));
    await page.fill('#productSearch', 'no-such-model');
    assert.equal(await page.locator('.product-card').count(), 0);
    assert.ok(await page.locator('#catalogEmpty').isVisible());
    await page.click('#resetFilters');
    assert.equal(await page.locator('.product-card').count(), 26);
    await page.locator('#comparisonTool summary').click();
    const variants = await page.evaluate(() => comparisonOptions.filter(product => product.baseProductId === 'part-ssd-kingston-kc600').slice(0, 2));
    await page.selectOption('#compareOne', variants[0].id);
    await page.selectOption('#compareTwo', variants[1].id);
    assert.equal(await page.locator('.comparison-table thead img').count(), 2);
    assert.equal(await page.locator('.comparison-table thead img').first().getAttribute('src'), variants[0].image);
    assert.equal(await page.locator('.comparison-table tfoot ins').first().innerText(), await page.evaluate(price => money(price), variants[0].price));
    await page.locator('[data-compare-add]').first().click();
    assert.equal(await page.evaluate(() => getCart()[0].id), variants[0].id);
    await page.selectOption('#compareTwo', variants[0].id);
    assert.equal(await page.locator('.comparison-table thead img').count(), 1, 'Duplicate comparison choices do not repeat columns');
    await page.selectOption('#compareTwo', variants[1].id);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('#comparisonTool').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': comparison fits');
      await page.screenshot({ path: path.join(projectRoot, 'images/previews/shopping-compare-' + width + '.png') });
      await page.check('[name="catalogView"][value="list"]');
      await page.locator('.product-card').first().scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': list fits');
      await page.screenshot({ path: path.join(projectRoot, 'images/previews/shopping-list-' + width + '.png') });
      await page.check('[name="catalogView"][value="grid"]');
    }
    await page.click('#clearComparison');
    assert.ok(await page.locator('#comparisonResults').isHidden());
    await page.locator('.shopping-extra').filter({ hasText: 'Already know what you need?' }).locator('summary').click();
    await page.fill('#quickOrderQty', '2.9');
    assert.equal(await page.inputValue('#quickOrderQty'), '2');
    assert.equal(await page.locator('#quickOrderTotal').innerText(), await page.evaluate(() => money(Number(document.getElementById('quickOrderPrice').value) * 2)));
    await page.goto('http://shop.test/pages/cart.html');
    await page.fill('[data-cart-quantity]', '3');
    await page.locator('[data-cart-quantity]').dispatchEvent('change');
    assert.equal(await page.evaluate(() => getCart()[0].quantity), 3);
    assert.equal(await page.locator('#cartTotal').innerText(), await page.evaluate(() => money(getCart()[0].price * 3)));
    await page.fill('[data-cart-quantity]', '999');
    await page.locator('[data-cart-quantity]').dispatchEvent('change');
    assert.equal(await page.evaluate(() => getCart()[0].quantity), variants[0].stock);
    await page.reload();
    assert.equal(await page.inputValue('[data-cart-quantity]'), String(variants[0].stock));
    // A customized line must not bypass the stock limit of its base variant.
    await page.evaluate(() => {
      const item = getCart()[0];
      addToCart({ ...item, id: item.id + '-configured', isConfigured: true }, 1);
    });
    assert.equal(await page.evaluate(() => getCart().length), 1);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': cart fits');
      await page.locator('#cartItems').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(projectRoot, 'images/previews/shopping-cart-' + width + '.png') });
    }
    await page.click('#clearCart');
    assert.ok(await page.locator('#checkoutButton').isDisabled());
    await page.goto('http://shop.test/pages/product.html?id=pc-creator');
    // Exercise the configured-item handler, including non-variant base IDs.
    await page.evaluate(() => document.getElementById('addConfiguredProduct').click());
    assert.equal(await page.evaluate(() => getCart()[0].baseProductId), 'pc-creator');
    await page.evaluate(() => {
      const product = catalogProducts().find(product => product.id === 'pc-creator');
      addToCart(product, product.stock);
    });
    assert.equal(await page.evaluate(() => getCart().reduce((sum, item) => sum + item.quantity, 0)), await page.evaluate(() => catalogProducts().find(product => product.id === 'pc-creator').stock));
    await page.goto('http://shop.test/pages/contact.html');
    await page.setInputFiles('#supportPhoto', { name: 'wrong.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') });
    assert.ok(!(await page.locator('#supportPhoto').evaluate(input => input.checkValidity())));
    await page.setInputFiles('#supportPhoto', { name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
    assert.ok(!(await page.locator('#supportPhoto').evaluate(input => input.checkValidity())));
    await page.setInputFiles('#supportPhoto', { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not really an image') });
    await page.waitForFunction(() => document.getElementById('supportPhoto').validationMessage.includes('cannot be opened'));
    await page.setInputFiles('#supportPhoto', { name: 'receipt.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(projectRoot, 'images/products/kingston-kc600.png')) });
    await page.locator('.support-photo-preview img').evaluate(image => image.decode());
    assert.ok(await page.locator('.support-photo-preview').isVisible());
    await page.fill('#name', 'Student shopper');
    await page.fill('#email', 'shopper@example.com');
    await page.fill('#message', 'Can this SSD fit my laptop?');
    await page.locator('[data-support-form] button[type=submit]').click();
    assert.match(await page.locator('.support-draft p').innerText(), /receipt.png \(not uploaded\)/);
    await page.click('#removeSupportPhoto');
    assert.ok(await page.locator('.support-photo-preview').isHidden());
    await page.fill('#addr', 'help@example.com');
    await page.click('#startSupportRequest');
    assert.equal(await page.inputValue('#email'), 'help@example.com');
    await page.goto('http://shop.test/pages/components.html');
    await page.click('#laptopReveal');
    assert.ok(await page.locator('#pc').isHidden());
    await page.click('#laptopReveal');
    assert.ok(await page.locator('#pc').isVisible());
    assert.equal(await page.locator('#laptopReveal').getAttribute('aria-expanded'), 'true');
    assert.ok(await page.locator('map area').count() > 4);
    await page.goto('http://shop.test/pages/login.html');
    await page.evaluate(async () => {
      await registerDemoAccount('Demo shopper', 'demo@example.com', 'practice-only');
      sessionStorage.removeItem('bitsAndBytesSignedInEmail');
      updateAccountState();
    });
    await page.fill('#loginEmail', 'demo@example.com');
    await page.fill('#loginPassword', 'practice-only');
    await page.check('#rememberMe');
    await page.locator('#loginForm button[type=submit]').click();
    await page.waitForFunction(() => document.getElementById('loginForm').hidden);
    await page.reload();
    assert.equal(await page.inputValue('#loginEmail'), 'demo@example.com');
    assert.equal(await page.inputValue('#loginPassword'), '');
    assert.ok(!(await page.evaluate(() => JSON.stringify(localStorage))).includes('practice-only'));
    await page.goto('http://shop.test/index.html');
    assert.equal(await page.locator('audio[controls]:not([autoplay])').count(), 1);
    assert.ok(fs.existsSync(path.join(projectRoot, 'downloads/PC_GUIDE.pdf')));
    assert.deepEqual(errors, []);
    console.log('Passed search, capacity-specific comparison, grid/list layouts, stock-limited quantities, cart persistence, upload preview, support draft, reveal, remembered email, and optional audio.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
