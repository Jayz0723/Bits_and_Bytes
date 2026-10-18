# Delivery addresses, sample payments, and tracking

## Files

- `js/address-data.js`: generated offline location snapshot.
- `js/addresses.js`: province/city/barangay selection and postal suggestions.
- `js/address-book.js`: account-specific address book and checkout address choice.
- `js/orders.js`: local sample-order storage and validation.
- `js/checkout-flow.js`: QR payment dialog, sample verification, and confirmation.
- `js/tracking.js` and `pages/tracking.html`: account-specific sample order tracking.
- `css/checkout-flow.css`: responsive checkout, confirmation, and tracking styles.
- `images/uploads/gcash-owner-qr.png`: the unmodified user-provided QR image.
- `js/vendor/qrcode.js`: QR Code Generator 1.4.4, Kazuhiko Arase, MIT license.

## Payment boundaries

The default GCash QR is deliberately **non-payable**. It contains a JSON sample
order reference and PHP amount, not a QR Ph banking payload. The supplied real QR
is available separately under a disclosure warning against using it for tests.
Never mark a real transfer paid based on this site's sample buttons or a
customer-entered reference. No OTP, wallet PIN, card number, or CVC is saved in an
order. Browser storage is not a production security boundary.

Completing a sample payment creates a local receipt. Verification checks account,
order ID, provider, PHP amount, the unchanged cart, and a ten-minute expiry. The
success animation appears only after the order is saved, then opens tracking.
Cancellation retains the cart. COD records payment as due, not paid. Duplicate
verification clicks cannot create multiple orders from the same attempt.

Sample delivery pricing is configured once in `deliveryRates` in `js/orders.js`:
standard PHP 150 and express PHP 300. Checkout shows items subtotal, delivery fee,
and total in PHP. The selected service and fee are saved with the order and shown
again in payment confirmation and tracking. Verification rejects a changed
delivery service or mismatched fee. Old orders without delivery fields retain
their original total and have a zero stored delivery fee. These are sample quotes,
not guaranteed courier service or arrival times.

Real automatic verification requires a merchant/payment-provider integration,
server-side payment creation, signed webhooks, idempotency, and authoritative
amount/currency checks. A QR image alone does not supply that integration.
Reference: https://docs.paymongo.com/docs/payment-acceptance-key-concepts

## Tracking boundaries

Orders and delivery events are browser-local and associated with the signed-in
account. Another account cannot view them through the ordinary tracking UI.
The sample advancement control records local event timestamps in Philippine
time. It never creates a waybill, schedules a courier, invents an ETA, or reports
real courier events. Refreshing the page preserves saved sample status. Clearing
site data removes orders, addresses, accounts, and sample tracking history.

## Address sources and limitations

Snapshot retrieved October 16, 2026 from the community-maintained PSGC Cloud v2
API. It contains 82 provinces plus a separate Metro Manila grouping, 1,656 cities
and municipalities, and 42,027 barangay records. It is a reference snapshot, not a
promise of the latest administrative boundaries or delivery availability.

- https://psgc.cloud/api/v2/provinces
- https://psgc.cloud/api/v2/cities-municipalities
- https://psgc.cloud/api/v2/regions and each region's `/barangays` endpoint
- Official PSA classification reference: https://psa.gov.ph/classifications-api/psgc
- Postal reference: https://phlpost.gov.ph/zip-code-locator/

City postal values combine the source snapshot with uniquely matched PHLPost
directory rows. There are suggestions for 1,344 cities/municipalities; unmatched
areas ask for a manual code rather than inventing one. Region codes correct the
source's erroneous Sarangani province label for Metro Manila. Manila districts
are retained in barangay labels to avoid duplicate numbered barangay names.

Selected Quezon City area overrides: Bagumbayan 1110, Commonwealth 1121, Holy
Spirit 1127. City-level values are suggestions, not a province-wide postcode;
barangay-specific suggestions replace them where available. Postal codes stay
editable. The manual barangay option handles newer or unlisted locations.

Additional area reference:
https://notices.philgeps.gov.ph/GEPS/Tender/PrintableBidNoticeAbstractUI.aspx?refid=11130943

Keep Privacy and Terms in sync before connecting a real payment processor,
backend account system, or courier. Have production policies and controls reviewed
before accepting actual payments or storing delivery information on a server.
