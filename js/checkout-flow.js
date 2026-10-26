// Sample checkout stays on this device. Never treat these checks as bank verification.
function setCheckoutStep(step) {
  document.querySelectorAll(".checkout-steps li").forEach((item, index) => {
    item.classList.toggle("is-current", index === step - 1);
    if (index === step - 1) item.setAttribute("aria-current", "step"); else item.removeAttribute("aria-current");
  });
}

function startSampleCheckout(form) {
  if (document.getElementById("samplePaymentDialog")) return;
  const status = document.getElementById("checkoutStatus");
  status.textContent = "";
  const user = getSignedInUser();
  if (!user || !form.reportValidity() || !getCart().length) return;
  const value = id => document.getElementById(id).value.trim();
  const pickup = selectedFulfillment() === "pickup";
  if (!value("checkoutFirstName") || !value("checkoutSurname") || (!pickup && !value("streetAddress"))) {
    status.textContent = "Enter a first name, surname, and street address.";
    return;
  }
  if (!pickup && !validateDeliveryAddress()) return;
  const method = form.querySelector('[name="paymentMethod"]:checked').value;
  const provider = form.querySelector('[name="walletProvider"]:checked')?.value;
  const paymentMethod = pickup && method === "Cash on Delivery" ? "Pay at pickup" : method === "E-wallet" ? provider : method;
  const items = getCart().map(item => ({ id: item.id, productId: item.baseProductId || item.id, variantId: item.variantId || "", name: item.name, image: item.image, specs: item.specs, price: item.price, quantity: item.quantity }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) { status.textContent = "Please review the items and amount in your cart."; return; }
  const service = selectedDeliveryService();
  const delivery = selectedDeliveryRate();
  const pricing = checkoutPricing(items);
  const discount = pricing.discount;
  const voucher = discount ? { code: pricing.voucher.code, discount } : null;
  const total = pricing.total;
  const order = {
    id: orderIdentifier(), accountEmail: user.email, items, subtotal, discount, voucher, delivery, total, paymentMethod,
    recipient: { firstName: value("checkoutFirstName"), middleName: value("checkoutMiddleName"), surname: value("checkoutSurname"), suffix: value("checkoutSuffix") },
    contact: { email: value("checkoutEmail"), phone: value("checkoutPhone") },
    address: pickup ? { ...storePickupLocation, street: storePickupLocation.address, barangay: "", postalCode: "", fictional: true } : readDeliveryAddressForm().address
  };
  const attempt = { order, cartSignature: cartSignature(), expiresAt: Date.now() + 10 * 60 * 1000, receipt: null, completed: false };
  const dialog = document.createElement("dialog");
  dialog.id = "samplePaymentDialog";
  dialog.className = "sample-payment-dialog";
  dialog.setAttribute("aria-labelledby", "samplePaymentTitle");
  dialog.innerHTML = `
    <button class="payment-dialog-close" type="button" aria-label="Close payment" title="Close payment">&times;</button>
    <div id="samplePaymentContent">
      <p class="eyebrow">Sample checkout</p>
      <h2 id="samplePaymentTitle"></h2>
      <p class="payment-flow-note">No money is transferred. Verification here applies only to a sample payment on this device.</p>
      <div class="sample-payment-total"><span>Order total (PHP)</span><strong id="samplePaymentAmount"></strong></div>
      <p id="sampleDeliveryBreakdown" class="sample-order-reference"></p>
      <p class="sample-order-reference" id="sampleOrderReference"></p>
      <section class="payment-order-review" aria-label="Review order"><h3>Order details</h3><p id="paymentRecipient"></p><p id="paymentDestination"></p><ul id="paymentItems"></ul></section>
      <div id="sampleQrPanel" hidden>
        <section class="provided-gcash-qr" aria-labelledby="providedQrTitle"><div>
          <p class="eyebrow">GCash / InstaPay</p><h3 id="providedQrTitle">Your GCash QR code</h3>
          <p>This is the QR provided by the store owner. Real transfers require confirmation from the store; this checkout cannot verify them.</p>
          <ol class="gcash-instructions"><li>Open GCash and choose Scan QR.</li><li>Check the recipient shown in GCash and the exact PHP amount above.</li><li>Contact the store with your transfer reference for actual payment confirmation.</li></ol>
          <p class="qr-transfer-note">For this sample checkout, use the sample payment buttons below. Do not send money to test the website.</p>
          <a class="button secondary" href="images/uploads/gcash-owner-qr.png" target="_blank" rel="noopener">Open full-size QR &nearr;</a></div>
          <img src="images/uploads/gcash-owner-qr.png" alt="Owner-provided GCash QR; real transfers are not verified by this website" width="1066" height="2046">
        </section>
        <details class="practice-qr"><summary>View non-payable practice QR</summary><div class="sample-qr-frame"><img id="samplePaymentQr" alt="Non-payable sample payment QR code" width="240" height="240"></div><p class="sample-qr-caption">Contains only the sample order reference. This is not a GCash payment code.</p></details>
      </div>
      <p id="samplePaymentState" role="status">Awaiting sample payment.</p>
      <div class="sample-payment-actions">
        <button id="completeSamplePayment" type="button" class="button secondary">Complete sample payment</button>
        <button id="verifySamplePayment" type="button" class="button primary">Verify sample payment</button>
      </div>
      <p id="samplePaymentError" class="checkout-error" role="alert"></p>
    </div>
    <div id="checkoutSuccess" hidden role="status">
      <div class="checkout-success-mark"><img src="images/icons/circle-check.svg" width="64" height="64" alt=""></div>
      <p class="eyebrow">Order recorded</p>
      <h2>You are all set</h2>
      <p id="checkoutSuccessMessage"></p>
      <p class="sample-order-reference" id="completedOrderReference"></p>
      <div id="checkoutReceipt"></div>
      <button id="printCheckoutReceipt" type="button" class="button secondary receipt-print"><img src="images/icons/printer.svg" width="18" height="18" alt="">Print / Save receipt</button>
      <a id="continueToTracking" class="button primary" href="pages/tracking.html">Track your order &rarr;</a>
    </div>`;
  document.body.append(dialog);
  dialog.querySelector("#samplePaymentTitle").textContent = paymentMethod === "GCash" ? "GCash QR payment" : paymentMethod === "Cash on Delivery" ? "Confirm your order" : paymentMethod + " sample payment";
  dialog.querySelector("#samplePaymentAmount").textContent = paymentAmount(total);
  dialog.querySelector("#sampleDeliveryBreakdown").textContent = "Items " + paymentAmount(subtotal) + (discount ? " - Voucher " + voucher.code + " " + paymentAmount(discount) : "") + " + " + delivery.label + " " + paymentAmount(delivery.fee);
  dialog.querySelector("#sampleOrderReference").textContent = order.id;
  dialog.querySelector('#paymentRecipient').textContent = 'Recipient: ' + Object.values(order.recipient).filter(Boolean).join(' ');
  dialog.querySelector('#paymentDestination').textContent = (pickup ? 'Store pickup: ' : 'Deliver to: ') + [order.address.street, order.address.barangay, order.address.city, order.address.province, order.address.postalCode, order.address.country].filter(Boolean).join(', ');
  for (const item of items) {
    const row = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = item.quantity + ' × ' + item.name;
    const amount = document.createElement('strong');
    amount.textContent = paymentAmount(item.price * item.quantity);
    row.append(label, amount);
    dialog.querySelector('#paymentItems').append(row);
  }
  const cod = paymentIsDeferred(paymentMethod);
  dialog.querySelector("#completeSamplePayment").hidden = cod;
  if (cod) {
    dialog.querySelector("#samplePaymentState").textContent = pickup ? "Payment remains due at pickup. This creates a local sample order only." : "Payment remains due on delivery. This creates a local sample order only.";
    dialog.querySelector("#verifySamplePayment").textContent = "Confirm sample order";
  }
  if (paymentMethod === "GCash") {
    dialog.classList.add('has-gcash');
    dialog.querySelector("#sampleQrPanel").hidden = false;
    const qr = qrcode(0, "M");
    qr.addData(JSON.stringify({ type: "BITS_AND_BYTES_SAMPLE_ONLY", order: order.id, amount: total, currency: "PHP" }));
    qr.make();
    dialog.querySelector("#samplePaymentQr").src = qr.createDataURL(5, 20);
  }
  dialog.querySelector(".payment-dialog-close").addEventListener("click", () => dialog.close());
  let trackingTimer;
  dialog.addEventListener("close", () => { clearTimeout(trackingTimer); setCheckoutStep(1); dialog.remove(); });
  dialog.querySelector("#completeSamplePayment").addEventListener("click", event => {
    attempt.receipt = { orderId: order.id, amount: total, provider: paymentMethod, reference: "SP-" + crypto.randomUUID().slice(0, 8).toUpperCase(), status: "paid" };
    dialog.querySelector("#samplePaymentState").textContent = "Sample payment completed. Reference: " + attempt.receipt.reference;
    dialog.querySelector("#samplePaymentError").textContent = "";
    event.currentTarget.disabled = true;
  });
  let verifying = false;
  dialog.querySelector("#verifySamplePayment").addEventListener("click", async event => {
    if (verifying || attempt.completed) return;
    verifying = true;
    const button = event.currentTarget;
    button.disabled = true;
    const error = dialog.querySelector("#samplePaymentError");
    error.textContent = "";
    try {
      const problem = samplePaymentProblem(attempt);
      if (problem) throw new Error(problem);
      button.textContent = "Checking...";
      await new Promise(resolve => setTimeout(resolve, 650));
      if (!dialog.open) return;
      const completed = recordSampleOrder(attempt);
      dialog.querySelector("#samplePaymentContent").hidden = true;
      dialog.querySelector("#checkoutSuccess").hidden = false;
      setCheckoutStep(3);
      dialog.setAttribute("aria-label", "You are all set");
      dialog.removeAttribute("aria-labelledby");
      dialog.querySelector("#checkoutSuccessMessage").textContent = paymentMethod === "Pay at pickup" ? "Your sample pickup order is saved. Payment is due at collection. The pickup point is fictional; no real reservation was made." : cod ? "Your sample order is saved. Payment is due on delivery; no courier shipment has been booked." : "Your sample payment is verified and your order is saved on this device. No real payment or courier shipment was made.";
      dialog.querySelector("#completedOrderReference").textContent = completed.id;
      const trackingLink = dialog.querySelector("#continueToTracking");
      trackingLink.href = "pages/tracking.html?order=" + encodeURIComponent(completed.id);
      dialog.querySelector("#checkoutReceipt").replaceChildren(createOrderReceipt(completed));
      dialog.querySelector("#printCheckoutReceipt").addEventListener("click", () => printOrderReceipt(completed));
      dialog.classList.add("has-order-receipt");
      renderCart();
      // Keep the receipt open until the customer chooses tracking or closes the dialog.
      dialog.scrollTop = 0;
    } catch (problem) {
      error.textContent = problem.message || "The order could not be saved. Your cart has not been intentionally cleared.";
    } finally {
      verifying = false;
      button.disabled = false;
      button.textContent = cod ? "Confirm sample order" : "Verify sample payment";
    }
  });
  dialog.showModal();
  setCheckoutStep(2);
}
