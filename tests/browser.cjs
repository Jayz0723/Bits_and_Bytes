// Prefer a regular project installation; the fallback supports the local Codex runtime.
const path = require('node:path');
const fs = require('node:fs');
fs.mkdirSync(path.resolve(__dirname, '../images/previews'), { recursive: true });
try {
  module.exports = require('playwright');
} catch {
  const home = process.env.USERPROFILE || process.env.HOME;
  module.exports = require(path.join(home, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
}
