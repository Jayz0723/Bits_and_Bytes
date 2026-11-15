/* Main storefront enhancements reuse the existing filter controls and handlers. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'storeMainContent';
  main.tabIndex = -1;
  const skip = document.createElement('a');
  skip.className = 'store-skip-link';
  skip.href = location.pathname + location.search + '#' + main.id;
  skip.textContent = 'Skip to content';
  document.body.prepend(skip);

  const search = document.getElementById('productSearch');
  if (!search) return;
  const type = document.getElementById('typeFilter');
  const use = document.getElementById('useFilter');
  const minimum = document.getElementById('minPrice');
  const maximum = document.getElementById('maxPrice');
  const stock = document.getElementById('inStockFilter');
  const reset = document.getElementById('resetFilters');
  const brands = document.getElementById('brandFilters');
  const toolbar = document.querySelector('.product-results-toolbar');
  const chips = document.createElement('div');
  chips.className = 'catalog-active-filters';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Remove selected filters');
  toolbar.after(chips);

  function update(control) {
    control.dispatchEvent(new Event(control === search || control.type === 'number' ? 'input' : 'change', { bubbles: true }));
  }
  function chip(label, remove) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'catalog-filter-chip';
    button.textContent = label + ' ×';
    button.setAttribute('aria-label', 'Remove filter: ' + label);
    button.addEventListener('click', () => {
      const index = [...chips.children].indexOf(button);
      remove();
      sync();
      (chips.children[Math.min(index, chips.children.length - 1)] || search).focus({ preventScroll: true });
    });
    chips.append(button);
  }
  function sync() {
    chips.replaceChildren();
    if (search.value.trim()) chip('Search: ' + search.value.trim(), () => { search.value = ''; update(search); });
    for (const control of [type, use]) if (control.value !== 'all') {
      chip(control.selectedOptions[0].textContent, () => { control.value = 'all'; update(control); });
    }
    brands.querySelectorAll('input:checked').forEach(control => chip(control.value, () => { control.checked = false; update(control); }));
    if (minimum.value) chip('Min: ' + minimum.value + ' ' + currencyPreference(), () => { minimum.value = ''; update(minimum); });
    if (maximum.value) chip('Max: ' + maximum.value + ' ' + currencyPreference(), () => { maximum.value = ''; update(maximum); });
    if (stock.checked) chip('In stock', () => { stock.checked = false; update(stock); });
    chips.hidden = !chips.children.length;
  }

  // Searching brand names only narrows the checkbox list, not the product results.
  const brandSearch = document.createElement('input');
  brandSearch.type = 'search';
  brandSearch.className = 'catalog-brand-search';
  brandSearch.placeholder = 'Find a brand';
  brandSearch.setAttribute('aria-label', 'Find a brand in the filters');
  brands.before(brandSearch);
  const noBrands = document.createElement('p');
  noBrands.className = 'catalog-brand-empty';
  noBrands.textContent = 'No matching brands. Try another name.';
  noBrands.hidden = true;
  brands.after(noBrands);
  function filterBrands() {
    const query = brandSearch.value.trim().toLowerCase();
    let visible = 0;
    brands.querySelectorAll('label').forEach(label => {
      label.hidden = !label.textContent.toLowerCase().includes(query);
      if (!label.hidden) visible++;
    });
    noBrands.hidden = visible > 0;
  }
  brandSearch.addEventListener('input', filterBrands);
  reset.addEventListener('click', () => { brandSearch.value = ''; filterBrands(); sync(); });

  const empty = document.getElementById('catalogEmpty');
  const emptyTitle = document.createElement('strong');
  emptyTitle.textContent = 'Let’s try a different combination.';
  const emptyNote = document.createElement('span');
  emptyNote.textContent = 'Remove a filter above, try a shorter search, or explore the full collection.';
  const emptyReset = document.createElement('button');
  emptyReset.type = 'button';
  emptyReset.className = 'button primary';
  emptyReset.textContent = 'Show all products';
  emptyReset.addEventListener('click', () => { reset.click(); search.focus({ preventScroll: true }); });
  empty.replaceChildren(emptyTitle, emptyNote, emptyReset);

  document.querySelectorAll('[data-catalog-type]').forEach(button => {
    const count = catalogProducts().filter(product => button.dataset.catalogType === 'all' || product.type === button.dataset.catalogType).length;
    const badge = document.createElement('span');
    badge.className = 'catalog-category-count';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = count;
    button.append(badge);
    // Keep the custom dropdown label synchronized with category shortcuts.
    button.addEventListener('click', () => { update(type); sync(); });
  });
  for (const control of [search, type, use, minimum, maximum, stock, brands]) {
    control.addEventListener('input', sync);
    control.addEventListener('change', sync);
  }
  sync();
})();
