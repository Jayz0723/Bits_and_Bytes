# Bits and Bytes

Start here: open [index.html](index.html) in your browser. No build step is needed.
This repository contains only the Bits and Bytes store, not AgrikAIzen.

## Folder Map

```text
Bits-and-Bytes/
  index.html              Homepage and starting point
  pages/                  All other store pages
  css/                    Styles and responsive layouts
  js/                     Catalog data and website behavior
  images/                 Pictures grouped by purpose
    products/             Product photos and extra viewing angles
      legacy/             Older image slots kept for existing references
    branding/             Store and manufacturer logos
    showcase/             Homepage, banners, and editorial photos
    guides/               Interactive PC/laptop component images and maps
    social/               Facebook, Instagram, X, and YouTube logos
    icons/                Local interface icons (cart, search, and play)
    decor/                Small background and border artwork
    placeholders/         Spare image placeholders
    uploads/              Existing numbered pictures from the project
  audio/                  Background music and its original copy
  videos/                 Local product previews for inline playback
  downloads/              PDF guide and text manuals
  docs/                   Project and classroom documentation
    image-sources/        Photo-source records and editing notes
  tests/                  Browser checks, separate from website code
  examples/               Original classroom practice page
```

## Find What You Want to Edit

| Change | File |
| --- | --- |
| Homepage, banner, and showcase | [index.html](index.html) |
| Product list and filters | [pages/products.html](pages/products.html) |
| Product details and configurations | [pages/product.html](pages/product.html) |
| Build Your Own PC | [pages/build.html](pages/build.html) |
| Cart and checkout | [pages/cart.html](pages/cart.html) |
| Login and registration | [pages/login.html](pages/login.html) |
| Support form and FAQ | [pages/contact.html](pages/contact.html) |
| Homepage support preview | [pages/support-widget.html](pages/support-widget.html) |
| Interactive hardware guide | [pages/components.html](pages/components.html) |
| About, policies, and downloads | `pages/about.html`, `pages/terms.html`, `pages/warranty.html`, `pages/downloads.html` |
| Products, variants, galleries, and builder choices | [js/data.js](js/data.js) |
| Shared shopping, accounts, navigation, and builder logic | [js/app.js](js/app.js) |
| Product comparison | [js/shopping-tools.js](js/shopping-tools.js) |
| Message drafts and attachment previews | [js/support-form.js](js/support-form.js) |
| Shared colors and base styles | [css/styles.css](css/styles.css) |
| Catalog layout | [css/shop.css](css/shop.css) |
| Storefront presentation | [css/storefront.css](css/storefront.css) |
| Support colors and layout | [css/support.css](css/support.css) |
| Comparison and list-view styles | [css/shopping-tools.css](css/shopping-tools.css) |

## Images and Documents

The homepage uses Microsoft's Surface Laptop Studio 2 product preview from its
manufacturer page, saved in `videos/`. It plays silently in the page, including
when opening the HTML file directly. Playback pauses offscreen and respects reduced
motion settings. Edit the video source and caption in `index.html`; playback and
the pause button are handled by `wireHomeVideo()` in `js/app.js`.

Shared navigation and the cart badge are in `js/app.js`; their appearance and the
full-width banners are in `css/storefront.css`. The navigation shrinks on scroll.
The catalog category buttons update the same filters as the sidebar. Brand and search shortcuts use
`pages/products.html?brand=Microsoft` and `pages/products.html?q=Mac+mini`.
Brand logos identify stocked product brands, not endorsements or formal partnerships.

See [the image guide](docs/IMAGES.md) for photo locations and editing instructions.
See [the classroom checklist](docs/CLASS_REQUIREMENTS.md) for the required HTML,
CSS, and JavaScript features. The PDF is in [downloads/PC_GUIDE.pdf](downloads/PC_GUIDE.pdf).

Pages inside `pages/` have `<base href="../">`. Their shared asset paths start at
the project root, just like the homepage. Page links include `pages/`; CSS image
URLs use `../images/` because the stylesheets live inside `css/`.
Keep this base tag when editing a page. Run or publish the whole project folder,
not only the `pages/` folder.

## Browser Checks

From the project folder, run the check you need:

```text
node tests/check-file-structure.cjs
node tests/check-checkout-account.cjs
node tests/check-shop-layout.cjs
node tests/check-shopping-tools.cjs
node tests/check-support-design.cjs
node tests/check-storefront.cjs
node tests/check-social-links.cjs
```

Tests use Node, Playwright, and Microsoft Edge. `tests/browser.cjs` first looks
for a normal Playwright installation, then the bundled local Codex runtime.
Screenshots go into `images/previews/`, which is kept out of GitHub.
Temporary development tools in `tmp/` and duplicate photo backups in
`images/originals/` also stay local. No original files were deleted during organization.

## Demo Limitations

This is a frontend school project, not a live payment or messaging service.
Checkout requires a local demo account. Registration saves a salted PBKDF2
password hash, never a plaintext password. The session lasts for this browser tab;
remembering an email does not sign the customer in. Do not use real passwords.
Real accounts, orders, and payments require server-side authentication and validation.
