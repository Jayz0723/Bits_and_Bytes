// Shared helper functions used by all pages.
function getCart() {
  const savedCart = JSON.parse(localStorage.getItem("bitsAndBytesCart")) || [];

  return savedCart.map((item) => {
    const currentProduct = typeof catalogProducts === "function"
      ? catalogProducts().find((product) => product.id === (item.baseProductId || item.id))
      : undefined;

    if (!currentProduct) return item;
    if (item.isConfigured) return { ...item, image: productWithVariant(currentProduct, item.variantId).image };
    return { ...item, ...productWithVariant(currentProduct, item.variantId), quantity: item.quantity };
  });
}

function saveCart(cart) {
  localStorage.setItem("bitsAndBytesCart", JSON.stringify(cart));
  updateCartCount();
}

function getWishlist() {
  return JSON.parse(localStorage.getItem("bitsAndBytesWishlist")) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem("bitsAndBytesWishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

function currencyPreference() {
  return localStorage.getItem("bitsAndBytesCurrency") || "PHP";
}

function money(amount) {
  const currency = currencyPreference();
  const convertedAmount = currency === "USD" ? amount / 57 : amount;

  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-PH", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(convertedAmount);
}

function productPriceMarkup(product, options = {}) {
  const { showBadge = true } = options;
  const hasDiscount = Number(product.originalPrice) > Number(product.price);

  if (!hasDiscount) return `<strong class="current-price">${money(product.price)}</strong>`;

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return `
    <span class="sale-price-group">
      <del>${money(product.originalPrice)}</del>
      <strong class="current-price">${money(product.price)}</strong>
      ${showBadge ? `<span class="discount-badge">Save ${discount}%</span>` : ""}
    </span>
  `;
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach((item) => {
    item.textContent = count;
    item.closest("a")?.setAttribute("aria-label", `Cart, ${count} item${count === 1 ? "" : "s"}`);
  });
}

function updateWishlistCount() {
  const count = getWishlist().length;
  document.querySelectorAll("#wishlistCount").forEach((item) => {
    item.textContent = count;
  });
}

function showkey ( e ) {
  // Do not interrupt customers while they are typing in a form.
  if (e.target.closest("input, textarea, select, [contenteditable]")) return;
  if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.toLowerCase() === "y")
  {
    alert ( 'Y pressed. Need help choosing a PC? Try the Build Your Own PC page.')
  }}
document.onkeydown = showkey 

// Configured versions of the same physical model share its available stock.
function sameStockItem(first, second) {
  return (first.baseProductId || first.id) === (second.baseProductId || second.id)
    && (first.variantId || "") === (second.variantId || "");
}

function wholeQuantity(value, maximum) {
  const number = Number(value);
  return Math.max(0, Math.min(maximum, Math.max(1, Math.floor(number) || 1)));
}

function addToCart(product, quantity = 1) {
  if (product.variants && !product.variantId && !product.isConfigured) product = productWithVariant(product);
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  quantity = wholeQuantity(quantity, product.stock === undefined ? 999 : product.stock);
  const currentQuantity = cart.filter((item) => sameStockItem(item, product)).reduce((sum, item) => sum + item.quantity, 0);
  const availableToAdd = product.stock === undefined ? quantity : Math.min(quantity, product.stock - currentQuantity);

  if (availableToAdd <= 0) {
    alert(`${product.name} has reached its available stock limit.`);
    return;
  }

  if (existing) {
    existing.quantity += availableToAdd;
  } else {
    cart.push({ ...product, quantity: availableToAdd });
  }

  saveCart(cart);
  const stockNote = availableToAdd < quantity ? ` Only ${availableToAdd} item(s) were available.` : "";
  alert(`${product.name} was added to the cart.${stockNote}`);
}

const computerPartProducts = [
  {
    id: "part-ssd-kingston-kc600", name: "Kingston KC600 SATA SSD", partCategory: "storage",
    type: "Computer Part", use: "Build", brand: "Kingston",
    price: 2495, stock: 18, image: "images/products/kingston-kc600.png",
    specs: "512GB, 2.5-inch SATA III SSD for desktop and compatible laptop upgrades"
  },
  {
    id: "part-cpu-i5-14600k",
    partCategory: "cpu",
    name: "Intel Core i5-14600K",
    type: "Computer Part",
    use: "Build",
    brand: "Intel",
    price: 18995,
    originalPrice: 20495,
    stock: 10,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: "14-core desktop processor for gaming and multitasking"
  },
  {
    id: "part-gpu-rtx-4060",
    partCategory: "gpu",
    name: "NVIDIA RTX 4060 8GB",
    type: "Computer Part",
    use: "Build",
    brand: "NVIDIA",
    price: 19995,
    originalPrice: 21995,
    stock: 8,
    image: "images/products/legacy/pc-pulse-gaming.jpg",
    specs: "RGB-ready gaming graphics with 8GB of video memory"
  },
  {
    id: "part-ram-32gb-ddr5",
    partCategory: "ram",
    name: "Kingston FURY Beast DDR5 Memory",
    type: "Computer Part",
    use: "Build",
    brand: "Kingston",
    price: 6995,
    stock: 18,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: "Fast dual-channel memory for gaming and creator workloads"
  },
  {
    id: "part-ssd-1tb-nvme",
    partCategory: "storage",
    name: "Kingston NV3 NVMe SSD",
    type: "Computer Part",
    use: "Build",
    brand: "Bits and Bytes Select",
    price: 3495,
    stock: 22,
    image: "images/products/legacy/pc-renderflow-creator.jpg",
    specs: "High-speed storage for games, projects, and applications"
  },
  {
    id: "part-cpu-ryzen-7-7700x",
    partCategory: "cpu",
    name: "AMD Ryzen 7 7700X",
    type: "Computer Part",
    use: "Build",
    brand: "AMD",
    price: 20995,
    stock: 9,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: "8-core AM5 processor for high-refresh gaming and creator tasks"
  },
  {
    id: "part-board-gigabyte-b650",
    partCategory: "motherboard",
    name: "Gigabyte B650 AORUS Elite AX",
    type: "Computer Part",
    use: "Build",
    brand: "Gigabyte",
    price: 13995,
    stock: 6,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: "AM5 ATX motherboard with DDR5 support, Wi-Fi, and RGB headers"
  },
  {
    id: "part-cooler-master-240",
    partCategory: "cooling",
    name: "Cooler Master ML240L RGB",
    type: "Computer Part",
    use: "Build",
    brand: "Cooler Master",
    price: 5295,
    originalPrice: 5995,
    stock: 12,
    image: "images/products/legacy/pc-pulse-gaming.jpg",
    specs: "240mm liquid cooler with RGB lighting"
  },
  {
    id: "part-corsair-psu-850",
    partCategory: "psu",
    name: "Corsair RM850e 850W Gold PSU",
    type: "Computer Part",
    use: "Build",
    brand: "Corsair",
    price: 8195,
    stock: 7,
    image: "images/products/legacy/pc-renderflow-creator.jpg",
    specs: "Fully modular 80 Plus Gold power supply for gaming and creator PCs"
  },
  {
    id: "part-kingston-fury-32",
    partCategory: "ram",
    name: "Kingston FURY Beast 32GB DDR5",
    type: "Computer Part",
    use: "Build",
    brand: "Kingston",
    price: 7295,
    stock: 16,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: "32GB DDR5 desktop memory kit for smooth multitasking and gaming"
  }
];

function catalogProducts() {
  return [...products, ...computerPartProducts].map((product) => {
    const media = productMedia[product.id] || {};
    const variants = productVariants[product.id];
    const defaultVariant = variants?.options.find((option) => option.id === variants.defaultId);
    return {
      ...product, ...media, ...defaultVariant, id: product.id, variants,
      image: defaultVariant?.image || media.image || product.image,
      photoCapacity: defaultVariant?.photoCapacity || product.photoCapacity,
      moduleLayout: defaultVariant?.moduleLayout || product.moduleLayout
    };
  });
}

// Stable IDs keep different capacities separate in the saved cart.
function productWithVariant(product, variantId) {
  if (!product.variants) return product;
  const variant = product.variants.options.find((option) => option.id === (variantId || product.variants.defaultId));
  if (!variant) return productWithVariant(product, product.variants.defaultId);
  const familyName = product.name.replace(/\b(?:8|16|32|64|128)GB\s*/i, "").trim();
  return {
    ...product, ...variant,
    gallery: variant.gallery || (variant.image && variant.image !== product.image ? undefined : product.gallery),
    id: `${product.id}::${variant.id}`, baseProductId: product.id, variantId: variant.id,
    name: variant.name || `${familyName} - ${variant.label}`, originalPrice: undefined
  };
}

// Close-ups use the selected item's actual photo, never an invented angle or connector.
function productGallery(product) {
  const views = product.gallery?.length ? product.gallery.map((view) => ({ ...view })) : [
    { src: product.image, label: product.name + " main product photo", shortLabel: "Main" }
  ];
  if (!views.some((view) => view.shortLabel === "Close-up")) views.push({
    src: product.image, label: product.name + " product close-up", shortLabel: "Close-up", zoom: 1.45
  });
  return views;
}

function productVariantMarkup(product, variantId, id = "") {
  if (!product.variants) return "";
  const selectedId = variantId || product.variants.defaultId;
  return `<label class="product-variant-picker">${product.variants.label}
    <select ${id ? `id="${id}"` : ""} data-product-variant="${product.id}" aria-label="${product.variants.label} for ${product.name}">
      ${product.variants.options.map((variant) => `<option value="${variant.id}" ${variant.id === selectedId ? "selected" : ""}>${variant.label} - ${money(variant.price)}</option>`).join("")}
    </select>
  </label>`;
}

function productPhotoLabel(product) {
  return product.photoCapacity ? `<span class="product-photo-capacity">${product.photoCapacity}${product.moduleLayout ? `<small>${product.moduleLayout}</small>` : ""}</span>` : "";
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const existingIndex = wishlist.indexOf(productId);

  if (existingIndex >= 0) {
    wishlist.splice(existingIndex, 1);
  } else {
    wishlist.push(productId);
  }

  saveWishlist(wishlist);
}

function wireQuickOrder() {
  const form = document.querySelector("#quickOrderForm");
  if (!form) return;

  const productSelect = document.querySelector("#quickOrderProduct");
  const quantityInput = document.querySelector("#quickOrderQty");
  const image = document.querySelector("#quickOrderImage");
  const name = document.querySelector("#quickOrderName");
  const specs = document.querySelector("#quickOrderSpecs");
  const total = document.querySelector("#quickOrderTotal");
  const stock = document.querySelector("#quickOrderStock");

  productSelect.innerHTML = catalogProducts().map((product) => `
    <option value="${product.id}">${product.name} - ${money(product.price)}</option>
  `).join("");

  function updateQuickOrder() {
    const product = catalogProducts().find((item) => item.id === productSelect.value);
    const quantity = wholeQuantity(quantityInput.value, product.stock);
    quantityInput.value = quantity;
    quantityInput.max = product.stock;
    image.src = product.image;
    image.alt = product.name;
    name.textContent = product.name;
    specs.textContent = `${product.brand} - ${product.specs}`;
    document.getElementById("quickOrderPrice").value = product.price;
    total.textContent = money(Number(multiply(quantityInput, document.getElementById("quickOrderPrice"))));
    stock.textContent = `${product.stock} in stock`;
  }

  productSelect.addEventListener("change", updateQuickOrder);
  quantityInput.addEventListener("input", updateQuickOrder);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const product = catalogProducts().find((item) => item.id === productSelect.value);
    const quantity = wholeQuantity(quantityInput.value, product.stock);
    addToCart(product, quantity);
  });

  updateQuickOrder();
}

function toggle() {
  const pc = document.getElementById("pc");
  if (!pc) return;

  pc.hidden = !pc.hidden;
  const button = document.getElementById("laptopReveal");
  if (button) {
    button.setAttribute("aria-expanded", String(!pc.hidden));
    button.textContent = pc.hidden ? "Show laptop" : "Hide laptop";
  }
}


function multiply(q, p) {
    let result = parseFloat(q.value) * parseFloat(p.value);

    if (isNaN(result) || result < 1)
        return '';
    else
        return result.toFixed(2);
}

function productCard(baseProduct, variantId) {
  // Array.map also supplies an index; only strings are variant IDs.
  const product = productWithVariant(baseProduct, typeof variantId === "string" ? variantId : undefined);
  const isWishlisted = getWishlist().includes(baseProduct.id);
  const detailUrl = `pages/product.html?id=${encodeURIComponent(baseProduct.id)}${product.variantId ? `&variant=${encodeURIComponent(product.variantId)}` : ""}`;

  return `
    <article class="product-card" data-product-id="${baseProduct.id}">
      <button class="wishlist-button${isWishlisted ? " active" : ""}" data-wishlist-product="${baseProduct.id}" type="button" aria-label="${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist" aria-pressed="${isWishlisted}">
        <span aria-hidden="true">&#9825;</span>
      </button>
      <a class="product-image-button" href="${detailUrl}" aria-label="View details for ${product.name}">
        <img src="${product.image}" alt="${product.name}">
        ${productPhotoLabel(product)}
      </a>
      <div class="product-card-body">
        ${product.photoNote ? `<small class="product-photo-note">${product.photoNote}</small>` : ""}
        <div class="tag-row">
          <span>${computerPartCategories.find((category) => category.id === product.partCategory)?.label || product.type}</span>
          <span>${product.use}</span>
          <span class="stock-badge">${product.stock} in stock</span>
        </div>
        <h3><a class="product-name-button" href="${detailUrl}">${product.name}</a></h3>
        <p>${product.brand} - ${product.specs}</p>
        ${productVariantMarkup(baseProduct, product.variantId)}
        <div class="price-row">
          ${productPriceMarkup(product)}
          <div class="product-card-actions">
            <button class="product-detail-button" data-product-detail="${baseProduct.id}" type="button">Quick View</button>
            <a class="product-detail-button" href="${detailUrl}">Full Details</a>
            <button class="button small" data-add-product="${baseProduct.id}" type="button" ${product.stock <= 0 ? "disabled" : ""}>${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function wireProductButtons(root = document) {
  root.querySelectorAll(".product-card [data-product-variant]").forEach((select) => {
    if (select.dataset.bound) return;
    select.dataset.bound = "true";
    select.addEventListener("change", () => {
      const product = catalogProducts().find((item) => item.id === select.dataset.productVariant);
      const template = document.createElement("template");
      template.innerHTML = productCard(product, select.value);
      const card = template.content.firstElementChild;
      select.closest(".product-card").replaceWith(card);
      wireProductButtons(card);
    });
  });
  root.querySelectorAll("[data-add-product]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const product = catalogProducts().find((item) => item.id === button.dataset.addProduct);
      addToCart(productWithVariant(product, button.closest(".product-card")?.querySelector("[data-product-variant]")?.value));
    });
  });

  root.querySelectorAll("[data-wishlist-product]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      toggleWishlist(button.dataset.wishlistProduct);
      if (document.querySelector("#wishlistGrid")) {
        renderWishlist();
      } else {
        renderFeaturedProducts();
        renderProductsPage();
      }
    });
  });

  root.querySelectorAll("[data-product-detail]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const product = catalogProducts().find((item) => item.id === button.dataset.productDetail);
      if (product) openProductDetails(productWithVariant(product, button.closest(".product-card")?.querySelector("[data-product-variant]")?.value));
    });
  });

}

function openProductDetails(product) {
  const baseProduct = catalogProducts().find((item) => item.id === (product.baseProductId || product.id));
  let dialog = document.querySelector("#productDetailsDialog");

  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "productDetailsDialog";
    dialog.className = "product-details-dialog";
    document.body.append(dialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  dialog.innerHTML = `
    <button class="dialog-close-button product-dialog-close" type="button" aria-label="Close product details">Close</button>
    <div class="product-detail-layout">
      <div class="product-detail-photo"><img src="${product.image}" alt="${product.name}">${productPhotoLabel(product)}</div>
      <div>
        <p class="eyebrow">${product.type} / ${product.use}</p>
        <h2>${product.name}</h2>
        <p class="product-detail-brand">${product.brand}</p>
        <p>${product.specs}</p>
        ${product.photoNote ? `<small class="product-photo-note">${product.photoNote}</small>` : ""}
        <dl class="product-spec-list">
          <div><dt>Availability</dt><dd>${product.stock} in stock</dd></div>
          <div><dt>Delivery</dt><dd>Philippine delivery address selected at checkout</dd></div>
          <div><dt>Payment</dt><dd>Cash on Delivery, card, GCash, or Maya</dd></div>
        </dl>
        ${productVariantMarkup(baseProduct, product.variantId, "quickViewVariant")}
        <div class="product-detail-footer">${productPriceMarkup(product)}<button class="button primary" data-detail-add="${product.id}" type="button">Add to Cart</button></div>
      </div>
    </div>
  `;

  dialog.querySelector(".product-dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-detail-add]").addEventListener("click", () => addToCart(product));
  dialog.querySelector("#quickViewVariant")?.addEventListener("change", (event) => {
    openProductDetails(productWithVariant(baseProduct, event.target.value));
  });
  if (!dialog.open) dialog.showModal();
}

function renderFeaturedProducts() {
  const container = document.querySelector("#featuredProducts");
  if (!container) return;

  container.innerHTML = catalogProducts().slice(0, 6).map(productCard).join("");
  wireProductButtons();
}

function renderProductsPage() {
  const collections = [
    {
      selector: "#computerProductsGrid",
      matches: (product) => product.type === "Desktop PC" || product.type === "Monitor"
    },
    {
      selector: "#laptopsGrid",
      matches: (product) => product.type === "Laptop"
    },
    {
      selector: "#accessoriesGrid",
      matches: (product) => product.type === "Accessory"
    },
    {
      selector: "#computerPartsGrid",
      matches: (product) => product.type === "Computer Part"
    }
  ];
  if (!document.querySelector("#computerProductsGrid")) return;
  const layout = document.querySelector(".product-page-layout");
  // Keep the full buying guide and quick order available below the products.
  layout.after(...document.querySelectorAll("main > .shopping-extra:not(#comparisonTool)"));
  const accessoryChooser = layout.querySelector(".accessory-chooser");
  if (accessoryChooser) accessoryChooser.parentElement.append(accessoryChooser);

  const typeFilter = document.querySelector("#typeFilter");
  const savedType = typeFilter.value;
  document.getElementById("partTypeOptions").replaceChildren(...computerPartCategories.map((category) => new Option(category.label, "part:" + category.id)));
  typeFilter.value = savedType;
  const useFilter = document.querySelector("#useFilter");
  const sortFilter = document.querySelector("#sortFilter");
  const minPrice = document.querySelector("#minPrice");
  const maxPrice = document.querySelector("#maxPrice");
  const inStockFilter = document.querySelector("#inStockFilter");
  const brandFilters = document.querySelector("#brandFilters");
  const resetFilters = document.querySelector("#resetFilters");
  const resultCount = document.querySelector("#productResultCount");
  const activeFilterSummary = document.querySelector("#activeFilterSummary");
  const search = document.getElementById("productSearch");
  const suggestions = document.getElementById("productSuggestions");
  if (suggestions) {
    suggestions.replaceChildren();
    catalogProducts().forEach((product) => {
      const option = document.createElement("option");
      option.value = product.name;
      suggestions.appendChild(option);
    });
  }
  const brands = [...new Set(catalogProducts().map((product) => product.brand))].sort();

  brandFilters.innerHTML = brands.map((brand) => `
    <label class="brand-filter-option">
      <input type="checkbox" value="${brand}" data-brand-filter>
      <span>${brand}</span>
    </label>
  `).join("");

  // Shared search and brand links open the catalog with the right filters applied.
  const query = new URLSearchParams(location.search);
  if (computerPartCategories.some((category) => category.id === query.get("part"))) {
    typeFilter.value = "part:" + query.get("part");
  }
  if (search) search.value = query.get("q") || "";
  brandFilters.querySelectorAll("input").forEach((input) => {
    input.checked = input.value === query.get("brand");
  });
  if ([...useFilter.options].some((option) => option.value === query.get("use"))) {
    useFilter.value = query.get("use");
  }

  const currencyLabel = currencyPreference() === "USD" ? "USD" : "PHP";
  minPrice.placeholder = `${currencyLabel} 0`;
  maxPrice.placeholder = "Any price";

  function render() {
    const selectedType = typeFilter.value;
    const partCategory = computerPartCategories.find((category) => "part:" + category.id === selectedType);
    document.querySelector("#computer-parts .collection-heading h2").textContent = partCategory?.label || "Computer Parts";
    document.querySelectorAll("[data-catalog-type]").forEach((button) => {
      const isPart = button.dataset.catalogType === "Computer Part" && selectedType.startsWith("part:");
      button.setAttribute("aria-pressed", String(isPart || button.dataset.catalogType === selectedType));
    });
    const selectedUse = useFilter.value;
    const selectedBrands = Array.from(document.querySelectorAll("[data-brand-filter]:checked")).map((input) => input.value);
    const currencyMultiplier = currencyPreference() === "USD" ? 57 : 1;
    const minimum = Number(minPrice.value) * currencyMultiplier;
    const maximum = Number(maxPrice.value) * currencyMultiplier;
    const filtered = catalogProducts().filter((product) => {
      const typeMatch = selectedType === "all" || product.type === selectedType
        || (selectedType.startsWith("part:") && product.type === "Computer Part" && product.partCategory === selectedType.slice(5));
      const useMatch = selectedUse === "all" || product.use === selectedUse;
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const minimumMatch = !minPrice.value || product.price >= minimum;
      const maximumMatch = !maxPrice.value || product.price <= maximum;
      const stockMatch = !inStockFilter.checked || product.stock > 0;
      // Include every available capacity in search, not just the default option.
      const words = (search?.value || "").trim().toLowerCase().split(/\s+/);
      const capacities = product.variants ? product.variants.options.map((option) => option.label).join(" ") : "";
      const description = `${product.name} ${product.brand} ${product.specs} ${capacities}`.toLowerCase();
      const searchMatch = words.every((word) => description.includes(word));
      return typeMatch && useMatch && brandMatch && minimumMatch && maximumMatch && stockMatch && searchMatch;
    });

    const sorted = [...filtered];
    if (sortFilter.value === "price-low") sorted.sort((a, b) => a.price - b.price);
    if (sortFilter.value === "price-high") sorted.sort((a, b) => b.price - a.price);
    if (sortFilter.value === "name-az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortFilter.value === "stock-high") sorted.sort((a, b) => b.stock - a.stock);

    collections.forEach(({ selector, matches }) => {
      const grid = document.querySelector(selector);
      const matchingProducts = sorted.filter(matches);
      const collection = grid.closest(".product-collection");
      collection.hidden = matchingProducts.length === 0;
      grid.innerHTML = matchingProducts.map(productCard).join("");
    });

    const activeFilters = [
      selectedType !== "all" ? typeFilter.selectedOptions[0].textContent : "",
      selectedUse !== "all" ? selectedUse : "",
      selectedBrands.length ? `${selectedBrands.length} brand${selectedBrands.length === 1 ? "" : "s"}` : "",
      inStockFilter.checked ? "In stock" : "",
      minPrice.value || maxPrice.value ? "Price range" : ""
    ].filter(Boolean);
    resultCount.textContent = `${sorted.length} product${sorted.length === 1 ? "" : "s"} found`;
    activeFilterSummary.textContent = activeFilters.length ? activeFilters.join(" · ") : "All products";
    const empty = document.getElementById("catalogEmpty");
    if (empty) empty.hidden = sorted.length !== 0;

    wireProductButtons();
  }

  [typeFilter, useFilter, sortFilter, minPrice, maxPrice, inStockFilter].forEach((control) => {
    control.addEventListener(control.type === "number" ? "input" : "change", render);
  });
  brandFilters.addEventListener("change", render);
  document.querySelectorAll("[data-catalog-type]").forEach((button) => {
    button.onclick = () => {
      typeFilter.value = button.dataset.catalogType;
      render();
    };
  });
  if (search) search.oninput = render;
  const searchForm = document.getElementById("catalogSearchForm");
  if (searchForm) searchForm.onsubmit = (event) => { event.preventDefault(); render(); };
  resetFilters.addEventListener("click", () => {
    typeFilter.value = "all";
    useFilter.value = "all";
    sortFilter.value = "featured";
    minPrice.value = "";
    maxPrice.value = "";
    inStockFilter.checked = false;
    if (search) search.value = "";
    brandFilters.querySelectorAll("input").forEach((input) => { input.checked = false; });
    render();
  });
  render();
}

function productSpecificationEntries(product) {
  const values = product.specs.split(",").map((item) => item.trim());

  if (product.type === "Desktop PC" || product.type === "Laptop") {
    return [
      ...values.map((value, index) => {
        const label = index === 0 ? "Processor"
          : /RTX|graphics/i.test(value) ? "Graphics"
          : /RAM|memory/i.test(value) ? "Memory"
          : /SSD|NVMe/i.test(value) ? "Storage"
          : /display/i.test(value) ? "Display" : "Specification";
        return ["SPEC", label, value];
      }),
      ["BR", "Brand", product.brand],
      ["MODEL", "Model", product.name],
      ["STK", "Availability", `${product.stock} units available`]
    ];
  }

  if (product.type === "Computer Part") {
    return [
      ["TYPE", "Part Type", product.name],
      ["USE", "Recommended Use", product.use],
      ["BR", "Brand", product.brand],
      ["SPEC", "Specification", product.specs],
      ["STK", "Availability", `${product.stock} units available`]
    ];
  }

  return [
    ["TYPE", "Product Type", product.type],
    ["USE", "Recommended Use", product.use],
    ["BR", "Brand", product.brand],
    ["SPEC", "Specification", product.specs],
    ["STK", "Availability", `${product.stock} units available`]
  ];
}

function wireMobileFilters() {
  const button = document.getElementById("toggleFilters");
  const controls = document.getElementById("filterControls");
  if (!button || !controls) return;
  const mobile = window.matchMedia("(max-width: 760px)");
  let expanded = false;
  button.closest(".filter-panel").classList.add("filters-ready");
  function update() {
    button.hidden = !mobile.matches;
    controls.hidden = mobile.matches && !expanded;
    button.setAttribute("aria-expanded", String(!controls.hidden));
    button.textContent = expanded ? "Hide filters" : "Filters & sort";
  }
  button.addEventListener("click", () => { expanded = !expanded; update(); });
  mobile.addEventListener("change", update);
  update();
}

function productConfigurationOptions(product) {
  const desktop = product.type === "Desktop PC";
  const laptop = product.type === "Laptop";
  const promotionDiscount = desktop ? 2000 : 750;

  return {
    promotions: [
      { id: "none", name: "Standard store pricing", description: "Keep the listed product price.", price: 0 },
      { id: "bundle-discount", name: `${money(promotionDiscount)} setup discount`, description: "Applies when at least one upgrade or add-on is selected.", price: -promotionDiscount, conditional: true },
      { id: "service", name: "Free setup consultation", description: "Includes a guided setup and first-start checklist.", price: 0 }
    ],
    // Do not promise hardware upgrades without checking the exact model's service manual.
    upgrades: [
      { id: "warranty-extended", name: "Three-year care plan", description: "Optional store support plan.", price: laptop ? 3995 : 1995 }
    ],
    addons: ["monitor-27", "keyboard-rgb", "mouse-wireless", "accessory-stream-kit"]
      .map((id) => productWithVariant(catalogProducts().find((item) => item.id === id)))
      .filter((item) => (item.baseProductId || item.id) !== (product.baseProductId || product.id))
      .map((item) => ({ id: item.baseProductId || item.id, name: item.name, description: item.specs, price: item.price, image: item.image }))

  };
}

function renderProductDetail() {
  const page = document.querySelector("#productDetailPage");
  if (!page) return;

  const productId = new URLSearchParams(window.location.search).get("id");
  const baseProduct = catalogProducts().find((item) => item.id === productId);
  let product = baseProduct ? productWithVariant(baseProduct, new URLSearchParams(window.location.search).get("variant")) : undefined;
  const loading = document.querySelector("#productDetailLoading");
  const notFound = document.querySelector("#productNotFound");

  loading.hidden = true;
  if (!product) {
    notFound.hidden = false;
    return;
  }

  document.title = `${product.name} | Bits and Bytes`;
  const overview = document.querySelector("#productOverview");
  const componentSection = document.querySelector("#productComponentSection");
  const configurator = document.querySelector("#configureProduct");
  const productImage = document.querySelector("#detailProductImage");
  let specifications = productSpecificationEntries(product);
  const options = productConfigurationOptions(product);
  const selected = { promotion: "none", upgrades: new Set(), addons: new Set() };
  const stages = ["promotions", "upgrades", "addons", "checkout"];
  let stageIndex = 0;

  overview.hidden = false;
  componentSection.hidden = false;
  configurator.hidden = false;
  const galleryThumbnails = document.querySelector("#productGalleryThumbnails");
  function renderGallery() {
    const gallery = productGallery(product);
    let activeImage = 0;
    document.querySelector("#detailPhotoCapacity").innerHTML = productPhotoLabel(product);
    const note = document.querySelector("#detailPhotoNote");
    note.textContent = product.photoNote || "";
    note.hidden = !product.photoNote;
    galleryThumbnails.innerHTML = gallery.map((image, index) => `
      <button class="${index === 0 ? "active" : ""}" type="button" data-product-image-src="${image.src}" aria-label="Show ${image.shortLabel}">
        <img src="${image.src}" alt="">
        <span>${image.shortLabel}</span>
      </button>`).join("");
    function showImage(index) {
      activeImage = (index + gallery.length) % gallery.length;
      const image = gallery[activeImage];
      productImage.src = image.src;
      productImage.alt = image.label;
      productImage.style.transform = `scale(${image.zoom || 1})`;
      document.querySelector("#galleryViewCaption").textContent = image.note || image.label;
      document.querySelector("#galleryImageCount").textContent = `${activeImage + 1} / ${gallery.length}`;
      document.querySelector("#galleryOriginal").href = image.src;
      galleryThumbnails.querySelectorAll("button").forEach((button, i) => {
        button.classList.toggle("active", i === activeImage);
        button.setAttribute("aria-pressed", String(i === activeImage));
      });
    }
    galleryThumbnails.querySelectorAll("button").forEach((button, index) => {
      button.addEventListener("click", () => showImage(index));
    });
    // Assign, rather than add listeners, because capacity changes rebuild the gallery.
    document.querySelector("#galleryPrevious").onclick = () => showImage(activeImage - 1);
    document.querySelector("#galleryNext").onclick = () => showImage(activeImage + 1);
    galleryThumbnails.onkeydown = (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      showImage(activeImage + (event.key === "ArrowRight" ? 1 : -1));
      galleryThumbnails.querySelectorAll("button")[activeImage].focus();
    };
    showImage(0);
  }
  renderGallery();
  document.querySelector("#detailBreadcrumb").textContent = product.name;
  document.querySelector("#detailProductCategory").textContent = `${product.type} / ${product.use}`;
  document.querySelector("#detailProductName").textContent = product.name;
  document.querySelector("#detailProductBrand").textContent = product.brand;
  document.querySelector("#detailProductDescription").textContent = product.specs;
  document.querySelector("#detailProductStock").textContent = `${product.stock} in stock`;
  document.querySelector("#detailProductPrice").innerHTML = product.originalPrice > product.price
    ? `<del>${money(product.originalPrice)}</del> ${money(product.price)}`
    : money(product.price);
  document.querySelector("#detailKeySpecs").innerHTML = specifications.slice(0, 4).map(([, label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");

  document.querySelector("#componentProductImage").src = product.image;
  document.querySelector("#componentProductImage").alt = product.name;
  document.querySelector("#componentOrbitCards").innerHTML = specifications.map(([icon, label, value]) => `
    <article class="orbit-spec-card">
      <span class="orbit-spec-icon" aria-hidden="true">${icon}</span>
      <strong>${label}</strong>
      <small>${value}</small>
    </article>
  `).join("");

  document.querySelector("#configSummaryImage").src = product.image;
  document.querySelector("#configSummaryImage").alt = product.name;
  document.querySelector("#configSummaryName").textContent = product.name;
  const variantPanel = document.querySelector("#detailVariants");
  variantPanel.hidden = !baseProduct.variants;
  variantPanel.innerHTML = productVariantMarkup(baseProduct, product.variantId, "detailVariant");
  variantPanel.addEventListener("change", (event) => {
    product = productWithVariant(baseProduct, event.target.value);
    specifications = productSpecificationEntries(product);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", product.variantId);
    history.replaceState(null, "", url);
    document.title = `${product.name} | Bits and Bytes`;
    document.querySelector("#detailProductName").textContent = product.name;
    productImage.src = product.image;
    productImage.alt = product.name;
    document.querySelector("#componentProductImage").src = product.image;
    document.querySelector("#configSummaryImage").src = product.image;
    renderGallery();
    document.querySelector("#detailProductPrice").textContent = money(product.price);
    document.querySelector("#detailProductDescription").textContent = product.specs;
    document.querySelector("#detailProductStock").textContent = `${product.stock} in stock`;
    document.querySelector("#configSummaryName").textContent = product.name;
    document.querySelector("#detailKeySpecs").innerHTML = specifications.slice(0, 4).map(([, label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
    document.querySelector("#componentOrbitCards").innerHTML = specifications.map(([icon, label, value]) => `<article class="orbit-spec-card"><span class="orbit-spec-icon" aria-hidden="true">${icon}</span><strong>${label}</strong><small>${value}</small></article>`).join("");
    updateConfigurationSummary();
  });

  function optionCard(option, group, radio = false) {
    return `
      <label class="configuration-option">
        <input type="${radio ? "radio" : "checkbox"}" name="${group}" value="${option.id}" ${radio && option.id === selected.promotion ? "checked" : ""}>
        ${option.image ? `<img src="${option.image}" alt="">` : `<span class="configuration-option-mark" aria-hidden="true">+</span>`}
        <span class="configuration-option-copy"><strong>${option.name}</strong><small>${option.description}</small></span>
        <b>${option.price === 0 ? "Included" : `${option.price > 0 ? "+" : "-"}${money(Math.abs(option.price))}`}</b>
      </label>
    `;
  }

  document.querySelector("#promotionPanel").innerHTML = `<div class="config-panel-heading"><p class="eyebrow">Current offers</p><h3>Choose a promotion</h3><p>Select one offer for this product.</p></div><div class="configuration-options">${options.promotions.map((option) => optionCard(option, "promotion", true)).join("")}</div>`;
  document.querySelector("#upgradePanel").innerHTML = `<div class="config-panel-heading"><p class="eyebrow">Optional changes</p><h3>Upgrade the product</h3><p>Select any upgrades that suit your performance needs.</p></div><div class="configuration-options">${options.upgrades.map((option) => optionCard(option, "upgrade")).join("")}</div>`;
  document.querySelector("#addonPanel").innerHTML = `<div class="config-panel-heading"><p class="eyebrow">Complete the setup</p><h3>Add useful desk gear</h3><p>Choose optional peripherals to include in the same cart item.</p></div><div class="configuration-options addon-options">${options.addons.map((option) => optionCard(option, "addon")).join("")}</div>`;
  document.querySelector("#checkoutPanelProduct").innerHTML = `
    <div class="config-panel-heading"><p class="eyebrow">Ready to order</p><h3>Review and continue</h3><p>Your delivery location and payment method are selected in the cart checkout.</p></div>
    <div class="product-checkout-actions">
      <button class="button secondary" id="detailWishlistButton" type="button">Save to Wishlist</button>
      <button class="button primary" id="addConfiguredProduct" type="button">Add Configuration to Cart</button>
      <button class="button primary" id="checkoutConfiguredProduct" type="button">Checkout Now</button>
    </div>
    <p class="product-checkout-note">Checkout supports Cash on Delivery, card, GCash, and Maya.</p>
  `;

  function selectedOptions() {
    const selectedPromotion = options.promotions.find((option) => option.id === selected.promotion);
    const selectedUpgrades = options.upgrades.filter((option) => selected.upgrades.has(option.id));
    const selectedAddons = options.addons.filter((option) => selected.addons.has(option.id));
    const promotionAllowed = !selectedPromotion?.conditional || selectedUpgrades.length + selectedAddons.length > 0;
    return { selectedPromotion: promotionAllowed ? selectedPromotion : options.promotions[0], selectedUpgrades, selectedAddons };
  }

  function updateConfigurationSummary() {
    const { selectedPromotion, selectedUpgrades, selectedAddons } = selectedOptions();
    const extras = [...selectedUpgrades, ...selectedAddons];
    const total = product.price + (selectedPromotion?.price || 0) + extras.reduce((sum, option) => sum + option.price, 0);
    const summary = [
      ...specifications.slice(0, 4).map(([, label, value]) => `${label}: ${value}`),
      `Promotion: ${selectedPromotion?.name || "Standard store pricing"}`,
      ...selectedUpgrades.map((option) => `Upgrade: ${option.name}`),
      ...selectedAddons.map((option) => `Add-on: ${option.name}`)
    ];
    document.querySelector("#configSummaryList").innerHTML = summary.map((item) => `<li>${item}</li>`).join("");
    document.querySelector("#configTotal").textContent = money(total);
    return { total, summary };
  }

  function showStage(index) {
    stageIndex = Math.max(0, Math.min(stages.length - 1, index));
    const activeStage = stages[stageIndex];
    document.querySelectorAll("[data-config-tab]").forEach((button) => {
      const active = button.dataset.configTab === activeStage;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-config-panel]").forEach((panel) => {
      const active = panel.dataset.configPanel === activeStage;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });
    document.querySelector("#configPrevious").disabled = stageIndex === 0;
    document.querySelector("#configNext").hidden = stageIndex === stages.length - 1;
    document.querySelector("#configNext").textContent = stageIndex === stages.length - 2 ? "Review Checkout" : "Next Step";
  }

  configurator.addEventListener("change", (event) => {
    if (event.target.name === "promotion") selected.promotion = event.target.value;
    if (event.target.name === "upgrade") event.target.checked ? selected.upgrades.add(event.target.value) : selected.upgrades.delete(event.target.value);
    if (event.target.name === "addon") event.target.checked ? selected.addons.add(event.target.value) : selected.addons.delete(event.target.value);
    updateConfigurationSummary();
  });
  document.querySelectorAll("[data-config-tab]").forEach((button) => button.addEventListener("click", () => showStage(stages.indexOf(button.dataset.configTab))));
  document.querySelector("#configPrevious").addEventListener("click", () => showStage(stageIndex - 1));
  document.querySelector("#configNext").addEventListener("click", () => showStage(stageIndex + 1));

  function configuredCartItem() {
    const configuration = updateConfigurationSummary();
    return {
      ...product,
      isConfigured: true,
      baseProductId: product.baseProductId || product.id,
      id: `${product.id}-configured-${Date.now()}`,
      name: `${product.name} - Configured`,
      price: configuration.total,
      specs: configuration.summary.join(", ")
    };
  }

  document.querySelector("#addConfiguredProduct").addEventListener("click", () => addToCart(configuredCartItem()));
  document.querySelector("#checkoutConfiguredProduct").addEventListener("click", () => {
    addToCart(configuredCartItem());
    window.location.href = new URL("pages/cart.html", document.baseURI).href;
  });
  document.querySelector("#detailWishlistButton").addEventListener("click", () => {
    toggleWishlist(baseProduct.id);
    document.querySelector("#detailWishlistButton").textContent = getWishlist().includes(baseProduct.id) ? "Saved to Wishlist" : "Save to Wishlist";
  });

  document.querySelector("#copyProductSpecs").addEventListener("click", async () => {
    const text = `${product.name}\n${specifications.map(([, label, value]) => `${label}: ${value}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      document.querySelector("#copySpecsStatus").textContent = "Specifications copied.";
    } catch {
      document.querySelector("#copySpecsStatus").textContent = "Copy is unavailable in this browser. Select the specifications above manually.";
    }
  });

  updateConfigurationSummary();
  showStage(0);
}

function renderWishlist() {
  const grid = document.querySelector("#wishlistGrid");
  if (!grid) return;

  const savedIds = getWishlist();
  const savedProducts = catalogProducts().filter((product) => savedIds.includes(product.id));
  const emptyState = document.querySelector("#wishlistEmpty");

  grid.innerHTML = savedProducts.map(productCard).join("");
  emptyState.hidden = savedProducts.length !== 0;
  wireProductButtons();
}

function wireStoreControls() {
  const nav = document.querySelector(".main-nav");
  if (!nav || document.querySelector(".store-toolbar")) return;

  Array.from(nav.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("|")) {
      node.remove();
    }
  });

  nav.insertAdjacentHTML("beforebegin", `
    <div class="store-toolbar" aria-label="Store controls">
      <label class="store-control" for="languageSelect">
        <span>Language</span>
        <select id="languageSelect">
          <optgroup label="Asian Languages">
            <option value="en">English</option>
            <option value="fil">Filipino - Coming soon</option>
            <option value="ja">Japanese - Coming soon</option>
            <option value="zh">Chinese - Coming soon</option>
            <option value="ko">Korean - Coming soon</option>
          </optgroup>
          <optgroup label="European Languages">
            <option value="es">Spanish - Coming soon</option>
            <option value="fr">French - Coming soon</option>
            <option value="de">German - Coming soon</option>
          </optgroup>
          <optgroup label="African Languages">
            <option value="sw">Swahili - Coming soon</option>
            <option value="zu">Zulu - Coming soon</option>
          </optgroup>
          <optgroup label="Middle Eastern Languages">
            <option value="ar">Arabic - Coming soon</option>
            <option value="tr">Turkish - Coming soon</option>
          </optgroup>
        </select>
      </label>
      <label class="store-control" for="currencySelect">
        <span>Currency</span>
        <select id="currencySelect">
          <option value="PHP">PHP (P)</option>
          <option value="USD">USD ($)</option>
        </select>
      </label>
      <a class="wishlist-pill" href="pages/wishlist.html" aria-label="Wishlist"><span class="wishlist-link-label">Wishlist</span> <span id="wishlistCount">0</span></a>
      <p class="control-status" id="controlStatus" role="status"></p>
    </div>
  `);

  const languageSelect = document.querySelector("#languageSelect");
  const currencySelect = document.querySelector("#currencySelect");
  const status = document.querySelector("#controlStatus");

  currencySelect.value = currencyPreference();
  languageSelect.value = localStorage.getItem("bitsAndBytesLanguage") || "en";

  languageSelect.addEventListener("change", () => {
    localStorage.setItem("bitsAndBytesLanguage", languageSelect.value);
    status.textContent = languageSelect.value === "en"
      ? "English is active."
      : `${languageSelect.options[languageSelect.selectedIndex].text} is not available yet.`;
  });

  currencySelect.addEventListener("change", () => {
    localStorage.setItem("bitsAndBytesCurrency", currencySelect.value);
    window.location.reload();
  });
}

function wireFoldableNavigation() {
  const nav = document.querySelector(".main-nav");
  if (!nav || nav.classList.contains("foldable-nav")) return;

  const headerGroup = nav.closest("hgroup");
  const links = Array.from(nav.querySelectorAll("a"));
  const getLink = (href) => links.find((link) => link.getAttribute("href") === href);
  const fallbackLabels = {
    "index.html": "Home",
    "pages/products.html": "Products",
    "pages/build.html": "Build Your Own PC",
    "pages/components.html": "Interactive Guide",
    "pages/about.html": "About",
    "pages/downloads.html": "Downloads",
    "pages/contact.html": "Contact",
    "pages/login.html": "Login",
    "pages/cart.html": "Cart"
  };
  const linkMarkup = (href, extraClass = "") => {
    const link = getLink(href);
    const activeClass = link && link.classList.contains("active") ? " active" : "";
    const label = link ? link.textContent.replace(/\s+\d+$/, "").trim() : fallbackLabels[href] || href;
    if (href === "pages/cart.html") return `<a class="${extraClass}${activeClass}" href="${href}" aria-label="Cart, 0 items" title="View cart"><img class="cart-icon" src="images/icons/shopping-cart.svg" alt="" width="24" height="24"><span id="cartCount" aria-live="polite">0</span></a>`;
    return `<a class="${extraClass}${activeClass}" href="${href}">${label}</a>`;
  };
  const groupMarkup = (label, hrefs) => {
    const hasActiveLink = hrefs.some((href) => getLink(href)?.classList.contains("active"));
    return `
      <details class="nav-group${hasActiveLink ? " current" : ""}">
        <summary>${label}</summary>
        <div class="nav-submenu">
          ${hrefs.map((href) => linkMarkup(href)).join("")}
        </div>
      </details>
    `;
  };
  const shopMarkup = `
    <details class="nav-group${getLink("pages/products.html")?.classList.contains("active") || getLink("pages/build.html")?.classList.contains("active") ? " current" : ""}">
      <summary>Shop Now</summary>
      <div class="nav-submenu shop-submenu">
        <a href="pages/products.html#computer-products">Computer Products</a>
        <a href="pages/products.html#laptops">Laptops</a>
        <a href="pages/products.html#accessories">Accessories</a>
        <a href="pages/products.html#computer-parts">Computer Parts</a>
        ${linkMarkup("pages/build.html")}
        ${linkMarkup("pages/products.html")}
      </div>
    </details>
  `;

  nav.classList.add("foldable-nav");
  nav.innerHTML = `
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primaryNavMenu">Menu</button>
    <div class="nav-menu" id="primaryNavMenu">
      <a class="nav-brand" href="index.html" aria-label="Bits and Bytes home"><img src="images/branding/bitsandbyteslogo.png" alt=""><span>Bits &amp; Bytes</span></a>
      ${linkMarkup("index.html", "nav-home")}
      ${shopMarkup}
      ${groupMarkup("Explore", ["pages/components.html", "pages/about.html", "pages/downloads.html"])}
      ${groupMarkup("Support", ["pages/contact.html", "pages/login.html"])}
      ${linkMarkup("pages/cart.html", "cart-pill")}
    </div>
  `;

  if (headerGroup) headerGroup.prepend(nav);

  const toggle = nav.querySelector(".nav-toggle");
  const menu = nav.querySelector(".nav-menu");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-group").forEach((group) => {
    group.addEventListener("toggle", () => {
      if (!group.open) return;
      nav.querySelectorAll(".nav-group").forEach((otherGroup) => {
        if (otherGroup !== group) otherGroup.open = false;
      });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    nav.querySelectorAll(".nav-group").forEach((group) => { group.open = false; });
    menu.blur();
  });
}

function wireStickyStoreHeader() {
  const header = document.querySelector(".site-header");
  const headerGroup = header?.querySelector("hgroup");
  const toolbar = headerGroup?.querySelector(".store-toolbar");
  const nav = headerGroup?.querySelector(".foldable-nav");
  if (!header || !headerGroup || !toolbar || !nav || document.querySelector(".sticky-site-nav")) return;

  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-site-nav";
  stickyHeader.setAttribute("aria-label", "Sticky site navigation");
  // Keep shopping actions visible beside the navigation, including on mobile.
  const cartLink = nav.querySelector(".cart-pill");
  if (cartLink) toolbar.prepend(cartLink);
  const mobileBrand = document.createElement("a");
  mobileBrand.className = "mobile-store-brand";
  mobileBrand.href = "index.html";
  mobileBrand.innerHTML = '<img src="images/branding/bitsandbyteslogo.png" alt=""><span>Bits &amp; Bytes</span>';
  nav.prepend(mobileBrand);
  stickyHeader.append(nav, toolbar);
  header.before(stickyHeader);

  // Keep the header's layout space steady as the visible navigation shrinks.
  const headerSpace = document.createElement("div");
  headerSpace.className = "site-nav-space";
  stickyHeader.before(headerSpace);
  headerSpace.append(stickyHeader);
  let compact = false;
  function updateHeader() {
    if (!compact && window.scrollY > 100) compact = true;
    else if (compact && window.scrollY < 32) compact = false;
    stickyHeader.classList.toggle("is-compact", compact);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

function wireHomeVideo() {
  const video = document.getElementById("surfaceVideo");
  const button = document.getElementById("toggleSurfaceVideo");
  if (!video || !button) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let userPaused = reducedMotion.matches;
  let visible = false;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = !userPaused;

  function updateButton() {
    button.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
    button.title = video.paused ? "Play video" : "Pause video";
    button.classList.toggle("is-playing", !video.paused);
    button.querySelector("img").src = video.paused ? "images/icons/play.svg" : "images/icons/pause.svg";
  }
  function updatePlayback() {
    if (visible && !document.hidden && !userPaused) video.play().catch(updateButton);
    else video.pause();
  }
  button.addEventListener("click", () => {
    userPaused = !video.paused;
    updatePlayback();
  });
  video.addEventListener("play", updateButton);
  video.addEventListener("pause", updateButton);
  document.addEventListener("visibilitychange", updatePlayback);
  reducedMotion.addEventListener("change", () => {
    userPaused = reducedMotion.matches;
    updatePlayback();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updatePlayback();
  }, { threshold: 0.25 }).observe(video);
  updateButton();
}

function wirePartnersDialog() {
  const dialog = document.querySelector("#partnersDialog");
  const openButton = document.querySelector("#viewPartners");
  const closeButton = document.querySelector("#closePartners");
  if (!dialog || !openButton || !closeButton) return;

  openButton.addEventListener("click", () => dialog.showModal());
  closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function wireBackgroundMusic() {
  const audio = document.querySelector("#backgroundMusic");
  const button = document.querySelector("#musicToggle");
  if (!audio || !button) return;
  const preferenceKey = "bits-bytes-music";
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== "off"; } catch {}
  audio.volume = 0.2;

  function updateButton() {
    const playing = !audio.paused;
    const label = playing ? "Pause background music" : "Play background music";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(playing));
    button.querySelector("img").src = playing ? "images/icons/pause.svg" : "images/icons/play.svg";
  }

  function stopRetrying() {
    document.removeEventListener("click", retryPlayback);
    document.removeEventListener("keydown", retryPlayback);
  }

  async function playMusic() {
    if (!enabled) return;
    try {
      await audio.play();
      stopRetrying();
    } catch {
      // Browsers can require a click or key press before audible playback.
    }
    updateButton();
  }

  function retryPlayback(event) {
    if (button.contains(event.target) || event.repeat) return;
    if (enabled && audio.paused) playMusic();
  }

  button.addEventListener("click", () => {
    enabled = audio.paused;
    try { localStorage.setItem(preferenceKey, enabled ? "on" : "off"); } catch {}
    if (enabled) playMusic();
    else { audio.pause(); stopRetrying(); }
    updateButton();
  });
  audio.addEventListener("play", updateButton);
  audio.addEventListener("pause", updateButton);
  document.addEventListener("click", retryPlayback);
  document.addEventListener("keydown", retryPlayback);
  playMusic();
}

function wireReviewCarousel() {
  const track = document.querySelector("#reviewTrack");
  const previous = document.querySelector("#reviewPrevious");
  const next = document.querySelector("#reviewNext");
  if (!track || !previous || !next) return;

  const cards = Array.from(track.querySelectorAll(".review-card"));
  let startIndex = 0;

  function visibleCount() {
    if (window.innerWidth <= 680) return 1;
    if (window.innerWidth <= 1020) return 2;
    return 3;
  }

  function update() {
    const maxIndex = Math.max(0, cards.length - visibleCount());
    startIndex = Math.min(startIndex, maxIndex);
    const step = cards[0].getBoundingClientRect().width + 16;
    track.style.transform = `translateX(-${startIndex * step}px)`;
    previous.disabled = startIndex === 0;
    next.disabled = startIndex === maxIndex;
  }

  previous.addEventListener("click", () => {
    startIndex = Math.max(0, startIndex - 1);
    update();
  });
  next.addEventListener("click", () => {
    startIndex = Math.min(cards.length - visibleCount(), startIndex + 1);
    update();
  });
  window.addEventListener("resize", update);
  update();
}

function wirePromoCarousel() {
  const carousel = document.querySelector("#promoCarousel");
  const track = document.querySelector("#promoCarouselTrack");
  const previous = document.querySelector("#promoPrevious");
  const next = document.querySelector("#promoNext");
  const dots = document.querySelector("#promoCarouselDots");
  if (!carousel || !track || !previous || !next || !dots) return;

  const slides = Array.from(track.querySelectorAll(".promo-slide"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let autoScroll;

  dots.innerHTML = slides.map((_, index) => `
    <button type="button" data-promo-slide="${index}" aria-label="Show promotion ${index + 1}"></button>
  `).join("");

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.querySelectorAll("a, button").forEach((control) => {
        control.tabIndex = isActive ? 0 : -1;
      });
    });
    dots.querySelectorAll("button").forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function stopAutoScroll() {
    window.clearInterval(autoScroll);
  }

  function startAutoScroll() {
    stopAutoScroll();
    if (!reduceMotion) autoScroll = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  }

  previous.addEventListener("click", () => {
    showSlide(activeIndex - 1);
    startAutoScroll();
  });
  next.addEventListener("click", () => {
    showSlide(activeIndex + 1);
    startAutoScroll();
  });
  dots.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-promo-slide]");
    if (!dot) return;
    showSlide(Number(dot.dataset.promoSlide));
    startAutoScroll();
  });
  carousel.addEventListener("focusin", stopAutoScroll);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoScroll();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoScroll();
    else startAutoScroll();
  });

  showSlide(0);
  startAutoScroll();
}

function wireSupportChat() {
  if (document.querySelector("#supportChat")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <aside class="support-chat" id="supportChat" aria-label="Customer service chat">
      <section class="support-chat-panel" id="supportChatPanel" hidden aria-labelledby="supportChatTitle">
        <header>
          <div>
            <p class="eyebrow">Bits and Bytes support</p>
            <h2 id="supportChatTitle">How can we help?</h2>
          </div>
          <button class="support-chat-close" id="supportChatClose" type="button" aria-label="Close customer service chat">Close</button>
        </header>
        <div class="support-chat-messages" id="supportChatMessages" aria-live="polite">
          <p class="support-message agent">Hello. Ask about products, delivery, a custom PC build, or payment options.</p>
        </div>
        <div class="support-chat-topics" aria-label="Common questions">
          <button type="button" data-chat-topic="Where is my order?">Order status</button>
          <button type="button" data-chat-topic="Can you help me choose a PC?">Choose a PC</button>
          <button type="button" data-chat-topic="What payment methods are available?">Payment options</button>
        </div>
        <form class="support-chat-form" id="supportChatForm">
          <label class="sr-only" for="supportChatInput">Your message</label>
          <input id="supportChatInput" type="text" placeholder="Type your question" autocomplete="off" required>
          <button type="submit">Send</button>
        </form>
      </section>
      <button class="support-chat-launcher" id="supportChatLauncher" type="button" aria-label="Chat with us" title="Chat with us" aria-expanded="false" aria-controls="supportChatPanel"><span class="chat-launcher-icon" aria-hidden="true"></span><span class="chat-launcher-label">Chat with us</span></button>
    </aside>
  `);

  const panel = document.querySelector("#supportChatPanel");
  const launcher = document.querySelector("#supportChatLauncher");
  const close = document.querySelector("#supportChatClose");
  const form = document.querySelector("#supportChatForm");
  const input = document.querySelector("#supportChatInput");
  const messages = document.querySelector("#supportChatMessages");

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.querySelector(".chat-launcher-label").textContent = open ? "Close chat" : "Chat with us";
    launcher.setAttribute("aria-label", open ? "Close chat" : "Chat with us");
    launcher.title = open ? "Close chat" : "Chat with us";
    if (open) input.focus();
  }

  function appendMessage(kind, text) {
    const message = document.createElement("p");
    message.className = `support-message ${kind}`;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function respond(message) {
    const normalized = message.toLowerCase();
    let reply = "Thanks for your message. This store assistant can point you to products, build advice, and support.";
    if (normalized.includes("order") || normalized.includes("deliver")) reply = "For delivery details, open Cart and continue to checkout. You can choose your province, city, and barangay there.";
    if (normalized.includes("payment") || normalized.includes("gcash") || normalized.includes("maya")) reply = "At checkout, you can choose Cash on Delivery, card payment, GCash, or Maya.";
    if (normalized.includes("pc") || normalized.includes("build") || normalized.includes("laptop")) reply = "For recommendations, browse Products or use Build Your Own PC to check compatible parts.";
    appendMessage("agent", reply);
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.querySelectorAll("[data-chat-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.chatTopic;
      appendMessage("visitor", question);
      respond(question);
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    appendMessage("visitor", message);
    input.value = "";
    respond(message);
  });
}

function wireStoreFooter() {
  document.querySelectorAll(".site-footer").forEach((footer) => {
    if (footer.dataset.storeFooter === "ready") return;
    footer.dataset.storeFooter = "ready";
    footer.id = "storeFooter";
    footer.innerHTML = `
      <div class="footer-main">
        <a class="footer-brand" href="index.html" aria-label="Bits and Bytes home">
          <img class="footer-brand-mark" src="images/branding/bitsandbyteslogo.png" alt="Bits and Bytes logo">
          <span><strong>Bits and Bytes</strong><small>PC and Laptop Store</small></span>
        </a>
        <section class="footer-location">
          <h2>Bits and Bytes Manila</h2>
          <p>Computer and laptop support desk<br>Quezon City, Metro Manila<br><a href="pages/contact.html">Contact customer service</a></p>
        </section>
        <section class="footer-location">
          <h2>Bits and Bytes Cebu</h2>
          <p>PC build and pickup support<br>Cebu City, Cebu<br><a href="pages/contact.html">Ask about availability</a></p>
        </section>
        <section class="footer-location">
          <h2>Online Store Support</h2>
          <p>Delivery, product advice, and checkout help<br>Philippines-wide service<br><a href="pages/contact.html">Send an inquiry</a></p>
        </section>
      </div>
      <div class="footer-bottom">
        <nav aria-label="Footer navigation">
          <a href="pages/about.html">About Us</a>
          <a href="pages/terms.html">Terms of Use</a>
          <a href="pages/warranty.html">Warranty Info</a>
          <a href="pages/downloads.html">Downloads</a>
          <a href="pages/contact.html">Contact Us</a>
          <a data-back-to-top href="#top">Back to top &uarr;</a>
        </nav>
        <div class="footer-social">
          <span>Follow us on</span>
          <div class="social-links" aria-label="Follow Bits and Bytes on social media">
            <a class="social-icon facebook" href="https://www.facebook.com/johncarlo.herrera.58" target="_blank" rel="noopener noreferrer" aria-label="Facebook: John Carlo Herrera" title="Facebook"><img src="images/social/facebook.svg" alt="" width="24" height="24"></a>
            <a class="social-icon instagram" href="https://www.instagram.com/jayzzzz0723/" target="_blank" rel="noopener noreferrer" aria-label="Instagram: jayzzzz0723" title="Instagram"><img src="images/social/instagram.svg" alt="" width="24" height="24"></a>
            <a class="social-icon x-twitter" href="https://x.com/Jayzee20202" target="_blank" rel="noopener noreferrer" aria-label="X: Jayzee20202" title="X"><img src="images/social/x.svg" alt="" width="24" height="24"></a>
            <a class="social-icon youtube" href="https://www.youtube.com/@johncarloherrera8540" target="_blank" rel="noopener noreferrer" aria-label="YouTube: johncarloherrera8540" title="YouTube"><img src="images/social/youtube.svg" alt="" width="24" height="24"></a>
          </div>
        </div>
        <p>&copy; 2026 Herrera Corporation. All rights reserved.</p>
      </div>
    `;
    // A base URL shares assets across pages; top links still target this page.
    footer.querySelector("[data-back-to-top]").href = window.location.href.split("#")[0] + "#top";
  });
}

function renderBuilder() {
  const form = document.querySelector("#pcBuilder");
  if (!form) return;

  const fields = document.querySelector("#builderFields");
  const categories = [
    ["cooling", "Cooling"],
    ["cpu", "Processor"],
    ["motherboard", "Motherboard"],
    ["gpu", "Graphics Card"],
    ["ram", "Memory"],
    ["storage", "Storage"],
    ["psu", "Power Supply"],
    ["case", "Case"],
    ["monitor", "Monitor"],
    ["keyboard", "Keyboard"],
    ["accessories", "Extra Accessory"]
  ];

  fields.innerHTML = categories.map(([key, label]) => `
    <div class="builder-choice" data-builder-choice="${key}">
      <label for="${key}">${label}</label>
      <select id="${key}" name="${key}">
        <option value="">Choose ${label}</option>
        ${pcParts[key].map((part, index) => `
          <option value="${index}">${part.name} - ${money(part.price)}</option>
        `).join("")}
      </select>
    </div>
  `).join("");

  fields.addEventListener("change", updateBuildSummary);
  document.querySelector("#addBuildToCart").addEventListener("click", addBuildToCart);
  wireBuilderTools();
  updateBuildSummary();
}

function wireBuilderTools() {
  const search = document.querySelector("#buildSearch");
  const choices = document.querySelectorAll("[data-builder-choice]");
  const presets = {
    student: { cooling: 0, cpu: 2, motherboard: 2, gpu: 0, ram: 0, storage: 0, psu: 0, case: 1, monitor: 0, keyboard: 0, accessories: 0 },
    gaming: { cooling: 1, cpu: 0, motherboard: 0, gpu: 1, ram: 1, storage: 1, psu: 1, case: 0, monitor: 1, keyboard: 1, accessories: 2 },
    creator: { cooling: 1, cpu: 3, motherboard: 2, gpu: 2, ram: 2, storage: 2, psu: 2, case: 2, monitor: 2, keyboard: 2, accessories: 1 }
  };

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    choices.forEach((choice) => {
      choice.hidden = query.length > 0 && !choice.textContent.toLowerCase().includes(query);
    });
  });

  document.querySelectorAll("[data-builder-part]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = document.querySelector(`#${button.dataset.builderPart}`);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll("[data-build-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      Object.entries(presets[button.dataset.buildPreset]).forEach(([key, value]) => {
        const field = document.querySelector(`#${key}`);
        if (field) field.value = value;
      });
      updateBuildSummary();
    });
  });
}

function selectedBuildParts() {
  const selected = {};
  Object.keys(pcParts).forEach((key) => {
    const field = document.querySelector(`#${key}`);
    if (field && field.value !== "") {
      selected[key] = pcParts[key][Number(field.value)];
    }
  });
  return selected;
}

function getCompatibilityMessages(parts) {
  const errors = [];
  const warnings = [];

  if (parts.cpu && parts.motherboard && parts.cpu.socket !== parts.motherboard.socket) {
    errors.push("CPU and motherboard sockets do not match.");
  }

  if (parts.ram && parts.motherboard && parts.ram.memory !== parts.motherboard.memory) {
    errors.push("RAM type does not match the motherboard memory type.");
  }

  if (parts.case && parts.motherboard && !parts.case.supports.includes(parts.motherboard.size)) {
    errors.push("The selected case does not support the motherboard size.");
  }

  if (parts.psu) {
    const cpuWatts = parts.cpu ? parts.cpu.watts : 0;
    const gpuWatts = parts.gpu ? parts.gpu.watts : 0;
    const estimatedWatts = cpuWatts + gpuWatts + 150;

    if (parts.psu.watts < estimatedWatts) {
      errors.push(`Power supply may be too weak. Estimated need is around ${estimatedWatts}W.`);
    } else if (parts.psu.watts - estimatedWatts < 100) {
      warnings.push("Power supply works, but there is not much room for future upgrades.");
    }
  }

  if (parts.gpu && parts.gpu.price === 0 && parts.cpu && parts.cpu.name.includes("7900X")) {
    warnings.push("A creator CPU without a dedicated GPU may feel limited for editing or 3D work.");
  }

  return { errors, warnings };
}

function updateBuildSummary() {
  const parts = selectedBuildParts();
  const buildList = document.querySelector("#buildList");
  const total = Object.values(parts).reduce((sum, part) => sum + part.price, 0);
  const result = getCompatibilityMessages(parts);
  const compatibilityBox = document.querySelector("#compatibilityBox");

  buildList.innerHTML = Object.entries(parts).map(([key, part]) => `
    <li><span>${key.toUpperCase()}: ${part.name}</span><strong>${money(part.price)}</strong></li>
  `).join("") || "<li>No parts selected yet.</li>";

  document.querySelector("#buildTotal").textContent = money(total);

  if (result.errors.length > 0) {
    compatibilityBox.className = "compatibility-box bad";
    compatibilityBox.innerHTML = `<strong>Compatibility problem:</strong><br>${result.errors.join("<br>")}`;
  } else if (result.warnings.length > 0) {
    compatibilityBox.className = "compatibility-box warning";
    compatibilityBox.innerHTML = `<strong>Compatible with notes:</strong><br>${result.warnings.join("<br>")}`;
  } else if (Object.keys(parts).length > 0) {
    compatibilityBox.className = "compatibility-box good";
    compatibilityBox.textContent = "All selected parts look compatible.";
  } else {
    compatibilityBox.className = "compatibility-box good";
    compatibilityBox.textContent = "Choose parts to begin.";
  }
}

function addBuildToCart() {
  const parts = selectedBuildParts();
  const result = getCompatibilityMessages(parts);

  if (Object.keys(parts).length < 6) {
    alert("Please choose the main PC parts before adding the build.");
    return;
  }

  if (result.errors.length > 0) {
    alert("Please fix compatibility problems first.");
    return;
  }

  const total = Object.values(parts).reduce((sum, part) => sum + part.price, 0);
  addToCart({
    id: `custom-build-${Date.now()}`,
    name: "Custom Bits and Bytes PC Build",
    type: "Desktop PC",
    use: "Custom",
    brand: "Bits and Bytes",
    price: total,
    image: "images/products/legacy/custom-pc-build.jpg",
    specs: Object.values(parts).map((part) => part.name).join(", ")
  });
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  if (!cartItems) return;

  const clearButton = document.querySelector("#clearCart");

  function render() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.querySelector("#cartTotal").textContent = money(total);
    const checkout = document.getElementById("checkoutButton");
    if (checkout) checkout.disabled = cart.length === 0;
    if (!cart.length) document.getElementById("checkoutPanel").hidden = true;

    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${item.specs}</p>
          <div class="cart-item-actions">
            <div class="cart-item-price">${productPriceMarkup(item, { showBadge: false })}<small>each</small></div>
            <label class="cart-quantity">Quantity
              <input type="number" min="1" max="${item.stock ?? 999}" step="1" value="${item.quantity}" data-cart-quantity="${item.id}" aria-label="Quantity for ${item.name}">
            </label>
            <strong class="cart-line-total">${money(item.price * item.quantity)}</strong>
            <button class="remove-item-button" data-remove-product="${item.id}" type="button" aria-label="Remove ${item.name} from cart">Remove item</button>
          </div>
        </div>
      </article>
    `).join("") || "<p>Your cart is empty. Add products or create a custom build.</p>";

    cartItems.querySelectorAll("[data-cart-quantity]").forEach((input) => {
      input.addEventListener("change", () => {
        const cart = getCart();
        const item = cart.find((item) => item.id === input.dataset.cartQuantity);
        const otherQuantity = cart.filter((other) => other.id !== item.id && sameStockItem(other, item))
          .reduce((sum, other) => sum + other.quantity, 0);
        item.quantity = wholeQuantity(input.value, Math.max(0, (item.stock ?? 999) - otherQuantity));
        saveCart(cart.filter((item) => item.quantity > 0));
        render();
        const status = document.getElementById("cartUpdateStatus");
        if (status) status.textContent = `${item.name}: quantity updated to ${item.quantity}.`;
        const updatedInput = Array.from(cartItems.querySelectorAll("[data-cart-quantity]"))
          .find((control) => control.dataset.cartQuantity === item.id);
        updatedInput?.focus({ preventScroll: true });
      });
    });

    document.querySelectorAll("[data-remove-product]").forEach((button) => {
      button.addEventListener("click", () => {
        const updatedCart = getCart().filter((item) => item.id !== button.dataset.removeProduct);
        saveCart(updatedCart);
        render();
      });
    });
  }

  clearButton.addEventListener("click", () => {
    saveCart([]);
    render();
  });

  render();
}

function wireDeliveryCheckout() {
  const checkoutButton = document.querySelector("#checkoutButton");
  const checkoutPanel = document.querySelector("#checkoutPanel");
  const form = document.querySelector("#deliveryCheckoutForm");
  if (!checkoutButton || !checkoutPanel || !form) return;

  const locations = {
    "Metro Manila": {
      "Quezon City": { barangays: ["Bagumbayan", "Commonwealth", "Holy Spirit"], postalCode: "1100" },
      "Makati City": { barangays: ["Bel-Air", "Poblacion", "San Antonio"], postalCode: "1200" },
      "Manila City": { barangays: ["Ermita", "Malate", "Sampaloc"], postalCode: "1000" }
    },
    "Cavite": {
      "Bacoor City": { barangays: ["Alima", "Molino III", "Talaba VII"], postalCode: "4102" },
      "Dasmarinas City": { barangays: ["Burol", "Paliparan I", "Salawag"], postalCode: "4114" }
    },
    "Cebu": {
      "Cebu City": { barangays: ["Apas", "Lahug", "Mabolo"], postalCode: "6000" },
      "Lapu-Lapu City": { barangays: ["Basak", "Maribago", "Pusok"], postalCode: "6015" }
    },
    "Iloilo": {
      "Iloilo City": { barangays: ["Jaro", "Mandurriao", "Molo"], postalCode: "5000" },
      "Pavia": { barangays: ["Agtabo", "Pagsanga-an", "Pandac"], postalCode: "5001" }
    },
    "Davao del Sur": {
      "Davao City": { barangays: ["Buhangin", "Matina", "Talomo"], postalCode: "8000" },
      "Digos City": { barangays: ["Aplaya", "Dawis", "San Jose"], postalCode: "8002" }
    }
  };

  const provinceSelect = document.querySelector("#provinceSelect");
  const citySelect = document.querySelector("#citySelect");
  const barangaySelect = document.querySelector("#barangaySelect");
  const postalCode = document.querySelector("#postalCode");
  const paymentDetail = document.querySelector("#paymentDetail");
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');

  function setOptions(select, placeholder, values) {
    select.innerHTML = `<option value="">${placeholder}</option>${values.map((value) => `<option value="${value}">${value}</option>`).join("")}`;
  }

  setOptions(provinceSelect, "Select province or region", Object.keys(locations));

  provinceSelect.addEventListener("change", () => {
    const cities = provinceSelect.value ? Object.keys(locations[provinceSelect.value]) : [];
    setOptions(citySelect, "Select city or municipality", cities);
    setOptions(barangaySelect, "Select city first", []);
    citySelect.disabled = cities.length === 0;
    barangaySelect.disabled = true;
    postalCode.value = "";
  });

  citySelect.addEventListener("change", () => {
    const selectedCity = locations[provinceSelect.value]?.[citySelect.value];
    const barangays = selectedCity ? selectedCity.barangays : [];
    setOptions(barangaySelect, "Select barangay", barangays);
    barangaySelect.disabled = barangays.length === 0;
    postalCode.value = selectedCity ? selectedCity.postalCode : "";
  });

  function continueToCheckout() {
    if (getCart().length === 0) {
      alert("Your cart is empty. Add an item before continuing to delivery.");
      return;
    }
    if (!getSignedInUser()) {
      openAccountDialog("login", continueToCheckout);
      return;
    }
    checkoutPanel.hidden = false;
    const email = document.getElementById("checkoutEmail");
    if (!email.value) email.value = getSignedInUser().email;
    checkoutPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  checkoutButton.addEventListener("click", continueToCheckout);
  window.addEventListener("store-account-change", () => {
    if (!getSignedInUser()) checkoutPanel.hidden = true;
  });

  function updatePaymentDetail() {
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (method === "Card Payment") {
      paymentDetail.innerHTML = `
        <div class="payment-detail-heading">
          <div><strong>Card information</strong><small>Enter the details shown on your card.</small></div>
          <div class="card-network-logos" aria-label="Accepted card networks">
            <span class="card-logo mastercard" data-card-brand="mastercard" title="Mastercard"><i></i><i></i><b>Mastercard</b></span>
            <span class="card-logo visa" data-card-brand="visa" title="Visa">VISA</span>
            <span class="card-logo amex" data-card-brand="amex" title="American Express">AMEX</span>
            <span class="card-logo jcb" data-card-brand="jcb" title="JCB">JCB</span>
          </div>
        </div>
        <label for="cardholderName">Name on card</label>
        <input id="cardholderName" type="text" autocomplete="cc-name" placeholder="Full name as shown on card" required>
        <label for="cardNumber">Card number</label>
        <div class="card-number-field">
          <input id="cardNumber" type="text" autocomplete="cc-number" inputmode="numeric" maxlength="19" pattern="[0-9 ]{15,19}" placeholder="1234 5678 9012 3456" required>
          <span id="detectedCardBrand">Card</span>
        </div>
        <div class="payment-field-grid">
          <div>
            <label for="cardExpiry">Expiration date</label>
            <input id="cardExpiry" type="text" autocomplete="cc-exp" inputmode="numeric" maxlength="7" pattern="(0[1-9]|1[0-2]) \/ [0-9]{2}" placeholder="MM / YY" required>
          </div>
          <div>
            <label for="cardSecurityCode">Security code</label>
            <input id="cardSecurityCode" type="password" autocomplete="cc-csc" inputmode="numeric" maxlength="4" pattern="[0-9]{3,4}" placeholder="CVC" required>
          </div>
        </div>
        <div class="supported-bank-row" aria-label="Examples of supported Philippine card issuers">
          <span>Common card issuers</span>
          <b class="bank-mark bdo">BDO</b>
          <b class="bank-mark bpi">BPI</b>
          <b class="bank-mark metrobank">Metrobank</b>
          <b class="bank-mark unionbank">UnionBank</b>
        </div>
        <label class="billing-address-toggle" for="billingSameAsDelivery">
          <input id="billingSameAsDelivery" type="checkbox" checked>
          <span>Billing address is the same as the delivery address</span>
        </label>
        <div class="billing-address-fields" id="billingAddressFields" hidden>
          <label for="billingAddress">Billing address</label>
          <input id="billingAddress" type="text" autocomplete="billing address-line1" placeholder="House number, street, city, and postal code">
        </div>
        <p class="payment-security-note">Card details are checked on this device only. No payment is processed, stored, or transmitted.</p>
      `;
    } else if (method === "E-wallet") {
      paymentDetail.innerHTML = `
        <div class="payment-detail-heading"><div><strong>E-wallet information</strong><small>Use the mobile number registered to your wallet.</small></div></div>
        <fieldset class="wallet-provider-options">
          <legend>Choose an e-wallet</legend>
          <label class="wallet-provider-card">
            <input type="radio" name="walletProvider" value="GCash" checked required>
            <span class="wallet-logo gcash" aria-hidden="true">GCash</span>
            <span><strong>GCash</strong><small>Pay using your GCash account</small></span>
          </label>
          <label class="wallet-provider-card">
            <input type="radio" name="walletProvider" value="Maya" required>
            <span class="wallet-logo maya" aria-hidden="true">Maya</span>
            <span><strong>Maya</strong><small>Pay using your Maya wallet</small></span>
          </label>
        </fieldset>
        <div class="payment-field-grid">
          <div>
            <label for="walletAccountName">Account name</label>
            <input id="walletAccountName" type="text" autocomplete="name" placeholder="Registered full name" required>
          </div>
          <div>
            <label for="walletMobile">Registered mobile number</label>
            <input id="walletMobile" type="tel" autocomplete="tel" inputmode="numeric" maxlength="11" pattern="09[0-9]{9}" placeholder="0917 123 4567" required>
          </div>
        </div>
        <p class="payment-security-note">A real store would redirect you to the selected wallet for secure authorization and OTP confirmation.</p>
      `;
    } else {
      paymentDetail.innerHTML = `
        <div class="cod-payment-message">
          <span class="cod-payment-mark" aria-hidden="true">COD</span>
          <div><strong>Pay when your order arrives</strong><p>Prepare the exact amount or follow the courier's accepted payment instructions. Some high-value orders may require confirmation before dispatch.</p></div>
        </div>
      `;
    }

    wirePaymentDetailFields();
  }

  function wirePaymentDetailFields() {
    const cardNumber = document.querySelector("#cardNumber");
    const cardExpiry = document.querySelector("#cardExpiry");
    const securityCode = document.querySelector("#cardSecurityCode");
    const billingSame = document.querySelector("#billingSameAsDelivery");
    const billingFields = document.querySelector("#billingAddressFields");
    const billingAddress = document.querySelector("#billingAddress");
    const walletMobile = document.querySelector("#walletMobile");

    cardNumber?.addEventListener("input", () => {
      const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
      cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
      let brand = "Card";
      let brandKey = "";
      if (/^4/.test(digits)) { brand = "Visa"; brandKey = "visa"; }
      else if (/^(5[1-5]|2[2-7])/.test(digits)) { brand = "Mastercard"; brandKey = "mastercard"; }
      else if (/^3[47]/.test(digits)) { brand = "Amex"; brandKey = "amex"; }
      else if (/^35/.test(digits)) { brand = "JCB"; brandKey = "jcb"; }
      document.querySelector("#detectedCardBrand").textContent = brand;
      document.querySelectorAll("[data-card-brand]").forEach((logo) => logo.classList.toggle("detected", logo.dataset.cardBrand === brandKey));
    });

    cardExpiry?.addEventListener("input", () => {
      const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
      cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
    });

    securityCode?.addEventListener("input", () => {
      securityCode.value = securityCode.value.replace(/\D/g, "").slice(0, 4);
    });

    walletMobile?.addEventListener("input", () => {
      walletMobile.value = walletMobile.value.replace(/\D/g, "").slice(0, 11);
    });

    billingSame?.addEventListener("change", () => {
      billingFields.hidden = billingSame.checked;
      billingAddress.required = !billingSame.checked;
      if (!billingAddress.required) billingAddress.value = "";
    });
  }

  paymentMethods.forEach((method) => method.addEventListener("change", updatePaymentDetail));
  updatePaymentDetail();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // Recheck at submission as well as when the delivery panel is opened.
    if (!getSignedInUser()) {
      checkoutPanel.hidden = true;
      openAccountDialog("login", continueToCheckout);
      return;
    }
    if (!getCart().length) return;
    const address = `${document.querySelector("#streetAddress").value}, ${barangaySelect.value}, ${citySelect.value}, ${provinceSelect.value} ${postalCode.value}`;
    const method = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    const provider = document.querySelector('input[name="walletProvider"]:checked')?.value;
    const cardDigits = document.querySelector("#cardNumber")?.value.replace(/\D/g, "");
    const paymentText = provider ? `${method} (${provider})` : cardDigits ? `${method} ending in ${cardDigits.slice(-4)}` : method;
    alert(`Order review ready for: ${address}\nPreferred payment method: ${paymentText}\nNo order has been sent and no payment has been taken.`);
  });
}

// Local demo accounts only. Production authentication must be checked by a server.
function getDemoAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem("bitsAndBytesAccounts"));
    return Array.isArray(accounts) ? accounts : [];
  } catch { return []; }
}

function getSignedInUser() {
  try {
    const email = sessionStorage.getItem("bitsAndBytesSignedInEmail");
    const account = getDemoAccounts().find((account) => account.email === email);
    return account ? { name: account.name, email: account.email } : null;
  } catch { return null; }
}

async function hashAccountPassword(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error("Please open the store using HTTPS, localhost, or its original HTML files to sign in securely.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signInDemoAccount(email, password) {
  const account = getDemoAccounts().find((account) => account.email === email.trim().toLowerCase());
  if (!account || await hashAccountPassword(password, account.salt) !== account.passwordHash) {
    throw new Error("Email or password is incorrect. Register first if you do not have an account on this device.");
  }
  sessionStorage.setItem("bitsAndBytesSignedInEmail", account.email);
  window.dispatchEvent(new Event("store-account-change"));
}

async function registerDemoAccount(name, email, password) {
  const accounts = getDemoAccounts();
  email = email.trim().toLowerCase();
  if (!name.trim()) throw new Error("Please enter your name.");
  if (password.length < 8) throw new Error("Use at least 8 characters for your password.");
  if (accounts.some((account) => account.email === email)) throw new Error("This email already has a local account. Please sign in.");
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const passwordHash = await hashAccountPassword(password, salt);
  accounts.push({ name: name.trim(), email, salt, passwordHash });
  localStorage.setItem("bitsAndBytesAccounts", JSON.stringify(accounts));
  sessionStorage.setItem("bitsAndBytesSignedInEmail", email);
  window.dispatchEvent(new Event("store-account-change"));
}

function updateAccountState() {
  const user = getSignedInUser();
  document.querySelectorAll('.foldable-nav a[href="pages/login.html"]').forEach((link) => {
    link.textContent = user ? "My account" : "Login";
  });
  const accountPanel = document.getElementById("signedInAccount");
  if (accountPanel) {
    accountPanel.hidden = !user;
    document.getElementById("loginForm").hidden = !!user;
    document.getElementById("signedInEmail").textContent = user ? `${user.name} (${user.email})` : "";
  }
}

function openAccountDialog(mode = "login", onSuccess) {
  // Native dialog keeps focus inside the popup and supports Escape to cancel.
  document.getElementById("accountDialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "accountDialog";
  dialog.className = "account-dialog";
  dialog.setAttribute("aria-labelledby", "accountDialogTitle");
  dialog.setAttribute("aria-describedby", "accountDialogDescription");
  dialog.innerHTML = `
    <button class="account-dialog-close" type="button" aria-label="Close account popup" title="Close">&times;</button>
    <p class="eyebrow">Bits and Bytes / Account</p>
    <h2 id="accountDialogTitle">Sign in to continue</h2>
    <p id="accountDialogDescription">Keep your cart ready for checkout.</p>
    <div class="account-mode-switch" role="group" aria-label="Account action">
      <button type="button" data-account-mode="login">Login</button>
      <button type="button" data-account-mode="register">Register</button>
    </div>
    <form id="accountDialogForm">
      <div id="accountNameField" hidden><label for="accountName">Name</label><input id="accountName" autocomplete="name" maxlength="100"></div>
      <label for="accountEmail">Email address</label>
      <input id="accountEmail" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" autofocus>
      <label for="accountPassword">Password</label>
      <div class="account-password-field"><input id="accountPassword" type="password" autocomplete="current-password" required maxlength="128"><button type="button" id="accountShowPassword" aria-label="Show password">Show</button></div>
      <div id="accountConfirmField" hidden><label for="accountConfirm">Confirm password</label><input id="accountConfirm" type="password" autocomplete="new-password" maxlength="128"></div>
      <p id="accountDialogError" class="account-error" role="alert"></p>
      <button class="button primary full-width" id="accountDialogSubmit" type="submit">Login</button>
    </form>
    <p class="account-demo-note">Your account is saved on this device. Use a password unique to this store.</p>`;
  document.body.appendChild(dialog);
  const form = dialog.querySelector("form");
  const password = dialog.querySelector("#accountPassword");
  const confirm = dialog.querySelector("#accountConfirm");
  const error = dialog.querySelector("#accountDialogError");
  const submit = dialog.querySelector("#accountDialogSubmit");

  function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === "register";
    dialog.querySelector("#accountNameField").hidden = !registering;
    dialog.querySelector("#accountName").required = registering;
    dialog.querySelector("#accountConfirmField").hidden = !registering;
    confirm.required = registering;
    confirm.setCustomValidity("");
    password.minLength = registering ? 8 : 1;
    password.autocomplete = registering ? "new-password" : "current-password";
    password.value = "";
    confirm.value = "";
    error.textContent = "";
    dialog.querySelector("#accountDialogTitle").textContent = registering ? "Create your account" : "Sign in to continue";
    submit.textContent = registering ? "Create account" : "Login";
    dialog.querySelectorAll("[data-account-mode]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.accountMode === mode));
    });
  }
  dialog.querySelectorAll("[data-account-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.accountMode)));
  dialog.querySelector(".account-dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector("#accountShowPassword").addEventListener("click", (event) => {
    const visible = password.type === "password";
    password.type = visible ? "text" : "password";
    event.currentTarget.textContent = visible ? "Hide" : "Show";
    event.currentTarget.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  });
  confirm.addEventListener("input", () => confirm.setCustomValidity(""));
  password.addEventListener("input", () => confirm.setCustomValidity(""));
  dialog.addEventListener("close", () => {
    document.body.classList.remove("account-popup-open");
    dialog.remove();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    if (mode === "register" && password.value !== confirm.value) {
      confirm.setCustomValidity("Passwords do not match.");
      confirm.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    submit.disabled = true;
    dialog.querySelectorAll("[data-account-mode]").forEach((button) => { button.disabled = true; });
    try {
      const email = dialog.querySelector("#accountEmail").value;
      if (mode === "register") await registerDemoAccount(dialog.querySelector("#accountName").value, email, password.value);
      else await signInDemoAccount(email, password.value);
      if (dialog.open) {
        dialog.close();
        if (onSuccess) onSuccess();
      }
    } catch (problem) {
      error.textContent = problem.message;
    } finally {
      submit.disabled = false;
      dialog.querySelectorAll("[data-account-mode]").forEach((button) => { button.disabled = false; });
    }
  });
  setMode(mode);
  dialog.querySelector("#accountEmail").value = localStorage.getItem("bitsAndBytesRememberedEmail") || "";
  dialog.showModal();
  document.body.classList.add("account-popup-open");
}

function wireLoginForm() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  const password = document.querySelector("#loginPassword");
  const togglePassword = document.querySelector("#togglePassword");
  const message = document.querySelector("#loginMessage");
  const email = document.getElementById("loginEmail");
  const remember = document.getElementById("rememberMe");
  email.value = localStorage.getItem("bitsAndBytesRememberedEmail") || "";
  remember.checked = email.value !== "";

  togglePassword.addEventListener("click", () => {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    togglePassword.querySelector("img").src = visible ? "images/icons/eye.svg" : "images/icons/eye-off.svg";
    togglePassword.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    togglePassword.setAttribute("title", visible ? "Show password" : "Hide password");
    togglePassword.setAttribute("aria-pressed", String(!visible));
  });

  document.getElementById("openRegistration").addEventListener("click", () => openAccountDialog("register"));
  document.getElementById("signOutAccount").addEventListener("click", () => {
    sessionStorage.removeItem("bitsAndBytesSignedInEmail");
    password.value = "";
    message.textContent = "You have signed out. Your cart is still saved on this device.";
    window.dispatchEvent(new Event("store-account-change"));
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    // Remember only the email preference. Never store a password in the browser.
    if (remember.checked) localStorage.setItem("bitsAndBytesRememberedEmail", email.value);
    else localStorage.removeItem("bitsAndBytesRememberedEmail");
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await signInDemoAccount(email.value, password.value);
      password.value = "";
      message.textContent = "You are signed in on this device.";
    } catch (problem) {
      message.textContent = problem.message;
    } finally { submit.disabled = false; }
  });
}

function renderComponentGuide() {
  const guide = document.querySelector(".interactive-layout:not([hidden])");
  const info = guide?.querySelector("#partInfo");
  if (!info) return;
  const mapImages = document.querySelectorAll(".component-map-image[usemap]");

  function setPart(partKey, device = "Computer") {
    const part = componentInfo[partKey];
    if (!part) return;
    info.innerHTML = `
      <p class="eyebrow">Selected ${device} component</p>
      <h2>${part.title}</h2>
      <p>${part.text}</p>
      <div class="tip-box"><strong>Tip:</strong> ${part.tip}</div>
    `;

    document.querySelectorAll(".part-legend-button").forEach((control) => {
      const active = control.dataset.part === partKey && control.dataset.device === device;
      control.classList.toggle("active", active);
      control.setAttribute("aria-pressed", String(active));
    });
  }

  document.querySelectorAll(".part-legend-button, .component-map-frame area").forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      setPart(control.dataset.part, control.dataset.device);
      if (window.innerWidth <= 900 && control.tagName === "AREA") {
        info.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  function resizeImageMap(image) {
    if (!image.naturalWidth || !image.clientWidth) return;
    const mapName = image.getAttribute("usemap").replace("#", "");
    const areas = document.querySelectorAll(`map[name="${mapName}"] area[data-original-coords]`);
    const xScale = image.clientWidth / image.naturalWidth;
    const yScale = image.clientHeight / image.naturalHeight;

    areas.forEach((area) => {
      const original = area.dataset.originalCoords.split(",").map(Number);
      area.coords = original.map((coordinate, index) => Math.round(coordinate * (index % 2 === 0 ? xScale : yScale))).join(",");
    });
  }

  mapImages.forEach((image) => {
    image.addEventListener("load", () => resizeImageMap(image));
    if (image.complete) resizeImageMap(image);
  });
  window.addEventListener("resize", () => mapImages.forEach(resizeImageMap));

  setPart("cpu", "Desktop PC");
}

function wireFocusedComponentMaps() {
  const images = document.querySelectorAll(".focused-map-image[data-responsive-map][usemap]");
  if (!images.length) return;

  function resizeMap(image) {
    if (!image.naturalWidth || !image.clientWidth) return;
    const mapName = image.getAttribute("usemap").slice(1);
    const areas = document.querySelectorAll(`map[name="${mapName}"] area[data-original-coords]`);
    const xScale = image.clientWidth / image.naturalWidth;
    const yScale = image.clientHeight / image.naturalHeight;

    areas.forEach((area) => {
      area.coords = area.dataset.originalCoords
        .split(",")
        .map((coordinate, index) => Math.round(Number(coordinate) * (index % 2 === 0 ? xScale : yScale)))
        .join(",");
    });
  }

  images.forEach((image) => {
    image.addEventListener("load", () => resizeMap(image));
    if (image.complete) resizeMap(image);
  });
  window.addEventListener("resize", () => images.forEach(resizeMap));
}

function wirePeripheralForm() {
  const form = document.querySelector("#peripheralForm");
  if (!form) return;

  const chooseButton = document.querySelector("#choosePeripherals");
  const checkboxes = form.querySelectorAll('input[name="Peripherals"]');
  const browserInput = form.querySelector('input[name="myBrowser"]');

  chooseButton.addEventListener("click", () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });

    const gamingSetup = form.querySelector('input[name="deviceType"][value="Gaming Setup"]');
    if (gamingSetup) {
      gamingSetup.checked = true;
    }

    if (browserInput) {
      browserInput.value = "Google Chrome";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selected.length === 0) {
      alert("Please choose at least one PC/Laptop peripheral.");
      return;
    }

    const deviceType = form.querySelector('input[name="deviceType"]:checked');
    const browser = browserInput && browserInput.value ? browserInput.value : "No browser selected";

    alert(`Selected peripherals: ${selected.join(", ")}\nComputer type: ${deviceType.value}\nBrowser: ${browser}`);
  });
}

wireFoldableNavigation();
wireStoreControls();
wireStickyStoreHeader();
wireHomeVideo();
wireBackgroundMusic();
wirePartnersDialog();
wirePromoCarousel();
wireReviewCarousel();
wireSupportChat();
document.addEventListener("DOMContentLoaded", wireStoreFooter);
updateCartCount();
updateWishlistCount();
wireQuickOrder();
renderFeaturedProducts();
renderProductsPage();
wireMobileFilters();
renderProductDetail();
renderWishlist();
renderBuilder();
renderCart();
wireDeliveryCheckout();
wireLoginForm();
window.addEventListener("store-account-change", updateAccountState);
updateAccountState();
renderComponentGuide();
wireFocusedComponentMaps();
wirePeripheralForm();
