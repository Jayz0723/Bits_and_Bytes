# Product Image Edits

Capacity-specific edits were also saved as `kingston-kc600-256gb-cutout.png`,
`kingston-kc600-1024gb-cutout.png`, `kingston-kc600-2048gb-cutout.png`,
`kingston-nv3-4000gb-cutout.png`, `kingston-fury-8gb-cutout.png`,
`kingston-fury-32gb-kit-cutout.png`, and `kingston-fury-64gb-kit-cutout.png`.
The 1TB/2TB NVMe photos and 16GB RAM photo already had transparency.

Capacity-specific edit prompt:

> Background-removal edit of this exact retrieved product photograph. Preserve the complete original product and its retail package if present. Remove ONLY the outside white table/background and the hanging-tab hole to true transparency; do not remove white product labels or white printing. Keep ALL capacity text and part numbers EXACTLY as in the source, including GB/TB numbers. Do not invent, relabel, redraw, or change hardware, module count, branding, shape, color, or viewing angle. Center the intact object with small even transparent margins. Output a sharp transparent PNG.

The built-in image generation/editing tool removed backgrounds from the original
downloaded photographs. Original files were retained beside the edited files
in `images/products/`. Download sources are listed in `product-sources.json`.

Edited files: `kingston-kc600-cutout.png`, `intel-core-i5-14600k-cutout.png`,
`amd-ryzen-7-7700x-cutout.png`, `hp-pavilion-plus-14-cutout.png`, and
`dell-inspiron-14-plus-cutout.png`.

CPU and laptop edit prompt:

> Edit only the background of this exact retrieved product photo for the existing ecommerce catalog. Remove the surrounding white background and any floor reflection/shadow so it is truly transparent. Preserve the exact product, angle, dimensions, colors, branding, every existing label and screen content without redraw or invention. Keep the entire product visible, with small even transparent margins. No new text, no replacement hardware, no stylization. Output a transparent PNG cutout.

KC600 edit prompt:

> Edit this exact retrieved product photograph for an ecommerce catalog. Remove ONLY the plain white background outside the retail package and the white hole at the package hanging tab, making these regions truly transparent. Preserve the original Kingston KC600 package shape, its exact original SSD, all printing and labels including 512GB, and all colors and proportions. Do not redraw, invent, change text, add graphics, or replace the product. Center the intact package with small even transparent margins. Output a clean transparent PNG cutout.
