const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => route.abort());
    // Simulate an autoplay restriction, then use real playback after interaction.
    await page.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      window.musicAttempts = 0;
      HTMLMediaElement.prototype.play = function () {
        if (this.id === 'backgroundMusic' && ++window.musicAttempts === 1) {
          return Promise.reject(new DOMException('Interaction required', 'NotAllowedError'));
        }
        return play.call(this);
      };
    });
    const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
    await page.goto(url);
    assert.equal(await page.evaluate(() => window.musicAttempts), 1);
    await page.locator('#customerReviewsTitle').click();
    await page.waitForFunction(() => !document.querySelector('#backgroundMusic').paused);
    await page.waitForFunction(() => document.querySelector('#musicToggle').getAttribute('aria-pressed') === 'true');
    assert.equal(await page.locator('#musicToggle').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#backgroundMusic').evaluate(audio => audio.volume), 0.2);
    const time = await page.locator('#backgroundMusic').evaluate(audio => audio.currentTime);
    await page.waitForFunction(previous => document.querySelector('#backgroundMusic').currentTime > previous, time, { timeout: 10000 });
    await page.locator('#musicToggle').click();
    await page.locator('#customerReviewsTitle').click();
    assert.ok(await page.locator('#backgroundMusic').evaluate(audio => audio.paused));
    await page.reload();
    assert.equal(await page.evaluate(() => window.musicAttempts), 0, 'Saved off preference prevents autoplay');
    await page.locator('#musicToggle').click();
    await page.locator('#customerReviewsTitle').click();
    await page.waitForFunction(() => !document.querySelector('#backgroundMusic').paused);
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.muted), 'Video stays silent');
    assert.ok(await page.locator('#reviewsEmpty').isVisible());
    assert.equal(await page.locator('#sampleReviewsNote').count(), 0);
    assert.ok(await page.locator('#googleReviewsLink').isHidden());
    assert.ok(await page.locator('#customerReviewControls').isHidden());
    assert.equal(await page.locator('.google-review-card').count(), 0);
    assert.equal(await page.locator('.google-reviews img[alt*="Google"]').count(), 0);
    assert.equal(await page.getByRole('link', {name:'Share your experience'}).getAttribute('href'), 'pages/contact.html');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('.google-reviews').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.locator('.google-reviews').screenshot({ path: path.resolve(__dirname, '../images/previews/reviews-' + width + '.png') });
    }
    await page.evaluate(() => {
      customerReviews.push({name:'Example', text:'Not real', rating:5, sample:true}, {name:'Invalid', text:'Invalid', rating:9});
      renderCustomerReviews();
    });
    assert.equal(await page.locator('.google-review-card').count(), 0, 'Reject demo and invalid entries');
    // Fixture only: check future real reviews render safely, including fallback avatars.
    await page.evaluate(() => {
      customerReviews.push({ name: '<b>Test</b>', rating: 5, date: 'October 2026', text: '<script>not markup</script>', photo: 'images/missing.png' });
      renderCustomerReviews();
    });
    assert.equal(await page.locator('.google-review-card strong').textContent(), '<b>Test</b>');
    assert.equal(await page.locator('.google-review-card script').count(), 0);
    assert.equal(await page.locator('.review-google-logo').count(), 0, 'Local feedback is not labeled Google feedback');
    assert.equal(await page.locator('#sampleReviewsNote').count(), 0);
    assert.ok(await page.locator('#reviewsEmpty').isHidden());
    assert.deepEqual(errors, []);
    console.log('Passed audio regression, genuine-only review rendering, safe text handling, feedback links, and desktop/mobile empty states.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
