// Browser-local sample orders only. Real payment/courier updates need a server.
const storeOrdersKey = "bitsAndBytesOrders";
const deliverySteps = ["Order recorded", "Preparing your items", "Dispatched", "Out for delivery", "Delivered"];
function orderStepLabels(order) {
  return order.delivery?.method === "pickup" ? ["Order recorded", "Preparing your items", "Ready for collection", "Collection arranged", "Collected"] : deliverySteps;
}
const deliveryRates = {
  standard: { label: "Standard delivery", fee: 150 },
  express: { label: "Express delivery", fee: 300 }
};

function selectedDeliveryService() {
  return document.querySelector('[name="deliveryService"]:checked')?.value || "standard";
}

function paymentIsDeferred(method) {
  return ["Cash on Delivery", "Pay at pickup"].includes(method);
}

function selectedDeliveryRate() {
  if (typeof selectedFulfillment === "function" && selectedFulfillment() === "pickup") return { method: "pickup", service: "pickup", label: "Store pickup", country: "Philippines", baseFee: 0, surcharge: 0, fee: 0 };
  const service = selectedDeliveryService();
  const country = document.getElementById("countryRegion")?.value || "Philippines";
  const setting = shippingDestinations[country];
  if (!setting) throw new Error("Choose a supported shipping country.");
  const base = deliveryRates[service];
  const surcharge = service === "express" ? setting.expressSurcharge : setting.surcharge;
  return { ...base, method: "delivery", service, country, baseFee: base.fee, surcharge, fee: base.fee + surcharge };
}

function updateCheckoutTotals() {
  if (!document.getElementById("checkoutGrandTotal")) return;
  const subtotal = getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = selectedDeliveryRate();
  document.getElementById("checkoutSubtotal").textContent = paymentAmount(subtotal);
  document.getElementById("checkoutDeliveryLabel").textContent = delivery.label;
  document.getElementById("checkoutDeliveryFee").textContent = paymentAmount(subtotal > 0 ? delivery.baseFee : 0);
  const surcharge = document.getElementById("checkoutOverseasFee");
  if (surcharge) { surcharge.textContent = paymentAmount(subtotal > 0 ? delivery.surcharge : 0); surcharge.parentElement.hidden = delivery.country === "Philippines"; }
  const note = document.getElementById("overseasShippingNote");
  if (note) note.hidden = delivery.country === "Philippines";
  const cod = document.querySelector('[name="paymentMethod"][value="Cash on Delivery"]');
  if (cod) {
    cod.closest("label").querySelector("strong").textContent = delivery.method === "pickup" ? "Pay at pickup" : "Cash on Delivery";
    cod.disabled = delivery.country !== "Philippines";
    cod.closest("label").classList.toggle("unavailable-payment", cod.disabled);
    if (cod.disabled && cod.checked) {
      const alternative = document.querySelector('[name="paymentMethod"][value="Card Payment"]');
      if (alternative) { alternative.checked = true; alternative.dispatchEvent(new Event("change")); }
    }
  }
  document.getElementById("checkoutGrandTotal").textContent = paymentAmount(subtotal > 0 ? subtotal + delivery.fee : 0);
}

function wireDeliveryRates() {
  document.querySelectorAll('[name="deliveryService"]').forEach(input => input.addEventListener("change", updateCheckoutTotals));
  updateCheckoutTotals();
}

function savedStoreOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(storeOrdersKey));
    return Array.isArray(orders) ? orders.filter(order =>
      order && typeof order.id === "string" && typeof order.accountEmail === "string" &&
      Number.isFinite(order.total) && order.total > 0 &&
      Array.isArray(order.items) && order.items.every(item => item && typeof item.id === "string" && typeof item.name === "string" && Number.isFinite(item.price) && Number.isSafeInteger(item.quantity) && item.quantity > 0) &&
      Array.isArray(order.events) && order.events.every(event => event && Number.isInteger(event.step) && event.step >= 0 && event.step < deliverySteps.length) &&
      order.recipient && order.address && order.contact && typeof order.contact.email === "string" && typeof order.contact.phone === "string"
    ) : [];
  } catch { return []; }
}

function accountStoreOrders() {
  const user = getSignedInUser();
  return user ? savedStoreOrders().filter(order => order.accountEmail === user.email) : [];
}

function paymentAmount(amount) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
}

function cartSignature(cart = getCart()) {
  return JSON.stringify(cart.map(item => [item.id, item.price, item.quantity]).sort((a, b) => a[0].localeCompare(b[0])));
}

function orderIdentifier() {
  return "BB-" + crypto.randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase();
}

function samplePaymentProblem(attempt) {
  const user = getSignedInUser();
  if (!user || user.email !== attempt.order.accountEmail) return "Please sign in to the account that started this checkout.";
  if (Date.now() > attempt.expiresAt) return "This sample payment has expired. Close it and start checkout again.";
  if (cartSignature() !== attempt.cartSignature) return "Your cart has changed. Close this payment and review your cart again.";
  const subtotal = getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  let fee = 0;
  if (attempt.order.delivery) {
    const rate = selectedDeliveryRate();
    if (!rate || rate.fee !== attempt.order.delivery.fee || rate.service !== attempt.order.delivery.service || rate.country !== (attempt.order.delivery.country || "Philippines")) return "The delivery service has changed or the destination was updated. Close this payment and review your order again.";
    fee = rate.fee;
  }
  const total = subtotal + fee;
  if (!getCart().length || !Number.isFinite(total) || Math.round(total * 100) !== Math.round(attempt.order.total * 100)) return "The order amount no longer matches your cart.";
  if (!paymentIsDeferred(attempt.order.paymentMethod)) {
    const receipt = attempt.receipt;
    if (!receipt || receipt.status !== "paid") return "Complete the sample payment before checking its verification.";
    if (receipt.orderId !== attempt.order.id || receipt.amount !== attempt.order.total || receipt.provider !== attempt.order.paymentMethod) return "The sample payment does not match this order.";
  }
  return "";
}

function recordSampleOrder(attempt) {
  if (attempt.completed) return attempt.order;
  const problem = samplePaymentProblem(attempt);
  if (problem) throw new Error(problem);
  const order = {
    ...attempt.order,
    sample: true,
    paymentStatus: attempt.order.paymentMethod === "Pay at pickup" ? "Due at pickup" : attempt.order.paymentMethod === "Cash on Delivery" ? "Due on delivery" : "Sample payment verified",
    paymentReference: attempt.receipt?.reference || "",
    createdAt: new Date().toISOString(),
    events: [{ step: 0, time: new Date().toISOString() }]
  };
  // Save the order before clearing the cart; a full browser store must not lose it.
  localStorage.setItem(storeOrdersKey, JSON.stringify([order, ...savedStoreOrders()]));
  attempt.completed = true;
  attempt.order = order;
  saveCart([]);
  return order;
}

function advanceSampleDelivery(id) {
  const orders = savedStoreOrders();
  const order = orders.find(item => item.id === id && item.accountEmail === getSignedInUser()?.email);
  if (!order || order.sample !== true) throw new Error("This sample order is not available for your account.");
  const step = order.events.length;
  if (step >= deliverySteps.length) return order;
  order.events.push({ step, time: new Date().toISOString() });
  localStorage.setItem(storeOrdersKey, JSON.stringify(orders));
  return order;
}
