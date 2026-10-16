# Catalog Expansion

Eleven products were added to `js/data.js`. Their photos are in `images/products/`;
original download addresses are recorded in `image-sources/catalog-expansion.json`.
Prices and stock are maintained store data rather than a live manufacturer feed.

| Product | Manufacturer reference |
| --- | --- |
| Dell Latitude 5440 | https://www.dell.com/en-us/shop/dell-laptops/spd/latitude-14-5440-laptop |
| Dell G15 5530 | https://www.dell.com/en-us/shop/dell-laptops/spd/g-series-15-5530-laptop |
| HP Pro Mini 400 G9 | https://www.hp.com/ie-en/products/desktops/product-details/product-specifications/2101789926 |
| Corsair 4000D AIRFLOW | https://www.corsair.com/us/en/p/pc-cases/cc-9011200-ww/4000d-airflow-tempered-glass-mid-tower-atx-case-black-cc-9011200-ww |
| Corsair ML120 LED ELITE Red | https://www.corsair.com/us/en/p/case-fans/co-9050120-ww/ml120-led-elite-red-premium-120mm-pwm-magnetic-levitation-fan-co-9050120-ww |
| Corsair VENGEANCE 32GB DDR5 | https://www.corsair.com/ww/en/p/memory/cmk32gx5m2b6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mhz-c36-memory-kit-black-cmk32gx5m2b6000c36 |
| MSI B760 GAMING PLUS WIFI | https://www.msi.com/Motherboard/B760-GAMING-PLUS-WIFI/Specification |
| MSI RTX 4070 SUPER VENTUS 2X OC | https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-2X-OC |
| Samsung 990 PRO 1TB | https://www.samsung.com/in/memory-storage/nvme-ssd/990-pro-1tb-nvme-pcie-gen-4-mz-v9p1t0bw/ |
| Logitech G502 HERO | https://www.logitechg.com/en-us/shop/p/g502-hero-gaming-mouse.910-005469 |
| Logitech G435 | https://www.logitechg.com/en-us/shop/p/g435-wireless-bluetooth-gaming-headset.981-001049 |

`computerPartCategories` in `js/data.js` supplies the component filter options.
Every computer part has an explicit `partCategory`; add this field when adding a
part. Categories also appear on the product cards. Example category link:
`pages/products.html?part=ram`. These catalog categories do not change the PC
builder's compatibility rules or add unverified components to its choices.

The Corsair memory photo shows two 16GB modules, a 32GB kit. The Samsung SSD photo
is marked 1TB. These two products have a fixed capacity; the existing Kingston
capacity options and their matching photos remain available.
