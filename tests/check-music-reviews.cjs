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
    await page.waitForTimeout(400);
    assert.ok(await page.locator('#backgroundMusic').evaluate(audio => audio.currentTime) > time);
    await page.locator('#musicToggle').click();
    await page.locator('#customerReviewsTitle').click();
    assert.ok(await page.locator('#backgroundMusic').evaluate(audio => audio.paused));
    await page.reload();
    assert.equal(await page.evaluate(() => window.musicAttempts), 0, 'Saved off preference prevents autoplay');
    await page.locator('#musicToggle').click();
    await page.locator('#customerReviewsTitle').click();
    await page.waitForFunction(() => !document.querySelector('#backgroundMusic').paused);
    assert.ok(await page.locator('#surfaceVideo').evaluate(video => video.muted), 'Video stays silent');
    assert.ok(await page.locator('#reviewsEmpty').isHidden());
    assert.ok(await page.locator('#sampleReviewsNote').isVisible());
    assert.ok(await page.locator('#googleReviewsLink').isHidden());
    assert.equal(await page.locator('.google-review-card').count(), 6, 'Six design examples with a section-level disclosure');
    assert.deepEqual(await page.locator('.google-review-card small').allTextContents(), ['1 week ago', '3 weeks ago', '1 month ago', '2 months ago', '3 months ago', '4 months ago']);
    assert.equal(await page.locator('.review-google-logo').count(), 6);
    await page.locator('.google-review-source img').evaluate(image => image.decode());
    const logoBytes = require('node:fs').readFileSync(path.resolve(__dirname, '../images/branding/google-transparent.svg'));
    const transparent = await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3] === 0 &&
        context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height * 0.35), 1, 1).data[3] === 0;
    }, 'data:image/svg+xml;base64,' + logoBytes.toString('base64'));
    assert.ok(transparent, 'Google logo has transparent corners and an open center');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('.google-reviews').scrollIntoViewIfNeeded();
      await page.locator('#customerReviewPrevious').click();
      assert.equal(await page.locator('#customerReviewPosition').textContent(), width === 1440 ? '4-6 of 6' : '6-6 of 6');
      await page.locator('#customerReviewNext').click();
      assert.equal(await page.locator('#customerReviewPosition').textContent(), width === 1440 ? '1-3 of 6' : '1-1 of 6');
      await page.locator('#customerReviewNext').click();
      await page.locator('#customerReviewPrevious').click();
      assert.equal(await page.locator('.google-review-card[aria-hidden="false"]').count(), width === 1440 ? 3 : 1);
      await page.waitForTimeout(300);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.screenshot({ path: path.resolve(__dirname, '../images/previews/reviews-' + width + '.png') });
    }
    // Fixture only: check future real reviews render safely, including fallback avatars.
    await page.evaluate(() => {
      customerReviews.push({ name: '<b>Test</b>', rating: 5, date: 'October 2026', text: '<script>not markup</script>', photo: 'images/missing.png' });
      renderCustomerReviews();
    });
    assert.equal(await page.locator('.google-review-card strong').textContent(), '<b>Test</b>');
    assert.equal(await page.locator('.google-review-card script').count(), 0);
    assert.equal(await page.locator('.review-google-logo').count(), 0, 'Local feedback is not labeled Google feedback');
    assert.ok(await page.locator('#sampleReviewsNote').isHidden());
    assert.ok(await page.locator('#reviewsEmpty').isHidden());
    assert.deepEqual(errors, []);
    console.log('Passed audio playback, pause persistence, transparent Google logo, labeled sample reviews, safe real-review rendering, and desktop/mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
