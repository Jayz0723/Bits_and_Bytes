# Catalog expansion and transparent product media

October 26, 2026: added ten products, bringing the catalog to 60. New entries include MSI Thin 15 B13VE and Modern 15 B13M laptops, G244F E2 monitor, CLUTCH GM11 mouse, VIGOR GK30 keyboard, IMMERSE GH20 headset, MAG A650BN PSU, SPATIUM M450 1TB SSD, PRO H610M-G DDR4 motherboard and white MAG FORGE M100R case.

Manufacturer references are linked in each product description. Exact installed CPU/RAM/SSD configurations are not asserted for the two family-level laptop listings; their configuration notes request confirmation of the regional SKU. Prices and stock are local inventory settings, not live manufacturer data. Downloaded manufacturer images and source pages are recorded in `docs/image-sources/catalog-20261026.json`. Review image redistribution permissions before a commercial launch.

## Media behavior

Product media retains genuine alpha transparency, including all color/capacity variants. `productPhotoReplacements` maps older solid-background main shots to new cutouts. `cleanProductPhotoRecord` removes audited opaque gallery shots while retaining transparent angles and the existing close-up function. Original files remain untouched. No fake alternate angles are generated or labeled as port photos. Old account thumbnails resolve replacement photos without rewriting saved transactions. Homepage setup photography, editorial scenes and video stay photographic rather than becoming cutouts.

Transparent backgrounds are also preserved by the catalog, detail, thumbnail, configuration and search-result CSS. This is not CSS color blending or a white-to-dark filter.

## Edited cutouts

Eight edits used the built-in image-generation tool in background-extraction mode, not the API/CLI fallback. Original files remain in the repository. Final files are in `images/products/` (G435 in `images/products/colors/`), and the original tool outputs remain under the Codex generated-images directory.

Shared prompt constraints: genuine transparent alpha, complete isolated ecommerce product, modest padding, preserve the exact product proportions/colors/details/angle, no redesigned hardware, no new accessories, no added text, no floor shadow or fake checkerboard.

| Final asset | Edit target | Additional prompt instructions |
| --- | --- | --- |
| `surface-studio-2-cutout.png` | `surface-studio-2-main.png` | Remove only the white background and shadow; preserve laptop screen, silver chassis, pen and ports. |
| `mac-mini-m4-cutout.png` | `mac-mini-m4-front.jpg` | Preserve the exact frontal view, front ports, LED and underside ventilation; no hand. |
| `acer-aspire-14-cutout.png` | `acer-aspire-14.jpg` | Preserve silver AS14H-53 chassis, screen contents, keyboard, trackpad and Acer bezel mark. |
| `lenovo-thinkbook-14-g6-cutout.png` | `lenovo-thinkbook-14-g6.jpg` | Extract the complete laptop; exclude the separate retailer badge outside the product. |
| `keychron-k8-pro-cutout.png` | `keychron-k8-pro.jpg` | Preserve exact tenkeyless layout, legends and key colors; exclude the separate switch inset and outside promotional/compatibility labels. |
| `elgato-facecam-mk2-cutout.png` | `elgato-facecam-mk2.jpg` | Preserve webcam lens reflections, blue LED, branding, housing and mounting clip. |
| `colors/g435-blue-cutout.png` | `colors/g435-blue-main.jpg` | Preserve Blue/Raspberry fabric/plastic, coiled wires, receiver and G435 marking; clear the spaces inside the headband. |
| `corsair-k65-plus-top-cutout.png` | `corsair-k65-plus-2.webp` | Extract only the keyboard; preserve layout, legends, volume dial and RGB, while excluding desk objects, headline/caption and award badges. |

## Verification

`tests/check-transparent-catalog.cjs` inspects every active main/gallery/variant file with an image decoder and checks that alpha is present, the picture is not opaque, and visible product pixels remain. It also exercises all ten new detail pages, gallery views, color switching, search/cart and desktop/mobile layouts. Existing product-description, component-filter and expansion-gallery tests remain in place.
