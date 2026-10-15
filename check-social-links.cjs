const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/John Carlo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const expected = [
  'https://www.facebook.com/johncarlo.herrera.58',
  'https://www.instagram.com/jayzzzz0723/',
  'https://x.com/Jayzee20202',
  'https://www.youtube.com/@johncarloherrera8540'
];
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('http://social.test/**', route => {
      const file = path.resolve(__dirname, new URL(route.request().url()).pathname.slice(1));
      if (!file.startsWith(__dirname + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    for (const file of ['index.html', 'products.html', 'product.html?id=pc-creator', 'build.html', 'contact.html', 'about.html', 'cart.html', 'components.html', 'login.html', 'wishlist.html', 'downloads.html', 'terms.html', 'warranty.html']) {
      await page.goto('http://social.test/' + file);
      await page.locator('.site-footer[data-store-footer=ready]').waitFor();
      const links = page.locator('.footer-social a');
      assert.deepEqual(await links.evaluateAll(elements => elements.map(element => element.href)), expected, file);
      await links.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      assert.ok(await links.evaluateAll(elements => elements.every(element => element.getAttribute('aria-label') && element.target === '_blank' && element.rel.includes('noopener'))));
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://social.test/contact.html');
      await page.locator('.footer-social').scrollIntoViewIfNeeded();
      const overflow = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        elements: [...document.querySelectorAll('body *')].filter(element => element.clientWidth && element.scrollWidth > element.clientWidth + 2).map(element => ({ tag: element.tagName, class: element.className, client: element.clientWidth, scroll: element.scrollWidth, text: element.textContent.slice(0, 80) })).slice(0, 10) }));
      assert.ok(overflow.scrollWidth <= width, JSON.stringify(overflow));
      assert.equal(await page.locator('.social-icon.facebook').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(255, 255, 255)');
      assert.ok((await page.locator('.social-icon.instagram').evaluate(element => getComputedStyle(element).backgroundImage)).includes('linear-gradient'));
      const tops = await page.locator('.footer-social .social-icon').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
      assert.ok(Math.max(...tops) - Math.min(...tops) < 1, 'Social logos remain in one horizontal row');
      await page.locator('.footer-social').screenshot({ path: path.join(__dirname, 'images/previews/social-footer-' + width + '.png') });
    }
    assert.deepEqual(errors, []);
    console.log('Passed all four exact profile links, local logo decoding, accessible external links on 13 pages, and desktop/mobile footer layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
