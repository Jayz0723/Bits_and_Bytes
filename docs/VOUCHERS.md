# Promo codes and vouchers

Edit `storeVouchers` in `js/vouchers.js`:

- `WELCOME10`: 10% off items with a PHP 5,000 minimum; maximum discount PHP 1,500.
- `SAVE500`: PHP 500 off items with a PHP 10,000 minimum.

Codes ignore case and surrounding spaces. One voucher applies per order, replacing
the previous valid code. Invalid replacements leave the existing voucher intact.
The selected code persists for the current tab session; only the code is stored,
never a user-supplied discount amount. It clears after successful order recording.
There are no expiry dates or per-customer redemption limits on these two offers.

Discounts apply to current item prices and exclude delivery fees and overseas
surcharges. PHP is the calculation currency; cart display follows the selected
display currency. Minimums, caps, and cent rounding are recalculated from the cart.
If the cart stops qualifying, the code stays visible with an explanation and zero
discount. Customers can remove it or adjust their cart.

`checkoutPricing()` in `js/orders.js` supplies the shared totals. Payment review and
verification use the same discount and reject changed codes/amounts. Orders keep
an immutable `discount` and `voucher` snapshot, which receipts also display. Older
orders without vouchers continue to work.

Orders/payment verification remain the existing browser-local sample flow, not a
real payment gateway. For real sales, validate prices and voucher rules on a trusted
server and store redemptions there; browser checks cannot enforce real promotions
against tampering. Account/address storage is unaffected.

Footer text links use a left-origin underline for hover and keyboard focus. Legal
links have their own divided row; existing support, shopping and social links stay
available. Reduced-motion preferences disable the underline transition.

Check: `node tests/check-vouchers-footer.cjs`.
