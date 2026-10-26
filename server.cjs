// Small local server: static shop files, password-checked accounts and SQLite addresses.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');
const { validInternationalAddress } = require('./js/international.js');
const { createMapService } = require('./map-service.cjs');
const { createChatService } = require('./chat-service.cjs');
const { validateProfilePhoto } = require('./profile-photo.cjs');
const pbkdf2 = promisify(crypto.pbkdf2);
const root = __dirname;
if (fs.existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));

function createStoreServer(databaseFile = path.join(root, 'data/store.sqlite'), options = {}) {
  const reverseMapAddress = createMapService();
  const chat = createChatService(options.chat);
  if (databaseFile !== ':memory:') fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const db = new DatabaseSync(databaseFile);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS address_books (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, body TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);`);
  db.exec('CREATE TABLE IF NOT EXISTS profile_photos (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, photo TEXT NOT NULL)');
  // Preserve the existing requested sample login without keeping a plaintext password.
  db.prepare('INSERT OR IGNORE INTO users (email,name,salt,password_hash) VALUES (?,?,?,?)').run('jcherrera0723@gmail.com', 'John Carlo Herrera', '10028767bf40ff97b6294984b3db32f4', '3423c1e4197be86b9ced8ecfd3bfb15bc7dc34b20047e96e94c31ba0a822d7a9');
  const attempts = new Map();
  const tokenHash = token => crypto.createHash('sha256').update(token).digest('hex');
  const cookie = req => /(?:^|;\s*)bb_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  const account = req => {
    const token = cookie(req);
    return token ? db.prepare('SELECT users.id, users.email, users.name FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires>?').get(tokenHash(token), Date.now()) : null;
  };
  const bookFor = user => {
    const row = db.prepare('SELECT body,revision FROM address_books WHERE user_id=?').get(user.id);
    return row ? { ...JSON.parse(row.body), revision: row.revision } : { addresses: [], defaultId: '', revision: 0 };
  };
  const payload = user => ({ user: user ? { email: user.email, name: user.name, avatar: db.prepare('SELECT photo FROM profile_photos WHERE user_id=?').get(user.id)?.photo || '' } : null, book: user ? bookFor(user) : { addresses: [], defaultId: '', revision: 0 } });
  const fail = (message, status = 400) => Object.assign(new Error(message), { status });
  async function readBody(req) {
    let size = 0, body = '';
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 100000) throw fail('Request too large.', 413);
      body += chunk;
    }
    try { return JSON.parse(body); } catch { throw fail('Invalid request.'); }
  }
  function session(res, user) {
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(tokenHash(token), user.id, Date.now() + 7 * 86400000);
    res.setHeader('Set-Cookie', 'bb_session=' + token + '; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800' + (process.env.COOKIE_SECURE === '1' ? '; Secure' : ''));
  }
  function validateBook(book) {
    if (!book || !Array.isArray(book.addresses) || book.addresses.length > 50 || !Number.isSafeInteger(book.revision)) throw fail('Invalid address book.');
    const ids = new Set();
    for (const entry of book.addresses) {
      if (!entry || typeof entry.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(entry.id) || ids.has(entry.id)) throw fail('Invalid address identifier.');
      ids.add(entry.id);
      const required = [entry.label, entry.recipient?.firstName, entry.recipient?.surname, entry.phone];
      if (required.some(value => typeof value !== 'string' || !value.trim() || value.length > 200) || !validInternationalAddress(entry.address)) throw fail('Complete the recipient and delivery address.');
      if (!/^[+0-9() .-]{7,30}$/.test(entry.phone) || entry.phone.replace(/\D/g, '').length < 7 || entry.phone.replace(/\D/g, '').length > 15) throw fail('Enter a valid phone number.');
      if (JSON.stringify(entry).length > 5000) throw fail('Address is too long.');
    }
    if (book.defaultId && !ids.has(book.defaultId)) throw fail('Default address is missing.');
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname.startsWith('/api/')) {
        if (!['GET', 'POST', 'PUT', 'PATCH'].includes(req.method)) throw fail('Method not allowed.', 405);
        if (req.method !== 'GET') {
          const origin = req.headers.origin;
          if ((origin && origin !== 'http://' + req.headers.host && origin !== 'https://' + req.headers.host) || req.headers['sec-fetch-site'] === 'cross-site') throw fail('Cross-site request rejected.', 403);
          if (!req.headers['content-type']?.startsWith('application/json')) throw fail('JSON required.', 415);
        }
        const user = account(req);
        if (pathname === '/api/chat' && req.method === 'POST') return reply(200, await chat(await readBody(req), req.socket.remoteAddress));
        if (pathname === '/api/map-config' && req.method === 'GET') return reply(200, { tileUrl: process.env.MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: process.env.MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
        if (pathname === '/api/session' && req.method === 'GET') return reply(200, payload(user));
        if (['/api/login', '/api/register'].includes(pathname) && req.method === 'POST') {
          const key = req.socket.remoteAddress;
          const now = Date.now();
          if (attempts.size > 5000) for (const [ip, value] of attempts) if (value.until < now) attempts.delete(ip);
          const rate = attempts.get(key);
          if (rate?.until > now && rate.count >= 20) throw fail('Too many sign-in attempts. Please try again in 15 minutes.', 429);
          attempts.set(key, rate?.until > now ? { ...rate, count: rate.count + 1 } : { until: now + 900000, count: 1 });
          const body = await readBody(req);
          const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) throw fail('Enter a valid email and a password of 8 to 128 characters.');
          let found = db.prepare('SELECT * FROM users WHERE email=?').get(email);
          if (pathname === '/api/register') {
            if (found) throw fail('This email already has an account. Please sign in.', 409);
            if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100) throw fail('Enter your name.');
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = (await pbkdf2(body.password, salt, 100000, 32, 'sha256')).toString('hex');
            try { db.prepare('INSERT INTO users (email,name,salt,password_hash) VALUES (?,?,?,?)').run(email, body.name.trim(), salt, hash); }
            catch (error) { if (String(error.message).includes('UNIQUE')) throw fail('This email already has an account.', 409); throw error; }
            found = db.prepare('SELECT id,email,name FROM users WHERE email=?').get(email);
          } else {
            const hash = await pbkdf2(body.password, found?.salt || 'not-an-account', 100000, 32, 'sha256');
            if (!found || !crypto.timingSafeEqual(hash, Buffer.from(found.password_hash, 'hex'))) throw fail('Email or password is incorrect.', 401);
          }
          session(res, found);
          return reply(200, payload(found));
        }
        if (pathname === '/api/logout' && req.method === 'POST') {
          if (cookie(req)) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(cookie(req)));
          res.setHeader('Set-Cookie', 'bb_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
          return reply(200, { user: null, book: { addresses: [], defaultId: '', revision: 0 } });
        }
        if (!user) throw fail('Please sign in to your account.', 401);
        if (pathname === '/api/map-reverse' && req.method === 'GET') {
          const query = new URL(req.url, 'http://localhost').searchParams;
          return reply(200, await reverseMapAddress(query.get('lat'), query.get('lng')));
        }
        if (pathname === '/api/addresses' && req.method === 'PUT') {
          const book = await readBody(req);
          validateBook(book);
          const current = bookFor(user);
          if (current.revision !== book.revision) return reply(409, { error: 'Your address book changed in another tab. Review the latest addresses and try again.', book: current });
          const saved = { addresses: book.addresses, defaultId: book.defaultId || '' };
          db.prepare('INSERT INTO address_books VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET body=excluded.body,revision=excluded.revision').run(user.id, JSON.stringify(saved), current.revision + 1);
          return reply(200, { book: bookFor(user) });
        }
        if (pathname === '/api/profile' && req.method === 'PATCH') {
          const body = await readBody(req);
          if (Object.hasOwn(body, 'avatar')) {
            if (!validateProfilePhoto(body.avatar)) throw fail('Choose a valid profile photo of up to 60 KB after resizing.');
            if (body.avatar) db.prepare('INSERT INTO profile_photos VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET photo=excluded.photo').run(user.id, body.avatar);
            else db.prepare('DELETE FROM profile_photos WHERE user_id=?').run(user.id);
            return reply(200, payload(user));
          }
          if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100) throw fail('Enter your name.');
          db.prepare('UPDATE users SET name=? WHERE id=?').run(body.name.trim(), user.id);
          return reply(200, payload({ ...user, name: body.name.trim() }));
        }
        throw fail('Not found.', 404);
      }
      if (!['GET', 'HEAD'].includes(req.method)) throw fail('Method not allowed.', 405);
      const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
      if (relative !== 'index.html' && !/^(pages|css|js|images|audio|videos|downloads)\//.test(relative)) throw fail('Not found.', 404);
      const filename = path.resolve(root, relative);
      if (!filename.startsWith(root + path.sep) || relative.split(/[\\/]/).some(part => part.startsWith('.')) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) throw fail('Not found.', 404);
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.pdf': 'application/pdf' };
      const size = fs.statSync(filename).size;
      const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      const start = range ? Number(range[1]) : 0;
      const end = range && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start > end || start >= size) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); return res.end(); }
      const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
      if (range) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      res.writeHead(range ? 206 : 200, headers);
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(filename, { start, end }).on('error', () => res.destroy()).pipe(res);
    } catch (error) { reply(error.status || 500, { error: error.status ? error.message : 'The store could not complete this request. Please try again.' }); }
  });
  server.on('close', () => db.close());
  return server;
}
if (require.main === module) {
  const port = Number(process.env.PORT) || 4173;
  createStoreServer().listen(port, '127.0.0.1', () => console.log('Bits and Bytes: http://localhost:' + port));
}
module.exports = { createStoreServer };
