/* Recently viewed is independent of accounts, carts, and wishlists.
   The HTML edition uses this same small script while keeping its pages in HTML. */
(() => {
  'use strict';
  const main = document.querySelector('main');
  if (!main || document.querySelector('.recent-products')) return;
  const script = new URL(document.currentScript.src);
  const editionRoot = new URL('../', script);
  const storeRoot = editionRoot.pathname.endsWith('/frontend-html/')
    ? new URL('../', editionRoot) : editionRoot;
  const storageKey = 'bitsAndBytesRecentlyViewedV1';
  const maxItems = 12;
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  let memory = [];

  // Restrict saved data to local product links and local catalog pictures.
  function valid(item) {
    return item && typeof item.id === 'string' && /^[\w-]{1,120}$/.test(item.id)
      && typeof item.variant === 'string' && /^[\w-]{0,120}$/.test(item.variant)
      && typeof item.name === 'string' && item.name.length <= 240
      && typeof item.image === 'string' && /^images\/[\w/ .-]+$/.test(item.image)
      && !item.image.includes('..') && Number.isFinite(item.viewedAt)
      && item.viewedAt <= Date.now() && Date.now() - item.viewedAt < maxAge;
  }
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      memory = Array.isArray(saved) ? saved.filter(valid).slice(0, maxItems) : [];
    } catch { /* Browsers with storage disabled can still use this page. */ }
    return memory;
  }
  function write(items) {
    memory = items;
    try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* Keep an in-page history. */ }
  }
  const keyOf = item => `${item.id}:${item.variant}`;

  // Read the existing catalog after its own product/variant handlers have run.
  function rememberProduct(id, variant) {
    if (typeof catalogProducts !== 'function') return;
    const base = catalogProducts().find(item => item.id === id);
    if (!base) return;
    const product = productWithVariant(base, variant || undefined);
    const item = { id: base.id, variant: product.variantId || '', name: product.name,
      image: product.image, viewedAt: Date.now() };
    if (!valid(item)) return;
    write([item, ...read().filter(saved => keyOf(saved) !== keyOf(item))].slice(0, maxItems));
  }
  function rememberCurrentProduct() {
    if (!document.querySelector('#productOverview:not([hidden])')) return;
    const params = new URLSearchParams(location.search);
    rememberProduct(params.get('id'), params.get('variant'));
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function button(label, text, action) {
    const node = element('button', 'recent-products-button', text);
    node.type = 'button';
    node.setAttribute('aria-label', label);
    node.addEventListener('click', action);
    return node;
  }

  const section = element('section', 'recent-products');
  section.hidden = true;
  section.setAttribute('aria-labelledby', 'recentProductsTitle');
  const header = element('div', 'recent-products-header');
  const introduction = element('div');
  introduction.append(element('p', 'recent-products-eyebrow', 'PICK UP WHERE YOU LEFT OFF'));
  const title = element('h2', '', 'Recently viewed');
  title.id = 'recentProductsTitle';
  title.tabIndex = -1;
  introduction.append(title, element('p', 'recent-products-note', 'Your latest finds, saved on this browser for 30 days.'));
  const controls = element('div', 'recent-products-controls');
  const list = element('ul', 'recent-products-list');
  list.setAttribute('aria-label', 'Recently viewed products');
  const status = element('p', 'recent-products-status');
  status.setAttribute('role', 'status');
  const clear = button('Clear recently viewed history', 'Clear history', () => {
    write([]);
    render(true);
    title.focus({ preventScroll: true });
  });
  function scroll(direction) {
    list.scrollBy({ left: direction * list.clientWidth * 0.85,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  const previous = button('Previous recently viewed products', '←', () => scroll(-1));
  const next = button('Next recently viewed products', '→', () => scroll(1));
  function updateArrows() {
    previous.disabled = list.scrollLeft < 2;
    next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
  }
  controls.append(clear, previous, next);
  header.append(introduction, controls);
  section.append(header, list, status);
  main.append(section);

  function render(keepVisible = false) {
    const items = read();
    list.replaceChildren();
    section.hidden = !items.length && !keepVisible;
    controls.hidden = !items.length;
    status.textContent = items.length ? '' : 'Your viewing history is clear. Explore the shop to discover something new.';
    items.forEach(saved => {
      // Refresh names/photos from the live catalog whenever it is available.
      let item = saved;
      if (typeof catalogProducts === 'function') {
        const base = catalogProducts().find(product => product.id === saved.id);
        if (!base) return;
        const current = productWithVariant(base, saved.variant || undefined);
        item = { ...saved, name: current.name, image: current.image, variant: current.variantId || '' };
      }
      const card = element('li', 'recent-products-card');
      const link = element('a', 'recent-products-link');
      const url = new URL('pages/product.html', storeRoot);
      url.searchParams.set('id', item.id);
      if (item.variant) url.searchParams.set('variant', item.variant);
      link.href = url.href;
      const image = element('img');
      image.src = new URL(item.image, storeRoot).href;
      image.alt = '';
      image.loading = 'lazy';
      image.width = 240;
      image.height = 170;
      image.addEventListener('error', () => { image.src = new URL('images/placeholders/product-photo-placeholder.svg', storeRoot).href; }, { once: true });
      link.append(image, element('h3', '', item.name), element('span', 'recent-products-return', 'View product →'));
      const remove = button(`Remove ${item.name} from recently viewed`, '×', () => {
        const index = [...list.children].indexOf(card);
        write(read().filter(entry => keyOf(entry) !== keyOf(saved)));
        render(true);
        (list.children[Math.min(index, list.children.length - 1)]?.querySelector('button') || title).focus({ preventScroll: true });
      });
      remove.classList.add('recent-products-remove');
      card.append(link, remove);
      list.append(card);
    });
    requestAnimationFrame(updateArrows);
  }

  rememberCurrentProduct();
  render();
  document.querySelector('#detailVariants')?.addEventListener('change', () => { rememberCurrentProduct(); render(); });
  // Quick View also counts as a visit, without taking over its existing handlers.
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-product-detail]');
    if (!trigger || !document.querySelector('#productDetailsDialog[open]')) return;
    rememberProduct(trigger.dataset.productDetail, document.querySelector('#quickViewVariant')?.value);
    render();
  });
  document.addEventListener('change', event => {
    if (event.target.id !== 'quickViewVariant') return;
    rememberProduct(event.target.dataset.productVariant, event.target.value);
    render();
  });
  list.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows, { passive: true });
  window.addEventListener('pageshow', () => render());
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) render(); });
})();
