const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');

(async () => {
  const server = createStoreServer(':memory:');
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [], oldMapRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (/map-config|map-reverse|tile.openstreetmap.org|leaflet|maps.googleapis.com/.test(request.url())) oldMapRequests.push(request.url());
    });
    // Block Google to prove a map outage cannot block checkout address entry.
    await page.route(/^https?:/, route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.goto(origin + '/pages/cart.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.getElementById('checkoutPanel').hidden = false);
    const frame = page.locator('#deliveryGoogleMap');
    assert.ok(await frame.isVisible());
    assert.equal(await frame.getAttribute('loading'), 'lazy');
    assert.equal(await page.locator('#addressPickerMap, #activateAddressMap, #retryMapTiles').count(), 0);
    for (const country of ['Japan', 'China', 'Spain', 'France', 'United States', 'Philippines']) {
      await page.selectOption('#countryRegion', country);
      const source = new URL(await frame.getAttribute('src'));
      assert.equal(source.hostname, 'www.google.com');
      assert.equal(source.searchParams.get('output'), 'embed');
      assert.ok(source.searchParams.get('q').includes(country));
    }
    await page.selectOption('#provinceSelect', 'Metro Manila');
    await page.selectOption('#citySelect', 'Quezon City');
    assert.match(new URL(await frame.getAttribute('src')).searchParams.get('q'), /Quezon City, Metro Manila, Philippines/);
    await page.fill('#checkoutFirstName', 'PrivateRecipient');
    await page.fill('#streetAddress', 'PrivateStreet 123');
    await page.evaluate(() => {
      window.mapSourceChanges = 0;
      new MutationObserver(records => window.mapSourceChanges += records.length).observe(document.getElementById('deliveryGoogleMap'), { attributes: true, attributeFilter: ['src'] });
      window.dispatchEvent(new Event('store-destination-change'));
      window.dispatchEvent(new Event('store-destination-change'));
    });
    await page.waitForTimeout(50);
    assert.equal(await page.evaluate(() => window.mapSourceChanges), 0, 'Same-area events do not reload Google');
    assert.doesNotMatch(await frame.getAttribute('src'), /PrivateRecipient|PrivateStreet/);
    await page.check('[name="fulfillmentMethod"][value="pickup"]');
    assert.match(await frame.getAttribute('src'), /14\.2119/);
    assert.equal(await page.evaluate(() => selectedDeliveryRate().fee), 0);
    await page.check('[name="fulfillmentMethod"][value="delivery"]');
    assert.equal(await page.inputValue('#streetAddress'), 'PrivateStreet 123');
    assert.equal(await page.locator('#streetAddress').isDisabled(), false);
    assert.match(new URL(await frame.getAttribute('src')).searchParams.get('q'), /Quezon City/);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await frame.evaluate(element => element.getBoundingClientRect().width <= innerWidth));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.deepEqual(oldMapRequests, []);
    assert.deepEqual(errors, []);
    console.log('Passed Google iframe, six countries, local area updates, pickup/delivery restoration, private-data exclusion, no redundant reloads or old-map requests, usable form with Google blocked, and responsive widths.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exit(1); });
