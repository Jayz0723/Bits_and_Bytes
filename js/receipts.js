// Receipts are derived from the recorded order, never from the current cart or exchange rate.
function receiptText(tag, value, className = "") {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  return element;
}

function orderArrivalEstimate(order) {
  if (order.delivery?.method === "pickup") return "Await collection confirmation";
  const overseas = (order.address.country || "Philippines") !== "Philippines";
  return order.delivery?.service === "express" ? overseas ? "3-7 business days after dispatch" : "1-3 business days after dispatch" : overseas ? "7-15 business days after dispatch" : "3-7 business days after dispatch";
}

function createOrderReceipt(order) {
  const receipt = document.createElement("article");
  receipt.className = "order-receipt";
  receipt.setAttribute("aria-label", "Order receipt");
  const header = document.createElement("header");
  const logo = document.createElement("img");
  logo.src = "images/branding/bitsandbyteslogo.png"; logo.alt = ""; logo.width = logo.height = 48;
  const brand = document.createElement("div");
  brand.append(receiptText("h3", "Bits & Bytes"), receiptText("p", "ORDER RECEIPT"));
  header.append(logo, brand);
  receipt.append(header);
  const details = document.createElement("dl");
  const pickup = order.delivery?.method === "pickup";
  const address = [order.address.lineTwo, order.address.street, order.address.barangay, order.address.city, order.address.province, order.address.postalCode, order.address.country || "Philippines"].filter(Boolean).join(", ");
  for (const [label, value] of [
    ["Receipt no.", order.id],
    ["Date", new Date(order.createdAt).toLocaleString("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }) + " (Philippine time)"],
    ["Customer", Object.values(order.recipient).filter(Boolean).join(" ")],
    [pickup ? "Pickup location" : "Delivery address", pickup ? order.address.street : address],
    ["Contact", order.contact.phone], ["Email", order.contact.email],
    ["Payment method", order.paymentMethod], ["Payment status", order.paymentStatus],
    ["Payment reference", order.paymentReference || "Not collected"],
    ["Fulfillment", order.delivery?.label || "Standard delivery"]
  ]) {
    const row = document.createElement("div"); row.append(receiptText("dt", label), receiptText("dd", value)); details.append(row);
  }
  receipt.append(details, receiptText("h4", "Items"));
  const list = document.createElement("ul"); list.className = "receipt-items";
  for (const item of order.items) {
    const row = document.createElement("li");
    const itemCopy = document.createElement("div");
    itemCopy.append(receiptText("strong", item.quantity + " × " + item.name), receiptText("small", item.specs || ""));
    row.append(itemCopy, receiptText("b", paymentAmount(item.price * item.quantity)));
    list.append(row);
  }
  receipt.append(list);
  const totals = document.createElement("dl"); totals.className = "receipt-totals";
  const fee = order.delivery?.fee || 0;
  const surcharge = order.delivery?.surcharge || 0;
  for (const [label, amount] of [["Items subtotal", order.subtotal ?? order.total - fee], ...(order.discount > 0 ? [["Voucher " + (order.voucher?.code || "discount"), -order.discount]] : []), [pickup ? "Pickup fee" : "Delivery fee", order.delivery?.baseFee ?? fee], ...(surcharge ? [["Overseas destination charge", surcharge]] : []), ["Total (PHP)", order.total]]) {
    const row = document.createElement("div"); row.append(receiptText("dt", label), receiptText("dd", paymentAmount(amount))); totals.append(row);
  }
  receipt.append(totals);
  const estimate = document.createElement("section"); estimate.className = "receipt-estimate";
  estimate.append(receiptText("p", pickup ? "Collection" : "Estimated delivery"), receiptText("strong", orderArrivalEstimate(order)), receiptText("small", pickup ? "Fictional pickup point. No real collection has been scheduled." : "Planning estimate only. Availability and timing require store confirmation."));
  receipt.append(estimate, receiptText("p", "Thank you for choosing Bits & Bytes.", "receipt-thanks"), receiptText("p", "Sample checkout record, not a tax invoice or proof of a real payment. No courier booking or pickup reservation was made.", "receipt-disclaimer"));
  return receipt;
}

function printOrderReceipt(order) {
  if (getSignedInUser()?.email !== order.accountEmail) return;
  document.getElementById("storeReceiptPrint")?.remove();
  const receipt = createOrderReceipt(order);
  receipt.id = "storeReceiptPrint";
  document.body.append(receipt);
  document.body.classList.add("printing-receipt");
  try { window.print(); }
  finally { document.body.classList.remove("printing-receipt"); receipt.remove(); }
}

function openOrderReceipt(orderId) {
  const order = accountStoreOrders().find(item => item.id === orderId);
  if (!order || document.getElementById("orderReceiptDialog")) return;
  const dialog = document.createElement("dialog");
  dialog.id = "orderReceiptDialog";
  dialog.className = "order-receipt-dialog";
  dialog.setAttribute("aria-label", "Order receipt");
  const close = receiptText("button", "×", "receipt-dialog-close");
  close.type = "button"; close.setAttribute("aria-label", "Close receipt"); close.title = "Close receipt";
  close.addEventListener("click", () => dialog.close());
  const print = receiptText("button", "Print / Save receipt", "button primary receipt-print"); print.type = "button";
  const printIcon = document.createElement("img");
  printIcon.src = "images/icons/printer.svg"; printIcon.alt = ""; printIcon.width = printIcon.height = 18;
  print.prepend(printIcon);
  print.addEventListener("click", () => printOrderReceipt(order));
  dialog.append(close, createOrderReceipt(order), print);
  document.body.append(dialog);
  dialog.addEventListener("close", () => dialog.remove());
  const clearOnSignout = () => { if (getSignedInUser()?.email !== order.accountEmail) dialog.close(); };
  window.addEventListener("store-account-change", clearOnSignout);
  dialog.addEventListener("close", () => window.removeEventListener("store-account-change", clearOnSignout), { once: true });
  dialog.showModal();
}
