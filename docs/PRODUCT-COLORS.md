# Product Colors

Color choices are in the final section of `js/data.js`. The small
`addProductColorOptions` helper reuses the existing variant/cart system. The UI
uses accessible, named color swatches; changing one dispatches the same variant
change event as a capacity selector. Images are never recolored with CSS.

## Available Finishes

- Apple MacBook Air 13-inch M3: Midnight, Silver, Space Gray, Starlight.
- Corsair 3000D AIRFLOW: Black, White.
- Corsair 4000D AIRFLOW: Black, White.
- Logitech G435: Black and Neon Yellow, Blue and Raspberry, Off-White and Lilac.
- Logitech MX Master 3S: Pale Gray, Graphite.

Each variant has its own image and gallery. The original default galleries are
retained. Non-default finishes never inherit the default finish's gallery.
Where only one verified photograph exists, the gallery offers that real photo
and its close-up rather than pretending another finish is the same unit.

Images are in `images/products/colors/`; exact downloaded URLs are recorded in
`docs/image-sources/product-colors.json`. Existing default photographs retain
their source notes in the other files in that folder. Store prices and stock
remain sample inventory, not manufacturer availability or quotations.

## Sources

- Apple M3 finishes: https://support.apple.com/en-us/118551
- Apple chassis photos use the manufacturer's M3 13-inch refurbished gallery;
  those photographs depict the same chassis, not a claim that this store's item
  is refurbished. Configuration details remain in the product specifications.
- Corsair 3000D White: https://www.corsair.com/us/en/p/pc-cases/cc-9011252-ww/3000d-tempered-glass-mid-tower-white-cc-9011252-ww
- Corsair 4000D White: https://www.corsair.com/us/en/p/pc-cases/cc-9011201-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-white-cc-9011201-ww
- Logitech G435 colors: https://ir.logitech.com/news/news-details/2021/Logitech-G-Unveils-Its-Lightest-Most-Affordable-Sustainable-Wireless-Gaming-Headset-Yet/default.aspx
- G435 Blue photo: https://www.walmart.com/ip/101485946
- G435 Off-White photo: https://ddtech.mx/producto/diadema-gamer-logitech-g435-microfono-wireless-lightspeed-ps4-ps5-pc-mac-blanco-crudo-lila-981-001073?id=11004
- MX Master 3S: https://www.logitech.com/en-us/products/mice/mx-master-3s.910-006558.html
- Graphite photographs use the original MX Master 3S gallery, not the newer
  Bluetooth Edition's packaging or a different MX model.

## Verification

`node tests/check-product-colors.cjs` checks all 13 finishes and their images,
catalog and quick-view switching, URL/reload state, separate cart lines, saved
order images, tracking links, keyboard swatches, and four screen widths.
