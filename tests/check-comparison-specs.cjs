const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('./browser.cjs');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,route=>route.abort());
  await page.goto(pathToFileURL(path.resolve(__dirname,'../pages/products.html')).href);
  const data=await page.evaluate(()=>catalogProducts().flatMap(base=>(base.variants?.options || [{id:''}]).map(v=>{
   const p=productWithVariant(base,v.id || undefined);
   return {id:base.id,variant:v.id,specs:p.specs,profile:productComparisonDetails(p)};
  })));
  assert.ok(data.length>=69);
  for(const p of data) {
   assert.ok(Object.keys(p.profile.values).length>=3,p.id+' missing attributes');
   assert.ok(p.profile.source,p.id+' missing source');
   assert.ok(!JSON.stringify(p.profile).includes('undefined'),p.id);
  }
  const get=(id,variant)=>data.find(p=>p.id===id&&p.variant===variant).profile;
  assert.match(JSON.stringify(get('monitor-27','24inch')),/23.8/);
  assert.match(get('monitor-27','32inch').source,/pa329cv/);
  assert.doesNotMatch(JSON.stringify(get('monitor-27','32inch')),/165Hz/);
  assert.match(JSON.stringify(get('lap-hp-victus-15','performance-blue')),/12GB/);
  assert.doesNotMatch(JSON.stringify(get('lap-hp-victus-15','performance-blue')),/5060/);
  assert.match(JSON.stringify(get('lap-hp-victus-15','mica-silver')),/24 GB/);
  await page.locator('#compareOne').selectOption('part-gpu-rtx-4060',{force:true});
  await page.locator('#compareTwo').selectOption('monitor-msi-g244f-e2',{force:true});
  assert.match(await page.locator('#comparisonResults').textContent(),/199 × 120 × 41/);
  assert.match(await page.locator('#comparisonResults').textContent(),/180 Hz/);
  assert.deepEqual(errors,[]);
  console.log(`Verified comparison coverage for ${data.length} configurations, variant isolation, source links and shared table.`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
