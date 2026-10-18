// Each signed-in account has its own browser-local address book.
function addressBookKey() {
  const user = getSignedInUser();
  return user ? "bitsAndBytesAddressBook:" + user.email : "";
}

function getAddressBook() {
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) return structuredClone(storeDatabase.book);
  if (!addressBookKey()) return { addresses: [], defaultId: "" };
  try {
    const saved = JSON.parse(localStorage.getItem(addressBookKey()));
    if (saved && Array.isArray(saved.addresses)) return { addresses: saved.addresses.filter(item => item && typeof item.id === "string" && item.recipient && item.address), defaultId: saved.defaultId || "" };
  } catch { /* A new account starts with an empty address book. */ }
  return { addresses: [], defaultId: "" };
}

function writeAddressBook(book) {
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) return storeDatabase.saveBook(book);
  const key = addressBookKey();
  if (!key) throw new Error("Please sign in before saving addresses.");
  localStorage.setItem(key, JSON.stringify(book));
  window.dispatchEvent(new Event("store-addressbook-change"));
}

function saveAddressBookEntry(entry, id = "", makeDefault = false) {
  if (!getSignedInUser()) throw new Error("Please sign in before saving addresses.");
  const city = philippineAddresses[entry.address?.province]?.[entry.address?.city];
  const domestic = deliveryCountry(entry.address) === "Philippines";
  if (!entry.label?.trim() || !entry.recipient?.firstName?.trim() || !entry.recipient?.surname?.trim() || !validInternationalAddress(entry.address) || (domestic && (!entry.address?.barangay?.trim() || !city)) || !/^[+0-9() .-]{7,30}$/.test(entry.phone) || entry.phone.replace(/\D/g, "").length > 15) throw new Error("Complete the recipient, phone number, and delivery address.");
  const book = getAddressBook();
  const index = book.addresses.findIndex(item => item.id === id);
  if (id && index < 0) throw new Error("This saved address is no longer available in your account.");
  if (!id && book.addresses.length >= 50) throw new Error("You can save up to 50 addresses. Edit or remove an existing address first.");
  const address = { id: id || crypto.randomUUID(), label: entry.label.trim(), recipient: { ...entry.recipient }, phone: entry.phone.trim(), address: { ...entry.address } };
  if (index >= 0) book.addresses[index] = address; else book.addresses.push(address);
  if (!book.addresses.some(item => item.id === book.defaultId) || makeDefault) book.defaultId = address.id;
  const saved = writeAddressBook(book);
  return saved?.then ? saved.then(() => address) : address;
}

function setDefaultAddress(id) {
  const book = getAddressBook();
  if (!book.addresses.some(item => item.id === id)) throw new Error("This address is not available in your account.");
  book.defaultId = id;
  return writeAddressBook(book);
}

function removeAddressBookEntry(id) {
  const book = getAddressBook();
  if (!book.addresses.some(item => item.id === id)) throw new Error("This address is not available in your account.");
  book.addresses = book.addresses.filter(item => item.id !== id);
  if (book.defaultId === id) book.defaultId = book.addresses[0]?.id || "";
  return writeAddressBook(book);
}

function readDeliveryAddressForm() {
  const value = id => document.getElementById(id).value.trim();
  const country = document.getElementById("countryRegion")?.value || "Philippines";
  const overseas = country !== "Philippines";
  return {
    recipient: { firstName: value("checkoutFirstName"), middleName: value("checkoutMiddleName"), surname: value("checkoutSurname"), suffix: value("checkoutSuffix") },
    phone: value("checkoutPhone"),
    address: { country, street: value("streetAddress"), lineTwo: value("addressLineTwo"), province: value(overseas ? "internationalRegion" : "provinceSelect"), city: value(overseas ? "internationalCity" : "citySelect"), barangay: overseas ? "" : value("barangaySelect") === "__other__" ? value("otherBarangay") : value("barangaySelect"), postalCode: value("postalCode"), landmark: value("deliveryLandmark"), instructions: value("deliveryInstructions") }
  };
}

function fillDeliveryAddressForm(entry) {
  const country = document.getElementById("countryRegion");
  if (country) {
    country.value = deliveryCountry(entry.address);
    country.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const fields = { checkoutFirstName: entry.recipient.firstName, checkoutMiddleName: entry.recipient.middleName, checkoutSurname: entry.recipient.surname, checkoutSuffix: entry.recipient.suffix, checkoutPhone: entry.phone, streetAddress: entry.address.street, addressLineTwo: entry.address.lineTwo, deliveryLandmark: entry.address.landmark, deliveryInstructions: entry.address.instructions };
  for (const [id, value] of Object.entries(fields)) document.getElementById(id).value = value || "";
  if (deliveryCountry(entry.address) !== "Philippines") {
    document.getElementById("internationalRegion").value = entry.address.province || "";
    document.getElementById("internationalRegion").dispatchEvent(new Event("input"));
    document.getElementById("internationalCity").value = entry.address.city || "";
    document.getElementById("postalCode").value = entry.address.postalCode || "";
    window.dispatchEvent(new Event("store-destination-change"));
    return;
  }
  const choose = (id, value) => {
    const select = document.getElementById(id);
    select.value = value || "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  choose("provinceSelect", entry.address.province);
  choose("citySelect", entry.address.city);
  const listed = [...document.getElementById("barangaySelect").options].some(option => option.value === entry.address.barangay);
  choose("barangaySelect", listed ? entry.address.barangay : "__other__");
  if (!listed) document.getElementById("otherBarangay").value = entry.address.barangay || "";
  document.getElementById("postalCode").value = entry.address.postalCode || "";
}

function wireSavedCheckoutAddresses() {
  const select = document.getElementById("checkoutSavedAddress");
  if (!select) return;
  function refresh(applyDefault = false) {
    const previous = select.value;
    const book = getAddressBook();
    select.replaceChildren(new Option("Enter a new address", ""));
    for (const entry of book.addresses) select.add(new Option(entry.label + " - " + entry.address.city + (book.defaultId === entry.id ? " (Default)" : ""), entry.id));
    select.value = applyDefault ? book.defaultId : previous;
    if (applyDefault && book.defaultId) {
      const entry = book.addresses.find(item => item.id === book.defaultId);
      if (entry) fillDeliveryAddressForm(entry);
    }
  }
  select.addEventListener("change", () => {
    const entry = getAddressBook().addresses.find(item => item.id === select.value);
    if (entry) fillDeliveryAddressForm(entry);
    else fillDeliveryAddressForm({ recipient: {}, phone: "", address: {} });
  });
  window.addEventListener("store-account-change", () => {
    fillDeliveryAddressForm({ recipient: {}, phone: "", address: {} });
    document.getElementById("checkoutEmail").value = getSignedInUser()?.email || "";
    refresh(true);
  });
  window.addEventListener("store-addressbook-change", () => refresh());
  window.addEventListener("storage", event => { if (!event.key || event.key.startsWith("bitsAndBytesAddressBook:")) refresh(); });
  refresh(true);
}

function openAddressBookEditor(id = "") {
  const user = getSignedInUser();
  if (!user || document.getElementById("addressBookDialog")) return;
  const entry = getAddressBook().addresses.find(item => item.id === id);
  if (id && !entry) return;
  const dialog = document.createElement("dialog");
  dialog.id = "addressBookDialog";
  dialog.className = "address-book-dialog";
  dialog.setAttribute("aria-labelledby", "addressBookTitle");
  dialog.innerHTML = `<button id="closeAddressBook" class="address-editor-close" type="button" aria-label="Close address editor" title="Close">&times;</button><h2 id="addressBookTitle"></h2><p class="account-storage-note">Saved to your account on this browser. Existing orders keep their original delivery address.</p>
    <form id="addressBookForm">
      <label for="addressBookLabel">Address label</label><input id="addressBookLabel" maxlength="40" required placeholder="Home, work, or family">
      <div class="address-editor-grid">
        <div><label for="checkoutFirstName">First name</label><input id="checkoutFirstName" autocomplete="given-name" maxlength="80" required></div>
        <div><label for="checkoutMiddleName">Middle name (optional)</label><input id="checkoutMiddleName" autocomplete="additional-name" maxlength="80"></div>
        <div><label for="checkoutSurname">Surname</label><input id="checkoutSurname" autocomplete="family-name" maxlength="80" required></div>
        <div><label for="checkoutSuffix">Suffix</label><select id="checkoutSuffix"><option value="">None</option><option>Jr.</option><option>Sr.</option><option>II</option><option>III</option><option>IV</option><option>V</option></select></div>
      </div>
      <label for="checkoutPhone">Mobile number</label><input id="checkoutPhone" type="tel" autocomplete="tel" pattern="[+0-9 ]{7,30}" required placeholder="Include country code for overseas">
      <label for="countryRegion">Country or region</label><select id="countryRegion" required></select>
      <label for="streetAddress">House number, street, subdivision</label><input id="streetAddress" autocomplete="address-line1" maxlength="200" required>
      <label for="addressLineTwo">Apartment, building, floor (optional)</label><input id="addressLineTwo" autocomplete="address-line2" maxlength="160">
      <div class="address-editor-grid">
        <div><label for="provinceSelect">Province / Metro Manila</label><select id="provinceSelect" required></select></div>
        <div><label for="citySelect">City / Municipality</label><select id="citySelect" required disabled><option value="">Select province first</option></select></div>
        <div><label for="barangaySelect">Barangay</label><select id="barangaySelect" required disabled><option value="">Select city first</option></select></div>
        <div><label for="postalCode">Postal code</label><input id="postalCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required><small id="postalCodeHint" class="account-storage-note">Confirm your exact postal code.</small></div>
      </div>
      <div id="otherBarangayField" hidden><label for="otherBarangay">Barangay name</label><input id="otherBarangay" maxlength="120"></div>
      <label for="deliveryLandmark">Landmark (optional)</label><input id="deliveryLandmark" maxlength="200">
      <label for="deliveryInstructions">Delivery instructions (optional)</label><textarea id="deliveryInstructions" rows="2" maxlength="500"></textarea>
      <label class="address-default-choice"><input id="addressBookDefault" type="checkbox">Use as my default delivery address</label>
      <p id="checkoutStatus" class="refund-error" role="alert"></p><div class="account-order-actions"><button id="cancelAddressBook" class="button secondary" type="button">Cancel</button><button class="button primary" type="submit">Save address</button></div>
    </form>`;
  document.body.append(dialog);
  if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) dialog.querySelector(".account-storage-note").textContent = "Saved to your account database. Existing orders keep their original delivery address.";
  dialog.querySelector("#addressBookTitle").textContent = id ? "Edit address" : "Add an address";
  wirePhilippineAddress();
  if (entry) {
    dialog.querySelector("#addressBookLabel").value = entry.label;
    dialog.querySelector("#addressBookDefault").checked = getAddressBook().defaultId === id;
    dialog.querySelector("#addressBookDefault").disabled = getAddressBook().defaultId === id;
    fillDeliveryAddressForm(entry);
  }
  dialog.querySelector("#cancelAddressBook").addEventListener("click", () => dialog.close());
  dialog.querySelector("#closeAddressBook").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    try {
      if (getSignedInUser()?.email !== user.email) throw new Error("Your signed-in account changed. Please reopen the address editor.");
      if (!validateDeliveryAddress()) return;
      await saveAddressBookEntry({ ...readDeliveryAddressForm(), label: dialog.querySelector("#addressBookLabel").value }, id, dialog.querySelector("#addressBookDefault").checked);
      dialog.close();
    } catch (problem) { dialog.querySelector("#checkoutStatus").textContent = problem.message; }
  });
  dialog.showModal();
}
