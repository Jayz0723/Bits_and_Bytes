# Monitor, graphics and gallery update

The catalog now contains 69 products. The additions are Samsung Odyssey G3 G30D
24-inch LS24DG302EEXXP and 27-inch LS27DG302EEXXP monitors, plus MSI GTX 1650
VENTUS XS 4G OC, RTX 3050 VENTUS 2X 6G OC and RTX 5080 16G VENTUS 3X OC cards.
Existing RTX 4060 and RTX 4070 SUPER products complete the component guide's
five example tiers. These are use-case categories, not benchmark results.

## Where to edit

- `js/catalog-updates.js`: named model records, retail references, connector
  galleries, product videos, catalog-derived brand carousel and guide additions.
- `js/app.js`: common image/video gallery, footer label wrapping and other store behavior.
- `css/storefront.css`: gallery video, GPU guide and text-width footer underline.
- `chat-service.cjs`: loads the same additions and component prices for chat context.

The module loads after `product-descriptions.js` and before `app.js` on every
store page. No HTML strings containing external catalog text are used for brand
links or the GPU guide. Both the carousel and its brand dialog derive their
contents from the actual catalog; duplicates are excluded from keyboard navigation.

## Prices

The `catalogPriceReferences` object records exact-model Philippine retailer
listings checked on **2026-10-31**. Product details link to the retailer and show
the date. Checked prices update the catalog and checkout consistently; original
strike-through prices are removed when a reference replaces the price.

These are dated advertised listings, not a live feed or a promise of current stock.
Older models, custom builds, imported laptop configurations and capacity options
without an exact matching source retain their configured store prices and show
a request to confirm configuration and availability. Do not label them verified
market prices. Do not replace an exact SKU with a similar model's price.

New product references:

| Model | PHP | Retailer |
| --- | ---: | --- |
| Samsung G3 24-inch | 8,395 | [DataBlitz](https://ecommerce.datablitz.com.ph/products/samsung-odyssey-g3-g30d-ls24dg302eexxp-24-fhd-1920x1080-180hz-1msmprt-va-gaming-monitor) |
| Samsung G3 27-inch | 10,895 | [DataBlitz](https://ecommerce.datablitz.com.ph/products/samsung-odyssey-g3-ls27dg302eexxp-27-fhd-180hz-1ms-mprt-freesync-va-gaming-monitor) |
| MSI GTX 1650 VENTUS XS 4G OC | 10,490 | [DWIN](https://dwinstore.com/product-category/computer-parts/graphics-card/) |
| MSI RTX 3050 VENTUS 2X 6G OC | 19,000 | [Bermor Techzone](https://bermorzone.com.ph/shop/video-cards/nvidia-video-cards/msi-geforce-rtx-3050-ventus-2x-6g-oc-gddr6-video-card/) |
| MSI RTX 5080 VENTUS 3X OC | 147,000 | [PC Express](https://pcx.com.ph/products/msi-geforce-rtx-5080-ventus-3x-oc-16gb-g5080-16v3c-gddr7-256-bit-graphics-card) |

Additional exact-match DataBlitz references are in `checkedRetailMatches`, with
their public product-page URLs. Capacity variants are never repriced using a
family listing's lowest advertised price.

## Photographs and video provenance

Assets in `images/products/expansion/` are unchanged manufacturer downloads:

- Samsung front/rear/connector views: the exact 24-inch and 27-inch [Samsung PH
  model galleries](https://www.samsung.com/ph/monitors/gaming/odyssey-g3-g30d-24-inch-180hz-freesync-ls24dg302eexxp/).
- GTX 1650, RTX 3050 and RTX 5080 packaging/front/connector views: each matching
  [MSI gallery](https://www.msi.com/Graphics-Card/GeForce-GTX-1650-VENTUS-XS-4G-OC/Gallery).
  Exact model specification links are stored with every description.
- G244F E2: `https://storage-asset.msi.com/global/picture/image/feature/monitor/G244F-E2/spec-io.png`.
- MAG 274QRF QD E2: `https://storage-asset.msi.com/global/picture/image/feature/monitor/MAG274QRF-QD-E2/spec-img.png`.
- Existing ASUS VG249Q1A, VG27AQ and PA329CV connector photos are restored from
  the original model galleries. The VG27AQ annotated JPEG retains its original
  background; all main product images and other gallery assets retain transparency.

The existing exact-model Surface Laptop Studio 2 film is the second gallery
item, after the main photo. Playback is user-controlled and stops when changing
gallery items. No unrelated generic video is attached to another product.

## Image map

The original desktop and laptop maps remain. Four more visible desktop regions
identify the radiator, sealed coolant hoses, GPU power cable and 24-pin board
power connection. Specific regions precede broad GPU/motherboard/case regions;
all have keyboard-accessible component shortcut buttons. Responsive coordinates
continue to use the existing original-coordinate scaling.

## Checks

`tests/check-catalog-expansion.cjs` checks catalog IDs, complete brand coverage,
footer underline width, every monitor's connector view, gallery media and keyboard
navigation, added map controls and four viewport widths. Existing catalog,
description, transparency, filter and voucher/footer checks cover regressions.
