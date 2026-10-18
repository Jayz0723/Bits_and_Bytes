// Run the local browser checks one at a time for predictable resource use.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const files = fs.readdirSync(__dirname).filter(file => /^check-.*\.cjs$/.test(file) && (file !== 'check-sample-account.cjs' || process.env.SAMPLE_ACCOUNT_PASSWORD));
const failed = [];
for (const file of files) {
  const timeout = ['check-shop-layout.cjs', 'check-ui-audit.cjs', 'check-store-refresh.cjs'].includes(file) ? 300000 : 120000;
  const result = spawnSync(process.execPath, [path.join(__dirname, file)], { encoding: 'utf8', timeout, windowsHide: true });
  console.log((result.status === 0 ? 'PASS ' : 'FAIL ') + file);
  if (result.status !== 0) {
    failed.push(file);
    console.log((result.error?.message || result.stderr || result.stdout || 'Test timed out').slice(-3500));
  }
}
console.log(`${files.length - failed.length}/${files.length} checks passed.`);
if (failed.length) process.exitCode = 1;
