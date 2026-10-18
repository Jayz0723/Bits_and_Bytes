# Database-backed store

## Open the connected version

Install Node.js 24 or later, open a terminal in the Bits-and-Bytes folder and run:

```text
npm start
```

Open `http://localhost:4173`. No package installation or paid database account is needed.
To use a different port in PowerShell: `$env:PORT = "4174"`, then `npm start`.
Opening `index.html` directly still works as a standalone preview, but uses browser-local
accounts and addresses. Existing file-preview accounts are not automatically imported.
The previously requested sample sign-in is seeded using its existing password hash.

## What is stored

`data/store.sqlite` contains users, password hashes/salts, expiring hashed sessions,
and per-user address books with default-address choices and revision numbers.
The folder is ignored by Git and cannot be downloaded through the web server.
Do not upload the database, its WAL files or backups to a public repository.
Stop the server before making a private backup of the `data` folder.

Accounts and addresses survive server restarts and can be accessed from another browser
using the same server. Carts, orders, favorites and sample tracking remain browser-local.
Deleting an address does not change an earlier order's delivery details.
Sessions use HttpOnly, SameSite=Strict cookies. Passwords use salted PBKDF2-SHA256.
API writes reject cross-origin requests; sign-in is rate limited. Address edits use a
revision check so stale tabs cannot silently overwrite a newer address book.

This server binds only to the local computer. Before internet deployment, configure
HTTPS, Secure cookies (`COOKIE_SECURE=1`), private backups, monitoring, email verification,
password recovery and production database operations. Update `storeDatabase.enabled`
in `js/database.js` for the same-origin production host. Never expose the development
server directly to the internet. Real payments and courier bookings are not implemented.

## Overseas checkout

`js/international.js` holds supported countries, postal formats, suggested regions/cities
and store-configured surcharges. Customers can type other regions/cities within each
supported country; suggestions are not a complete worldwide address or postcode database.
No sample street or recipient is inserted into a customer's address book.

| Destination | Standard surcharge PHP | Express surcharge PHP |
| --- | ---: | ---: |
| Philippines | 0 | 0 |
| Japan | 1400 | 2400 |
| China | 1200 | 2100 |
| Spain | 2200 | 3400 |
| France | 2200 | 3400 |
| United States | 2400 | 3700 |

These surcharges are added to the existing standard PHP150 or express PHP300 base fee.
They are illustrative store settings, not live courier prices. Checkout lists the base
fee and overseas surcharge separately. Import duties/taxes are not included. Availability
must be confirmed before accepting real international orders. COD is Philippines-only.
Amounts, verification and order records remain in PHP regardless of display currency.

Postal formatting reference: https://www.upu.int/en/Postal-Solutions/Programmes-Services/Addressing-Solutions
Japan accepts seven digits with an optional hyphen; China six digits; Spain and France
five digits; the US five digits or ZIP+4. Postal examples are format examples, not
guaranteed matches for an entire city. Customers must enter their exact street's postcode.

## Checks

```text
node tests/check-database.cjs
node tests/check-address-book-delivery.cjs
node tests/check-orders-tracking.cjs
node tests/check-localization.cjs
```

The database check creates an isolated ignored database under `tmp`, not real user data.
