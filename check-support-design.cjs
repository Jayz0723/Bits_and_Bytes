// Visual and interaction checks for the support-only design.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/John Carlo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'shop.test') return route.abort();
      const file = path.resolve(__dirname, decodeURIComponent(url.pathname.slice(1)));
      if (!file.startsWith(__dirname + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404 });
      const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
      return route.fulfill({ body: fs.readFileSync(file), contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('http://shop.test/contact.html');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), width + ': no page overflow');
      await page.screenshot({ path: path.join(__dirname, 'images/previews/support-redesign-' + width + '.png'), fullPage: true });
      for (const topic of ['Product question', 'Build Your Own PC help', 'Order support']) {
        await page.locator('[data-support-topic]').filter({ hasText: topic === 'Product question' ? 'Find the right device' : topic === 'Order support' ? 'Help with an order' : 'Check your build' }).click();
        assert.equal(await page.inputValue('#topic'), topic);
      }
      await page.fill('#name', 'Support shopper');
      await page.fill('#email', 'test@example.com');
      await page.fill('#message', 'Could you check this build?');
      await page.locator('[data-support-form] button[type=submit]').click();
      assert.ok(await page.locator('.support-draft').isVisible());
      assert.match(await page.locator('.support-draft p').innerText(), /Could you check this build/);
      await page.locator('.faq-item summary').first().click();
      assert.ok(await page.locator('.faq-item').first().getAttribute('open') !== null);
      await page.fill('#addr', 'next@example.com');
      await page.click('#startSupportRequest');
      assert.equal(await page.inputValue('#email'), 'next@example.com');
      await page.locator('.support-panel').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(__dirname, 'images/previews/support-details-' + width + '.png') });
    }
    // Check the exact foreground/background pair that was unreadable in the old strip.
    const colors = await page.locator('.support-copy h2').evaluate(element => {
      const style = getComputedStyle(element);
      return { text: style.color, surface: getComputedStyle(document.body).backgroundColor };
    });
    function brightness(color) {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => {
        value = Number(value) / 255;
        return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
      });
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    }
    const contrast = (brightness(colors.text) + .05) / (brightness(colors.surface) + .05);
    assert.ok(contrast >= 4.5, 'Support strip text has readable contrast');
    await page.goto('http://shop.test/support-widget.html');
    await page.fill('#name', 'Widget shopper');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'A laptop recommendation, please.');
    await page.locator('button[type=submit]').click();
    assert.ok(await page.locator('.support-draft').isVisible());
    assert.deepEqual(errors, []);
    console.log('Passed support layouts at 1440/1024/768/390/320, topic shortcuts, message drafts, FAQs, email transfer, widget, and text contrast (' + contrast.toFixed(1) + ':1).');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
