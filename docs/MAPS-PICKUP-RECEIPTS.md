# Google Maps preview, pickup and receipts

Run `npm start` and open the connected store at `http://localhost:4173`. Checkout has been restored to a Google Maps iframe preview. No Maps JavaScript SDK or API key is loaded. The map follows the selected city, province/region and country, or the fictional pickup coordinates. Repeated events for the same area do not reload the frame.

## Address entry and privacy

The iframe supports Google's map navigation, but clicks do not fill checkout fields. Customers enter delivery details manually or choose a saved address; the form remains usable if Google is blocked or slow. Do not add fake click-to-fill controls over a cross-origin iframe.

Only the general selected area is included in the store-generated map URL, not names, phone numbers, street addresses or saved-address IDs. Google's service may receive browser/network information and interactions inside its frame. The privacy page reflects this. The external Google Maps link follows the same selected area.

Map imagery and attribution keep their original appearance. Browser checks use a placeholder frame to verify integration, not as proof of Google's network speed or availability. Real Google service availability depends on the user's connection and browser.

The previous Leaflet files and protected Photon server endpoints are retained but unused by checkout. There are no tile, map-config or reverse-geocoding requests from the current checkout. Existing `MAP_*` environment settings do not affect this iframe; no server restart is required for the restored view.

Google's sharing guide: https://support.google.com/maps/answer/7101463 .

## Store pickup

`storePickupLocation` in `js/international.js` defines an illustrative point near Calamba City. It is labelled fictional everywhere and is not an operating store, verified business address or actual collection booking. Replace it only when the store has a real, approved collection address.

Pickup has zero shipping and overseas surcharges. Contact/recipient details remain required, while shipping address fields are disabled. The earlier shipping fields are restored when switching back to delivery. The fictional pickup location is saved on the order, not in the customer's personal address book. Pay at pickup stays **Due at pickup**, not paid. Its timeline uses Ready for collection and Collected rather than courier-delivery labels.

## Receipts

After confirmation, the success dialog stays open to read/print the receipt; **Track your order** opens tracking. There is no automatic redirect that interrupts receipt reading.

The receipt uses the immutable recorded order's recipient, address, items, capacities/colors, quantities, PHP prices, delivery/surcharge breakdown, payment reference/status and timestamp. It is not recalculated from the current cart or selected display currency. COD/pickup is explicitly unpaid. Estimates are configurable planning ranges, not live courier ETAs or store reservations. Sample payment records are not tax invoices or evidence of a real bank payment.

**Print / Save receipt** opens the browser print dialog; choose Save as PDF there. Screen receipts use the store's dark teal colors, with an ink-friendly print layout. Tracking and purchase history can reopen receipts for the signed-in account. Orders and receipts still remain in browser storage; only users and saved address books currently use SQLite.

Check: `node tests/check-map-pickup-receipts.cjs` and `node tests/check-orders-tracking.cjs`.

Printer icon: Lucide, ISC license, https://github.com/lucide-icons/lucide/blob/main/icons/printer.svg .
