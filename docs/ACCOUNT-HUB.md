# My Account

Open `pages/profile.html`, or choose **Support > My account**. Signed-in customers
can also open it from the sign-in page. The existing dark store theme is retained.

## Files

- `pages/profile.html`: account layout and section navigation.
- `css/profile.css`: responsive sidebar, order lists, and return dialog.
- `js/profile.js`: order filters, search, tracking links, return requests,
  favorites, display-name updates, and recent delivery addresses.
- `js/orders.js`: existing checkout order history and delivery events.
- `js/app.js`: shared account navigation and account-specific favorites.
- `js/address-book.js`: personal address storage, editor, and checkout autofill.
- `tests/check-profile.cjs`: account hub behavior and responsive checks.

## Behavior

Orders come from checkout, not invented purchase history. All orders, To receive,
and Completed filters use the saved delivery events. Previous transactions show
the original PHP amount and payment status. Tracking links open the exact order.

Return/refund requests are whole-order, browser-local sample records. A request
requires a delivered sample order and a verified sample payment. The code checks
ownership, eligibility, reason, description length, and duplicate requests at
submission. Requests can be withdrawn. Neither action changes payment status,
refunds money, contacts staff, or updates a real courier. Actual returns still
need the store's support team and a backend/payment-provider workflow.

Favorites use `bitsAndBytesWishlist:<account email>` while signed in. Guest
favorites use the original `bitsAndBytesWishlist` key and move to the account on
sign-in or registration. Signing out does not erase an account's favorites.
Existing local accounts, order recipients, addresses, and passwords are not
overwritten by changing the profile display name.

The account menu greets the signed-in shopper with `Hi, <display name>` and links
to purchases, tracking, addresses, favorites, and returns. Long names are visually
truncated in the navigation, with the full greeting available in its tooltip.

## Address Book

The Address book section supports adding, editing, removing, and choosing a
default address. Each account uses its own `bitsAndBytesAddressBook:<email>` key.
The first saved address becomes the default. Removing the default selects the
next remaining address. Removing an address requires confirmation. Past order
addresses are snapshots and are never rewritten by address-book changes.

Recipients keep separate first/middle/surname/suffix fields. The editor reuses
the checkout province, city, barangay, and editable postal suggestions. Checkout
selects the default saved address and permits another address or manual entry.
Editing checkout fields does not silently overwrite the saved address.

Orders use `bitsAndBytesOrders`; requests use `bitsAndBytesRefundRequests`.
These are local browser records, not server authentication or secure multi-user
storage. Other accounts cannot access them through the ordinary account UI,
but anyone controlling the browser can inspect or modify browser storage.
Clearing site data removes saved history. No live refund, courier, or production
account integration is implied.
