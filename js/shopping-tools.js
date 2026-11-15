// A small, separate file for catalog display and comparison controls.
const comparisonOptions = [];
const compareSelects = document.querySelectorAll("[data-compare-select]");

// Each capacity is a separate choice, so the picture and price stay together.
for (const product of catalogProducts()) {
  if (product.variants) {
    for (const variant of product.variants.options) {
      comparisonOptions.push(productWithVariant(product, variant.id));
    }
  } else {
    comparisonOptions.push(product);
  }
}

for (const select of compareSelects) {
  select.add(new Option("Choose a product", ""));
  for (const type of ["Laptop", "Desktop PC", "Monitor", "Computer Part", "Accessory"]) {
    const group = document.createElement("optgroup");
    group.label = type;
    for (const product of comparisonOptions) {
      if (product.type === type) group.appendChild(new Option(product.name, product.id));
    }
    select.appendChild(group);
  }
  select.addEventListener("change", compareProducts);
}

function compareProducts() {
  const selected = [];
  for (const select of compareSelects) {
    const product = comparisonOptions.find((product) => product.id === select.value);
    if (product && !selected.includes(product)) selected.push(product);
  }
  const results = document.getElementById("comparisonResults");
  const status = document.getElementById("compareStatus");
  results.hidden = selected.length === 0;
  status.textContent = selected.length < 2 ? "Choose two or three different configurations to compare."
    : selected.length + " configurations selected. Prices and stock are store listings. Shipping is not included. Unconfirmed specifications are labeled.";

  // Only trusted catalog data goes into this table, never the search input.
  results.innerHTML = `<table class="comparison-table">
    <caption>Your side-by-side shortlist</caption>
    <thead><tr><th scope="col">Product</th>${selected.map((product) => `<th scope="col">
      <figure><img src="${product.image}" alt="${product.name}"><figcaption>${product.name}</figcaption></figure>
    </th>`).join("")}</tr></thead>
    <tbody>
      <tr><th scope="row">Brand</th>${selected.map((product) => `<td>${product.brand}</td>`).join("")}</tr>
      <tr><th scope="row">Best for</th>${selected.map((product) => `<td>${product.use}</td>`).join("")}</tr>
      <tr><th scope="row">Specifications</th>${selected.map((product) => `<td>${product.specs}</td>`).join("")}</tr>
      <tr><th scope="row">Availability</th>${selected.map((product) => `<td>${product.stock} in stock</td>`).join("")}</tr>
    </tbody>
    <tfoot><tr><th scope="row">Price per item</th>${selected.map((product) => `<td>
      <ins>${money(product.price)}</ins><br><button class="button small" type="button" data-compare-add="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>Add to Cart</button>
    </td>`).join("")}</tr></tfoot>
  </table>`;
  // Share the same variant-aware facts with the quick comparison dialog.
  const profiles = selected.map(window.productComparisonDetails);
  const labels = [...new Set(profiles.flatMap(profile => Object.keys(profile.values)))];
  const body = results.querySelector('tbody');
  for (const label of labels) {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row'; heading.textContent = label; row.append(heading);
    for (const profile of profiles) {
      const cell = document.createElement('td');
      cell.textContent = profile.values[label] || 'Not confirmed for this configuration';
      row.append(cell);
    }
    body.append(row);
  }
  const references = document.createElement('tr');
  const referenceHeading = document.createElement('th');
  referenceHeading.scope = 'row'; referenceHeading.textContent = 'Product references';
  references.append(referenceHeading);
  for (const profile of profiles) {
    const cell = document.createElement('td');
    if (profile.source) {
      const link = document.createElement('a');
      link.href = profile.source; link.textContent = 'View specification';
      link.target = '_blank'; link.rel = 'noopener noreferrer'; cell.append(link);
    } else cell.textContent = 'No external reference available';
    references.append(cell);
  }
  body.append(references);
  for (const button of results.querySelectorAll("[data-compare-add]")) {
    button.addEventListener("click", () => {
      addToCart(comparisonOptions.find((product) => product.id === button.dataset.compareAdd));
    });
  }
}

document.getElementById("clearComparison").addEventListener("click", () => {
  for (const select of compareSelects) select.value = "";
  compareProducts();
});

for (const radio of document.querySelectorAll('[name="catalogView"]')) {
  radio.addEventListener("change", () => {
    document.body.classList.toggle("catalog-list-view", radio.value === "list");
  });
}
