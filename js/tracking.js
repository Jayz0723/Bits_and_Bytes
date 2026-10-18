// Order details are visible only to their signed-in browser-local account.
function trackingText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function trackingDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" });
}

function wireTrackingPage() {
  if (!document.getElementById("trackingLookup")) return;
  let selectedId = new URLSearchParams(window.location.search).get("order") || "";
  const reference = document.getElementById("trackingReference");
  const select = document.getElementById("savedOrderSelect");
  const message = document.getElementById("trackingMessage");

  function render() {
    const user = getSignedInUser();
    document.getElementById("trackingSignIn").hidden = !!user;
    document.getElementById("trackingAccount").hidden = !user;
    // Clear personal content when the current account signs out.
    document.getElementById("trackingOrder").hidden = true;
    document.getElementById("trackingItems").replaceChildren();
    for (const id of ["trackingRecipient", "trackingAddress", "trackingContact"]) document.getElementById(id).textContent = "";
    if (!user) return;
    const orders = accountStoreOrders();
    select.replaceChildren(new Option("Select an order", ""));
    for (const order of orders) select.add(new Option(order.id + " - " + trackingDate(order.createdAt), order.id));
    document.getElementById("trackingEmpty").hidden = orders.length > 0;
    if (!selectedId && orders.length) selectedId = orders[0].id;
    reference.value = selectedId;
    const order = orders.find(order => order.id === selectedId);
    if (!order) { message.textContent = selectedId ? "Order not found in this account on this browser." : ""; return; }
    message.textContent = "";
    select.value = order.id;
    document.getElementById("trackingOrder").hidden = false;
    document.getElementById("trackingOrderTitle").textContent = order.id;
    document.getElementById("trackingReceiptButton").onclick = () => openOrderReceipt(order.id);
    document.getElementById("trackingCreated").textContent = "Recorded " + trackingDate(order.createdAt) + " (Philippine time)";
    document.getElementById("trackingPaymentBadge").textContent = order.paymentStatus;
    const step = Math.max(0, Math.min(deliverySteps.length - 1, order.events.length - 1));
    const pickup = order.delivery?.method === "pickup";
    const steps = orderStepLabels(order);
    document.getElementById("trackingCurrentStatus").textContent = steps[step];
    const timeline = document.getElementById("trackingTimeline");
    timeline.replaceChildren();
    steps.forEach((label, index) => {
      const event = order.events.find(event => event.step === index);
      const item = document.createElement("li");
      item.className = index < step ? "is-complete" : index === step ? "is-current" : "";
      if (index === step) item.setAttribute("aria-current", "step");
      item.append(trackingText("span", String(index + 1), "tracking-step-number"), trackingText("strong", label), trackingText("small", event ? trackingDate(event.time) : "Pending"));
      timeline.append(item);
    });
    const advance = document.getElementById("advanceSampleDelivery");
    advance.disabled = step === deliverySteps.length - 1;
    advance.textContent = pickup ? advance.disabled ? "Sample collection complete" : "Advance sample collection" : advance.disabled ? "Sample delivery complete" : "Advance sample delivery";
    const items = document.getElementById("trackingItems");
    for (const product of order.items) {
      const row = document.createElement("article");
      row.className = "tracking-product";
      const image = document.createElement("img");
      if (typeof product.image === "string" && /^images\/[\w/.-]+$/.test(product.image) && !product.image.includes("..")) image.src = product.image;
      image.alt = product.name;
      image.width = 90;
      image.height = 90;
      image.addEventListener("error", () => image.remove());
      const text = document.createElement("div");
      const link = document.createElement("a");
      link.href = "pages/product.html?id=" + encodeURIComponent(product.productId || product.id);
      if (product.variantId) link.href += "&variant=" + encodeURIComponent(product.variantId);
      link.textContent = product.name;
      text.append(link, trackingText("p", product.specs), trackingText("small", "Quantity: " + product.quantity));
      row.append(image, text, trackingText("strong", paymentAmount(product.price * product.quantity)));
      items.append(row);
    }
    document.getElementById("trackingRecipient").textContent = Object.values(order.recipient).filter(Boolean).join(" ");
    document.getElementById("trackingAddress").textContent = pickup ? order.address.address || order.address.street : [order.address.lineTwo, order.address.street, order.address.barangay, order.address.city, order.address.province, order.address.postalCode, order.address.country || "Philippines"].filter(Boolean).join(", ");
    document.getElementById("trackingContact").textContent = order.contact.email + " / " + order.contact.phone;
    const summary = document.getElementById("trackingSummary");
    summary.replaceChildren();
    for (const [label, value] of [["Payment method", order.paymentMethod], ["Payment reference", order.paymentReference || "Not yet collected"], ["Items subtotal", paymentAmount(order.subtotal ?? order.total)], ["Delivery service", order.delivery?.label || "Standard delivery"], ["Delivery fee", paymentAmount(order.delivery?.fee || 0)], ["Order total", paymentAmount(order.total)], ["Courier", "Not booked - sample tracking"]]) {
      const row = document.createElement("div");
      row.append(trackingText("dt", label), trackingText("dd", value));
      summary.append(row);
    }
  }

  document.getElementById("trackingLogin").addEventListener("click", () => openAccountDialog("login", render));
  document.getElementById("trackingLookup").addEventListener("submit", event => {
    event.preventDefault();
    selectedId = reference.value.trim().toUpperCase();
    const url = new URL(window.location.href);
    url.searchParams.set("order", selectedId);
    history.replaceState(null, "", url);
    render();
  });
  select.addEventListener("change", () => {
    selectedId = select.value;
    render();
  });
  document.getElementById("advanceSampleDelivery").addEventListener("click", () => {
    try { advanceSampleDelivery(selectedId); render(); }
    catch (problem) { message.textContent = problem.message; }
  });
  window.addEventListener("store-account-change", render);
  window.addEventListener("storage", event => { if (event.key === storeOrdersKey) render(); });
  render();
}

wireTrackingPage();
