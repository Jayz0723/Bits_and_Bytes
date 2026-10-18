# Product descriptions

Edit `js/product-descriptions.js` to change the descriptions. Entries use the same
product IDs as `js/data.js`. Each includes an original summary and an official
manufacturer reference URL, researched on October 17, 2026. The source is visible
in Quick View and on the full product page. These are paraphrases, not copied
manufacturer advertising or claims of affiliation.

## Selected options

Capacities, module arrangements, colors, and installed specifications remain in
`js/data.js`. They appear separately below the narrative and update when an option
changes. Avoid putting a fixed capacity or color in a shared family description.

The ASUS monitor selector changes models, so its VG249Q1A and PA329CV options have
their own descriptions and references. Switching back to VG27AQ restores that
model's description and source. Other families share a description where the
underlying product design is unchanged.

`catalogProducts()` and `productWithVariant()` attach the matching copy. The
description script must load before `js/app.js` on each page. No runtime web
requests are needed to show descriptions.

## Accuracy notes

Manufacturer pages frequently describe multiple regional configurations and list
maximum specifications. Those maximums are not automatically imported as installed
hardware. Existing prices, stock, photos, variant IDs, and checkout behavior are
unchanged. This research does not verify physical inventory or supplier SKUs.

Visible notes identify listings needing a full supplier/model code:

- ThinkBook 14 G6 IRL: Lenovo's family reference does not list the catalog's
  Core i5-13420H. Confirm the supplier SKU before selling that configuration.
- XPS 13 9340: exact panel configuration is unspecified.
- ROG Strix G16, Pavilion Plus 14, Aegis R 13th, and Inspiron 14 Plus 7440:
  incomplete processor or display identifiers.
- Vivobook Pro 16 OLED K6602: confirm the full model suffix. ASUS's historical
  Australian product guide identifies the OLED family; the former global product
  URL now redirects to the current Vivobook collection.
- Corsair RMe: model year and GPU cable bundle are unspecified; the linked 2025
  family manual must not be treated as proof that every option is that revision.

The RTX 4060 VENTUS listing's unsupported "RGB-ready" wording has been replaced
with model-specific graphics, cooling, and output information.
The ProArt monitor option now uses the Creator category rather than inheriting
Gaming from the TUF monitor, including when switching models on the detail page.

Descriptions remain English alongside model names and technical specifications.
Existing interface language and currency controls are unchanged.

## Check changes

Run `node tests/check-product-descriptions.cjs` to check every product and option,
Quick View, monitor-model changes, reference links, and responsive page widths.
The test checks links belong to manufacturer domains; it does not guarantee that
external pages stay available. Recheck external sources when updating stock.
