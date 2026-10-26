// Shared helper functions used by all pages.
function getCart() {
  let savedCart;
  try { savedCart = JSON.parse(localStorage.getItem("bitsAndBytesCart")); }
  catch { return []; }
  if (!Array.isArray(savedCart)) return [];

  return savedCart.filter(item => item && typeof item.id === "string").map((item) => {
    const currentProduct = typeof catalogProducts === "function"
      ? catalogProducts().find((product) => product.id === (item.baseProductId || item.id))
      : undefined;

    if (!currentProduct) return item;
    if (item.isConfigured) return { ...item, image: productWithVariant(currentProduct, item.variantId).image };
    return { ...item, ...productWithVariant(currentProduct, item.variantId), quantity: item.quantity };
  }).filter(item => typeof item.name === "string" && Number.isFinite(item.price) && item.price >= 0 && Number.isSafeInteger(item.quantity) && item.quantity > 0);
}

function saveCart(cart) {
  localStorage.setItem("bitsAndBytesCart", JSON.stringify(cart));
  updateCartCount();
}

function getWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(wishlistStorageKey()));
    return Array.isArray(saved) ? saved.filter(id => typeof id === "string") : [];
  } catch { return []; }
}

function wishlistStorageKey() {
  const user = getSignedInUser();
  return user ? "bitsAndBytesWishlist:" + user.email : "bitsAndBytesWishlist";
}

function adoptGuestWishlist() {
  const key = wishlistStorageKey();
  if (key === "bitsAndBytesWishlist") return;
  try {
    const guest = JSON.parse(localStorage.getItem("bitsAndBytesWishlist")) || [];
    if (!Array.isArray(guest) || !guest.length) return;
    saveWishlist([...new Set([...getWishlist(), ...guest.filter(id => typeof id === "string")])]);
    localStorage.removeItem("bitsAndBytesWishlist");
  } catch { /* Keep the guest list intact if browser storage is unavailable. */ }
}

function saveWishlist(wishlist) {
  localStorage.setItem(wishlistStorageKey(), JSON.stringify(wishlist));
  updateWishlistCount();
  window.dispatchEvent(new Event("store-wishlist-change"));
}

// Display-only conversion settings, not live exchange rates. Orders are paid in PHP.
const displayCurrencyRates = { PHP: 1, USD: 1 / 57, JPY: 2.6, EUR: 0.016, CNY: 0.123 };

function currencyPreference() {
  const saved = localStorage.getItem("bitsAndBytesCurrency");
  return Object.hasOwn(displayCurrencyRates, saved) ? saved : "PHP";
}

function money(amount) {
  const currency = currencyPreference();
  const convertedAmount = amount * displayCurrencyRates[currency];
  const locale = typeof storeLocale === "function" ? storeLocale() : "en-PH";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: ["EUR", "CNY"].includes(currency) ? 2 : 0
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

// Small confirmations do not interrupt shopping or move keyboard focus.
function animateStoreElement(element, keyframes) {
  if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  element.getAnimations().forEach(animation => animation.cancel());
  element.animate(keyframes, { duration: 480, easing: "cubic-bezier(.2,.8,.3,1)" });
}

function showShoppingFeedback(title, productName, destination = "cart", note = "") {
  let toast = document.getElementById("shoppingFeedback");
  if (!toast) {
    toast = document.createElement("aside");
    toast.id = "shoppingFeedback";
    toast.className = "shopping-feedback";
    toast.hidden = true;
    toast.innerHTML = `<img class="shopping-feedback-icon" width="24" height="24" alt="">
      <div class="shopping-feedback-copy" role="status" aria-live="polite" aria-atomic="true"><strong></strong><p translate="no"></p><small></small></div>
      <a class="shopping-feedback-link"></a>
      <button class="shopping-feedback-close" type="button" aria-label="Close" title="Close">&times;</button>`;
    toast.dismiss = () => {
      clearTimeout(toast.dismissTimer);
      toast.classList.remove("is-visible");
      clearTimeout(toast.hideTimer);
      toast.hideTimer = setTimeout(() => { toast.hidden = true; }, 220);
    };
    toast.scheduleDismiss = () => {
      clearTimeout(toast.dismissTimer);
      toast.dismissTimer = setTimeout(toast.dismiss, 6000);
    };
    toast.querySelector("button").addEventListener("click", toast.dismiss);
    toast.addEventListener("pointerenter", () => clearTimeout(toast.dismissTimer));
    toast.addEventListener("pointerleave", () => {
      if (!toast.contains(document.activeElement)) toast.scheduleDismiss();
    });
    toast.addEventListener("focusin", () => clearTimeout(toast.dismissTimer));
    toast.addEventListener("focusout", event => {
      if (!toast.contains(event.relatedTarget)) toast.scheduleDismiss();
    });
  }
  // A quick-view dialog is in the browser's top layer; keep its confirmation visible.
  (document.querySelector("dialog[open]") || document.body).append(toast);
  clearTimeout(toast.hideTimer);
  const text = value => typeof storeText === "function" ? storeText(value) : value;
  toast.querySelector("strong").textContent = text(title);
  toast.querySelector("p").textContent = productName;
  toast.querySelector("small").textContent = note;
  toast.querySelector("small").hidden = !note;
  toast.querySelector("img").src = destination === "wishlist" ? "images/icons/heart.svg" : "images/icons/shopping-cart.svg";
  const link = toast.querySelector("a");
  link.href = destination === "wishlist" ? "pages/wishlist.html" : "pages/cart.html";
  link.textContent = text(destination === "wishlist" ? "View wishlist" : "View cart");
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  toast.scheduleDismiss();
}

function wireDeliveryMap() {
  const map = document.getElementById("deliveryGoogleMap");
  const link = document.getElementById("deliveryGoogleMapLink");
  if (!map || !link) return;
  function updateMap() {
    // Share only the general delivery area, not the customer's name or street address.
    const country = document.getElementById("countryRegion")?.value || "Philippines";
    const international = country !== "Philippines";
    const city = document.getElementById(international ? "internationalCity" : "citySelect")?.value;
    const province = document.getElementById(international ? "internationalRegion" : "provinceSelect")?.value;
    const area = [city, province, country].filter(Boolean).join(", ");
    const pickup = selectedFulfillment() === "pickup";
    const query = encodeURIComponent(pickup ? storePickupLocation.lat + "," + storePickupLocation.lng : area);
    link.href = "https://www.google.com/maps/search/?api=1&query=" + query;
    const source = "https://www.google.com/maps?q=" + query + "&output=embed";
    if (map.getAttribute("src") !== source) map.src = source;
    map.title = pickup ? "Google Maps fictional store pickup location" : "Google Maps delivery area: " + area;
    document.getElementById("deliveryMapCaption").textContent = pickup
      ? "Fictional collection point near Calamba City. Not an operating store."
      : area;
  }
  document.getElementById("deliveryCheckoutForm")?.addEventListener("change", event => {
    if (["provinceSelect", "citySelect", "countryRegion", "internationalRegion", "internationalCity", "checkoutSavedAddress"].includes(event.target.id)) updateMap();
  });
  window.addEventListener("store-destination-change", updateMap);
  updateMap();
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
  showShoppingFeedback("Added to your cart", product.name, "cart", stockNote.trim());
  animateStoreElement(document.querySelector(".cart-pill"), [
    { transform: "scale(1)" }, { transform: "scale(1.12)", offset: .4 }, { transform: "scale(1)" }
  ]);
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

// Some size options are different models, so their descriptions need their own source.
function productDescriptionFor(productId, variantId) {
  const entry = productDescriptions[productId];
  if (!entry) return {};
  const copy = { ...entry, ...entry.variants?.[variantId] };
  return {
    description: copy.description,
    descriptionSource: copy.source,
    descriptionNote: copy.note || "",
    ...(copy.specs ? { specs: copy.specs } : {})
  };
}

function catalogProducts() {
  return [...products, ...computerPartProducts].map((product) => {
    const media = productMedia[product.id] || {};
    const variants = productVariants[product.id];
    const defaultVariant = variants?.options.find((option) => option.id === variants.defaultId);
    return {
      ...product, ...media, ...defaultVariant,
      ...productDescriptionFor(product.id, variants?.defaultId), id: product.id, variants,
      image: defaultVariant?.image || media.image || product.image,
      photoCapacity: defaultVariant?.photoCapacity || product.photoCapacity,
      moduleLayout: defaultVariant?.moduleLayout || product.moduleLayout
    };
  });
}

// Stable IDs keep capacities and colors separate in the saved cart.
function productWithVariant(product, variantId) {
  if (!product.variants) return product;
  const variant = product.variants.options.find((option) => option.id === (variantId || product.variants.defaultId));
  if (!variant) return productWithVariant(product, product.variants.defaultId);
  const familyName = product.name.replace(/\b(?:8|16|32|64|128)GB\s*/i, "").trim();
  return {
    ...product, ...variant, ...productDescriptionFor(product.baseProductId || product.id, variant.id),
    gallery: variant.gallery || (variant.image && variant.image !== product.image ? undefined : product.gallery),
    id: `${product.id}::${variant.id}`, baseProductId: product.id, variantId: variant.id,
    name: variant.name || `${familyName} - ${variant.label}`, originalPrice: product.variants.kind === "color" ? product.originalPrice : undefined
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
  if (product.variants.kind === "color") {
    const selected = product.variants.options.find(option => option.id === selectedId);
    return `<div class="color-variant-picker"><p>Color: <strong data-selected-color>${selected.label}</strong></p>
      <div class="color-swatches" role="group" aria-label="Color for ${product.name}">
        ${product.variants.options.map(option => `<button type="button" class="color-swatch" data-product-color="${option.id}" aria-label="Color: ${option.label}" title="${option.label}" aria-pressed="${option.id === selectedId}">${option.swatches.map(color => `<span style="background-color:${color}"></span>`).join("")}</button>`).join("")}
      </div><select ${id ? `id="${id}"` : ""} data-product-variant="${product.id}" aria-label="Product color" hidden>${product.variants.options.map(option => `<option value="${option.id}" ${option.id === selectedId ? "selected" : ""}>${option.label}</option>`).join("")}</select></div>`;
  }
  return `<label class="product-variant-picker">${product.variants.label}
    <select ${id ? `id="${id}"` : ""} data-product-variant="${product.id}" aria-label="${product.variants.label} for ${product.name}">
      ${product.variants.options.map((variant) => `<option value="${variant.id}" ${variant.id === selectedId ? "selected" : ""}>${variant.label} - ${money(variant.price)}</option>`).join("")}
    </select>
  </label>`;
}

// Reuse the existing variant change handlers in catalog, quick view, and details.
function wireColorSwatches() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-product-color]");
    if (!button) return;
    const picker = button.closest(".color-variant-picker");
    const select = picker.querySelector("[data-product-variant]");
    select.value = button.dataset.productColor;
    picker.querySelector("[data-selected-color]").textContent = select.selectedOptions[0].textContent;
    picker.querySelectorAll("[data-product-color]").forEach(swatch => swatch.setAttribute("aria-pressed", String(swatch === button)));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
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
  const saved = wishlist.includes(productId);
  const product = catalogProducts().find(item => item.id === productId);
  showShoppingFeedback(saved ? "Saved to your wishlist" : "Removed from your wishlist", product?.name || "", "wishlist");
  requestAnimationFrame(() => {
    const heart = document.querySelector(`[data-wishlist-product="${CSS.escape(productId)}"]`)
      || document.getElementById("detailWishlistButton");
    animateStoreElement(heart, saved ? [
      { transform: "scale(1)" }, { transform: "scale(1.28) rotate(-12deg)", offset: .4 },
      { transform: "scale(.94)", offset: .75 }, { transform: "scale(1)" }
    ] : [{ transform: "scale(1)" }, { transform: "scale(.88)" }, { transform: "scale(1)" }]);
    animateStoreElement(document.querySelector(".wishlist-pill"), [
      { transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }
    ]);
  });
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
        // Keep the selected color/capacity while updating matching heart buttons.
        const selected = getWishlist().includes(button.dataset.wishlistProduct);
        document.querySelectorAll("[data-wishlist-product]").forEach(heart => {
          if (heart.dataset.wishlistProduct !== button.dataset.wishlistProduct) return;
          const name = heart.closest(".product-card").querySelector("h3").textContent;
          heart.classList.toggle("active", selected);
          heart.setAttribute("aria-pressed", String(selected));
          heart.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${name} ${selected ? "from" : "to"} wishlist`);
        });
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
        <p class="product-description-copy">${product.description || product.specs}</p>
        <p class="product-selected-specs">${product.specs}</p>
        ${product.descriptionNote ? `<p class="product-description-note">${product.descriptionNote}</p>` : ""}
        ${product.descriptionSource ? `<a class="product-description-source" href="${product.descriptionSource}" target="_blank" rel="noopener noreferrer">Manufacturer reference <span aria-hidden="true">&#8599;</span></a>` : ""}
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

  const currencyLabel = currencyPreference();
  minPrice.placeholder = `${currencyLabel} 0`;
  maxPrice.placeholder = "Any price";
  minPrice.step = maxPrice.step = "any";

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
    const currencyMultiplier = 1 / displayCurrencyRates[currencyPreference()];
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
  // Preserve the product and variant query parameters despite the page's base URL.
  function updateConfigureProductLink() {
    const target = new URL(window.location.href);
    target.hash = "configureProduct";
    document.querySelector("#configureProductLink").href = target.href;
  }
  updateConfigureProductLink();
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
  function updateProductDescription() {
    document.querySelector("#detailProductDescription").textContent = product.description || product.specs;
    document.querySelector("#detailProductSelectedSpecs").textContent = product.specs;
    const note = document.querySelector("#detailProductDescriptionNote");
    note.textContent = product.descriptionNote || "";
    note.hidden = !product.descriptionNote;
    const source = document.querySelector("#detailProductDescriptionSource");
    source.hidden = !product.descriptionSource;
    if (product.descriptionSource) source.href = product.descriptionSource;
    else source.removeAttribute("href");
  }
  updateProductDescription();
  document.querySelector("#detailProductStock").textContent = `${product.stock} in stock`;
  document.querySelector("#detailProductPrice").innerHTML = product.originalPrice > product.price
    ? `<del>${money(product.originalPrice)}</del> ${money(product.price)}`
    : money(product.price);
  document.querySelector("#detailKeySpecs").innerHTML = specifications.slice(0, 4).map(([, label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");

  document.querySelector("#componentProductImage").src = product.image;
  document.querySelector("#componentProductImage").alt = product.name;
  document.querySelector("#componentOrbitCards").innerHTML = specifications.map(([, label, value]) => `
    <article class="orbit-spec-card">
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
    updateConfigureProductLink();
    document.title = `${product.name} | Bits and Bytes`;
    document.querySelector("#detailProductName").textContent = product.name;
    document.querySelector("#detailBreadcrumb").textContent = product.name;
    document.querySelector("#detailProductCategory").textContent = `${product.type} / ${product.use}`;
    productImage.src = product.image;
    productImage.alt = product.name;
    document.querySelector("#componentProductImage").src = product.image;
    document.querySelector("#componentProductImage").alt = product.name;
    document.querySelector("#configSummaryImage").src = product.image;
    document.querySelector("#configSummaryImage").alt = product.name;
    renderGallery();
    document.querySelector("#detailProductPrice").innerHTML = product.originalPrice > product.price
      ? `<del>${money(product.originalPrice)}</del> ${money(product.price)}`
      : money(product.price);
    updateProductDescription();
    document.querySelector("#detailProductStock").textContent = `${product.stock} in stock`;
    document.querySelector("#configSummaryName").textContent = product.name;
    document.querySelector("#detailKeySpecs").innerHTML = specifications.slice(0, 4).map(([, label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
    document.querySelector("#componentOrbitCards").innerHTML = specifications.map(([, label, value]) => `<article class="orbit-spec-card"><strong>${label}</strong><small>${value}</small></article>`).join("");
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
          <optgroup label="Languages">
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="zh">简体中文</option>
          </optgroup>
        </select>
      </label>
      <label class="store-control" for="currencySelect">
        <span>Currency</span>
        <select id="currencySelect">
          <option value="PHP">PHP (P)</option>
          <option value="USD">USD ($)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="EUR">EUR (€)</option>
          <option value="CNY">CNY (CN¥)</option>
        </select>
      </label>
      <a class="wishlist-pill" href="pages/wishlist.html" aria-label="Wishlist"><span class="wishlist-link-label">Wishlist</span> <span id="wishlistCount">0</span></a>
      <p class="control-status" id="controlStatus" role="status"></p>
    </div>
  `);

  const languageSelect = document.querySelector("#languageSelect");
  const currencySelect = document.querySelector("#currencySelect");

  currencySelect.value = currencyPreference();
  languageSelect.value = typeof storeLanguage === "function" ? storeLanguage() : "en";

  languageSelect.addEventListener("change", () => {
    localStorage.setItem("bitsAndBytesLanguage", languageSelect.value);
    const localCurrency = { ja: "JPY", es: "EUR", fr: "EUR", zh: "CNY" }[languageSelect.value];
    if (localCurrency) localStorage.setItem("bitsAndBytesCurrency", localCurrency);
    window.location.reload();
  });

  currencySelect.addEventListener("change", () => {
    localStorage.setItem("bitsAndBytesCurrency", currencySelect.value);
    window.location.reload();
  });

  if (currencyPreference() !== "PHP") {
    const note = document.createElement("p");
    note.className = "currency-notice";
    note.textContent = "Converted prices are estimates. Checkout and payments are in PHP.";
    document.querySelector("main")?.prepend(note);
  }
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
    "pages/articles.html": "Articles",
    "pages/contact.html": "Contact",
    "pages/login.html": "Login",
    "pages/tracking.html": "Track Order",
    "pages/profile.html": "My account",
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
      ${groupMarkup("Explore", ["pages/articles.html", "pages/components.html", "pages/about.html", "pages/downloads.html"])}
      ${groupMarkup("Support", ["pages/contact.html", "pages/tracking.html", "pages/profile.html", "pages/login.html"])}
      <details class="nav-group nav-account">
        <summary title="Your account"><img src="images/icons/user-round.svg" alt="" width="20" height="20"><span class="nav-account-greeting">My account</span></summary>
        <div class="nav-submenu">
          <a href="pages/profile.html">Manage my account</a><a href="pages/profile.html#orders">My purchases</a>
          <a href="pages/profile.html#addresses">Address book</a><a href="pages/profile.html#tracking">Delivery tracking</a>
          <a href="pages/profile.html#favorites">My favorites</a><a href="pages/profile.html#refunds">Returns &amp; refunds</a>
          <button class="nav-account-signout" type="button" hidden>Sign out</button>
        </div>
      </details>
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
  nav.querySelector(".nav-account-signout").addEventListener("click", () => {
    signOutStoreAccount();
    nav.querySelector(".nav-account").open = false;
    window.dispatchEvent(new Event("store-account-change"));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.querySelectorAll(".nav-group").forEach(group => { group.open = false; });
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("pointerdown", event => {
    nav.querySelectorAll(".nav-group").forEach(group => { if (!group.contains(event.target)) group.open = false; });
  });

  function updateNavigationHighlight() {
    const current = new URL(window.location.href);
    let pathname = current.pathname.endsWith("/") ? current.pathname + "index.html" : current.pathname;
    pathname = pathname.replace(/\/product\.html$/, "/products.html");
    pathname = pathname.replace(/\/article\.html$/, "/articles.html");
    const accountPage = /\/(profile|login|wishlist)\.html$/.test(pathname);
    const hash = pathname.endsWith("/wishlist.html") ? "#favorites" : current.hash;
    if (accountPage) pathname = pathname.replace(/\/(login|wishlist)\.html$/, "/profile.html");
    const anchors = [...nav.querySelectorAll("a:not(.nav-brand):not(.mobile-store-brand):not(.cart-pill)")];
    anchors.forEach(link => { link.classList.remove("active"); link.removeAttribute("aria-current"); });
    nav.querySelectorAll(".nav-group").forEach(group => group.classList.remove("current"));
    const matches = anchors.filter(link => new URL(link.href).pathname === pathname && (!accountPage || link.closest(".nav-account")));
    const selected = matches.find(link => new URL(link.href).hash === hash) || matches.find(link => !new URL(link.href).hash);
    if (selected) {
      selected.classList.add("active");
      selected.setAttribute("aria-current", new URL(selected.href).hash ? "location" : "page");
      selected.closest(".nav-group")?.classList.add("current");
    }
    if (accountPage) nav.querySelector(".nav-account").classList.add("current");
  }
  window.addEventListener("hashchange", updateNavigationHighlight);
  updateNavigationHighlight();

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
  mobileBrand.setAttribute("aria-label", "Bits and Bytes home");
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
  // Keep the existing audio and playback preferences; only move its control.
  const nav = document.querySelector(".sticky-site-nav .foldable-nav");
  if (nav) nav.append(button.closest(".background-music"));
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
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let elapsed = 0, lastTime = 0, frame = 0;
  let manuallyPaused = motionPreference.matches;
  let focused = false, inView = true;
  const pause = document.createElement("button");
  pause.type = "button";
  pause.id = "promoPause";
  pause.className = "promo-pause";
  carousel.append(pause);

  dots.innerHTML = slides.map((_, index) => `
    <button type="button" data-promo-slide="${index}" aria-label="Show promotion ${index + 1}"><span></span></button>
  `).join("");

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    elapsed = 0;
    lastTime = 0;
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
      dot.querySelector("span").style.transform = `scaleX(${dotIndex < activeIndex ? 1 : 0})`;
    });
  }

  function stopAutoScroll() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function startAutoScroll() {
    stopAutoScroll();
    const paused = manuallyPaused || focused || document.hidden || !inView;
    carousel.dataset.paused = String(paused);
    pause.setAttribute("aria-label", manuallyPaused ? "Play promotions" : "Pause promotions");
    pause.title = manuallyPaused ? "Play promotions" : "Pause promotions";
    pause.setAttribute("aria-pressed", String(manuallyPaused));
    const icon = manuallyPaused ? "play" : "pause";
    if (pause.dataset.icon !== icon) {
      pause.dataset.icon = icon;
      pause.innerHTML = `<img src="images/icons/${icon}.svg" width="18" height="18" alt="">`;
    }
    if (!paused) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    if (lastTime) elapsed += time - lastTime;
    lastTime = time;
    if (elapsed >= 5000) showSlide(activeIndex + 1);
    dots.querySelector("button.active span").style.transform = `scaleX(${Math.min(elapsed / 5000, 1)})`;
    frame = requestAnimationFrame(tick);
  }
  pause.addEventListener("click", () => { manuallyPaused = !manuallyPaused; focused = false; startAutoScroll(); });

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
  carousel.addEventListener("focusin", () => { focused = true; startAutoScroll(); });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) { focused = false; startAutoScroll(); }
  });
  document.addEventListener("visibilitychange", () => {
    startAutoScroll();
  });
  motionPreference.addEventListener("change", () => { manuallyPaused = motionPreference.matches; startAutoScroll(); });
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; startAutoScroll(); }, { threshold: 0.1 }).observe(carousel);

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
          <p class="support-message agent">Hello. I'm your AI shopping assistant. Ask about products, delivery, a custom PC build, or payment options. Messages are sent to OpenAI; please don't share sensitive information.</p>
        </div>
        <div class="support-chat-topics" aria-label="Common questions">
          <button type="button" data-chat-topic="Where is my order?">Order status</button>
          <button type="button" data-chat-topic="Can you help me choose a PC?">Choose a PC</button>
          <button type="button" data-chat-topic="What payment methods are available?">Payment options</button>
        </div>
        <form class="support-chat-form" id="supportChatForm">
          <label class="sr-only" for="supportChatInput">Your message</label>
          <input id="supportChatInput" type="text" placeholder="Type your question" autocomplete="off" maxlength="2000" required>
          <button type="submit">Send</button>
        </form>
      </section>
      <div class="support-chat-nudge" id="supportChatNudge" role="status" hidden>
        <p id="supportChatNudgeText"></p>
        <button id="dismissChatNudge" type="button" aria-label="Dismiss chat message" title="Dismiss message"><img src="images/icons/x.svg" width="16" height="16" alt=""></button>
      </div>
      <button class="store-back-to-top" id="storeBackToTop" type="button" aria-label="Back to top" title="Back to top" hidden>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 15 7-7 7 7"/></svg>
      </button>
      <button class="support-chat-launcher" id="supportChatLauncher" type="button" aria-label="Chat with us" title="Chat with us" aria-expanded="false" aria-controls="supportChatPanel">
        <img class="chat-robot-normal" src="images/branding/support-robot-hover.png" width="64" height="64" alt="" aria-hidden="true">
        <img class="chat-robot-hover" src="images/branding/support-robot-normal.png" width="64" height="64" alt="" aria-hidden="true">
        <span class="chat-notification-dot" aria-hidden="true"></span>
      </button>
    </aside>
  `);

  const panel = document.querySelector("#supportChatPanel");
  const launcher = document.querySelector("#supportChatLauncher");
  const close = document.querySelector("#supportChatClose");
  const form = document.querySelector("#supportChatForm");
  const input = document.querySelector("#supportChatInput");
  const messages = document.querySelector("#supportChatMessages");
  const nudge = document.querySelector("#supportChatNudge");
  const nudgeKey = "bitsAndBytesChatWelcomeSeen";
  const footer = document.querySelector(".site-footer");
  const footerIsVisible = () => footer && footer.getBoundingClientRect().top < innerHeight && footer.getBoundingClientRect().bottom > 0;
  let welcomeTimer, dismissTimer;
  const typingAnimations = new WeakMap();
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const activeDialogue = new Set();
  const backToTop = document.querySelector("#storeBackToTop");
  function updateSpeaking() {
    launcher.classList.toggle("is-speaking", !nudge.hidden || (!panel.hidden && (activeDialogue.size > 0 || messages.hasAttribute("aria-busy"))));
  }
  function updateBackToTop() {
    backToTop.hidden = scrollY < 400 || !panel.hidden;
  }
  addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop.addEventListener("click", () => scrollTo({ top: 0, behavior: motionPreference.matches ? "instant" : "smooth" }));
  updateBackToTop();

  function typeChatText(node, text) {
    typingAnimations.get(node)?.();
    const accessible = document.createElement("span");
    accessible.className = "sr-only";
    accessible.textContent = text;
    const reserve = document.createElement("span");
    reserve.className = "typewriter-reserve";
    reserve.setAttribute("aria-hidden", "true");
    reserve.textContent = text;
    const visible = document.createElement("span");
    visible.className = "typewriter-text";
    visible.setAttribute("aria-hidden", "true");
    node.replaceChildren(accessible, reserve, visible);
    node.classList.add("typewriter-message");
    if (motionPreference.matches) { visible.textContent = text; return Promise.resolve(); }
    const characters = Array.from(text);
    const duration = Math.min(6500, characters.length * 22);
    node.classList.add("is-typing");
    activeDialogue.add(node);
    updateSpeaking();
    return new Promise(resolve => {
      let frame, started;
      const finish = () => {
        cancelAnimationFrame(frame);
        visible.textContent = text;
        node.classList.remove("is-typing");
        typingAnimations.delete(node);
        activeDialogue.delete(node);
        updateSpeaking();
        resolve();
      };
      typingAnimations.set(node, finish);
      const tick = time => {
        started ??= time;
        const count = Math.min(characters.length, Math.floor((time - started) / Math.max(1, duration) * characters.length) + 1);
        visible.textContent = characters.slice(0, count).join("");
        if (count >= characters.length || motionPreference.matches) finish();
        else frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function dismissNudge() {
    clearTimeout(welcomeTimer);
    clearTimeout(dismissTimer);
    typingAnimations.get(document.querySelector("#supportChatNudgeText"))?.();
    nudge.hidden = true;
    updateSpeaking();
    launcher.classList.remove("has-notification");
    try { sessionStorage.setItem(nudgeKey, "yes"); } catch { /* Chat remains usable without browser storage. */ }
  }
  let welcomeSeen = false;
  try { welcomeSeen = sessionStorage.getItem(nudgeKey) === "yes"; } catch {}
  const welcomeLines = {
    shop: [
      "Hi! Looking for a PC, laptop, or the right upgrade? Ask me anytime.",
      "Tell me your budget and what you use your computer for. Let's find a good fit.",
      "Comparing a few products? Ask me about their specs and what to look for.",
      "Planning a new setup? I can help you narrow down your options."
    ],
    build: [
      "Building your first PC? Tell me your budget and where you'd like to start.",
      "Unsure which parts go together? Ask me about sockets, memory, and case sizes.",
      "Gaming, studying, or creating? Let's talk about the parts your build needs.",
      "Choosing your next upgrade? Tell me what is already inside your PC."
    ],
    delivery: [
      "Questions about delivery or pickup? I can help you find the right checkout option.",
      "Need help with a voucher or payment option? Ask me before you check out.",
      "Sending an order overseas? Checkout shows the available services and extra fees.",
      "Looking for an order update? Open My account or Tracking to see your order details."
    ],
    support: [
      "Need a hand? Ask about your order, delivery, or payment anytime.",
      "Have a warranty question? I can point you toward the right information.",
      "Something not going as expected? Tell me what happened and I'll help you find support.",
      "Need to contact the store? I can help you find the support and inquiry options."
    ],
    journal: [
      "Reading up on your next upgrade? Ask me to explain a term or component.",
      "Want to turn a setup idea into a shopping list? Tell me what you have in mind.",
      "Not sure where to start? Ask about laptops, memory, storage, or building a PC.",
      "A guide caught your eye? I can help you compare the hardware in the catalog."
    ]
  };
  const lineGroup = /contact|warranty|support/.test(location.pathname) ? "support"
    : /cart|tracking|profile/.test(location.pathname) ? "delivery"
    : /build|components/.test(location.pathname) ? "build"
    : /articles?\.html/.test(location.pathname) ? "journal" : "shop";
  const lines = welcomeLines[lineGroup];
  const cursorKey = "bitsAndBytesChatLine-" + lineGroup;
  let lineCursor = 0;
  try { lineCursor = Number(sessionStorage.getItem(cursorKey)) || 0; } catch {}
  if (!Number.isSafeInteger(lineCursor) || lineCursor < 0) lineCursor = 0;
  function showNudge() {
      if (!panel.hidden || !nudge.hidden || document.querySelector("dialog[open]") || footerIsVisible()) return;
      const text = lines[lineCursor % lines.length];
      lineCursor = (lineCursor + 1) % lines.length;
      try { sessionStorage.setItem(cursorKey, String(lineCursor)); } catch {}
      nudge.hidden = false;
      updateSpeaking();
      typeChatText(document.querySelector("#supportChatNudgeText"), text);
      launcher.classList.add("has-notification");
      try { sessionStorage.setItem(nudgeKey, "yes"); } catch {}
      dismissTimer = setTimeout(dismissNudge, 12000);
  }
  if (!welcomeSeen) welcomeTimer = setTimeout(showNudge, 1800);
  launcher.addEventListener("pointerenter", showNudge);
  launcher.addEventListener("focus", event => { if (launcher.matches(":focus-visible") && !event.relatedTarget?.closest("#supportChat")) showNudge(); });
  document.querySelector("#dismissChatNudge").addEventListener("click", () => {
    dismissNudge();
    launcher.focus();
  });
  if (footer) new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !nudge.hidden) dismissNudge();
  }).observe(footer);

  let greeted = false;
  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    updateBackToTop();
    updateSpeaking();
    if (open) dismissNudge();
    launcher.setAttribute("aria-label", open ? "Close chat" : "Chat with us");
    launcher.title = open ? "Close chat" : "Chat with us";
    if (open) input.focus();
    if (open && !greeted) {
      greeted = true;
      const greeting = messages.querySelector(".agent");
      typeChatText(greeting, greeting.textContent);
    }
  }

  function appendMessage(kind, text) {
    const message = document.createElement("p");
    message.className = `support-message ${kind}`;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  let pending = false;
  let history = [];
  async function respond(message) {
    if (pending || !message || message.length > 2000) return;
    appendMessage("visitor", message);
    if (!/^https?:$/.test(location.protocol)) {
      const text = "AI chat needs the store server. Open http://localhost:4173/ to chat, or contact support.";
      typeChatText(appendMessage("agent", ""), text);
      return;
    }
    pending = true;
    const controls = [form.querySelector("button"), ...panel.querySelectorAll("[data-chat-topic]")];
    controls.forEach(control => { control.disabled = true; });
    const indicator = appendMessage("agent", "Thinking...");
    messages.setAttribute("aria-busy", "true");
    updateSpeaking();
    const conversation = [...history.slice(-8), { role: "user", content: message }];
    while (conversation.reduce((size, entry) => size + entry.content.length, 0) > 12000) conversation.splice(0, 2);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }), signal: AbortSignal.timeout(35000)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "AI chat is unavailable. Open the store through its server or contact support.");
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("The AI returned an empty reply. Please try again.");
      await typeChatText(indicator, data.reply);
      history = [...conversation, { role: "assistant", content: data.reply.slice(0, 2000) }];
    } catch (error) {
      const errorText = error.name === "TimeoutError" || error.name === "AbortError"
        ? "The AI took too long to reply. Please try again."
        : error instanceof TypeError ? "Cannot reach chat. Check your connection and try again." : error.message;
      await typeChatText(indicator, errorText);
      if (!input.value) input.value = message;
    } finally {
      pending = false;
      indicator.classList.add("chat-reply");
      controls.forEach(control => { control.disabled = false; });
      messages.removeAttribute("aria-busy");
      updateSpeaking();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => { setOpen(false); launcher.focus(); });
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") { setOpen(false); launcher.focus(); }
  });
  document.querySelectorAll("[data-chat-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.chatTopic;
      respond(question);
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || pending) return;
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
          <a href="pages/articles.html">The Journal</a>
          <a href="pages/tracking.html">Track Order</a>
          <a href="pages/profile.html">My account</a>
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
      </div>
      <div class="footer-legal">
        <p>&copy; 2026 Herrera Corporation. All rights reserved.</p>
        <nav aria-label="Legal information"><a href="pages/terms.html">Terms of Use</a><a href="pages/privacy.html">Privacy Policy</a></nav>
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
    student: { cooling: 0, cpu: 2, motherboard: 3, gpu: 0, ram: 0, storage: 0, psu: 0, case: 1, monitor: 0, keyboard: 0, accessories: 0 },
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
    if (typeof updateCheckoutTotals === "function") updateCheckoutTotals();
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

  wirePhilippineAddress();
  wireSavedCheckoutAddresses();
  wireDeliveryRates();
  const paymentDetail = document.querySelector("#paymentDetail");
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');

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
        <p class="payment-security-note">GCash includes a QR option at the next step. Sample verification does not charge your wallet or confirm a real transfer. Never share an OTP or wallet PIN.</p>
      `;
    } else {
      paymentDetail.innerHTML = `
        <div class="cod-payment-message">
          <span class="cod-payment-mark" aria-hidden="true">COD</span>
          <div><strong>Pay when your order arrives</strong><p>Prepare the exact amount or follow the courier's accepted payment instructions. Some high-value orders may require confirmation before dispatch.</p></div>
        </div>
      `;
      if (selectedFulfillment() === "pickup") {
        paymentDetail.querySelector("strong").textContent = "Pay when you collect your order";
        paymentDetail.querySelector("p").textContent = "Payment remains due at collection. This sample pickup does not reserve a real store collection.";
      }
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
    if (!form.reportValidity()) return;
    startSampleCheckout(form);
  });
}

// Local demo accounts only. Production authentication must be checked by a server.
function getDemoAccounts() {
  // A test login for this static store, never an administrator or a real account.
  const sampleAccount = {
    name: "John Carlo Herrera",
    email: "jcherrera0723@gmail.com",
    salt: "10028767bf40ff97b6294984b3db32f4",
    passwordHash: "3423c1e4197be86b9ced8ecfd3bfb15bc7dc34b20047e96e94c31ba0a822d7a9"
  };
  let accounts = [];
  try {
    const saved = JSON.parse(localStorage.getItem("bitsAndBytesAccounts"));
    if (Array.isArray(saved)) accounts = saved.filter(account => account && typeof account.name === "string" && typeof account.email === "string" && typeof account.salt === "string" && typeof account.passwordHash === "string" && /^[a-f0-9]{64}$/i.test(account.passwordHash));
  } catch { /* An unreadable local store still allows the test login. */ }
  if (!accounts.some(account => account.email === sampleAccount.email)) accounts.push(sampleAccount);
  return accounts;
}

function getSignedInUser() {
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) return storeDatabase.user;
  try {
    const email = sessionStorage.getItem("bitsAndBytesSignedInEmail");
    const account = getDemoAccounts().find((account) => account.email === email);
    return account ? { name: account.name, email: account.email, avatar: account.avatar || '' } : null;
  } catch { return null; }
}

async function hashAccountPassword(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error("Please open the store using HTTPS, localhost, or its original HTML files to sign in securely.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signInDemoAccount(email, password) {
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) {
    await storeDatabase.ready;
    await storeDatabase.authenticate("/api/login", { email, password });
    adoptGuestWishlist();
    return;
  }
  const account = getDemoAccounts().find((account) => account.email === email.trim().toLowerCase());
  if (!account || await hashAccountPassword(password, account.salt) !== account.passwordHash) {
    throw new Error("Email or password is incorrect. Register first if you do not have an account on this device.");
  }
  sessionStorage.setItem("bitsAndBytesSignedInEmail", account.email);
  adoptGuestWishlist();
  window.dispatchEvent(new Event("store-account-change"));
}

async function registerDemoAccount(name, email, password) {
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) {
    await storeDatabase.ready;
    await storeDatabase.authenticate("/api/register", { name, email, password });
    adoptGuestWishlist();
    return;
  }
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
  adoptGuestWishlist();
  window.dispatchEvent(new Event("store-account-change"));
}

async function signOutStoreAccount() {
  try {
    if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) await storeDatabase.signOut();
    sessionStorage.removeItem("bitsAndBytesSignedInEmail");
    window.dispatchEvent(new Event("store-account-change"));
  } catch (error) { alert(error.message || "Could not sign out. Please try again."); }
}

function updateAccountState() {
  const user = getSignedInUser();
  document.querySelectorAll(".nav-account-greeting").forEach(label => {
    label.textContent = user ? "Hi, " + user.name : "My account";
    label.closest("summary").title = user ? "Hi, " + user.name : "Your account";
  });
  document.querySelectorAll(".nav-account-signout").forEach(button => { button.hidden = !user; });
  document.querySelectorAll('.foldable-nav a[href="pages/login.html"]').forEach((link) => {
    link.textContent = user ? "Sign-in details" : "Login";
  });
  updateWishlistCount();
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
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) dialog.querySelector(".account-demo-note").textContent = "Your account and address book are saved in the store database. Use a password unique to this store.";
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
    signOutStoreAccount();
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
if (typeof wireStorePickers === "function") wireStorePickers();
wireStickyStoreHeader();
wireHomeVideo();
wireBackgroundMusic();
wirePartnersDialog();
wirePromoCarousel();
if (typeof wireSiteExperience === "function") wireSiteExperience();
wireReviewCarousel();
wireSupportChat();
document.addEventListener("DOMContentLoaded", wireStoreFooter);
updateCartCount();
updateWishlistCount();
wireQuickOrder();
wireColorSwatches();
renderFeaturedProducts();
renderProductsPage();
wireMobileFilters();
renderProductDetail();
renderWishlist();
renderBuilder();
renderCart();
wireDeliveryCheckout();
wireDeliveryMap();
wireLoginForm();
window.addEventListener("store-account-change", updateAccountState);
updateAccountState();
renderComponentGuide();
wireFocusedComponentMaps();
wirePeripheralForm();
