/* A separate comparison shortlist. Existing cart, wishlist, filters, and the
   original comparison form keep their own handlers and storage. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main || document.querySelector('#shortlistDialog')) return;
  const editionRoot = new URL('../', document.currentScript.src);
  const storeRoot = editionRoot.pathname.endsWith('/frontend-html/') ? new URL('../', editionRoot) : editionRoot;
  const storageKey = 'bitsAndBytesCompareShortlistV1';
  const fields = [['brand', 'Brand'], ['type', 'Category'], ['use', 'Best for'],
    ['specs', 'Specifications'], ['stock', 'Availability'], ['price', 'Price per item']];
  const keyOf = item => `${item.id}:${item.variant}`;
  let selected = [];
  let lastTrigger;

  function valid(item) {
    return item && /^[\w-]{1,120}$/.test(item.id) && typeof item.variant === 'string'
      && /^[\w-]{0,120}$/.test(item.variant) && typeof item.name === 'string' && item.name.length <= 240
      && typeof item.image === 'string' && /^images\/[\w/ .-]+$/.test(item.image) && !item.image.includes('..')
      && fields.every(([key]) => typeof item[key] === 'string' && item[key].length <= 3000);
  }
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      selected = Array.isArray(saved) ? saved.filter(valid).filter((item, index, items) =>
        items.findIndex(other => keyOf(other) === keyOf(item)) === index).slice(0, 3) : [];
    } catch { /* The shortlist still works while this page stays open. */ }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(selected)); } catch { /* Storage may be disabled. */ }
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }
  function button(text, action, label = text) {
    const element = node('button', 'shortlist-button', text);
    element.type = 'button';
    element.setAttribute('aria-label', label);
    element.addEventListener('click', action);
    return element;
  }
  function liveItem(id, variant) {
    if (typeof catalogProducts !== 'function') return null;
    const base = catalogProducts().find(item => item.id === id);
    if (!base) return null;
    const product = productWithVariant(base, variant || undefined);
    return { id, variant: product.variantId || '', name: product.name, image: product.image,
      brand: product.brand, type: product.type, use: product.use || 'General use', specs: product.specs,
      stock: product.stockUnconfirmed ? 'Check color availability' : `${product.stock} in stock`, price: money(product.price) };
  }
  // HTML pages already contain the displayed product data. Read it directly so
  // the second edition does not need a second catalog or the main app script.
  function cardItem(card) {
    const anchor = card.querySelector('.product-name-button');
    if (!anchor?.href) return null;
    const params = new URL(anchor.href).searchParams;
    const id = card.dataset.productId;
    const variant = card.querySelector('[data-product-variant]')?.value || params.get('variant') || '';
    const live = liveItem(id, variant);
    if (live) return live;
    const description = card.querySelector('.product-card-body > p')?.textContent.trim() || '';
    const separator = description.indexOf(' - ');
    const tags = card.querySelectorAll('.tag-row > span');
    const item = { id, variant, name: anchor.textContent.trim(),
      image: card.querySelector('.product-image-button img')?.getAttribute('src') || '',
      brand: separator < 0 ? 'See product details' : description.slice(0, separator),
      specs: separator < 0 ? description : description.slice(separator + 3),
      type: tags[0]?.textContent.trim() || 'Product', use: tags[1]?.textContent.trim() || 'General use',
      stock: 'See product for current availability', price: card.querySelector('.current-price')?.textContent.trim() || 'See product details' };
    return valid(item) ? item : null;
  }

  const panel = node('section', 'shortlist-panel');
  panel.setAttribute('aria-label', 'Product comparison shortlist');
  const summary = node('p');
  const notice = node('p', 'shortlist-notice');
  notice.setAttribute('role', 'status');
  panel.append(summary, button('Compare products', open), button('Clear selection', () => {
    selected = []; save(); sync();
    notice.textContent = 'Comparison cleared.';
  }), notice);
  main.prepend(panel);

  const dialog = node('dialog', 'shortlist-dialog');
  dialog.id = 'shortlistDialog';
  dialog.setAttribute('aria-labelledby', 'shortlistTitle');
  const heading = node('div', 'shortlist-heading');
  const title = node('h2', '', 'Find your best fit');
  title.id = 'shortlistTitle';
  title.tabIndex = -1;
  heading.append(title, button('×', () => dialog.close(), 'Close product comparison'));
  const description = node('p', 'shortlist-description', 'Compare your selected colors and configurations. Prices exclude shipping. Open a product for its latest price and availability.');
  const filter = node('label', 'shortlist-differences');
  const differences = node('input');
  differences.type = 'checkbox';
  differences.addEventListener('change', renderTable);
  filter.append(differences, document.createTextNode('Show differences only'));
  const viewport = node('div', 'shortlist-table-wrap');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Product comparison, scroll horizontally for more products');
  const scrollHint = node('p', 'shortlist-scroll-hint', 'Swipe the table sideways to compare all selected products.');
  dialog.append(heading, description, filter, scrollHint, viewport);
  document.body.append(dialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  } });
  dialog.addEventListener('close', () => { if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true }); });

  function open(event) {
    lastTrigger = event?.currentTarget;
    renderTable();
    if (!dialog.open) dialog.showModal();
    title.focus({ preventScroll: true });
    dialog.scrollTop = 0;
  }
  function renderTable() {
    viewport.replaceChildren();
    const items = selected.map(item => liveItem(item.id, item.variant) || item);
    if (!items.length) { viewport.append(node('p', '', 'Choose products from the shop to start comparing.')); return; }
    const table = node('table', 'shortlist-table');
    const caption = node('caption', '', `${items.length} selected product${items.length === 1 ? '' : 's'}`);
    const head = node('thead');
    const headRow = node('tr');
    const label = node('th', '', 'Your shortlist'); label.scope = 'col'; headRow.append(label);
    items.forEach((item, index) => {
      const cell = node('th'); cell.scope = 'col';
      const image = node('img'); image.src = new URL(item.image, storeRoot).href; image.alt = ''; image.width = 220; image.height = 160;
      image.addEventListener('error', () => { image.src = new URL('images/placeholders/product-photo-placeholder.svg', storeRoot).href; }, { once: true });
      const link = node('a', '', item.name);
      const url = new URL('pages/product.html', storeRoot); url.searchParams.set('id', item.id);
      if (item.variant) url.searchParams.set('variant', item.variant);
      link.href = url.href;
      const remove = button('Remove', () => {
        selected.splice(index, 1); save(); sync(); renderTable(); title.focus({ preventScroll: true });
      }, `Remove ${item.name} from comparison`);
      cell.append(image, link, remove); headRow.append(cell);
    });
    head.append(headRow); table.append(caption, head);
    const body = node('tbody');
    let count = 0;
    fields.forEach(([key, label]) => {
      const same = items.every(item => item[key] === items[0][key]);
      if (differences.checked && same && items.length > 1) return;
      const row = node('tr', same ? '' : 'shortlist-different');
      const header = node('th', '', label); header.scope = 'row'; row.append(header);
      items.forEach(item => row.append(node('td', '', item[key])));
      body.append(row); count++;
    });
    table.append(body); viewport.append(table);
    if (!count) viewport.append(node('p', '', 'The displayed specifications match. Turn off the filter to see every row.'));
  }

  function sync() {
    summary.textContent = `${selected.length}/3 products selected`;
    panel.hidden = selected.length === 0 && !notice.textContent;
    panel.querySelector('button').disabled = selected.length < 2;
    main.querySelectorAll('.shortlist-card-controls').forEach(controls => {
      const item = cardItem(controls.closest('.product-card'));
      const active = item && selected.some(saved => keyOf(saved) === keyOf(item));
      const toggle = controls.querySelector('.shortlist-toggle');
      toggle.textContent = active ? '✓ Selected' : '+ Compare';
      toggle.setAttribute('aria-pressed', String(Boolean(active)));
      toggle.setAttribute('aria-label', `${active ? 'Remove from' : 'Add to'} comparison: ${item?.name || 'product'}`);
      const view = controls.querySelector('.shortlist-view');
      view.hidden = selected.length < 2;
      view.textContent = `View comparison (${selected.length})`;
    });
  }
  function attach() {
    main.querySelectorAll('.product-card').forEach(card => {
      if (card.querySelector('.shortlist-card-controls') || !cardItem(card)) return;
      const controls = node('div', 'shortlist-card-controls');
      const feedback = node('span', 'shortlist-card-feedback'); feedback.setAttribute('role', 'status');
      const toggle = button('+ Compare', () => {
        const item = cardItem(card); if (!item) return;
        const index = selected.findIndex(saved => keyOf(saved) === keyOf(item));
        feedback.textContent = '';
        if (index >= 0) selected.splice(index, 1);
        else if (selected.length >= 3) {
          feedback.textContent = 'Your comparison is full. Remove one product to add another.'; return;
        } else selected.push(item);
        notice.textContent = ''; save(); sync();
      });
      toggle.classList.add('shortlist-toggle');
      const view = button('View comparison', open); view.classList.add('shortlist-view');
      controls.append(toggle, view, feedback);
      (card.querySelector('.product-card-body') || card).append(controls);
    });
    sync();
  }
  read(); attach();
  // Filters and color choices replace cards. Observe only additions containing
  // product cards, so our own text updates never create an observer loop.
  new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes].some(added => added.nodeType === 1 &&
      (added.matches('.product-card') || added.querySelector('.product-card'))))) attach();
  }).observe(main, { childList: true, subtree: true });
  main.addEventListener('change', event => { if (event.target.matches('[data-product-variant]')) sync(); });
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) { read(); sync(); if (dialog.open) renderTable(); } });
})();
