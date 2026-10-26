// This account hub reads the same local orders and favorites as checkout.
const refundRequestsKey = "bitsAndBytesRefundRequests";

function profileText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

function profileDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium" });
}

function orderDeliveryStep(order) {
  return Math.max(0, Math.min(deliverySteps.length - 1, order.events.length - 1));
}

function savedRefundRequests() {
  try {
    const saved = JSON.parse(localStorage.getItem(refundRequestsKey));
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === "string" && typeof item.orderId === "string") : [];
  } catch { return []; }
}

function accountRefundRequests() {
  return savedRefundRequests().filter(item => item.accountEmail === getSignedInUser()?.email);
}

function refundEligibility(order) {
  if (!order || order.sample !== true) return "This saved sample order is not available.";
  if (orderDeliveryStep(order) !== 4) return "Return requests become available after delivery.";
  if (order.paymentStatus !== "Sample payment verified") return "This order has no verified sample payment to return.";
  if (accountRefundRequests().some(request => request.orderId === order.id && request.status !== "Withdrawn")) return "A request already exists for this order.";
  return "";
}

function createRefundRequest(orderId, reason, details) {
  // Always re-check ownership and eligibility when submitting, not just opening.
  const user = getSignedInUser();
  const order = accountStoreOrders().find(order => order.id === orderId);
  if (!user || !order) throw new Error("Sign in to the account that placed this order.");
  const problem = refundEligibility(order);
  if (problem) throw new Error(problem);
  const reasons = ["Damaged or faulty item", "Wrong item received", "Missing item", "Changed my mind", "Other"];
  if (!reasons.includes(reason) || details.trim().length < 10 || details.trim().length > 1000) throw new Error("Choose a reason and add 10 to 1,000 characters describing the issue.");
  const request = { id: "RR-" + crypto.randomUUID().slice(0, 8).toUpperCase(), orderId, accountEmail: user.email, reason, details: details.trim(), amount: order.total, status: "Request recorded", createdAt: new Date().toISOString() };
  localStorage.setItem(refundRequestsKey, JSON.stringify([request, ...savedRefundRequests()]));
  return request;
}

function withdrawRefundRequest(id) {
  const requests = savedRefundRequests();
  const request = requests.find(item => item.id === id && item.accountEmail === getSignedInUser()?.email);
  if (!request || request.status !== "Request recorded") throw new Error("This request is not available to withdraw.");
  request.status = "Withdrawn";
  request.updatedAt = new Date().toISOString();
  localStorage.setItem(refundRequestsKey, JSON.stringify(requests));
}

function wireProfilePage() {
  if (!document.getElementById("profileAccount")) return;
  let filter = "all";
  const notice = document.getElementById("profileNotice");
  let pendingPhoto = '', photoOwner = '', photoBusy = false;
  const photoFile = document.getElementById('profilePhotoFile');
  const photoStatus = document.getElementById('profilePhotoStatus');
  const photoSave = document.getElementById('saveProfilePhoto');
  const photoCancel = document.getElementById('cancelProfilePhoto');
  const photoRemove = document.getElementById('removeProfilePhoto');
  function paintAvatar(node, user, source = user?.avatar) {
    node.replaceChildren();
    if (source && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(source)) {
      const image = document.createElement('img');
      image.src = source;
      image.alt = 'Profile photo';
      node.append(image);
    } else node.textContent = user?.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '';
  }
  function resetPhoto(user) {
    pendingPhoto = ''; photoOwner = ''; photoFile.value = '';
    photoSave.hidden = photoCancel.hidden = true;
    photoRemove.hidden = !user?.avatar;
    paintAvatar(document.getElementById('profilePhotoPreview'), user);
    photoStatus.textContent = '';
  }
  photoFile.addEventListener('change', async () => {
    const file = photoFile.files[0], user = getSignedInUser();
    if (!file || !user || photoBusy) return;
    resetPhoto(user);
    photoBusy = true;
    photoFile.disabled = true;
    let bitmap;
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose a JPG, PNG or WebP image smaller than 5 MB.');
      bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 40000000) throw new Error('Choose a photo smaller than 40 megapixels.');
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      context.fillStyle = '#18232b'; context.fillRect(0, 0, 256, 256);
      const side = Math.min(bitmap.width, bitmap.height);
      context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
      if (getSignedInUser()?.email !== user.email) return;
      pendingPhoto = canvas.toDataURL('image/jpeg', .85);
      photoOwner = user.email;
      paintAvatar(document.getElementById('profilePhotoPreview'), user, pendingPhoto);
      photoSave.hidden = photoCancel.hidden = false;
      photoStatus.textContent = 'Preview ready. Save your photo to update your profile.';
    } catch (error) { photoStatus.textContent = error.message || 'This image could not be opened. Try another photo.'; }
    finally { bitmap?.close(); photoBusy = false; photoFile.disabled = false; }
  });
  photoCancel.addEventListener('click', () => resetPhoto(getSignedInUser()));
  async function savePhoto(remove = false) {
    const user = getSignedInUser();
    if (!user || photoBusy || (!remove && (photoOwner !== user.email || !pendingPhoto))) return;
    photoBusy = true;
    photoSave.disabled = photoRemove.disabled = photoCancel.disabled = photoFile.disabled = true;
    try {
      const avatar = remove ? '' : pendingPhoto;
      if (typeof storeDatabase !== 'undefined' && storeDatabase.enabled) await storeDatabase.updateAvatar(avatar);
      else {
        localStorage.setItem('bitsAndBytesAccounts', JSON.stringify(getDemoAccounts().map(account => account.email === user.email ? { ...account, avatar } : account)));
        window.dispatchEvent(new Event('store-account-change'));
      }
      photoStatus.textContent = remove ? 'Profile photo removed.' : 'Your profile photo has been saved.';
    } catch (error) { photoStatus.textContent = error.message || 'Your photo could not be saved. Try again.'; }
    finally { photoBusy = false; photoSave.disabled = photoRemove.disabled = photoCancel.disabled = photoFile.disabled = false; }
  }
  photoSave.addEventListener('click', () => savePhoto());
  photoRemove.addEventListener('click', () => savePhoto(true));

  function action(label, href) {
    const link = profileText("a", label, "button secondary");
    link.href = href;
    return link;
  }

  function empty(container, title, description, icon = "package") {
    const block = document.createElement("div");
    block.className = "account-empty";
    const image = document.createElement("img");
    image.src = "images/icons/" + icon + ".svg";
    image.alt = "";
    block.append(image, profileText("h3", title), profileText("p", description), action("Explore products", "pages/products.html"));
    container.append(block);
  }

  function productImage(product) {
    const image = document.createElement("img");
    if (typeof product.image === "string" && /^images\/[\w/.-]+$/.test(product.image) && !product.image.includes("..")) image.src = typeof transparentProductPhoto === "function" ? transparentProductPhoto(product.image) : product.image;
    image.alt = product.name;
    image.loading = "lazy";
    return image;
  }

  function orderCard(order, trackingOnly = false) {
    const card = document.createElement("article");
    card.className = "account-order";
    const heading = document.createElement("header");
    heading.className = "account-order-header";
    const reference = document.createElement("div");
    reference.append(profileText("strong", order.id), profileText("small", profileDate(order.createdAt) + " / " + order.paymentMethod + " / " + order.paymentStatus));
    heading.append(reference, profileText("span", orderStepLabels(order)[orderDeliveryStep(order)], "account-order-status"));
    const items = document.createElement("div");
    items.className = "account-order-items";
    for (const item of order.items) {
      const row = document.createElement("div");
      row.className = "account-product-row";
      const text = document.createElement("div");
      const link = profileText("a", item.name);
      link.href = "pages/product.html?id=" + encodeURIComponent(item.productId || item.id);
      if (item.variantId) link.href += "&variant=" + encodeURIComponent(item.variantId);
      text.append(link, profileText("p", item.specs || ""), profileText("small", "Quantity: " + item.quantity));
      row.append(productImage(item), text, profileText("strong", paymentAmount(item.price * item.quantity)));
      items.append(row);
    }
    const footer = document.createElement("footer");
    footer.className = "account-order-footer";
    const total = profileText("div", "Order total", "account-order-total");
    total.append(profileText("strong", paymentAmount(order.total)));
    const actions = document.createElement("div");
    actions.className = "account-order-actions";
    actions.append(action(trackingOnly ? "View delivery timeline" : "Order details / Track", "pages/tracking.html?order=" + encodeURIComponent(order.id)));
    const receipt = profileText("button", "View receipt", "button secondary");
    receipt.type = "button";
    receipt.addEventListener("click", () => openOrderReceipt(order.id));
    actions.append(receipt);
    if (!trackingOnly && !refundEligibility(order)) {
      const button = profileText("button", "Return / Refund", "button secondary");
      button.type = "button";
      button.addEventListener("click", () => openRefundDialog(order.id));
      actions.append(button);
    } else if (!trackingOnly && accountRefundRequests().some(request => request.orderId === order.id && request.status !== "Withdrawn")) {
      actions.append(action("View return request", "pages/profile.html#refunds"));
    }
    footer.append(total, actions);
    card.append(heading, items, footer);
    return card;
  }

  function openRefundDialog(orderId) {
    if (!getSignedInUser()) return render();
    const dialog = document.createElement("dialog");
    dialog.className = "refund-dialog";
    dialog.id = "refundDialog";
    dialog.setAttribute("aria-labelledby", "refundDialogTitle");
    dialog.innerHTML = `<h2 id="refundDialogTitle">Return / Refund request</h2>
      <p id="refundOrderLabel"></p><p>This records a whole-order sample request on this device only. It does not send a request to the store, approve a return, or transfer money. Contact support for an actual refund.</p>
      <form class="refund-form" id="refundForm"><label for="refundReason">Reason</label><select id="refundReason" required><option value="">Choose a reason</option><option>Damaged or faulty item</option><option>Wrong item received</option><option>Missing item</option><option>Changed my mind</option><option>Other</option></select>
      <label for="refundDetails">Tell us what happened</label><textarea id="refundDetails" minlength="10" maxlength="1000" required placeholder="Describe the item and the issue. Do not include payment passwords or PINs."></textarea>
      <p id="refundError" class="refund-error" role="alert"></p><div class="account-order-actions"><button class="button secondary" id="cancelRefund" type="button">Cancel</button><button class="button primary" type="submit">Save request</button></div></form>`;
    dialog.querySelector("#refundOrderLabel").textContent = "Order " + orderId;
    dialog.querySelector("#cancelRefund").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => dialog.remove());
    dialog.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      try {
        createRefundRequest(orderId, dialog.querySelector("#refundReason").value, dialog.querySelector("#refundDetails").value);
        dialog.close();
        window.location.hash = "refunds";
        render();
        notice.textContent = "Request saved on this device. Contact support to arrange an actual return.";
      } catch (problem) { dialog.querySelector("#refundError").textContent = problem.message; }
    });
    document.body.append(dialog);
    dialog.showModal();
  }

  function renderOrders(orders) {
    const query = document.getElementById("profileOrderSearch").value.trim().toLowerCase();
    const filtered = orders.filter(order => (filter === "all" || (filter === "completed" ? orderDeliveryStep(order) === 4 : orderDeliveryStep(order) < 4)) && (order.id.toLowerCase().includes(query) || order.items.some(item => item.name.toLowerCase().includes(query))));
    const container = document.getElementById("profileOrders");
    container.replaceChildren();
    filtered.forEach(order => container.append(orderCard(order)));
    if (!filtered.length) empty(container, orders.length ? "No matching purchases" : "Your next setup starts here", orders.length ? "Try another order number, product name, or status." : "Once you complete checkout, your purchases will appear here.");
    document.getElementById("allOrdersCount").textContent = orders.length;
    document.getElementById("receivingCount").textContent = orders.filter(order => orderDeliveryStep(order) < 4).length;
    document.getElementById("completedCount").textContent = orders.filter(order => orderDeliveryStep(order) === 4).length;
    document.querySelectorAll("[data-order-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.orderFilter === filter)));
  }

  function renderRefunds() {
    const container = document.getElementById("profileRefunds");
    container.replaceChildren();
    for (const request of accountRefundRequests()) {
      const card = document.createElement("article");
      card.className = "account-order";
      const header = document.createElement("div");
      header.className = "account-order-header";
      header.append(profileText("strong", request.id + " / " + request.orderId), profileText("span", request.status, "account-order-status"));
      const body = document.createElement("div");
      body.className = "account-order-items";
      body.append(profileText("p", request.reason), profileText("p", request.details, "account-storage-note"), profileText("p", "Requested amount: " + paymentAmount(request.amount) + " / " + profileDate(request.createdAt), "account-storage-note"));
      const footer = document.createElement("div");
      footer.className = "account-order-footer";
      footer.append(action("Contact support", "pages/contact.html"));
      if (request.status === "Request recorded") {
        const withdraw = profileText("button", "Withdraw request", "button secondary");
        withdraw.type = "button";
        withdraw.addEventListener("click", () => {
          try { withdrawRefundRequest(request.id); render(); notice.textContent = "Your local request was withdrawn. No payment was changed."; }
          catch (problem) { notice.textContent = problem.message; }
        });
        footer.append(withdraw);
      }
      card.append(header, body, footer);
      container.append(card);
    }
    if (!container.children.length) empty(container, "No return requests", "For a delivered order with a verified sample payment, open My purchases and choose Return / Refund.", "rotate-ccw");
  }

  function renderFavorites() {
    const container = document.getElementById("profileFavorites");
    container.replaceChildren();
    const products = getWishlist().map(id => catalogProducts().find(product => product.id === id)).filter(Boolean);
    for (const product of products) {
      const card = document.createElement("article");
      card.className = "account-favorite";
      const link = document.createElement("a");
      link.href = "pages/product.html?id=" + encodeURIComponent(product.id);
      link.append(productImage(product), profileText("h3", product.name), profileText("strong", money(product.price)));
      const remove = profileText("button", "Remove from favorites");
      remove.type = "button";
      remove.setAttribute("aria-label", "Remove " + product.name + " from favorites");
      remove.addEventListener("click", () => { try { toggleWishlist(product.id); } catch { notice.textContent = "Favorites could not be saved. Please check browser storage."; } });
      card.append(link, remove);
      container.append(card);
    }
    if (!products.length) empty(container, "Keep your favorites close", "Tap the heart on any product to save it for later.", "heart");
    document.getElementById("favoritesCount").textContent = products.length;
  }

  function render() {
    const user = getSignedInUser();
    notice.textContent = "";
    document.getElementById("profileGate").hidden = !!user;
    document.getElementById("profileAccount").hidden = !user;
    resetPhoto(user);
    if (!user) {
      document.getElementById("refundDialog")?.close();
      document.getElementById("addressBookDialog")?.close();
      for (const id of ["profileOrders", "profileDeliveries", "profileRefunds", "profileFavorites", "profileAddresses", "profileAddressBook"]) document.getElementById(id).replaceChildren();
      for (const id of ["profileName", "profileEmail", "profileAvatar", "profileGreeting"]) document.getElementById(id).textContent = "";
      document.getElementById("profileDetailsForm").reset();
      return;
    }
    const section = window.location.hash.slice(1);
    const current = ["orders", "tracking", "refunds", "favorites", "details", "addresses"].includes(section) ? section : "orders";
    document.querySelectorAll("[data-account-panel]").forEach(panel => { panel.hidden = panel.dataset.accountPanel !== current; });
    document.querySelectorAll("[data-account-section]").forEach(link => {
      if (link.dataset.accountSection === current) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    document.getElementById("profileGreeting").textContent = user.name.split(" ")[0];
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    paintAvatar(document.getElementById('profileAvatar'), user);
    document.getElementById("profileDisplayName").value = user.name;
    document.getElementById("profileAccountEmail").value = user.email;
    const orders = accountStoreOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    document.getElementById("ordersCount").textContent = orders.length;
    renderOrders(orders);
    const deliveries = document.getElementById("profileDeliveries");
    deliveries.replaceChildren();
    orders.filter(order => orderDeliveryStep(order) < 4).forEach(order => deliveries.append(orderCard(order, true)));
    if (!deliveries.children.length) empty(deliveries, "No deliveries on the way", "Active deliveries appear here. Completed delivery timelines remain available in My purchases.", "truck");
    renderRefunds();
    renderFavorites();
    const addresses = document.getElementById("profileAddresses");
    addresses.replaceChildren();
    const uniqueAddresses = [...new Set(orders.filter(order => order.delivery?.method !== "pickup").map(order => [order.address.lineTwo, order.address.street, order.address.barangay, order.address.city, order.address.province, order.address.postalCode, order.address.country || "Philippines"].filter(Boolean).join(", ")))];
    uniqueAddresses.slice(0, 5).forEach(address => addresses.append(profileText("div", address, "account-address")));
    if (!uniqueAddresses.length) addresses.append(profileText("p", "No delivery addresses yet.", "account-storage-note"));
    renderAddressBook();
  }

  function renderAddressBook() {
    const container = document.getElementById("profileAddressBook");
    container.replaceChildren();
    const book = getAddressBook();
    for (const entry of book.addresses) {
      const block = document.createElement("article");
      block.className = "saved-address";
      const heading = document.createElement("div");
      heading.className = "saved-address-heading";
      heading.append(profileText("h3", entry.label));
      if (book.defaultId === entry.id) heading.append(profileText("span", "Default", "saved-address-badge"));
      block.append(heading, profileText("strong", Object.values(entry.recipient).filter(Boolean).join(" ")), profileText("p", entry.phone), profileText("p", [entry.address.lineTwo, entry.address.street, entry.address.barangay, entry.address.city, entry.address.province, entry.address.postalCode, entry.address.country || "Philippines"].filter(Boolean).join(", ")));
      const actions = document.createElement("div");
      actions.className = "account-order-actions";
      const operations = [["Edit", () => openAddressBookEditor(entry.id)]];
      if (book.defaultId !== entry.id) operations.push(["Set as default", () => setDefaultAddress(entry.id)]);
      operations.push(["Remove", () => {
        if (confirm("Remove this saved address? Existing orders will not change.")) removeAddressBookEntry(entry.id);
      }]);
      for (const [label, handler] of operations) {
        const button = profileText("button", label, "button secondary");
        button.type = "button";
        button.addEventListener("click", async () => { try { button.disabled = true; await handler(); } catch (problem) { notice.textContent = problem.message; } finally { button.disabled = false; } });
        actions.append(button);
      }
      block.append(actions);
      container.append(block);
    }
    if (!book.addresses.length) {
      container.append(profileText("h3", "Where should your next setup go?"), profileText("p", "Add a home or work address to make your next checkout easier.", "account-storage-note"));
    }
  }

  document.getElementById("addProfileAddress").addEventListener("click", () => openAddressBookEditor());
  window.addEventListener("store-addressbook-change", () => { if (getSignedInUser()) renderAddressBook(); });
  document.getElementById("profileLogin").addEventListener("click", () => openAccountDialog("login", render));
  document.getElementById("profileLogout").addEventListener("click", signOutStoreAccount);
  document.getElementById("profileOrderSearch").addEventListener("input", () => { if (getSignedInUser()) renderOrders(accountStoreOrders()); });
  document.querySelectorAll("[data-order-filter]").forEach(button => button.addEventListener("click", () => { filter = button.dataset.orderFilter; if (getSignedInUser()) renderOrders(accountStoreOrders()); }));
  document.getElementById("profileDetailsForm").addEventListener("submit", async event => {
    event.preventDefault();
    const user = getSignedInUser();
    const name = document.getElementById("profileDisplayName").value.trim();
    if (!user || !name) { notice.textContent = "Enter a display name while signed in."; return; }
    try {
      if (typeof storeDatabase !== "undefined" && storeDatabase.enabled) {
        await storeDatabase.updateName(name);
        notice.textContent = "Your display name has been updated.";
        return;
      }
      const accounts = getDemoAccounts().map(account => account.email === user.email ? { ...account, name } : account);
      localStorage.setItem("bitsAndBytesAccounts", JSON.stringify(accounts));
      window.dispatchEvent(new Event("store-account-change"));
      notice.textContent = "Your display name has been updated.";
    } catch { notice.textContent = "Changes could not be saved. Please check browser storage."; }
  });
  window.addEventListener("hashchange", render);
  window.addEventListener("store-account-change", () => { filter = "all"; document.getElementById("profileOrderSearch").value = ""; document.getElementById("refundDialog")?.close(); document.getElementById("addressBookDialog")?.close(); render(); });
  window.addEventListener("store-wishlist-change", () => { if (getSignedInUser()) renderFavorites(); });
  window.addEventListener("storage", render);
  render();
}

wireProfilePage();
