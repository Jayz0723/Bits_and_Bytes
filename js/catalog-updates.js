// Catalog expansion: exact model media, Philippine retail references and guide content.
// Keep source data separate from the storefront's rendering and checkout behavior.
const catalogExpansionFolder = 'images/products/expansion/';
const catalogPriceCheckedOn = '2026-10-31';

function expansionPhoto(file, label, shortLabel = 'Main', note = '') {
  return { src: catalogExpansionFolder + file, label, shortLabel, note };
}

const samsungMonitorModels = [
  {
    size: 24, id: 'monitor-samsung-g3-24', sku: 'LS24DG302EEXXP', price: 8395,
    retailSlug: 'samsung-odyssey-g3-g30d-ls24dg302eexxp-24-fhd-1920x1080-180hz-1msmprt-va-gaming-monitor'
  },
  {
    size: 27, id: 'monitor-samsung-g3-27', sku: 'LS27DG302EEXXP', price: 10895,
    retailSlug: 'samsung-odyssey-g3-ls27dg302eexxp-27-fhd-180hz-1ms-mprt-freesync-va-gaming-monitor'
  }
];

const catalogPriceReferences = {};
for (const model of samsungMonitorModels) {
  const name = `Samsung Odyssey G3 G30D ${model.size}-inch`;
  const source = `https://www.samsung.com/ph/monitors/gaming/odyssey-g3-g30d-${model.size}-inch-180hz-freesync-${model.sku.toLowerCase()}/`;
  const image = `samsung-g3-${model.size}-view-0.png`;
  products.push({
    id: model.id, name, brand: 'Samsung', type: 'Monitor', use: 'Gaming',
    price: model.price, stock: 8, image: catalogExpansionFolder + image,
    specs: `${model.sku}, ${model.size}-inch VA, 1920 × 1080, 180Hz, 1ms MPRT, FreeSync, HDMI, DisplayPort, headphone output, adjustable stand`,
    gallery: [
      expansionPhoto(image, name + ' front view'),
      expansionPhoto(`samsung-g3-${model.size}-view-8.png`, name + ' rear connections', 'Ports', 'Rear connector bay: power, headphone output, HDMI and DisplayPort. Use Open original for a larger view.'),
      expansionPhoto(`samsung-g3-${model.size}-view-2.png`, name + ' rear stand', 'Rear')
    ]
  });
  productDescriptions[model.id] = {
    description: `The ${name} (${model.sku}) combines a Full HD VA panel with a 180Hz refresh rate for a compact gaming setup. Its height-adjustable stand supports a more comfortable viewing position, while HDMI and DisplayPort let you connect compatible PCs and consoles. The 1ms figure is MPRT, rather than a guarantee of pixel response in every mode.`,
    source
  };
  catalogPriceReferences[model.id] = {
    price: model.price, retailer: 'DataBlitz',
    url: 'https://ecommerce.datablitz.com.ph/products/' + model.retailSlug
  };
}

const expansionGraphicsCards = [
  {
    id: 'part-gpu-gtx-1650', name: 'MSI GeForce GTX 1650 VENTUS XS 4G OC',
    file: 'gtx1650', price: 10490, tier: 'Legacy / entry-level',
    specs: '4GB GDDR5, 128-bit, dual-fan cooler, DisplayPort, HDMI, DVI-D, 75W board power',
    description: 'A compact, entry-level Turing graphics card for older games, lighter esports titles and additional display connections. This VENTUS XS 4G OC model uses 4GB of GDDR5 memory and a dual-fan cooler. Unlike GeForce RTX models, it does not include dedicated RT or Tensor cores. Check the display connectors and application requirements before choosing this legacy option.',
    source: 'https://www.msi.com/Graphics-Card/GeForce-GTX-1650-VENTUS-XS-4G-OC/Specification',
    retailer: 'DWIN', retailUrl: 'https://dwinstore.com/product-category/computer-parts/graphics-card/'
  },
  {
    id: 'part-gpu-rtx-3050', name: 'MSI GeForce RTX 3050 VENTUS 2X 6G OC',
    file: 'rtx3050', price: 19000, tier: 'Entry-level RTX',
    specs: '6GB GDDR6, 96-bit, dual-fan cooler, DisplayPort 1.4a, 2 × HDMI, 70W board power',
    description: 'This 6GB RTX 3050 is an entry point to NVIDIA ray tracing and DLSS in supported games. Its compact dual-fan design and 70W board power suit modest desktop upgrades. The 6GB version is a different specification from the 8GB RTX 3050, so compare the exact model rather than the family name alone. It provides one DisplayPort and two HDMI outputs.',
    source: 'https://www.msi.com/Graphics-Card/GeForce-RTX-3050-VENTUS-2X-6G-OC/Specification',
    retailer: 'Bermor Techzone', retailUrl: 'https://bermorzone.com.ph/shop/video-cards/nvidia-video-cards/msi-geforce-rtx-3050-ventus-2x-6g-oc-gddr6-video-card/'
  },
  {
    id: 'part-gpu-rtx-5080', name: 'MSI GeForce RTX 5080 16G VENTUS 3X OC',
    file: 'rtx5080', price: 147000, tier: 'High-end RTX',
    specs: '16GB GDDR7, 256-bit, triple-fan cooler, 3 × DisplayPort, HDMI, Blackwell architecture',
    description: 'The RTX 5080 VENTUS 3X OC pairs NVIDIA Blackwell architecture with 16GB of GDDR7 memory for demanding gaming and GPU-accelerated creative workloads. Its triple-fan cooler needs substantial case space. Check the exact card dimensions, the recommended power supply and the required power connector before ordering. DLSS features require supported software; performance depends on resolution and settings.',
    source: 'https://www.msi.com/Graphics-Card/GeForce-RTX-5080-16G-VENTUS-3X-OC/Specification',
    retailer: 'PC Express', retailUrl: 'https://pcx.com.ph/products/msi-geforce-rtx-5080-ventus-3x-oc-16gb-g5080-16v3c-gddr7-256-bit-graphics-card'
  }
];

for (const card of expansionGraphicsCards) {
  products.push({
    id: card.id, name: card.name, brand: 'MSI', type: 'Computer Part',
    partCategory: 'gpu', use: 'Build', price: card.price, stock: 5,
    image: catalogExpansionFolder + card.file + '-main.webp', specs: card.specs,
    gallery: [
      expansionPhoto(card.file + '-main.webp', card.name + ' and retail packaging'),
      expansionPhoto(card.file + '-ports.webp', card.name + ' display connectors', 'Ports')
    ]
  });
  productDescriptions[card.id] = { description: card.description, source: card.source };
  catalogPriceReferences[card.id] = { price: card.price, retailer: card.retailer, url: card.retailUrl };
}

// References are dated snapshots, not a live pricing feed. Never substitute a
// similarly named motherboard, different RAM capacity, or another laptop SKU.
const checkedRetailMatches = [
  ['accessory-msi-gh20', 1195, 'msi-immerse-gh20-gaming-headset'],
  ['part-msi-a650bn', 2950, 'msi-mag-a650bn-650w-80-bronze-non-modular-power-supply'],
  ['monitor-msi-274qrf-qd-e2', 18295, 'msi-mag-274qrf-qd-e2-27-wqhd-180hz-1ms-gtg-rapid-ips-adaptive-sync-gaming-monitor'],
  ['accessory-logitech-g502', 1995, 'logitech-g502-hero-high-performance-gaming-mouse-1'],
  ['part-msi-b760-gaming-plus', 10795, 'msi-b760-gaming-plus-wifi-ddr5-intel-motherboard'],
  ['accessory-stream-kit', 7650, 'elgato-facecam-mk-2-1080p-webcam-10wac9901'],
  ['part-cpu-ryzen-7-7700x', 19495, 'amd-ryzen-7-7700x-processor'],
  ['part-samsung-990-pro-1tb', 19450, 'samsung-990-pro-1tb-pcie-4-0-nvme-m-2-ssd-mz-v9p1t0bw']
];
for (const [id, price, slug] of checkedRetailMatches) {
  catalogPriceReferences[id] = {
    price, retailer: 'DataBlitz', url: 'https://ecommerce.datablitz.com.ph/products/' + slug
  };
}

function applyCheckedCatalogPrices(records) {
  for (const product of records) {
    const reference = catalogPriceReferences[product.id];
    if (!reference) continue;
    product.price = reference.price;
    delete product.originalPrice;
    const variants = productVariants[product.id];
    if (variants?.kind === 'color') {
      // Only identical hardware finishes share a price; configuration SKUs do not.
      for (const variant of variants.options) {
        variant.price = reference.price;
        delete variant.originalPrice;
      }
    }
  }
}
applyCheckedCatalogPrices(products);

// Genuine connector photos are useful even when the main image is a cutout.
function appendConnectorView(record, src, label, note = '') {
  record.gallery ||= [{ src: record.image, label: record.name + ' main view', shortLabel: 'Main' }];
  if (!record.gallery.some(view => view.src === src)) {
    record.gallery.push({ src, label, shortLabel: 'Ports', note });
  }
}
appendConnectorView(products.find(item => item.id === 'monitor-msi-g244f-e2'),
  catalogExpansionFolder + 'msi-g244f-e2-ports.png', 'MSI G244F E2 connector layout');
appendConnectorView(products.find(item => item.id === 'monitor-msi-274qrf-qd-e2'),
  catalogExpansionFolder + 'msi-274qrf-ports.png', 'MSI MAG 274QRF QD E2 rear connector layout');
for (const [id, file, name] of [
  ['24inch', 'gallery-asus-vg249q1a-ports.png', 'ASUS VG249Q1A'],
  ['27inch', 'asus-vg27aq-rear-ports.jpg', 'ASUS VG27AQ'],
  ['32inch', 'gallery-asus-pa329cv-ports.png', 'ASUS PA329CV']
]) {
  appendConnectorView(productVariants['monitor-27'].options.find(option => option.id === id),
    'images/products/' + file, name + ' actual connector photograph');
}

const productVideoPreviews = {
  'lap-microsoft-studio-2': {
    src: 'videos/surface-laptop-studio-2.mp4',
    label: 'Surface Laptop Studio 2 product film'
  }
};

Object.assign(componentInfo, {
  radiator: {
    title: 'Liquid-cooling radiator',
    text: 'The top-mounted radiator transfers heat from the coolant to the air. Its fans push air through closely spaced fins. Radiator length alone does not guarantee that a cooler fits a case.',
    tip: 'Check radiator length, thickness, fan clearance and the case mounting positions.'
  },
  tubes: {
    title: 'Coolant tubes',
    text: 'These sealed hoses connect the CPU pump block to the radiator. They carry coolant around the cooling loop and need enough room to bend gently without touching fan blades.',
    tip: 'Do not kink, disconnect or cut the hoses on a sealed all-in-one cooler.'
  },
  gpupower: {
    title: 'Graphics card power cable',
    text: 'This cable supplies additional power to the graphics card. Connector type and required cable count depend on the exact GPU; some low-power cards use only the motherboard slot.',
    tip: 'Use the PSU manufacturer’s compatible cables, fully insert connectors and avoid sharp bends.'
  },
  boardpower: {
    title: '24-pin motherboard power',
    text: 'The main motherboard power cable connects along the board edge beside the memory slots. The processor also needs its separate EPS CPU power connection.',
    tip: 'Switch off and unplug the PC before checking connections. PCIe and EPS cables are not interchangeable.'
  }
});

function renderCatalogPriceReference(product) {
  const description = document.querySelector('#detailProductDescriptionSource');
  if (!description) return;
  let note = document.querySelector('#catalogPriceReference');
  if (!note) {
    note = document.createElement('p');
    note.id = 'catalogPriceReference';
    note.className = 'catalog-price-reference';
    description.after(note);
  }
  const reference = catalogPriceReferences[product.baseProductId || product.id];
  if (!reference) {
    note.textContent = 'Store price. Exact regional configuration and current availability should be confirmed before payment.';
    return;
  }
  note.replaceChildren(document.createTextNode(`PH retail reference · ${catalogPriceCheckedOn} · `));
  const link = document.createElement('a');
  link.href = reference.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = reference.retailer;
  note.append(link, document.createTextNode('. Prices and stock may change.'));
}

function renderCatalogBrands() {
  const strip = document.querySelector('.brand-strip');
  if (!strip) return;
  const originalLinks = new Map([...strip.querySelectorAll('.car-slide:first-child a')]
    .map(link => [link.querySelector('img')?.alt, link]));
  const websites = {
    Samsung: 'https://www.samsung.com/ph/', Acer: 'https://www.acer.com/ph-en',
    Logitech: 'https://www.logitech.com/', Keychron: 'https://www.keychron.com/',
    Elgato: 'https://www.elgato.com/', 'Bits and Bytes': 'pages/about.html',
    'Bits and Bytes Select': 'pages/about.html'
  };
  const brands = [...new Set(catalogProducts().map(product => product.brand))].sort();
  function brandLink(brand, className, duplicate = false) {
    const existing = originalLinks.get(brand);
    const link = document.createElement('a');
    link.className = className;
    link.dataset.catalogBrand = brand;
    link.href = existing?.getAttribute('href') || websites[brand] || 'pages/products.html?brand=' + encodeURIComponent(brand);
    link.setAttribute('aria-label', brand);
    if (/^https:/.test(link.getAttribute('href'))) {
      link.target = '_blank'; link.rel = 'noopener noreferrer';
    }
    if (duplicate) link.tabIndex = -1;
    if (existing?.querySelector('img')) {
      link.append(existing.querySelector('img').cloneNode());
    } else {
      const wordmark = document.createElement('span');
      wordmark.className = 'catalog-brand-wordmark';
      wordmark.textContent = brand;
      link.append(wordmark);
    }
    return link;
  }
  strip.querySelectorAll('.car-slide').forEach((slide, index) => {
    slide.replaceChildren(...brands.map(brand => brandLink(brand, 'card partner-logo', index > 0)));
  });
  document.querySelector('#partnersDialog .partner-grid')?.replaceChildren(
    ...brands.map(brand => brandLink(brand, 'partner-card'))
  );
}

function renderExpandedComponentGuide() {
  const map = document.querySelector('#pcHardwareMap');
  if (!map) return;
  const shortcuts = map.closest('.device-map-card').querySelector('.part-legend-button').parentElement;
  const regions = [
    ['radiator', '50,105,950,210', 'Top radiator'],
    ['tubes', '740,360,900,435', 'Coolant tubes'],
    ['gpupower', '470,690,550,1005', 'GPU power cable'],
    ['boardpower', '745,445,865,550', '24-pin power']
  ];
  // Specific regions precede the wider motherboard, GPU and case regions.
  for (const [part, coords, label] of regions) {
    const area = document.createElement('area');
    area.shape = 'rect'; area.coords = coords;
    area.dataset.originalCoords = coords;
    area.dataset.part = part; area.dataset.device = 'Desktop PC';
    area.href = 'pages/components.html#partInfo'; area.alt = label;
    map.prepend(area);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'part-legend-button';
    button.dataset.part = part; button.dataset.device = 'Desktop PC';
    button.append(document.createElement('span'), document.createTextNode(label));
    shortcuts.append(button);
  }

  const guide = document.createElement('section');
  guide.className = 'gpu-range-guide section';
  guide.setAttribute('aria-labelledby', 'gpuRangeTitle');
  guide.innerHTML = `<p class="eyebrow">Graphics, at every level</p>
    <h2 id="gpuRangeTitle">Find your place from GTX to RTX</h2>
    <p>Compare the exact card, memory and power requirements. These are use-case starting points; game performance varies by settings and resolution.</p>
    <div class="gpu-range-grid"></div>`;
  const choices = [
    ['part-gpu-gtx-1650', 'Legacy / entry-level', 'Older games and lighter esports. No dedicated RT or Tensor cores.'],
    ['part-gpu-rtx-3050', 'Entry-level RTX', 'An introduction to DLSS and ray tracing in supported games.'],
    ['part-gpu-rtx-4060', 'Mid-range', 'A compact 8GB option for mainstream Full HD gaming.'],
    ['part-msi-4070-super', 'Performance', '12GB of memory for more demanding games and creative workloads.'],
    ['part-gpu-rtx-5080', 'High-end', '16GB GDDR7 for demanding gaming and GPU-accelerated projects.']
  ];
  const catalog = catalogProducts();
  for (const [id, tier, copy] of choices) {
    const product = catalog.find(item => item.id === id);
    if (!product) continue;
    const card = document.createElement('a');
    card.className = 'gpu-range-card';
    card.href = 'pages/product.html?id=' + id;
    const photo = document.createElement('img');
    photo.src = product.image; photo.alt = product.name; photo.loading = 'lazy';
    const category = document.createElement('small'); category.textContent = tier;
    const title = document.createElement('h3'); title.textContent = product.name;
    const body = document.createElement('p'); body.textContent = copy;
    const price = document.createElement('strong'); price.textContent = money(product.price);
    card.append(photo, category, title, body, price);
    guide.querySelector('.gpu-range-grid').append(card);
  }
  map.closest('.interactive-layout').before(guide);
}
