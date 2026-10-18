function setAddressOptions(select, placeholder, values) {
  select.replaceChildren(new Option(placeholder, ""));
  for (const value of values) select.add(new Option(value, value));
}

function selectedDeliveryCity() {
  return philippineAddresses[document.getElementById("provinceSelect").value]?.[document.getElementById("citySelect").value];
}

function wirePhilippineAddress() {
  const province = document.getElementById("provinceSelect");
  const city = document.getElementById("citySelect");
  const barangay = document.getElementById("barangaySelect");
  const postal = document.getElementById("postalCode");
  const hint = document.getElementById("postalCodeHint");
  const other = document.getElementById("otherBarangay");
  const country = document.getElementById("countryRegion");
  if (country && typeof shippingDestinations !== "undefined") {
    setAddressOptions(country, "Choose country", Object.keys(shippingDestinations));
    country.value = "Philippines";
    const international = document.createElement("div");
    international.id = "internationalAddressFields";
    international.className = "address-grid address-editor-grid";
    international.hidden = true;
    international.innerHTML = `<div><label for="internationalRegion">State / region / prefecture</label><input id="internationalRegion" list="internationalRegions" autocomplete="address-level1" maxlength="100"><datalist id="internationalRegions"></datalist></div><div><label for="internationalCity">City / town</label><input id="internationalCity" list="internationalCities" autocomplete="address-level2" maxlength="100"><datalist id="internationalCities"></datalist></div>`;
    province.closest(".address-grid, .address-editor-grid").before(international);
    const regionInput = document.getElementById("internationalRegion");
    const cityInput = document.getElementById("internationalCity");
    const suggestions = (id, values) => document.getElementById(id).replaceChildren(...values.map(value => new Option(value, value)));
    regionInput.addEventListener("input", () => suggestions("internationalCities", shippingDestinations[country.value]?.regions?.[regionInput.value] || []));
    country.addEventListener("change", () => {
      const domestic = country.value === "Philippines";
      const setting = shippingDestinations[country.value];
      international.hidden = domestic;
      regionInput.required = cityInput.required = !domestic;
      regionInput.disabled = cityInput.disabled = domestic;
      regionInput.value = cityInput.value = "";
      for (const select of [province, city, barangay]) {
        select.closest("div").hidden = !domestic;
        select.disabled = !domestic;
        select.required = domestic;
      }
      province.value = "";
      province.dispatchEvent(new Event("change"));
      if (!domestic) city.disabled = barangay.disabled = true;
      postal.value = "";
      postal.pattern = setting?.postal || ".*";
      postal.maxLength = domestic ? 4 : 10;
      postal.placeholder = setting?.example || "Postal code";
      hint.textContent = domestic ? "Choose a city for postal suggestions." : "Enter the postal code for your exact street address. City suggestions are not a complete address directory.";
      suggestions("internationalRegions", Object.keys(setting?.regions || {}));
      suggestions("internationalCities", []);
      const phone = document.getElementById("checkoutPhone");
      phone.pattern = "\\+?[0-9][0-9 ]{6,28}";
      phone.maxLength = 30;
      if (typeof updateCheckoutTotals === "function") updateCheckoutTotals();
      window.dispatchEvent(new Event("store-destination-change"));
    });
    regionInput.disabled = cityInput.disabled = true;
  }
  setAddressOptions(province, "Select province or Metro Manila", Object.keys(philippineAddresses));
  function updatePostal() {
    const location = selectedDeliveryCity();
    const specificCode = location?.postalAreas[barangay.value];
    postal.value = specificCode || location?.postalCode || "";
    hint.textContent = specificCode ? "Postal suggestion for " + barangay.value + ". Confirm for your exact address." : postal.value ? "City-level postal suggestion. Some areas have another code; correct it if needed." : "No confirmed postal suggestion for this area. Enter the code for your exact address.";
  }
  province.addEventListener("change", () => {
    const names = Object.keys(philippineAddresses[province.value] || {});
    setAddressOptions(city, "Select city or municipality", names);
    setAddressOptions(barangay, "Select city first", []);
    city.disabled = names.length === 0;
    barangay.disabled = true;
    postal.value = "";
    hint.textContent = "Select a city for its postal-code suggestion.";
    document.getElementById("otherBarangayField").hidden = true;
    other.required = false;
    other.value = "";
  });
  city.addEventListener("change", () => {
    const location = selectedDeliveryCity();
    setAddressOptions(barangay, "Select barangay", location?.barangays || []);
    if (location) barangay.add(new Option("Other barangay (not listed)", "__other__"));
    barangay.disabled = !location;
    document.getElementById("otherBarangayField").hidden = true;
    other.required = false;
    other.value = "";
    updatePostal();
  });
  barangay.addEventListener("change", () => {
    const manual = barangay.value === "__other__";
    document.getElementById("otherBarangayField").hidden = !manual;
    other.required = manual;
    if (!manual) other.value = "";
    updatePostal();
  });
}

function validateDeliveryAddress() {
  const country = document.getElementById("countryRegion")?.value || "Philippines";
  if (country !== "Philippines") {
    const valid = validInternationalAddress({ country, street: document.getElementById("streetAddress").value, province: document.getElementById("internationalRegion").value, city: document.getElementById("internationalCity").value, postalCode: document.getElementById("postalCode").value });
    if (!valid) document.getElementById("checkoutStatus").textContent = "Complete the country, region, city, street and correct postal-code format.";
    return valid;
  }
  const city = selectedDeliveryCity();
  const barangay = document.getElementById("barangaySelect");
  const other = document.getElementById("otherBarangay");
  const valid = city && (city.barangays.includes(barangay.value) || (barangay.value === "__other__" && other.value.trim()));
  if (!valid) {
    document.getElementById("checkoutStatus").textContent = "Select a valid province, city, and barangay before continuing.";
    barangay.focus();
  }
  return Boolean(valid);
}
