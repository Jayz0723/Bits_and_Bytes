// All voucher amounts are PHP. Edit these rules to add or change store offers.
const storeVouchers = {
  WELCOME10: { percent: 10, minimum: 5000, maximumDiscount: 1500 },
  SAVE500: { amount: 500, minimum: 10000 }
};
const voucherStorageKey = "bitsAndBytesVoucher";
let currentVoucherCode = null;

function selectedVoucherCode() {
  if (currentVoucherCode !== null) return currentVoucherCode;
  try { currentVoucherCode = sessionStorage.getItem(voucherStorageKey) || ""; } catch { currentVoucherCode = ""; }
  return currentVoucherCode;
}

function saveVoucherCode(code) {
  currentVoucherCode = code;
  try {
    if (code) sessionStorage.setItem(voucherStorageKey, code);
    else sessionStorage.removeItem(voucherStorageKey);
  } catch { /* Keep checkout usable when browser storage is unavailable. */ }
}

function evaluateCartVoucher(cart, code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { code: "", discount: 0, error: "" };
  const rule = storeVouchers[normalized];
  if (!Object.hasOwn(storeVouchers, normalized)) return { code: normalized, discount: 0, error: "This voucher code is not recognized." };
  const subtotalCents = Math.round(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100);
  if (!cart.length || subtotalCents <= 0) return { code: normalized, discount: 0, error: "Add items to your cart before applying a voucher." };
  if (subtotalCents < rule.minimum * 100) return { code: normalized, discount: 0, error: normalized + " requires an items subtotal of " + paymentAmount(rule.minimum) + "." };
  const discountCents = rule.percent
    ? Math.min(Math.round(subtotalCents * rule.percent / 100), rule.maximumDiscount * 100)
    : rule.amount * 100;
  return { code: normalized, discount: Math.min(subtotalCents, discountCents) / 100, error: "" };
}

function syncVoucherControls(voucher) {
  const active = document.getElementById("activeVoucher");
  if (!active) return;
  active.hidden = !voucher.code;
  document.getElementById("activeVoucherCode").textContent = voucher.code;
  if (voucher.code) {
    const status = document.getElementById("voucherStatus");
    status.textContent = voucher.error || voucher.code + " applied. You save " + paymentAmount(voucher.discount) + " on items.";
    status.classList.toggle("is-error", Boolean(voucher.error));
    status.dataset.voucherState = "active";
  } else if (document.getElementById("voucherStatus").dataset.voucherState === "active") {
    document.getElementById("voucherStatus").textContent = "";
    document.getElementById("voucherStatus").classList.remove("is-error");
  }
}

function wireVoucherControls() {
  const form = document.getElementById("voucherForm");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "yes";
  const input = document.getElementById("voucherCode");
  const status = document.getElementById("voucherStatus");
  form.addEventListener("submit", event => {
    event.preventDefault();
    const code = input.value.trim().toUpperCase();
    const result = evaluateCartVoucher(getCart(), code);
    if (!code || result.error) {
      status.textContent = result.error || "Enter a promo or voucher code.";
      status.classList.add("is-error");
      input.setAttribute("aria-invalid", "true");
      return;
    }
    saveVoucherCode(code);
    input.value = "";
    input.removeAttribute("aria-invalid");
    updateCheckoutTotals();
  });
  input.addEventListener("input", () => input.removeAttribute("aria-invalid"));
  document.getElementById("removeVoucher").addEventListener("click", () => {
    saveVoucherCode("");
    status.textContent = "Voucher removed.";
    status.dataset.voucherState = "removed";
    status.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    updateCheckoutTotals();
    input.focus();
  });
}
