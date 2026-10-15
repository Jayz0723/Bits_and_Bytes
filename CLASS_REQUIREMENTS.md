# Classroom Features in the Store

The store uses plain HTML, CSS, and JavaScript. No framework or build step is required. Open `index.html` in a browser. This is a frontend school project: payments, accounts, messages, and attachments are not processed by a server. Local demo registration and login are required before checkout; passwords are salted and hashed, and sessions last for the browser tab. This is not production authentication.

## Where to Find Each Requirement

| Requirement from the photos | Related store feature | Main files |
| --- | --- | --- |
| Y keyboard event | Existing PC-shopping help shortcut; ignored while typing in forms | app.js: showkey |
| strong / em | Important comparison guidance | products.html |
| del / ins | Previous sale prices and newly inserted comparison prices | app.js: productPriceMarkup; shopping-tools.js |
| Top / bottom anchors | Store information link and shared Back to top footer link | products.html; app.js: wireStoreFooter |
| hr | Contact draft separator | contact.html |
| pre | Store contact information keeps its line breaks | contact.html |
| toggle() / reveal | Show or hide the laptop figure, with an accessible button | components.html; app.js: toggle |
| ruby | RAM pronunciation in the upgrade glossary | components.html |
| table / th / tr / td / tfoot | Live comparison of up to three real configurations, including price footer | shopping-tools.js |
| dl / dt / dd / dfn | Upgrade glossary with buying advice | components.html |
| ol / li and ul / li | Purchase checklist and care tips | components.html |
| audio | Optional, user-controlled background music, not autoplay | index.html |
| iframe | Focused support form on the homepage, not a whole page inside a page | index.html; support-widget.html; support-form.js |
| figure / figcaption | Product comparison photos and laptop inspection | shopping-tools.js; components.html |
| Image map | Click actual PC, laptop, and component images for component information | components.html; app.js |
| PDF | Downloadable PC guide and built-in preview with fallback link | downloads.html; PC_GUIDE.pdf |
| Checkbox | Stock/brand filters and Remember my email preference | products.html; login.html |
| Radio | Grid/list display; checkout payment method | products.html; cart.html |
| Datalist | Product-name search suggestions | products.html; app.js: renderProductsPage |
| Multiplication / stocks | Quantity times unit price; whole-number quantities and shared physical stock limits | app.js: multiply, wholeQuantity, addToCart, renderCart |
| Email validation | Native required email inputs in support, sign-in, and checkout forms | contact.html; login.html; cart.html |
| Go button | Search submits without leaving the catalog; Start request validates and transfers the support email | products.html; support-form.js |
| Optgroup / select | Product-type groups and configuration comparison groups | products.html; shopping-tools.js |
| Textarea | Support message and delivery instructions | contact.html; cart.html |
| Textbox / password | Name, email, and show/hide password; passwords are never saved | login.html; app.js: wireLoginForm |
| Upload | Optional support attachment with type/size validation and local image preview | contact.html; support-form.js |
| Repeating image | Subtle repeated trim on the laptop inspection panel | styles.css; images/store-trim.svg |
| Cursor | Pointer for controls and disabled cursor for unavailable actions | styles.css |
| Border image | Image border on the laptop reveal button | styles.css |
| Focus | Visible keyboard focus ring around interactive controls | styles.css |
| Transition | Product-card hover/focus transitions, disabled for reduced-motion users | styles.css |

## Simple Code to Study

- `shopping-tools.js` keeps the new comparison tool together: ordinary loops, named functions, native selects, and a small table template.
- `multiply(q, p)` reads quantity and price inputs and returns their product. Quick order uses the result in an `output` element.
- `wholeQuantity(value, maximum)` prevents fractional quantities and limits orders to available stock.
- `toggle()` changes the laptop figure's `hidden` property and updates its button label.
- `support-form.js` prepares a local message draft. Uploaded images use a temporary browser URL, not an online upload service.
- `shopping-tools.css` contains the new search, list, and comparison layouts without changing the store palette.

## Checks

`check-shopping-tools.cjs` covers the new interactions, images, stock limits, saved quantities, upload validation, support drafts, and desktop/mobile layouts. Existing `check-shop-layout.cjs`, `check-storefront.cjs`, and `check-social-links.cjs` cover the preserved storefront features. The checks need Node and the Playwright installation referenced at the top of each file.
