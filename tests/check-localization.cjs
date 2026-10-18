const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
const root = path.resolve(__dirname, '..');
const url = file => pathToFileURL(path.join(root, file)).href;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => dialog.dismiss());
    await page.route(/^https?:/, route => route.abort());
    await page.goto(url('pages/products.html'));
    for (const [language, currency, home, html] of [
      ['ja', 'JPY', 'ホーム', 'ja'], ['es', 'EUR', 'Inicio', 'es'],
      ['fr', 'EUR', 'Accueil', 'fr'], ['zh', 'CNY', '首页', 'zh-Hans']
    ]) {
      await Promise.all([page.waitForEvent('load'), page.selectOption('#languageSelect', language)]);
      assert.equal(await page.locator('html').getAttribute('lang'), html);
      assert.equal(await page.locator('.nav-home').textContent(), home);
      assert.equal(await page.locator('#currencySelect').inputValue(), currency);
      assert.equal(await page.locator('#typeFilter option[value="Laptop"]').getAttribute('value'), 'Laptop');
      await page.selectOption('#typeFilter', 'Laptop');
      assert.ok(await page.locator('#laptops .product-card:visible').count());
      assert.equal(await page.locator('#computer-products .product-card:visible').count(), 0);
      await page.selectOption('#typeFilter', 'all');
      // A price filter uses the chosen display currency, not raw pesos.
      await page.locator('#maxPrice').fill('500');
      await page.locator('#maxPrice').dispatchEvent('input');
      const correct = await page.evaluate(() => [...document.querySelectorAll('.product-card')].every(card => {
        const product = catalogProducts().find(item => item.id === card.dataset.productId);
        return product.price * displayCurrencyRates[currencyPreference()] <= 500;
      }));
      assert.ok(correct, 'Price filter converts back to PHP');
      await page.locator('#resetFilters').click();
      for (const width of [1440, 1280, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), language + ' catalog overflow at ' + width);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      if (language === 'fr') await page.screenshot({ path: path.join(root, 'images/previews/language-fr-catalog.png') });
      await page.locator('[data-add-product]').first().click();
      await page.goto(url('pages/cart.html'));
      assert.equal(await page.locator('#languageSelect').inputValue(), language);
      assert.equal(await page.locator('#currencySelect').inputValue(), currency);
      assert.equal(await page.locator('.currency-notice').count(), 1);
      assert.match(await page.evaluate(() => paymentAmount(1995)), /₱1,995\.00/);
      assert.match(await page.locator('.checkout-grand-total dt').textContent(), /PHP/);
      assert.ok(await page.evaluate(() => getCart().every(item => item.price > 0 && item.quantity > 0)));
      await page.goto(url('index.html'));
      assert.notEqual(await page.locator('.hero-copy h1').textContent(), 'PCs, laptops & components');
      for (const width of [1440, 1280, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), language + ' overflow at ' + width);
      }
      await page.screenshot({ path: path.join(root, 'images/previews/language-' + language + '.png') });
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(url('pages/products.html'));
      console.log(language + ': translations, filters, cart, persistence, responsive widths passed');
    }
    // Language and currency can be selected independently.
    await Promise.all([page.waitForEvent('load'), page.selectOption('#currencySelect', 'JPY')]);
    assert.equal(await page.locator('#languageSelect').inputValue(), 'zh');
    assert.equal(await page.locator('#currencySelect').inputValue(), 'JPY');
    assert.ok(await page.evaluate(() => !money(1995).includes('.')), 'JPY has no fractional amount');
    await page.evaluate(() => {
      localStorage.setItem('bitsAndBytesCurrency', 'INVALID');
      localStorage.setItem('bitsAndBytesLanguage', 'INVALID');
    });
    await page.reload();
    assert.equal(await page.locator('#currencySelect').inputValue(), 'PHP');
    assert.equal(await page.locator('#languageSelect').inputValue(), 'en');
    assert.equal(await page.locator('.nav-home').textContent(), 'Home');
    assert.deepEqual(errors, []);
    console.log('Independent currencies, invalid saved preferences and page errors passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
