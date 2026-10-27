// Original store guides share one index with the site-wide search.
const storeArticles = [
  { id: 'choose-your-laptop', category: 'Laptops', title: 'A laptop that fits your day', image: 'images/showcase/real-laptop-workspace.jpg', summary: 'Balance portability, performance and the connections you actually use.', query: 'laptop', sections: [
    ['Start with your everyday work', 'List the applications you use most. Studying, video calls and documents have different demands from video editing or modern games. Choose for that workload before comparing processor names.'],
    ['Look beyond the processor', 'Compare memory, storage, screen size, keyboard layout and ports together. Check whether memory can be upgraded on the exact model; some thin laptops have soldered memory.'],
    ['Make portability practical', 'Consider the laptop and charger together. Battery life depends on brightness, workload and power settings, so treat advertised battery figures as a comparison rather than a promise.'] ] },
  { id: 'plan-a-balanced-pc', category: 'PC building', title: 'Build a balanced PC, one part at a time', image: 'images/showcase/real-desktop-setup.jpg', summary: 'A practical starting point for choosing compatible hardware without overspending.', query: 'desktop', sections: [
    ['Choose the work first', 'Set a budget for the complete setup, including a display and peripherals. Decide whether gaming, study or creative work matters most, then allocate spending around that priority.'],
    ['Check the platform', 'The processor socket, motherboard support list and memory generation must agree. Check the motherboard size against the case and leave space for the graphics card and CPU cooler.'],
    ['Keep the build in balance', 'Power-supply capacity and connectors must suit the selected components. Storage capacity, cooling and usable ports matter alongside raw performance. Use the builder compatibility checks as a starting point and confirm exact manufacturer specifications before buying.'] ] },
  { id: 'ram-upgrade-guide', category: 'Components', title: 'Memory upgrades without the guesswork', image: 'images/showcase/real-pc-components.jpg', summary: 'Understand memory generations, form factors and upgrade slots before ordering RAM.', query: 'memory RAM', sections: [
    ['Identify your current memory', 'Find the exact computer or motherboard model and check its manual. Desktop DIMMs and laptop SO-DIMMs are different physical formats; DDR4 and DDR5 are not interchangeable.'],
    ['Check supported configurations', 'Confirm the maximum supported capacity and number of slots. A matched kit avoids some of the uncertainty of combining separate memory modules, but the board and processor still determine supported settings.'],
    ['Install with care', 'Power down and disconnect the computer before opening it. Follow the service manual, handle modules by their edges and check that the new capacity is recognized after installation.'] ] },
  { id: 'ssd-storage-guide', category: 'Components', title: 'Choose the right SSD for your next upgrade', image: 'images/products/kingston-nv3.png', summary: 'Capacity is only the beginning: compare interface, physical size and slot support.', query: 'SSD storage', sections: [
    ['Match the connection', 'SATA and NVMe drives use different interfaces. An M.2-shaped slot alone does not guarantee NVMe support; read the device or motherboard documentation for the supported interface and length.'],
    ['Plan for your files', 'Estimate space for the operating system, applications, games and projects, then leave room for growth. Compare warranty and endurance information for the exact drive capacity.'],
    ['Back up before changing drives', 'Keep an independent backup before cloning or replacing a drive. Decide whether to migrate your system or perform a fresh installation, and retain the old drive until your files are verified.'] ] },
  { id: 'monitor-desk-guide', category: 'Workspace', title: 'A clearer view of your next workspace', image: 'images/showcase/showcase-monitor.jpg', summary: 'Find the right balance of display size, resolution, refresh rate and desk space.', query: 'monitor', sections: [
    ['Fit the display to the desk', 'Compare panel dimensions, stand depth and viewing distance. If using a monitor arm, check the display weight and mounting pattern rather than assuming every screen fits.'],
    ['Choose for your workload', 'Fast-paced games benefit from smooth motion; text-heavy work and creative projects may put more emphasis on resolution and color requirements. Compare the complete display specification, not a single headline number.'],
    ['Verify the signal path', 'The computer output, cable and monitor input all need to support your chosen resolution and refresh rate. Check included cables and connector versions for the exact model.'] ] },
  { id: 'delivery-checklist', category: 'Shopping', title: 'From checkout to your doorstep', image: 'images/showcase/showcase-keyboard.jpg', summary: 'Prepare your address, review delivery choices and keep your order details close.', query: '', sections: [
    ['Review your delivery details', 'Choose a saved address or add a complete new one. Check the recipient name, phone number, postal code and delivery instructions before confirming an order.'],
    ['Compare the available services', 'Checkout shows the services and fees for your selected destination. Overseas delivery carries an additional charge. Store pickup uses the collection point displayed at checkout; confirm arrangements with support before visiting.'],
    ['Keep your records', 'Your receipt and order reference help you find the transaction again. Open My account for purchase history and tracking. For a delivery problem or return question, contact support with the order reference, never a payment password or OTP.'] ] }
];

function experienceEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}
function articleCard(article) {
  return `<article class="journal-card"><a href="pages/article.html?id=${article.id}"><div class="journal-image"><img src="${article.image}" alt="${experienceEscape(article.title)}" loading="lazy" width="960" height="600"></div><div class="journal-card-copy"><p class="eyebrow">${article.category}</p><h3>${article.title}</h3><p>${article.summary}</p><span class="journal-read">Read story <span aria-hidden="true">&rarr;</span></span></div></a></article>`;
}
function siteSearchEntries() {
  const pages = [
    ['Build Your Own PC', 'Compatible processor motherboard graphics RAM memory storage cooling power supply case', 'pages/build.html'],
    ['Interactive component guide', 'Learn CPU GPU RAM SSD computer parts explained', 'pages/components.html'],
    ['Contact support', 'Help inquiry questions customer service', 'pages/contact.html'],
    ['Track your order', 'Delivery shipping status parcel tracking', 'pages/tracking.html'],
    ['My account', 'Profile address book purchases refunds returns favorites', 'pages/profile.html'],
    ['Cart and checkout', 'Payment GCash Maya voucher promo shipping pickup overseas', 'pages/cart.html'],
    ['Warranty', 'Repairs replacement warranty coverage', 'pages/warranty.html'],
    ['Downloads', 'Manuals resources guides', 'pages/downloads.html'],
    ['Privacy Policy', 'Data privacy account information', 'pages/privacy.html'],
    ['Terms of Use', 'Store terms conditions policies', 'pages/terms.html']
  ];
  return [
    ...catalogProducts().map(product => ({ title: product.name, detail: product.specs || product.brand, kind: 'Products', image: product.image,
      primary: [product.name, product.brand, product.partCategory, computerPartCategories.find(category => category.id === product.partCategory)?.label].join(' '),
      words: [product.name, product.brand, product.specs, product.type, product.use, product.partCategory, computerPartCategories.find(category => category.id === product.partCategory)?.label, JSON.stringify(productVariants[product.id] || {})].join(' '), url: 'pages/product.html?id=' + encodeURIComponent(product.id) })),
    ...storeArticles.map(article => ({ title: article.title, detail: article.summary, kind: 'Articles', image: article.image, words: [article.title, article.summary, article.category, article.sections.flat().join(' ')].join(' '), url: 'pages/article.html?id=' + article.id })),
    ...pages.map(([title, detail, url]) => ({ title, detail, words: title + ' ' + detail, kind: 'Pages', url }))
  ];
}
function searchWebsite(query, kind = 'All') {
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const score = entry => Number(normalize(entry.title).includes(normalize(query))) * 20 + words.filter(word => normalize(entry.primary || entry.title).includes(word)).length * 5;
  return siteSearchEntries().filter(entry => (kind === 'All' || entry.kind === kind) && words.every(word => normalize(entry.words).includes(word)))
    .sort((a, b) => score(b) - score(a));
}
function searchResultsMarkup(entries) {
  return entries.map(entry => `<a class="site-search-result" href="${experienceEscape(entry.url)}">${entry.image ? `<img src="${experienceEscape(entry.image)}" alt="" width="64" height="64">` : '<span class="result-page-icon" aria-hidden="true">&rarr;</span>'}<span><small>${entry.kind}</small><strong>${experienceEscape(entry.title)}</strong><span>${experienceEscape(entry.detail)}</span></span><span aria-hidden="true">&rarr;</span></a>`).join('');
}

function wireSiteExperience() {
  const nav = document.querySelector('.foldable-nav');
  if (!nav) return;
  const searchButton = document.createElement('button');
  searchButton.className = 'site-search-toggle';
  searchButton.type = 'button';
  searchButton.id = 'siteSearchToggle';
  searchButton.title = 'Search the website';
  searchButton.setAttribute('aria-label', 'Search the website');
  searchButton.setAttribute('aria-haspopup', 'dialog');
  searchButton.innerHTML = '<img class="site-search-icon" src="images/icons/search.svg" width="22" height="22" alt="">';
  nav.append(searchButton);
  const dialog = document.createElement('dialog');
  dialog.className = 'site-search-dialog';
  dialog.id = 'siteSearchDialog';
  dialog.setAttribute('aria-label', 'Search Bits and Bytes');
  dialog.innerHTML = `<div class="site-search-inner"><form id="siteSearchForm" action="pages/search.html"><label class="sr-only" for="siteSearchInput">Search products, articles and support</label><div class="site-search-field"><img class="site-search-icon" src="images/icons/search.svg" width="22" height="22" alt=""><input id="siteSearchInput" name="q" type="search" maxlength="150" placeholder="Search products, articles and support" autocomplete="off" required><button type="submit" title="Show all results" aria-label="Show all search results"><span aria-hidden="true">&rarr;</span></button></div><button type="button" id="closeSiteSearch" title="Close search" aria-label="Close search"><img src="images/icons/x.svg" alt="" width="24" height="24"></button></form><p id="siteSearchStatus" role="status">Popular searches</p><div id="siteSearchResults"></div><a id="allSearchResults" hidden>View all results &rarr;</a></div>`;
  document.body.append(dialog);
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('#siteSearchResults');
  const status = dialog.querySelector('#siteSearchStatus');
  const all = dialog.querySelector('#allSearchResults');
  function updateSearch() {
    const query = input.value.trim();
    all.hidden = !query;
    all.href = 'pages/search.html?q=' + encodeURIComponent(query);
    if (!query) {
      status.textContent = 'Popular searches';
      results.innerHTML = '<div class="search-suggestions">' + ['Gaming laptop', 'RAM', 'SSD', 'Microsoft', 'Delivery', 'Build Your Own PC'].map(word => `<button type="button">${word}</button>`).join('') + '</div>';
      results.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { input.value = button.textContent; updateSearch(); }));
      return;
    }
    const matches = searchWebsite(query);
    status.textContent = matches.length ? `${matches.length} results for "${query}"` : 'No matches. Try a product name, component or support topic.';
    results.innerHTML = searchResultsMarkup(matches.slice(0, 6));
  }
  searchButton.addEventListener('click', () => {
    document.querySelectorAll('.nav-group[open]').forEach(group => { group.open = false; });
    dialog.showModal();
    document.body.classList.add('search-is-open');
    updateSearch();
    input.focus();
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('search-is-open'); searchButton.focus(); });
  dialog.querySelector('#closeSiteSearch').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  input.addEventListener('input', updateSearch);

  const main = document.querySelector('main');
  const carousel = document.querySelector('#promoCarousel');
  document.body.classList.add('store-gradient');
  let scheduled = false;
  const updateBackdrop = () => {
    const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.body.style.setProperty('--journey', String(progress));
    scheduled = false;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateBackdrop); } }, { passive: true });
  updateBackdrop();
  if (document.body.classList.contains('home-page')) {
    const landing = document.querySelector('#landingHero');
    if (landing) {
      let previous = landing;
      for (const section of [document.querySelector('.brand-strip'), document.querySelector('.landing-collections'), document.querySelector('.landing-featured'), carousel]) {
        if (section) { previous.after(section); previous = section; }
      }
    } else if (carousel) main.prepend(carousel);
    const journal = document.createElement('section');
    journal.className = 'journal-section';
    journal.setAttribute('aria-labelledby', 'journalHeading');
    journal.innerHTML = `<div class="journal-heading"><div><p class="eyebrow">The Bits &amp; Bytes journal</p><h2 id="journalHeading">Ideas for your next upgrade</h2></div><a class="text-link" href="pages/articles.html">All articles &rarr;</a></div><div class="journal-highlights">${storeArticles.slice(0, 5).map(articleCard).join('')}</div>`;
    document.querySelector('.home-video')?.before(journal);
    const wordmark = document.createElement('div');
    wordmark.className = 'ambient-wordmark';
    wordmark.setAttribute('aria-hidden', 'true');
    wordmark.textContent = 'BITS & BYTES';
    document.body.prepend(wordmark);
  }

  const articleGrid = document.querySelector('#articleGrid');
  if (articleGrid) {
    const filters = document.querySelector('#articleFilters');
    ['All', ...new Set(storeArticles.map(article => article.category))].forEach(category => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = category;
      button.setAttribute('aria-pressed', String(category === 'All'));
      filters.append(button);
      button.addEventListener('click', () => {
        filters.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
        articleGrid.innerHTML = storeArticles.filter(article => category === 'All' || article.category === category).map(articleCard).join('');
      });
    });
    articleGrid.innerHTML = storeArticles.map(articleCard).join('');
  }
  const articleView = document.querySelector('#articleView');
  if (articleView) {
    const article = storeArticles.find(item => item.id === new URLSearchParams(location.search).get('id'));
    if (!article) articleView.innerHTML = '<h1>Article not found</h1><a class="text-link" href="pages/articles.html">Browse all articles &rarr;</a>';
    else {
      document.title = article.title + ' | Bits and Bytes Journal';
      articleView.innerHTML = `<header class="article-heading"><a class="text-link" href="pages/articles.html">&larr; The journal</a><p class="eyebrow">${article.category} / Buying guide</p><h1>${article.title}</h1><p>${article.summary}</p><span>By Bits &amp; Bytes editorial &middot; ${article.sections.length + 1} min read</span></header><img class="article-cover" src="${article.image}" alt="${article.title}" width="1440" height="850"><div class="article-layout"><nav class="article-contents" aria-label="In this article"><h2>In this article</h2>${article.sections.map(([title], index) => `<a href="pages/article.html?id=${article.id}#section-${index}">${title}</a>`).join('')}</nav><div class="article-body">${article.sections.map(([title, copy], index) => `<section id="section-${index}"><span class="eyebrow">0${index + 1}</span><h2>${title}</h2><p>${copy}</p></section>`).join('')}<a class="button primary" href="${article.id === 'plan-a-balanced-pc' ? 'pages/build.html' : article.id === 'delivery-checklist' ? 'pages/contact.html' : 'pages/products.html?q=' + encodeURIComponent(article.query)}">${article.id === 'delivery-checklist' ? 'Contact support' : article.id === 'plan-a-balanced-pc' ? 'Start your build' : 'Explore the collection'} &rarr;</a></div></div><section class="related-stories"><h2>Keep exploring</h2><div class="journal-grid">${storeArticles.filter(item => item.id !== article.id).slice(0, 3).map(articleCard).join('')}</div></section>`;
    }
  }
  const searchPage = document.querySelector('#searchPageResults');
  if (searchPage) {
    const query = new URLSearchParams(location.search).get('q')?.slice(0, 150) || '';
    document.querySelector('#resultsQuery').value = query;
    const render = kind => {
      const entries = searchWebsite(query, kind);
      document.querySelector('#resultsCount').textContent = query ? `${entries.length} results for "${query}"` : 'Search for a product, article or support topic.';
      searchPage.innerHTML = entries.length ? searchResultsMarkup(entries) : '<p class="search-empty">No results yet. Try fewer words, a brand name, RAM, storage or delivery.</p>';
    };
    document.querySelectorAll('[data-search-kind]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-search-kind]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      render(button.dataset.searchKind);
    }));
    render('All');
  }
}
