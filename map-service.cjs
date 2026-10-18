// Cache and pace user-triggered Photon lookups. No autocomplete or background scans.
function createMapService(options = {}) {
  const request = options.fetch || fetch;
  const endpoint = options.endpoint || process.env.MAP_GEOCODER_URL || 'https://photon.komoot.io/reverse';
  const cache = new Map();
  let busy = false, lastStarted = 0;
  const failure = (message, status) => Object.assign(new Error(message), { status });
  return async function reverse(latValue, lngValue) {
    if (latValue === null || lngValue === null || !String(latValue).trim() || !String(lngValue).trim()) throw failure('Select a valid map point.', 400);
    const lat = Number(latValue), lng = Number(lngValue);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw failure('Select a valid map point.', 400);
    const key = lat.toFixed(5) + ',' + lng.toFixed(5);
    const saved = cache.get(key);
    if (saved && saved.expires > Date.now()) return saved.result;
    if (busy || Date.now() - lastStarted < 1100) throw failure('Please wait a moment before choosing another map point.', 429);
    busy = true;
    lastStarted = Date.now();
    try {
      const url = new URL(endpoint);
      url.searchParams.set('lat', String(lat)); url.searchParams.set('lon', String(lng));
      url.searchParams.set('lang', 'en'); url.searchParams.set('limit', '1'); url.searchParams.set('radius', '1');
      const response = await request(url, { headers: { 'User-Agent': 'BitsAndBytesStore/1.0 (+https://github.com/Jayz0723/Bits_and_Bytes)', Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw failure('The address service is unavailable. Enter your address manually or try again later.', 503);
      const data = await response.json();
      const properties = data.features?.[0]?.properties;
      const result = { properties: properties || null, attribution: 'OpenStreetMap contributors / Photon' };
      if (cache.size >= 500) cache.delete(cache.keys().next().value);
      cache.set(key, { result, expires: Date.now() + 86400000 });
      return result;
    } catch (error) {
      if (error.status) throw error;
      throw failure('Address lookup timed out or could not connect. Enter your address manually.', 503);
    } finally { busy = false; }
  };
}
module.exports = { createMapService };
