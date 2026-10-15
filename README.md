# Bits and Bytes

Open `index.html` in a browser to use the storefront. This is the standalone
PC and laptop store; it does not depend on the AgrikAIzen application.

- `data.js`: catalog, product variants, galleries, and builder parts.
- `app.js`: shared navigation, shopping, cart, builder, and product interactions.
- `shopping-tools.js`, `shopping-tools.css`: catalog search/display and side-by-side comparisons.
- `support-form.js`: local message drafts and validated photo previews.
- `styles.css`, `shop.css`, `storefront.css`: appearance and responsive layouts.
- `support.css`: support page and homepage support-form colors and layout.
- `images/`: product photographs, logos, and preview screenshots.
- `downloads/`: store guides and manuals.
- `tmp/`: supporting photo-source and development utilities.

The contact and checkout flows are demonstrations, not a live order or messaging backend.
Checkout requires a local demo account. Registration saves a salted PBKDF2 password
hash in this browser, never the plaintext password. The signed-in email is kept in
session storage for this tab; remembering an email does not sign the customer in.
These browser-side checks can be bypassed and are not production security. Real
accounts and payments require server-side authentication and order validation.
See `images/README.md` for photo organization and source documentation.
See `CLASS_REQUIREMENTS.md` for a classroom-feature checklist and simple functions to study.
