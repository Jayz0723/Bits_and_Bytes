// Product and PC part data are kept here so the website is easy to modify.
// Each entry can also have a gallery: [{ src: "images/...", label: "Side view", shortLabel: "Side" }].
// Use the productMedia map below to replace photos without changing product details.
const productMedia = {
  "lap-asus-gaming": {"gallery":[{"src":"images/products/asus-rog-g16-main.png","label":"ASUS ROG Strix G16 (2023) main view","shortLabel":"Main"},{"src":"images/products/asus-rog-g16-front.png","label":"ASUS ROG Strix G16 (2023) front view","shortLabel":"Front"},{"src":"images/products/asus-rog-g16-ports.png","label":"ASUS ROG Strix G16 (2023) ports view","shortLabel":"Ports"}]},
  "pc-creator": {"gallery":[{"src":"images/products/asus-proart-pd500tc.png","label":"ASUS ProArt Station PD5 PD500TC main view","shortLabel":"Main"},{"src":"images/products/asus-proart-pd500tc-alternate.png","label":"ASUS ProArt Station PD5 PD500TC angle view","shortLabel":"Angle"}]},
  "pc-office": {"gallery":[{"src":"images/products/lenovo-neo-50t.webp","label":"Lenovo ThinkCentre neo 50t Gen 4 main view","shortLabel":"Main"},{"src":"images/products/lenovo-neo-50t-angle.jpg","label":"Lenovo ThinkCentre neo 50t Gen 4 angle view","shortLabel":"Angle"}]},
  "pc-gaming": {"gallery":[{"src":"images/products/msi-infinite-s3-front.webp","label":"MSI MAG Infinite S3 13th front view","shortLabel":"Front"},{"src":"images/products/msi-infinite-s3-side.webp","label":"MSI MAG Infinite S3 13th side view","shortLabel":"Side"},{"src":"images/products/msi-infinite-s3-rear.webp","label":"MSI MAG Infinite S3 13th rear view","shortLabel":"Rear"}]},
  "lap-hp-pavilion-plus": { image: "images/products/hp-pavilion-plus-14-cutout.png" },
  "lap-dell-inspiron-plus": { image: "images/products/dell-inspiron-14-plus-cutout.png" },
  "pc-msi-aegis-rgb": { image: "images/products/msi-aegis-r.png" },
  "part-cpu-i5-14600k": {
    image: "images/products/intel-core-i5-14600k-cutout.png",
    gallery: [
      { src: "images/products/intel-core-i5-14600k-cutout.png", label: "Intel Core i5-14600K retail package", shortLabel: "Main" },
      { src: "images/products/intel-i5-14600k-chip.png", label: "Intel Core i5-14600K chip top and model marking", shortLabel: "Chip" }
    ]
  },
  "part-cpu-ryzen-7-7700x": {
    image: "images/products/amd-ryzen-7-7700x-cutout.png",
    gallery: [
      { src: "images/products/amd-ryzen-7-7700x-cutout.png", label: "AMD Ryzen 7 7700X retail package", shortLabel: "Main" },
      { src: "images/products/amd-7700x-chip.jpg", label: "AMD Ryzen 7 7700X chip top and model marking", shortLabel: "Chip" }
    ]
  },
  "part-board-gigabyte-b650": { image: "images/products/gigabyte-b650-aorus-elite-ax.png" },
  "part-corsair-psu-850": { image: "images/products/corsair-rm850e.webp" },
  "part-kingston-fury-32": { image: "images/products/kingston-fury-beast-large.png" },
  "part-cooler-master-240": {
    image: "images/products/cooler-master-ml240l.png",
    gallery: [
      { src: "images/products/cooler-master-ml240l.png", label: "Cooler Master ML240L RGB main view", shortLabel: "Main" },
      { src: "images/products/cooler-master-ml240l-side.png", label: "Cooler Master ML240L RGB alternate view", shortLabel: "Side" }
    ]
  },
  "part-gpu-rtx-4060": {
    name: "MSI GeForce RTX 4060 VENTUS 2X BLACK 8GB",
    brand: "MSI",
    image: "images/products/msi-rtx-4060-main.webp",
    gallery: [
      { src: "images/products/msi-rtx-4060-main.webp", label: "RTX 4060 front view", shortLabel: "Front" },
      { src: "images/products/msi-rtx-4060-side.webp", label: "RTX 4060 side view", shortLabel: "Side" },
      { src: "images/products/msi-rtx-4060-back.webp", label: "RTX 4060 rear view", shortLabel: "Rear" }
    ]
  },
  "part-ram-32gb-ddr5": { image: "images/products/kingston-fury-beast-large.png", brand: "Kingston", name: "Kingston FURY Beast DDR5 Memory" },
  "part-ssd-1tb-nvme": { image: "images/products/kingston-nv3.png", brand: "Kingston", name: "Kingston NV3 NVMe SSD" },
  "part-ssd-kingston-kc600": { image: "images/products/kingston-kc600-cutout.png" }
};

// Prices and stock are sample store inventory, not live manufacturer pricing.
// Variants represent purchasable configurations of one product family.
const productVariants = {
  "part-ram-32gb-ddr5": {
    label: "Memory capacity", defaultId: "32gb",
    options: [
      { id: "8gb", label: "8GB", price: 1995, stock: 20, name: "Kingston FURY Beast DDR5-5600 Memory - 8GB", specs: "8GB DDR5-5600 desktop DIMM, AM5 / compatible Intel DDR5 motherboards" },
      { id: "16gb", label: "16GB", price: 4295, stock: 18, specs: "16GB DDR5-5600 desktop memory, AM5 / compatible Intel DDR5 motherboards" },
      { id: "32gb", label: "32GB", price: 6995, stock: 18, specs: "32GB DDR5-5600 desktop memory, AM5 / compatible Intel DDR5 motherboards" },
      { id: "64gb", label: "64GB", price: 12995, stock: 8, specs: "64GB DDR5-6000 desktop memory, AM5 / compatible Intel DDR5 motherboards" }
    ]
  },
  "part-kingston-fury-32": {
    label: "Memory capacity", defaultId: "32gb",
    options: [
      { id: "8gb", label: "8GB", price: 2195, stock: 18, specs: "8GB Kingston FURY Beast DDR5-5600 desktop DIMM" },
      { id: "16gb", label: "16GB", price: 4495, stock: 20, specs: "16GB Kingston FURY Beast DDR5-5600 desktop DIMM" },
      { id: "32gb", label: "32GB", price: 7295, stock: 16, specs: "32GB Kingston FURY Beast DDR5-5600 desktop memory kit" },
      { id: "64gb", label: "64GB", price: 13495, stock: 7, specs: "64GB Kingston FURY Beast DDR5-6000 desktop memory kit" }
    ]
  },
  "part-ssd-1tb-nvme": {
    label: "Storage capacity", defaultId: "1tb",
    options: [
      { id: "500gb", label: "500GB", price: 2295, stock: 18, specs: "500GB Kingston NV3, M.2 2280, PCIe 4.0 x4 NVMe" },
      { id: "1tb", label: "1TB", price: 3495, stock: 22, specs: "1TB Kingston NV3, M.2 2280, PCIe 4.0 x4 NVMe" },
      { id: "2tb", label: "2TB", price: 5995, stock: 12, specs: "2TB Kingston NV3, M.2 2280, PCIe 4.0 x4 NVMe" },
      { id: "4tb", label: "4TB", price: 10995, stock: 5, specs: "4TB Kingston NV3, M.2 2280, PCIe 4.0 x4 NVMe" }
    ]
  },
  "part-ssd-kingston-kc600": {
    label: "Storage capacity", defaultId: "512gb",
    options: [
      { id: "256gb", label: "256GB", price: 1695, stock: 20, specs: "256GB Kingston KC600, 2.5-inch SATA III SSD" },
      { id: "512gb", label: "512GB", price: 2495, stock: 18, specs: "512GB Kingston KC600, 2.5-inch SATA III SSD" },
      { id: "1tb", label: "1TB", price: 3995, stock: 15, specs: "1TB Kingston KC600, 2.5-inch SATA III SSD" },
      { id: "2tb", label: "2TB", price: 7295, stock: 9, specs: "2TB Kingston KC600, 2.5-inch SATA III SSD" }
    ]
  },
  "part-corsair-psu-850": {
    label: "Power output", defaultId: "850w",
    options: [
      { id: "650w", label: "650W", price: 5495, stock: 10, name: "Corsair RM650e Gold PSU", image: "images/products/corsair-rm650e.webp", specs: "650W fully modular RMe series power supply" },
      { id: "750w", label: "750W", price: 6495, stock: 9, name: "Corsair RM750e Gold PSU", image: "images/products/corsair-rm750e.webp", specs: "750W fully modular RMe series power supply" },
      { id: "850w", label: "850W", price: 8195, stock: 7, name: "Corsair RM850e Gold PSU", specs: "850W fully modular RMe series power supply" },
      { id: "1000w", label: "1000W", price: 9995, stock: 5, name: "Corsair RM1000e Gold PSU", image: "images/products/corsair-rm1000e.webp", specs: "1000W fully modular RMe series power supply" }
    ]
  },
  "monitor-27": {
    label: "Monitor model / size", defaultId: "27inch",
    options: [
    {
        "id": "24inch",
        "label": "23.8-inch FHD / VG249Q1A",
        "price": 6995,
        "stock": 15,
        "name": "ASUS TUF Gaming VG249Q1A",
        "specs": "23.8-inch Full HD IPS display, 165Hz refresh rate",
        "image": "images/products/asus-vg249q1a.png",
        "gallery": [
            {
                "src": "images/products/asus-vg249q1a.png",
                "label": "ASUS TUF Gaming VG249Q1A front view",
                "shortLabel": "Front"
            },
            {
                "src": "images/products/asus-vg249q1a-angle.png",
                "label": "ASUS TUF Gaming VG249Q1A alternate view",
                "shortLabel": "Angle"
            }
        ]
    },
    {
        "id": "27inch",
        "label": "27-inch QHD / VG27AQ",
        "price": 15995,
        "stock": 12,
        "name": "ASUS TUF Gaming VG27AQ",
        "specs": "27-inch QHD IPS display, 165Hz refresh rate",
        "image": "images/products/asus-vg27aq.png",
        "gallery": [
            {
                "src": "images/products/asus-vg27aq.png",
                "label": "ASUS TUF Gaming VG27AQ front view",
                "shortLabel": "Front"
            },
            {
                "src": "images/products/asus-vg27aq-angle.png",
                "label": "ASUS TUF Gaming VG27AQ alternate view",
                "shortLabel": "Angle"
            }
        ]
    },
    {
        "id": "32inch",
        "label": "32-inch 4K / PA329CV",
        "price": 29995,
        "stock": 6,
        "name": "ASUS ProArt PA329CV",
        "specs": "32-inch 4K IPS display, 60Hz refresh rate",
        "image": "images/products/asus-pa329cv.png",
        "gallery": [
            {
                "src": "images/products/asus-pa329cv.png",
                "label": "ASUS ProArt PA329CV front view",
                "shortLabel": "Front"
            },
            {
                "src": "images/products/asus-pa329cv-angle.png",
                "label": "ASUS ProArt PA329CV alternate view",
                "shortLabel": "Angle"
            }
        ]
    }
]
  }
};

// These images have been checked against their source capacity labels or kit layouts.
const capacityPhotos = {
  ram: {
    "8gb": { image: "images/products/kingston-fury-8gb-cutout.png", photoCapacity: "8GB", moduleLayout: "1 x 8GB" },
    "16gb": { image: "images/products/kingston-fury-16gb.png", photoCapacity: "16GB", moduleLayout: "1 x 16GB" },
    "32gb": { image: "images/products/kingston-fury-32gb-kit-cutout.png", photoCapacity: "32GB", moduleLayout: "2 x 16GB" },
    "64gb": { image: "images/products/kingston-fury-64gb-kit-cutout.png", photoCapacity: "64GB", moduleLayout: "2 x 32GB" }
  },
  nv3: {
    "500gb": { image: "images/products/kingston-nv3.png", photoCapacity: "500GB" },
    "1tb": { image: "images/products/kingston-nv3-1000gb.png", photoCapacity: "1TB" },
    "2tb": { image: "images/products/kingston-nv3-2000gb.png", photoCapacity: "2TB" },
    "4tb": { image: "images/products/kingston-nv3-4000gb-cutout.png", photoCapacity: "4TB" }
  },
  kc600: {
    "256gb": { image: "images/products/kingston-kc600-256gb-cutout.png", photoCapacity: "256GB" },
    "512gb": { image: "images/products/kingston-kc600-cutout.png", photoCapacity: "512GB" },
    "1tb": { image: "images/products/kingston-kc600-1024gb-cutout.png", photoCapacity: "1TB" },
    "2tb": { image: "images/products/kingston-kc600-2048gb-cutout.png", photoCapacity: "2TB" }
  }
};
[
  ["part-ram-32gb-ddr5", capacityPhotos.ram],
  ["part-kingston-fury-32", capacityPhotos.ram],
  ["part-ssd-1tb-nvme", capacityPhotos.nv3],
  ["part-ssd-kingston-kc600", capacityPhotos.kc600]
].forEach(([productId, photos]) => {
  productVariants[productId].options.forEach((variant) => Object.assign(variant, photos[variant.id]));
});

// Gallery photos are kept on each variant so changing capacity cannot reuse a wrong label.
productVariants["part-corsair-psu-850"].options.forEach((variant) => {
  const watts = variant.id.replace("w", "");
  const image = variant.image || productMedia["part-corsair-psu-850"].image;
  variant.gallery = [
    { src: image, label: variant.name + " main view", shortLabel: "Main" },
    { src: `images/products/corsair-rm${watts}e-view-10.webp`, label: variant.name + " side view", shortLabel: "Side" },
    { src: `images/products/corsair-rm${watts}e-view-08.webp`, label: variant.name + " AC power inlet and switch", shortLabel: "Power inlet" },
    { src: `images/products/corsair-rm${watts}e-view-09.webp`, label: variant.name + " modular cable connectors", shortLabel: "Connectors" }
  ];
});
productVariants["part-ssd-kingston-kc600"].options.forEach((variant) => {
  const capacity = { "256gb": "256", "512gb": "512", "1tb": "1024", "2tb": "2048" }[variant.id];
  variant.gallery = [
    { src: variant.image, label: "Kingston KC600 " + variant.label + " main photo", shortLabel: "Main" },
    { src: `images/products/kingston-kc600-${capacity}gb-view-1.jpg`, label: "Kingston KC600 " + variant.label + " top casing", shortLabel: "Top" },
    { src: `images/products/kingston-kc600-${capacity}gb-view-2.jpg`, label: "Kingston KC600 " + variant.label + " angled casing view", shortLabel: "Angle" },
    {
      src: "images/products/kingston-kc600-sata-connectors.jpg",
      label: "Kingston KC600 SATA power and data connectors",
      shortLabel: "Connectors",
      note: "KC600 SATA power and data connectors. This unlabelled casing view shows the connection design shared across capacities."
    }
  ];
});
productVariants["part-ssd-1tb-nvme"].options.forEach((variant) => {
  const capacity = { "500gb": "500", "1tb": "1000", "2tb": "2000" }[variant.id];
  variant.gallery = [
    { src: variant.image, label: "Kingston NV3 " + variant.label + " main view", shortLabel: "Main" }
  ];
  if (capacity) variant.gallery.push({
    src: `images/products/kingston-nv3-${capacity}gb-angle.png`,
    label: "Kingston NV3 " + variant.label + " front label and M.2 connector", shortLabel: "Front"
  });
});
["part-ram-32gb-ddr5", "part-kingston-fury-32"].forEach((productId) => {
  productVariants[productId].options.forEach((variant) => {
    variant.gallery = [
      { src: variant.image, label: "Kingston FURY Beast " + variant.label + " / " + variant.moduleLayout, shortLabel: "Main" },
      {
        src: "images/products/kingston-fury-beast-large.png",
        label: "Kingston FURY Beast DDR5 module and edge contacts",
        shortLabel: "Module",
        note: "Single-module design and DDR5 contacts. See the main photo for the selected kit quantity and total capacity."
      }
    ];
  });
});

const products = [
  {
    id: "lap-acer-office",
    name: "Acer Aspire 14 AS14H-53",
    type: "Laptop",
    use: "Student",
    brand: "Acer",
    price: 34995,
    originalPrice: 38995,
    stock: 14,
    image: "images/products/acer-aspire-14.jpg",
    specs: "Intel Core 5 210H, 16GB RAM, 512GB SSD, 14-inch WUXGA display"
  },
  {
    id: "lap-asus-gaming",
    name: "ASUS ROG Strix G16 (2023)",
    type: "Laptop",
    use: "Gaming",
    brand: "ASUS",
    price: 99995,
    originalPrice: 109995,
    stock: 6,
    image: "images/products/asus-rog-g16-main.png",
    specs: "Intel Core i7, RTX 4060, 16GB RAM, 1TB SSD, 16-inch 165Hz display"
  },
  {
    id: "lap-lenovo-office",
    name: "Lenovo ThinkBook 14 G6 IRL",
    type: "Laptop",
    use: "Office",
    brand: "Lenovo",
    price: 49995,
    stock: 9,
    image: "images/products/lenovo-thinkbook-14-g6.jpg",
    specs: "Intel Core i5-13420H, 16GB RAM, 512GB SSD, 14-inch display"
  },
  {
    id: "lap-apple-creator",
    name: "Apple MacBook Air 13-inch M3",
    type: "Laptop",
    use: "Creator",
    brand: "Apple",
    price: 64990,
    stock: 7,
    image: "images/products/apple-macbook-air-m3.png",
    specs: "Apple M3, 16GB unified memory, 512GB SSD, 13.6-inch Liquid Retina display"
  },
  {
    id: "pc-gaming",
    name: "MSI MAG Infinite S3 13th",
    type: "Desktop PC",
    use: "Gaming",
    brand: "MSI",
    price: 69995,
    originalPrice: 75995,
    stock: 5,
    image: "images/products/msi-infinite-s3-front.webp",
    specs: "Intel Core i5-13400F, RTX 4060 Ti, 8GB DDR5 RAM, 512GB NVMe SSD"
  },
  {
    id: "pc-office",
    name: "Lenovo ThinkCentre neo 50t Gen 4",
    type: "Desktop PC",
    use: "Office",
    brand: "Lenovo",
    price: 34995,
    stock: 11,
    image: "images/products/lenovo-neo-50t.webp",
    specs: "Intel Core i5-13400, Intel UHD graphics, 8GB DDR4 RAM, 512GB SSD"
  },
  {
    id: "pc-creator",
    name: "ASUS ProArt Station PD5 PD500TC",
    type: "Desktop PC",
    use: "Creator",
    brand: "ASUS",
    price: 119995,
    stock: 3,
    image: "images/products/asus-proart-pd500tc.png",
    specs: "Intel Core i7-11700, RTX 3060 12GB, 32GB DDR4 RAM, 1TB NVMe SSD"
  },
  {
    id: "monitor-27",
    name: "ASUS TUF Gaming VG27AQ",
    type: "Monitor",
    use: "Gaming",
    brand: "ASUS",
    price: 15995,
    originalPrice: 17995,
    stock: 12,
    image: "images/products/asus-vg27aq.png",
    specs: "27-inch QHD, IPS panel, 165Hz refresh rate"
  },
  {
    id: "keyboard-rgb",
    name: "Keychron K8 Pro Mechanical Keyboard",
    type: "Accessory",
    use: "Gaming",
    brand: "Keychron",
    price: 4495,
    originalPrice: 5295,
    stock: 24,
    image: "images/products/keychron-k8-pro.jpg",
    specs: "Tenkeyless, Thai/English keycaps, hot-swappable switches, Bluetooth / USB-C"
  },
  {
    id: "mouse-wireless",
    name: "Logitech MX Master 3S Pale Gray",
    type: "Accessory",
    use: "Office",
    brand: "Logitech",
    price: 1995,
    stock: 31,
    image: "images/products/logitech-mx-master-3s.png",
    specs: "8000 DPI sensor, quiet clicks, rechargeable battery, Bluetooth / Logi Bolt"
  },
  {
    id: "pc-aurora-elite",
    name: "ASUS ROG G22CH",
    type: "Desktop PC",
    use: "Gaming",
    brand: "ASUS",
    price: 149995,
    stock: 2,
    image: "images/products/asus-rog-g22ch.png",
    specs: "Intel Core i7-14700KF, RTX 4070 Super, 32GB DDR5 RAM, 1TB NVMe SSD"
  },
  {
    id: "lap-creator-pro",
    name: "ASUS Vivobook Pro 16 OLED K6602",
    type: "Laptop",
    use: "Creator",
    brand: "ASUS",
    price: 124995,
    stock: 4,
    image: "images/products/asus-vivobook-k6602.png",
    specs: "Intel Core i9-13900H, RTX 4060, 16GB RAM, 1TB SSD, 16-inch OLED display"
  },
  {
    id: "accessory-stream-kit",
    name: "Elgato Facecam MK.2",
    type: "Accessory",
    use: "Creator",
    brand: "Elgato",
    price: 8995,
    originalPrice: 9995,
    stock: 15,
    image: "images/products/elgato-facecam-mk2.jpg",
    specs: "1080p 60fps HDR webcam, fixed-focus lens, USB 3.0, privacy shutter"
  },
  {
    id: "lap-hp-pavilion-plus",
    name: "HP Pavilion Plus 14",
    type: "Laptop",
    use: "Student",
    brand: "HP",
    price: 52995,
    stock: 8,
    image: "images/products/hp-pavilion-plus-14-cutout.png",
    specs: "Intel Core Ultra 5, 16GB RAM, 512GB SSD, 14-inch display"
  },
  {
    id: "pc-msi-aegis-rgb",
    name: "MSI Aegis R 13th",
    type: "Desktop PC",
    use: "Gaming",
    brand: "MSI",
    price: 109995,
    stock: 4,
    image: "images/products/msi-aegis-r.png",
    specs: "Intel i7, RTX 4060 Ti, 32GB DDR5, 1TB NVMe, RGB case"
  },
  {
    id: "lap-dell-inspiron-plus",
    name: "Dell Inspiron 14 Plus 7440",
    type: "Laptop",
    use: "Office",
    brand: "Dell",
    price: 58995,
    stock: 6,
    image: "images/products/dell-inspiron-14-plus-cutout.png",
    specs: "Intel Core Ultra 7, 16GB RAM, 1TB SSD, 14-inch QHD display"
  }
];

// Genuine alternate views; source URLs and model checks live in docs/image-sources/gallery-sources.json.
const additionalProductViews = {
  "lap-acer-office": [
    {
      "src": "images/products/gallery-acer-as14h53-rear-angle.jpg",
      "label": "AS14H-53 rear three-quarter view (published marketing image)",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-acer-as14h53-ports.jpg",
      "label": "AS14H-53 left and right connectors (annotated)",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "lap-lenovo-office": [
    {
      "src": "images/products/gallery-lenovo-thinkbook14-g6-irl-angle.jpg",
      "label": "ThinkBook 14 G6 IRL open three-quarter view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-lenovo-thinkbook14-g6-irl-rear.jpg",
      "label": "ThinkBook 14 G6 IRL rear angle and Ethernet edge",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-lenovo-thinkbook14-g6-irl-ports.jpg",
      "label": "ThinkBook 14 G6 IRL both side connector profiles",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "lap-apple-creator": [
    {
      "src": "images/products/gallery-apple-mba13-m3-midnight-lid.jpg",
      "label": "13-inch M3 MacBook Air Midnight closed lid",
      "shortLabel": "Lid",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-apple-mba13-m3-midnight-side.jpg",
      "label": "13-inch M3 MacBook Air Midnight open side profiles",
      "shortLabel": "Side",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-apple-mba13-m3-midnight-ports.jpg",
      "label": "Midnight MacBook Air MagSafe, USB-C and headphone connectors",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "lap-hp-pavilion-plus": [
    {
      "src": "images/products/gallery-hp-14-ew1010nr-angle.jpg",
      "label": "Pavilion Plus 14-ew1010nr open right angle",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-hp-14-ew1010nr-rear.jpg",
      "label": "Pavilion Plus 14-ew1010nr rear three-quarter view",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-hp-14-ew1010nr-right-ports.jpg",
      "label": "Pavilion Plus 14-ew1010nr right USB-C, HDMI and USB-A edge",
      "shortLabel": "Right ports",
      "role": "ports"
    },
    {
      "src": "images/products/gallery-hp-14-ew1010nr-left-ports.jpg",
      "label": "Pavilion Plus 14-ew1010nr left audio and USB-A edge",
      "shortLabel": "Left ports",
      "role": "ports"
    }
  ],
  "lap-dell-inspiron-plus": [
    {
      "src": "images/products/gallery-dell-7440-angle.jpg",
      "label": "Inspiron 14 Plus 7440 open left angle",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-dell-7440-rear.jpg",
      "label": "Inspiron 14 Plus 7440 rear three-quarter view",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-dell-7440-right-ports.jpg",
      "label": "Inspiron 14 Plus 7440 right connector profile",
      "shortLabel": "Right ports",
      "role": "ports"
    },
    {
      "src": "images/products/gallery-dell-7440-left-ports.jpg",
      "label": "Inspiron 14 Plus 7440 left power, HDMI, USB-A and USB-C edge",
      "shortLabel": "Left ports",
      "role": "ports"
    }
  ],
  "lap-creator-pro": [
    {
      "src": "images/products/gallery-asus-k6602vv-angle.jpg",
      "label": "Vivobook Pro 16 OLED K6602VV open three-quarter view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-k6602vv-rear.jpg",
      "label": "Vivobook Pro 16 OLED K6602VV rear angle",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-k6602vv-ports.jpg",
      "label": "Vivobook Pro 16 OLED K6602VV both connector edges",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "pc-aurora-elite": [
    {
      "src": "images/products/gallery-asus-g22ch-front.png",
      "label": "ROG G22CH straight front view",
      "shortLabel": "Front",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-g22ch-angle.png",
      "label": "ROG G22CH opposite side three-quarter view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-g22ch-top-ports.png",
      "label": "ROG G22CH top USB-A, USB-C and audio connectors",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "pc-msi-aegis-rgb": [
    {
      "src": "images/products/gallery-msi-aegis-r13-front.webp",
      "label": "Aegis R 13th straight front view",
      "shortLabel": "Front",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-msi-aegis-r13-side.webp",
      "label": "Aegis R 13th solid side and front angle",
      "shortLabel": "Side",
      "role": "genuine-angle"
    }
  ],
  "monitor-27::24inch": [
    {
      "src": "images/products/gallery-asus-vg249q1a-rear.png",
      "label": "VG249Q1A rear view",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-vg249q1a-ports.png",
      "label": "VG249Q1A HDMI, DisplayPort and audio connectors",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "monitor-27::32inch": [
    {
      "src": "images/products/gallery-asus-pa329cv-rear.png",
      "label": "PA329CV rear view",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-pa329cv-rear-angle.png",
      "label": "PA329CV rear three-quarter view",
      "shortLabel": "Rear",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-asus-pa329cv-ports.png",
      "label": "PA329CV underside display and USB connectors",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "part-gpu-rtx-4060": [
    {
      "src": "images/products/gallery-msi-4060-ventus-backplate.webp",
      "label": "RTX 4060 VENTUS 2X BLACK backplate view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-msi-4060-ventus-ports.webp",
      "label": "RTX 4060 VENTUS 2X BLACK HDMI and DisplayPort bracket",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "part-board-gigabyte-b650": [
    {
      "src": "images/products/gallery-gigabyte-b650-aorus-ax-rev12-angle.png",
      "label": "B650 AORUS ELITE AX rev. 1.2 three-quarter view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-gigabyte-b650-aorus-ax-rev12-io.png",
      "label": "B650 AORUS ELITE AX rev. 1.2 rear I/O panel",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "accessory-stream-kit": [
    {
      "src": "images/products/gallery-elgato-facecam-mk2-angle.jpg",
      "label": "Facecam MK.2 mounted front three-quarter photo",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-elgato-facecam-mk2-usbc.jpg",
      "label": "Facecam MK.2 rear USB-C socket and cable",
      "shortLabel": "Ports",
      "role": "ports"
    }
  ],
  "mouse-wireless": [
    {
      "src": "images/products/gallery-logitech-mx3s-palegray-side.png",
      "label": "MX Master 3S Pale Gray thumb-wheel side profile",
      "shortLabel": "Side",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-logitech-mx3s-palegray-angle.png",
      "label": "MX Master 3S Pale Gray high three-quarter view",
      "shortLabel": "Angle",
      "role": "genuine-angle"
    },
    {
      "src": "images/products/gallery-logitech-mx3s-palegray-bottom.png",
      "label": "MX Master 3S Pale Gray underside sensor and pairing controls",
      "shortLabel": "Underside",
      "role": "genuine-angle"
    }
  ]
};
Object.entries(additionalProductViews).forEach(([key, extraViews]) => {
  const [productId, variantId] = key.split("::");
  if (variantId) {
    const variant = productVariants[productId].options.find((item) => item.id === variantId);
    variant.gallery.push(...extraViews);
  } else {
    const media = productMedia[productId] || (productMedia[productId] = {});
    const product = products.find((item) => item.id === productId);
    const image = media.image || product?.image;
    // Parts already define their main photo in productMedia.
    const main = { src: image, label: product ? product.name + " main view" : "Main product view", shortLabel: "Main" };
    media.gallery = [...(media.gallery || [main]), ...extraViews];
  }
});

// Additional connector photos corroborated separately from the main source collection.
productMedia["pc-creator"].gallery.push(
  { src: "images/products/proart-pd500tc-view-3.png", label: "ProArt PD500TC front view", shortLabel: "Front" },
  { src: "images/products/proart-pd500tc-view-4.png", label: "ProArt PD500TC top USB, audio and card-reader connections", shortLabel: "Ports" },
  { src: "images/products/proart-pd500tc-view-5.png", label: "ProArt PD500TC side panel", shortLabel: "Side" }
);
productMedia["pc-office"].gallery.push(
  { src: "images/products/lenovo-neo50t-view-001.webp", label: "ThinkCentre neo 50t Gen 4 left three-quarter view", shortLabel: "Left angle" },
  { src: "images/products/lenovo-neo50t-view-003.webp", label: "ThinkCentre neo 50t Gen 4 rear connections", shortLabel: "Ports",
    note: "Manufacturer chassis connections. Optional expansion connections depend on the ordered configuration." }
);
productMedia["pc-gaming"].gallery[2].label = "MAG Infinite S3 right-side view";
productMedia["pc-gaming"].gallery[2].shortLabel = "Right side";
productMedia["pc-gaming"].gallery.push({
  src: "images/products/msi-infinite-s3-front-extra.webp",
  label: "MAG Infinite S3 13th rear connections",
  shortLabel: "Ports",
  note: "Manufacturer rear chassis photograph. Graphics outputs and optional connections vary by configuration."
});
productVariants["monitor-27"].options.find((variant) => variant.id === "27inch").gallery.push({
  src: "images/products/asus-vg27aq-rear-ports.jpg", label: "ASUS VG27AQ rear controls and HDMI / DisplayPort inputs", shortLabel: "Ports",
  note: "VG27AQ rear view and connector detail, with the manufacturer's published annotations."
});
productMedia["keyboard-rgb"] = {
  gallery: [
    { src: "images/products/keychron-k8-pro.jpg", label: "Keychron K8 Pro Thai/English keyboard", shortLabel: "Main" },
    { src: "images/products/keychron-k8pro-usbc.jpg", label: "Keychron K8 Pro black side profile and USB-C connector", shortLabel: "Ports",
      note: "K8 Pro USB-C connector and mode switches. This side profile shows the connection design, not the keycap legends." }
  ]
};

const pcParts = {
  cooling: [
    { name: "AirFlow 120 Tower Cooler", price: 1995, watts: 5, use: "Office / Gaming" },
    { name: "FrostLoop 240 RGB Liquid Cooler", price: 5495, watts: 12, use: "Gaming / Creator" }
  ],
  cpu: [
    { name: "Intel Core i5-14600K", price: 18995, socket: "LGA1700", watts: 125, use: "Gaming / Office" },
    { name: "Intel Core i7-14700K", price: 24995, socket: "LGA1700", watts: 125, use: "Gaming / Creator" },
    { name: "AMD Ryzen 5 7600", price: 12995, socket: "AM5", watts: 65, use: "Office / Gaming" },
    { name: "AMD Ryzen 9 7900X", price: 26995, socket: "AM5", watts: 170, use: "Content Creation" }
  ],
  motherboard: [
    { name: "MSI B760 Gaming Plus WiFi", price: 10495, socket: "LGA1700", memory: "DDR5", size: "ATX" },
    { name: "ASUS Prime Z790-P", price: 13995, socket: "LGA1700", memory: "DDR5", size: "ATX" },
    { name: "Gigabyte B650 Eagle AX", price: 11995, socket: "AM5", memory: "DDR5", size: "ATX" },
    { name: "ASRock A620M Pro RS", price: 6995, socket: "AM5", memory: "DDR5", size: "Micro-ATX" }
  ],
  gpu: [
    { name: "No dedicated GPU", price: 0, watts: 0, tier: "Office" },
    { name: "NVIDIA RTX 4060 8GB", price: 19995, watts: 115, tier: "Gaming" },
    { name: "NVIDIA RTX 4070 Super", price: 39995, watts: 220, tier: "Creator / Gaming" },
    { name: "AMD Radeon RX 7800 XT", price: 32995, watts: 263, tier: "Gaming" }
  ],
  ram: [
    { name: "16GB DDR5 5600", price: 4295, memory: "DDR5", use: "Office / Gaming" },
    { name: "32GB DDR5 6000", price: 6995, memory: "DDR5", use: "Gaming / Creator" },
    { name: "64GB DDR5 6000", price: 12995, memory: "DDR5", use: "Content Creation" },
    { name: "8GB DDR5 5600", price: 1995, memory: "DDR5", use: "Office / Student" }
  ],
  storage: [
    { name: "500GB NVMe SSD", price: 2295, use: "Office" },
    { name: "1TB NVMe SSD", price: 3495, use: "Gaming / Student" },
    { name: "2TB NVMe SSD", price: 5995, use: "Creator / Gaming" },
    { name: "256GB NVMe SSD", price: 1695, use: "Office" },
    { name: "512GB NVMe SSD", price: 2495, use: "Office / Student" },
    { name: "4TB NVMe SSD", price: 10995, use: "Creator / Gaming" }
  ],
  psu: [
    { name: "550W Bronze PSU", price: 3295, watts: 550 },
    { name: "650W Gold PSU", price: 4995, watts: 650 },
    { name: "850W Gold PSU", price: 7495, watts: 850 },
    { name: "750W Gold PSU", price: 6495, watts: 750 },
    { name: "1000W Gold PSU", price: 9995, watts: 1000 }
  ],
  case: [
    { name: "AirBox ATX Case", price: 4295, supports: ["ATX", "Micro-ATX"] },
    { name: "MiniFlow Micro-ATX Case", price: 3795, supports: ["Micro-ATX"] },
    { name: "Creator Glass ATX Case", price: 6995, supports: ["ATX", "Micro-ATX"] }
  ],
  monitor: [
    { name: "24-inch 1080p Office Monitor", price: 6995 },
    { name: "27-inch 1440p 165Hz Gaming Monitor", price: 15995 },
    { name: "32-inch 4K Creator Monitor", price: 29995 }
  ],
  keyboard: [
    { name: "Basic Office Keyboard", price: 1295 },
    { name: "Mechanical RGB Keyboard", price: 4495 },
    { name: "Wireless Creator Keyboard", price: 5995 }
  ],
  accessories: [
    { name: "WiFi and Bluetooth Adapter", price: 1295 },
    { name: "Studio Webcam", price: 3995 },
    { name: "Gaming Headset", price: 4995 }
  ]
};

const componentInfo = {
  cpu: {
    title: "CPU",
    text: "The CPU is the main processor. It matters for school work, programming, office apps, gaming frame rates, and video editing timelines.",
    tip: "Match the CPU socket with the motherboard socket."
  },
  gpu: {
    title: "Graphics Card",
    text: "The GPU handles games, 3D apps, video editing effects, and some streaming work. Office PCs can often skip a dedicated GPU.",
    tip: "More powerful GPUs need stronger power supplies."
  },
  ram: {
    title: "RAM",
    text: "RAM helps the computer run many apps at once. 16GB is a good start, 32GB is better for gaming and editing, and 64GB is for heavier creator work.",
    tip: "DDR5 RAM needs a DDR5 motherboard."
  },
  storage: {
    title: "SSD Storage",
    text: "The SSD stores Windows, games, documents, and apps. NVMe SSDs are fast and make a computer feel more responsive.",
    tip: "1TB is a comfortable size for most users."
  },
  psu: {
    title: "Power Supply",
    text: "The PSU gives power to every part. It should have enough wattage for the CPU and GPU plus extra room for upgrades.",
    tip: "Choose a higher wattage PSU for strong gaming or creator GPUs."
  },
  cooling: {
    title: "Cooling System",
    text: "Case fans and the CPU cooler move heat away from important components. Good airflow helps a PC maintain steady performance during long gaming and creator workloads.",
    tip: "Keep intake filters clean and leave space around the case vents."
  },
  motherboard: {
    title: "Motherboard",
    text: "The motherboard connects the processor, memory, storage, graphics card, and other devices. Its socket and supported memory type determine which components will work together.",
    tip: "Check the CPU socket, RAM generation, case size, and expansion slots before buying."
  },
  frontio: {
    title: "Front I/O Ports",
    text: "Front input and output controls provide convenient access to the power button, audio, USB-A, and USB-C connections without reaching behind the computer.",
    tip: "Check that the case connectors match the headers available on the motherboard."
  },
  case: {
    title: "Computer Case",
    text: "The case protects the desktop components and controls how much room, airflow, cable space, and upgrade flexibility the complete build has.",
    tip: "Match the case size with the motherboard, graphics card length, radiator, and power supply."
  },
  heatpipes: {
    title: "Laptop Heat Pipes",
    text: "Heat pipes carry heat from the laptop processor and graphics chip toward the cooling fins, where the fans can move that heat out of the chassis.",
    tip: "Blocked exhaust vents can reduce performance even when both cooling fans still work."
  },
  wifi: {
    title: "Wi-Fi and Bluetooth Card",
    text: "This compact wireless card connects the laptop to Wi-Fi networks and Bluetooth accessories through its attached antenna cables.",
    tip: "Reconnect the small antenna leads carefully if this card is ever replaced."
  },
  battery: {
    title: "Laptop Battery",
    text: "The rechargeable lithium-ion battery supplies portable power. Its capacity, age, temperature, and workload determine how long the laptop runs away from an outlet.",
    tip: "A swollen battery should not be used and must be replaced by a qualified technician."
  },
  speakers: {
    title: "Laptop Speakers",
    text: "The internal left and right speakers provide system audio without external equipment and are normally installed along the lower edges of the chassis.",
    tip: "Distorted audio can come from software settings, loose connections, or damaged speaker units."
  },
  ports: {
    title: "Laptop Side Ports",
    text: "Side ports connect power, displays, storage, networks, headphones, and USB accessories. Available ports vary considerably between laptop models.",
    tip: "Check for the exact HDMI, USB, Thunderbolt, audio, and network ports your setup requires."
  },
  hinge: {
    title: "Display Hinges",
    text: "The hinges support the display and route delicate screen and antenna cables between the lid and the laptop body.",
    tip: "Open the display from the center and avoid forcing it beyond its designed angle."
  },
  monitor: {
    title: "Monitor",
    text: "The monitor changes how the whole setup feels. Gaming users may want high refresh rates, while creators may prefer color accuracy and 4K resolution.",
    tip: "Match the monitor to your main use, not only the biggest size."
  },
  keyboard: {
    title: "Keyboard",
    text: "A keyboard affects comfort every day. Office users may prefer quiet keys, while gamers often like mechanical switches.",
    tip: "Wireless is clean, but wired is simple and reliable."
  }
};
