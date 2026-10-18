// Pickup hides delivery-only inputs without losing the customer's saved form values.
function wireFulfillmentOptions() {
  if (!document.getElementById("storePickupDetails")) return;
  const original = new Map();
  const ids = ["countryRegion", "streetAddress", "addressLineTwo", "provinceSelect", "citySelect", "barangaySelect", "postalCode", "otherBarangay", "internationalRegion", "internationalCity", "deliveryLandmark", "deliveryInstructions"];
  const nodes = [];
  for (const id of ids) {
    const input = document.getElementById(id);
    if (!input) continue;
    nodes.push(input, ...document.querySelectorAll(`label[for="${id}"]`));
    if (input.parentElement.matches(".address-grid > div, .address-editor-grid > div")) nodes.push(input.parentElement);
  }
  nodes.push(document.querySelector(".saved-address-choice"), document.querySelector(".delivery-services"));
  const unique = [...new Set(nodes.filter(Boolean))];
  function refresh() {
    const pickup = selectedFulfillment() === "pickup";
    document.getElementById("checkoutFirstName").closest("fieldset").querySelector("legend").textContent = pickup ? "Pickup recipient" : "Delivery address";
    document.getElementById("storePickupDetails").hidden = !pickup;
    if (pickup) {
      for (const node of unique) {
        if (!original.has(node)) original.set(node, { hidden: node.hidden, disabled: node.disabled, required: node.required });
        node.hidden = true;
        if ("disabled" in node) node.disabled = true;
        if ("required" in node) node.required = false;
      }
    } else {
      for (const [node, state] of original) {
        node.hidden = state.hidden;
        if ("disabled" in node) node.disabled = state.disabled;
        if ("required" in node) node.required = state.required;
      }
      original.clear();
    }
    updateCheckoutTotals();
    document.querySelector('[name="paymentMethod"]:checked')?.dispatchEvent(new Event("change"));
    window.dispatchEvent(new Event("store-destination-change"));
  }
  document.querySelectorAll('[name="fulfillmentMethod"]').forEach(input => input.addEventListener("change", refresh));
}

wireFulfillmentOptions();
