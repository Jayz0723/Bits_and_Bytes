Keep real product photos in `images/products/`. This guide lives in `docs/`.

Folder organization:

- `images/products/`: product photos and galleries; older image slots are in `legacy/`.
- `images/branding/`: store and manufacturer logos.
- `images/showcase/`: homepage banners, setup photos, and category imagery.
- `images/guides/`: interactive component photos and maps.
- `images/social/`: social-platform logos.
- `images/decor/`: small background and border assets.
- `images/placeholders/`: spare placeholder images, not active product listings.
- `images/uploads/`: existing numbered image files, preserved without deletion.
- `docs/image-sources/`: source URLs, model records, and image editing notes.
- `images/originals/` and `images/previews/`: local backups and screenshots, excluded from GitHub.

From a page in the project root, use paths like `images/showcase/home-banner.jpg`.
Keep the same filename when replacing a picture to avoid changing the code.

## Product Photo Slots

Downloaded product photos are in `images/products/`. Their original image URLs,
product families, and source pages are recorded in `docs/image-sources/product-sources.json`.
Photos identify the model or family; capacities, regional variants, and revisions
can differ from the illustrative store inventory. Existing images are preserved.

Edit the `productMedia` map near the top of `js/data.js` to set a product's main photo.
Use its existing product ID as the key. Catalog products now use real model photos;
do not add a placeholder or a picture of a different brand to an active listing.

Each product detail page shows its actual available views plus a Close-up.
Add confirmed angle/port photos in a `gallery` array, or in
`additionalProductViews` below the products list:

```js
"pc-creator": {
  image: "images/products/my-creator-pc.jpg",
  gallery: [
    { src: "images/products/my-creator-pc.jpg", label: "Main view", shortLabel: "Main" },
    { src: "images/products/my-creator-pc-side.jpg", label: "Side view", shortLabel: "Side" },
    { src: "images/products/my-creator-pc-detail.jpg", label: "Inside view", shortLabel: "Detail" },
    { src: "images/products/my-creator-pc-ports.jpg", label: "Rear connections", shortLabel: "Ports" }
  ]
}
```

The catalog, quick view, detail page, and cart all use the same photo mapping.

## Capacities and Variants

Catalog photo source URLs and model pages are recorded in `catalog-sources.json`.

## Extended Galleries and Storefront

`gallery-sources.json` records 38 additional inspected laptop, monitor, GPU,
motherboard, desktop, webcam, and mouse photographs. Other new connector sources
are recorded in `desktop-gallery-sources.json`, `extra-port-sources.json`,
`component-detail-sources.json`, and the parts/PSU gallery manifests.
The published photographs are retained unmodified, including some annotated
manufacturer/retailer artwork. Never substitute another model's I/O panel.

Every gallery retains a Close-up after its additional views. RAM uses a genuine
single-module design view with a caption explaining kit quantity; the main photo
remains capacity-specific. KC600's unlabelled SATA connector photograph is shared
across capacities, while labelled package photos and other drive views remain
capacity-specific. PSU side labels and sockets belong to the selected wattage.

`css/storefront.css` contains presentation refinements without changing the shared
color variables. The homepage embeds `pages/support-widget.html`, a focused support
draft form, rather than embedding an entire page with a duplicate navigation.
`js/support-form.js` validates inputs and resizes that iframe. No form data is sent,
and this is stated on the form. A production store needs a real support endpoint.
All listings use identifiable manufacturer models. Galleries use genuine photos;
where another angle is unavailable, "Close-up" magnifies the actual selected
product photo. RAM and SSD galleries rebuild on capacity changes and do not
display invented ports. Monitor sizes correspond to different actual ASUS models.
The Keychron photo and listing both specify Thai/English keycaps.

`productVariants` in `js/data.js` defines each family's capacities, price, stock,
specifications, and optional photo. RAM has 8/16/32/64GB choices. Kingston KC600
SATA drives have 256GB/512GB/1TB/2TB choices; Kingston NV3 NVMe drives use their
actual 500GB/1TB/2TB/4TB family capacities. PSU wattages and monitor screen sizes
are also selectable. Prices and stock remain sample store data.

Selected variants have stable IDs and stay separate in the cart. Configured
items retain their selected capacity and extra costs after reloading.
Builder RAM, storage, and PSU choices are defined separately in `pcParts`.

`capacityPhotos` maps each RAM/SSD variant to its own photo. SSD label capacities
were visually checked against the selected variant. RAM images show single-module
or two-module kits, with total capacity and module layout annotated in the image
frame because module fronts do not always print their capacity. The cart and
product galleries use these same variant photos. Do not reuse a labelled 500GB
or 512GB photo for a different-capacity variant.

Transparent PNG/WebP sources preserve their original alpha channel. Files ending
in `-cutout.png` are background-removal edits made with the built-in image tool;
the original downloads are retained. See `photo-edit-notes.md` for the prompts.

The website already references placeholder JPG file names such as:

- `home-banner.jpg`
- `showcase-gaming-pc.jpg`
- `showcase-laptop.jpg`
- `laptop-asus-rog.jpg`
- `pc-pulse-gaming.jpg`
- `custom-pc-build.jpg`

If an image file is missing, the browser will show the alt text and the CSS background color behind the image area.
