const assert = require('node:assert/strict');
const { createMapService } = require('../map-service.cjs');

(async () => {
  let calls = 0;
  const reverse = createMapService({ fetch: async (url, options) => {
    calls++;
    assert.match(options.headers['User-Agent'], /BitsAndBytesStore/);
    assert.equal(url.searchParams.get('lat'), '14.7');
    assert.equal(url.searchParams.get('lon'), '121.1');
    return { ok: true, json: async () => ({ features: [{ properties: { countrycode: 'PH', city: 'Quezon City' } }] }) };
  } });
  for (const [lat, lng] of [[null, '1'], ['', '1'], ['NaN', '1'], ['91', '1'], ['1', '181']]) await assert.rejects(() => reverse(lat, lng), error => error.status === 400);
  assert.equal(calls, 0);
  assert.equal((await reverse('14.7', '121.1')).properties.city, 'Quezon City');
  await reverse('14.7', '121.1');
  assert.equal(calls, 1, 'Repeated points use cache');
  await assert.rejects(() => reverse('14.71', '121.1'), error => error.status === 429);
  const unavailable = createMapService({ fetch: async () => { throw new Error('offline'); } });
  await assert.rejects(() => unavailable('14.7', '121.1'), error => error.status === 503);
  console.log('Passed coordinate validation, application identification, cache hits, application-wide rate cap, and upstream failure handling.');
})().catch(error => { console.error(error); process.exit(1); });
