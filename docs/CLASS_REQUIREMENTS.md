# Classroom Features in the Store

The store uses plain HTML, CSS, and JavaScript. No framework or build step is required. Open `index.html` in a browser. This is a frontend school project: payments, accounts, messages, and attachments are not processed by a server. Local demo registration and login are required before checkout; passwords are salted and hashed, and sessions last for the browser tab. This is not production authentication.

## Where to Find Each Requirement

| Requirement from the photos | Related store feature | Main files |
| --- | --- | --- |
| Y keyboard event | Existing PC-shopping help shortcut; ignored while typing in forms | js/app.js: showkey |
| strong / em | Important comparison guidance | pages/products.html |
| del / ins | Previous sale prices and newly inserted comparison prices | js/app.js: productPriceMarkup; js/shopping-tools.js |
| Top / bottom anchors | Store information link and shared Back to top footer link | pages/products.html; js/app.js: wireStoreFooter |
| hr | Contact draft separator | pages/contact.html |
| pre | Store contact information keeps its line breaks | pages/contact.html |
| toggle() / reveal | Show or hide the laptop figure, with an accessible button | pages/components.html; js/app.js: toggle |
| ruby | RAM pronunciation in the upgrade glossary | pages/components.html |
| table / th / tr / td / tfoot | Live comparison of up to three real configurations, including price footer | js/shopping-tools.js |
| dl / dt / dd / dfn | Upgrade glossary with buying advice | pages/components.html |
| ol / li and ul / li | Purchase checklist and care tips | pages/components.html |
| audio | Optional, user-controlled background music, not autoplay | index.html |
| iframe | Focused support form on the homepage, not a whole page inside a page | index.html; pages/support-widget.html; js/support-form.js |
| figure / figcaption | Product comparison photos and laptop inspection | js/shopping-tools.js; pages/components.html |
| Image map | Click actual PC, laptop, and component images for component information | pages/components.html; js/app.js |
| PDF | Downloadable PC guide and built-in preview with fallback link | pages/downloads.html; downloads/PC_GUIDE.pdf |
| Checkbox | Stock/brand filters and Remember my email preference | pages/products.html; pages/login.html |
| Radio | Grid/list display; checkout payment method | pages/products.html; pages/cart.html |
| Datalist | Product-name search suggestions | pages/products.html; js/app.js: renderProductsPage |
| Multiplication / stocks | Quantity times unit price; whole-number quantities and shared physical stock limits | js/app.js: multiply, wholeQuantity, addToCart, renderCart |
| Email validation | Native required email inputs in support, sign-in, and checkout forms | pages/contact.html; pages/login.html; pages/cart.html |
| Go button | Search submits without leaving the catalog; Start request validates and transfers the support email | pages/products.html; js/support-form.js |
| Optgroup / select | Product-type groups and configuration comparison groups | pages/products.html; js/shopping-tools.js |
| Textarea | Support message and delivery instructions | pages/contact.html; pages/cart.html |
| Textbox / password | Name, email, and show/hide password; passwords are never saved | pages/login.html; js/app.js: wireLoginForm |
| Upload | Optional support attachment with type/size validation and local image preview | pages/contact.html; js/support-form.js |
| Repeating image | Subtle repeated trim on the laptop inspection panel | css/styles.css; images/decor/store-trim.svg |
| Cursor | Pointer for controls and disabled cursor for unavailable actions | css/styles.css |
| Border image | Image border on the laptop reveal button | css/styles.css |
| Focus | Visible keyboard focus ring around interactive controls | css/styles.css |
| Transition | Product-card hover/focus transitions, disabled for reduced-motion users | css/styles.css |

## Simple Code to Study

- `js/shopping-tools.js` keeps the new comparison tool together: ordinary loops, named functions, native selects, and a small table template.
- `multiply(q, p)` reads quantity and price inputs and returns their product. Quick order uses the result in an `output` element.
- `wholeQuantity(value, maximum)` prevents fractional quantities and limits orders to available stock.
- `toggle()` changes the laptop figure's `hidden` property and updates its button label.
- `js/support-form.js` prepares a local message draft. Uploaded images use a temporary browser URL, not an online upload service.
- `css/shopping-tools.css` contains the new search, list, and comparison layouts without changing the store palette.

## Checks

`tests/check-shopping-tools.cjs` covers the shopping interactions, images, stock limits, saved quantities, upload validation, support drafts, and desktop/mobile layouts. Other checks in `tests/` cover the storefront, galleries, builder, accounts, support, and social links. Run `node tests/check-file-structure.cjs` to verify local links and asset paths without a browser. Browser checks need Node, Playwright, and Edge; see the root README for commands.
