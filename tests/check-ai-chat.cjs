const assert = require('node:assert/strict');
const { createChatService } = require('../chat-service.cjs');
const { createStoreServer } = require('../server.cjs');
const { chromium } = require('./browser.cjs');

(async () => {
  const request = { messages: [{ role: 'user', content: 'A laptop for studying?' }] };
  let sent;
  const chat = createChatService({ apiKey: 'test-only-secret', fetchImpl: async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'What is your budget for a study laptop?' }] }] });
  } });
  assert.match((await chat(request, 'test')).reply, /budget/);
  assert.equal(sent.url, 'https://api.openai.com/v1/responses');
  assert.equal(sent.body.store, false);
  assert.match(sent.body.instructions, /MSI/);
  assert.equal(sent.body.input[0].content, request.messages[0].content);
  assert.equal(sent.options.headers.Authorization, 'Bearer test-only-secret');
  for (const messages of [[], [{ role: 'system', content: 'x' }], [{ role: 'user', content: 'x'.repeat(2001) }], [{ role: 'assistant', content: 'x' }]]) {
    await assert.rejects(chat({ messages }, 'test'), error => error.status === 400);
  }
  await assert.rejects(createChatService({ apiKey: '' })(request, 'test'), /not configured/);
  await assert.rejects(createChatService({ apiKey: 'test-only-secret', fetchImpl: async () => Response.json({ error: { code: 'insufficient_quota' } }, { status: 429 }) })(request, 'test'), /no available API credits/);
  for (const status of [401, 403, 429, 500, 404]) {
    const failing = createChatService({ apiKey: 'test-only-secret', fetchImpl: async () => new Response('private provider error', { status }) });
    await assert.rejects(failing(request, 'test'), error => error.status >= 500 && !error.message.includes('private provider'));
  }
  for (let i = 1; i < 20; i++) await chat(request, 'test');
  await assert.rejects(chat(request, 'test'), error => error.status === 429);

  let calls = 0, previous;
  const server = createStoreServer(':memory:', { chat: { apiKey: 'test-only-secret', fetchImpl: async (_url, options) => {
    previous = JSON.parse(options.body);
    calls++;
    await new Promise(resolve => setTimeout(resolve, 200));
    if (calls === 3) return new Response('', { status: 429 });
    return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: calls === 1 ? 'What is your budget?' : 'For that budget, compare the available study laptops. <script>window.bad=true</script>' }] }] });
  } } });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    const forbidden = await fetch(origin + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://elsewhere.test' }, body: JSON.stringify(request) });
    assert.equal(forbidden.status, 403);
    assert.equal((await fetch(origin + '/.env')).status, 404);
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of [1440, 390]) {
      calls = 0;
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
      await page.goto(origin);
      await page.click('#supportChatLauncher');
      await page.fill('#supportChatInput', 'A laptop for study?');
      await page.click('#supportChatForm button');
      await page.locator('#supportChatMessages[aria-busy="true"]').waitFor();
      assert.equal(await page.locator('#supportChatForm button').isDisabled(), true);
      await page.locator('.chat-reply .typewriter-text').filter({ hasText: 'What is your budget?' }).waitFor();
      await page.fill('#supportChatInput', 'Under 50000 PHP');
      await page.click('#supportChatForm button');
      await page.locator('.chat-reply').nth(1).waitFor();
      assert.equal(previous.input.length, 3);
      assert.equal(previous.input[1].role, 'assistant');
      assert.equal(await page.evaluate(() => window.bad), undefined);
      await page.fill('#supportChatInput', 'Any other choices?');
      await page.click('#supportChatForm button');
      await page.locator('.chat-reply .typewriter-text').filter({ hasText: 'AI service has reached its usage limit' }).waitFor();
      assert.equal(await page.inputValue('#supportChatInput'), 'Any other choices?');
      assert.equal(await page.locator('#supportChatForm button').isEnabled(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: require('node:path').join(__dirname, '../images/previews/ai-chat-' + width + '.png') });
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('Passed AI request/catalog/privacy, validation, key/quota/model failures, rate limit, cross-site rejection, secret-file protection, desktop/mobile follow-ups, typing state, safe text rendering and error recovery.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
