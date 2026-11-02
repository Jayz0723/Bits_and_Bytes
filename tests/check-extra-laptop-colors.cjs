const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('./browser.cjs');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage(); const errors=[];
  page.on('pageerror',error=>errors.push(error.message)); page.on('dialog',dialog=>dialog.dismiss());
  await page.route(/^https?:/,route=>route.abort());
  for(const [id,color,photo] of [['lap-creator-pro','cool-silver','k6602-cool-silver'],['lap-msi-modern-15-b13m','classic-black','modern15-vibe']]){
   await page.goto(pathToFileURL(path.resolve(__dirname,'../pages/product.html')).href+'?id='+id);
   assert.equal(await page.locator('#detailVariants .color-swatch').count(),2);
   assert.match(await page.locator('#detailVariants .color-stock-list').textContent(),/in stock.*Check availability/);
   await page.locator('#detailVariants [data-product-color="'+color+'"]').click();
   await page.locator('#detailProductImage').evaluate(img=>img.decode());
   assert.ok((await page.locator('#detailProductImage').getAttribute('src')).includes(photo));
   assert.match(await page.locator('#detailProductStock').textContent(),/Check color availability/);
   const inventory=await page.evaluate(({id,color})=>{const p=productWithVariant(catalogProducts().find(p=>p.id===id),color);saveCart([]);addToCart(p);return {stock:p.stock,cart:getCart().length}}, {id,color});
   assert.deepEqual(inventory,{stock:0,cart:0});
   for(const width of [1440,390,320]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)}
  }
  assert.deepEqual(errors,[]); console.log('Passed exact laptop color photos, independent inventory, unconfirmed-stock order blocking, labels and three responsive widths.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
