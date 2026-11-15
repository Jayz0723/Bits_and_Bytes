/* Shared comparison facts. Manufacturer facts are kept separate from store
   configuration claims. Never infer installed options from a family maximum. */
(() => {
  'use strict';
  function verifiedDetails(item) {
    if (item.id === 'lap-hp-victus-15' && item.variant === 'mica-silver') return {
      source: 'https://www.hp.com/ie-en/products/laptops/product-details/product-specifications/2103174418',
      values: { 'Configuration basis': 'HP 15-fa2007na / C09K1EA; checked 15 November 2026',
        Processor: 'Intel Core 7 240H; 10 cores, 16 threads', Graphics: 'GeForce RTX 5060 Laptop; 8 GB GDDR7',
        'Installed memory': '24 GB DDR5-5600 (2 × 12 GB)', 'Installed storage': '1 TB PCIe NVMe SSD',
        Display: '15.6-inch IPS; 1920 × 1080; 144 Hz', 'Brightness / gamut': '300 nits; 62.5% sRGB',
        Battery: '70 Wh', Weight: '2.29 kg', Wireless: 'Wi-Fi 6; Bluetooth 5.4',
        Ports: '2 USB-A; USB-C with DisplayPort 1.4a; HDMI 2.1; Ethernet; combined audio jack',
        'Power adapter': '200 W', 'Operating system': 'Windows 11 Home' }
    };
    if (item.id === 'lap-msi-thin-15-b13ve') return {
      source: 'https://www.msi.com/Laptop/Thin-15-B13VX/Specification',
      values: { 'Configuration basis': 'B13VE family specification; regional SKU not supplied; checked 15 November 2026',
        Processor: 'Up to 13th-generation Core i7; exact CPU not confirmed', Graphics: 'GeForce RTX 4050 Laptop; 6 GB GDDR6; up to 45 W graphics power',
        'Installed memory': 'Capacity not confirmed; supports DDR4-3200, 2 slots, up to 64 GB',
        'Installed storage': 'Capacity not confirmed; supports M.2 PCIe 4 SSD and 2.5-inch SATA drive',
        Display: '15.6-inch IPS-level; 1920 × 1080; 144 Hz', 'Brightness / gamut': 'Not specified in this manufacturer reference',
        Battery: '52.4 Wh', Weight: '1.86 kg', Wireless: 'Wi-Fi 6E; Bluetooth 5.3',
        Ports: '3 USB-A; USB-C with DisplayPort; HDMI (4K at 30 Hz); Ethernet; separate mic and headphone jacks',
        'Power adapter': '120 W', 'Operating system': 'Windows 11 Home / Pro options; confirm regional SKU' }
    };
    return null;
  }

  const checked = {};
  function register(id, values, source) { checked[id] = { values, source }; }
  register("monitor-msi-g244f-e2", {"Display": "23.8-inch Rapid IPS; 1920 × 1080", "Refresh rate": "180 Hz", "Response time": "1 ms GtG", "Brightness": "300 nits", "Ports": "2 HDMI 2.0b; DisplayPort 1.2a; headphone output", "Mount": "VESA 75 × 75 mm"}, "https://www.msi.com/Monitor/G244F-E2/Specification");
  register("monitor-msi-274qrf-qd-e2", {"Display": "27-inch Rapid IPS Quantum Dot; 2560 × 1440", "Refresh rate": "180 Hz via DisplayPort / USB-C; HDMI up to 144 Hz", "Response time": "1 ms GtG", "Brightness": "400 nits; DisplayHDR 400", "Ports": "DisplayPort 1.4a; 2 HDMI 2.0b; USB-C (65 W PD); USB hub; headphone output", "Stand": "Height, tilt, swivel and pivot"}, "https://www.msi.com/Monitor/MAG-274QRF-QD-E2/Specification");
  register("part-msi-a650bn", {"Rated power": "650 W", "Efficiency certification": "80 PLUS Bronze", "Cabling": "Fixed cables", "Fan": "120 mm", "Dimensions": "140 × 150 × 86 mm", "Power connectors": "1 EPS 4+4; 2 PCIe 6+2; 5 SATA"}, "https://www.msi.com/Power-Supply/MAG-A650BN/Specification");
  register("accessory-msi-gh20", {"Connection": "Wired 3.5 mm", "Drivers": "40 mm neodymium", "Frequency response": "20 Hz–20 kHz", "Impedance": "32 ohms", "Weight": "245 g excluding cable", "Microphone": "Unidirectional"}, "https://www.msi.com/Gaming-Gear/IMMERSE-GH20/Specification");
  register("accessory-msi-gm11", {"Connection": "USB", "Sensor": "PixArt PMW-3325 optical", "Sensitivity": "Up to 5,000 DPI", "Polling rate": "1,000 Hz", "Buttons": "6 programmable", "Weight": "89 g excluding cable"}, "https://www.msi.com/Gaming-Gear/CLUTCH-GM11/Specification");
  register("part-msi-m450-1tb", {"Capacity": "1 TB", "Form factor": "M.2 2280", "Interface": "PCIe 4.0 ×4; NVMe 1.4", "Sequential read / write": "Up to 3,600 / 3,000 MB/s", "Endurance": "600 TBW"}, "https://www.msi.com/Storage/SPATIUM-M450-PCIe-4.0-NVMe-M.2/Specification");
  register("part-msi-m100r-white", {"Motherboard support": "Micro-ATX / Mini-ITX", "GPU clearance": "300 mm", "CPU cooler clearance": "160 mm", "Included fans": "4 × 120 mm ARGB", "Radiator support": "Up to 240 mm front / top", "Dimensions": "388 × 200 × 423 mm"}, "https://www.msi.com/PC-Case/MAG-FORGE-M100R/Specification");
  register("part-msi-h610m-g", {"Chipset / socket": "Intel H610 / LGA1700", "Form factor": "Micro-ATX", "Memory support": "2 DDR4 slots; up to 64 GB; up to 3200 MT/s", "Storage connections": "4 SATA; 1 M.2 storage slot (PCIe 3.0 ×4 / SATA)", "Expansion": "PCIe 4.0 ×16"}, "https://www.msi.com/Motherboard/PRO-H610M-G-DDR4/Specification");
  register("accessory-msi-gk30", {"Connection": "USB 2.0", "Switches": "Plunger", "Lighting": "RGB", "Key rollover": "6-key rollover; 20-key anti-ghosting", "Layout": "Full size; key count depends on region", "Weight": "1,042 g"}, "https://www.msi.com/Gaming-Gear/VIGOR-GK30/Specification");
  register("part-gpu-rtx-4060", {"Graphics": "GeForce RTX 4060", "Video memory": "8 GB GDDR6; 128-bit", "Interface": "PCIe 4.0 ×8", "Outputs": "3 DisplayPort 1.4a; 1 HDMI 2.1a", "Recommended PSU": "550 W", "Power connector": "1 × 8-pin", "Dimensions": "199 × 120 × 41 mm"}, "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-VENTUS-2X-BLACK-8G/Specification");
  register("lap-msi-modern-15-b13m", {"Display": "15.6-inch Full HD IPS-level", "Memory support": "Onboard DDR4-3200; up to 16 GB (configuration dependent)", "Storage support": "1 M.2 PCIe 3.0 slot", "Wireless": "Wi-Fi 6; Bluetooth 5.2", "Weight": "1.7 kg", "Power adapter": "65 W"}, "https://www.msi.com/Business-Productivity/Modern-15-B13X/Specification");
  register("lap-msi-modern-14-c13m", {"Display": "14-inch Full HD IPS-level", "Memory support": "Onboard DDR4-3200; up to 16 GB (configuration dependent)", "Storage support": "1 M.2 PCIe 3.0 slot", "Wireless": "Wi-Fi 6; Bluetooth 5.2", "Weight": "1.4 kg", "Power adapter": "65 W"}, "https://www.msi.com/Business-Productivity/Modern-14-C13X/Specification");
  register("lap-msi-cyborg-15-a13v", {"Graphics": "A13VF: RTX 4060 Laptop; 8 GB GDDR6; up to 45 W", "Display": "15.6-inch Full HD; 144 Hz; IPS-level", "Memory support": "2 DDR5 slots; up to 64 GB", "Storage support": "1 M.2 PCIe 4.0 slot"}, "https://www.msi.com/Laptop/Cyborg-15-A13VX/Specification");
  register("part-msi-pro-b650-s", {"Chipset / socket": "AMD B650 / AM5", "Memory support": "4 DDR5 slots; AMD EXPO support", "Storage connections": "2 M.2 PCIe 4.0 ×4; 4 SATA", "Networking": "2.5 Gb Ethernet; Wi-Fi 6E; Bluetooth 5.3"}, "https://www.msi.com/Motherboard/PRO-B650-S-WIFI/Specification");

  // Split the live, selected variant into comparable attributes. These rows are
  // explicitly store-listed, not independently verified manufacturer claims.
  const rules = [
    ['Processor', /(?:Intel.*(?:Core|i[3579])|Core [i3579]|Ryzen|Apple M\d|\d+-core.*processor)/i],
    ['Graphics', /(?:RTX|GTX|graphics|GPU)/i],
    ['Installed memory', /(?:RAM|DDR[345]|LPDDR|unified memory)/i],
    ['Installed storage', /(?:SSD|NVMe|SATA.*drive)/i],
    ['Display', /(?:inch|display|refresh rate|\d+Hz|GtG|MPRT)/i],
    ['Power', /(?:PSU|power supply|\d+W|80 PLUS)/i],
    ['Platform / fit', /(?:socket|chipset|motherboard|ATX|ITX|LGA|AM5|clearance)/i],
    ['Cooling', /(?:fan|cooler|cooled|radiator)/i],
    ['Connection / ports', /(?:USB|HDMI|DisplayPort|Bluetooth|Wi-Fi|LAN|3.5mm|wireless)/i],
    ['Controls / input', /(?:switch|keycap|rollover|ghosting|DPI|sensor|buttons|clicks)/i],
    ['Audio / camera', /(?:microphone|drivers|webcam|lens|HDR|fps|audio)/i],
    ['Appearance', /(?:Color:|RGB|LED|panel|Black|White|Silver|Blue|Gray)/i]
  ];
  function catalogDetails(product) {
    const values = {};
    for (const clause of (product.specs || '').split(/,\s*/)) {
      const label = rules.find(([, pattern]) => pattern.test(clause))?.[0] || 'Other features';
      const key = label;
      values[key] = [values[key], clause].filter(Boolean).join('; ');
    }
    return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, 'Store listed: ' + value]));
  }
  window.productComparisonDetails = function(item) {
    const id = item.baseProductId || item.id.split('::')[0];
    const variant = item.variantId || item.variant || '';
    const base = typeof catalogProducts === 'function' ? catalogProducts().find(p => p.id === id) : null;
    const product = base ? productWithVariant(base, variant || undefined) : item;
    const exact = verifiedDetails({ id, variant: product.variantId || variant });
    if (exact) return exact;
    const reference = checked[id];
    return {
      source: reference?.source || product.descriptionSource,
      values: {
        'Configuration basis': reference
          ? 'Manufacturer model / family facts checked 16 November 2026. Store-listed options require exact SKU confirmation.'
          : 'Store-listed configuration. Exact SKU specifications have not been independently confirmed; reference may cover several configurations.',
        ...catalogDetails(product),
        ...(reference?.values || {}),
        'Unlisted specifications': 'Not confirmed for this configuration; do not assume optional features are included.'
      }
    };
  };
})();
