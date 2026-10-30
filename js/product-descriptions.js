// Original summaries based on the linked manufacturer references, checked October 17, 2026.
// Keep capacities, colors, and installed hardware in data.js; those change with the selected option.
const productDescriptions = {
  'lap-hp-victus-15': { description: 'The Victus 15-fa2007na pairs a Core 7 240H processor with RTX 5060 Laptop graphics and a 144Hz Full HD display for gaming and everyday work. This UK model includes 24GB memory, a 1TB SSD and a Mica Silver finish. Confirm regional keyboard and power adapter requirements before ordering.', source: 'https://www.hp.com/gb-en/shop/products/laptops/victus-gaming-laptop-15-fa2007na-c09k1ea-abu', note: 'Color choices represent different Victus configurations. Check the model, processor, graphics, memory, storage and price after switching.', variants: { 'performance-blue': { description: 'The Performance Blue Victus 15-fb3105na pairs a Ryzen 7 7445HS processor with RTX 4050 Laptop graphics, a 144Hz Full HD display, 12GB RAM and a 512GB SSD. This is a different UK configuration from the Mica Silver 15-fa2007na; selecting it changes the hardware and price, as well as the finish.', source: 'https://www.johnlewis.com/hp-victus-15-fb3105na-gaming-laptop-amd-ryzen-7-processor-12gb-ram-512gb-ssd-rtx-4050-15-6-inch-full-hd-performance-blue/p115821710' } } },
  'pc-bb-foundation': { description: 'An entry-level store-configured desktop for study, browsing and everyday office work, using Ryzen integrated graphics rather than a separate graphics card. The photo shows the chosen Corsair enclosure only. Internal part brands, cooling and final availability must be confirmed with the store.', source: 'pages/build.html' },
  'pc-bb-core': { description: 'A mid-range store-configured desktop pairing a Core i5 processor with RTX 4060 graphics for gaming and multitasking. Choose a black or white Corsair enclosure without changing the listed hardware. Photos show the enclosure only; confirm final component brands and cooling before purchase.', source: 'pages/build.html' },
  'pc-bb-apex': { description: 'A high-end store-configured desktop combining Core i7 processing, RTX 4070 Super graphics and 64GB memory for demanding projects and gaming. Photos show the selected enclosure rather than a completed system. Confirm final motherboard, cooling and component availability with the store.', source: 'pages/build.html' },
  "monitor-msi-g244f-e2": {"description":"The G244F E2 brings a fast 180Hz refresh rate to a compact Full HD desk setup. Its Rapid IPS panel and Adaptive-Sync support suit responsive gaming, with HDMI and DisplayPort connections for compatible computers.","source":"https://www.msi.com/Monitor/G244F-E2/Specification"},
  "part-msi-a650bn": {"description":"The MAG A650BN is an entry-level ATX power supply with 80 PLUS Bronze certification and a 120mm cooling fan. Its DC-to-DC design and electrical protection features provide a practical foundation for a compatible desktop build.","source":"https://www.msi.com/Power-Supply/MAG-A650BN/Specification"},
  "accessory-msi-gh20": {"description":"The IMMERSE GH20 pairs lightweight construction with soft ear cushions and an adjustable microphone. Its inline volume and mute controls keep common adjustments close at hand, while a 3.5mm connection supports compatible computers and consoles.","source":"https://www.msi.com/Gaming-Gear/IMMERSE-GH20/Specification"},
  "accessory-msi-gm11": {"description":"The CLUTCH GM11 offers an optical sensor with selectable sensitivity up to 5000 DPI and six programmable buttons. Its USB connection and RGB lighting make it a straightforward addition to a gaming or everyday desktop setup.","source":"https://www.msi.com/Gaming-Gear/CLUTCH-GM11/Specification"},
  "part-msi-m450-1tb": {"description":"The 1TB SPATIUM M450 uses a compact M.2 2280 form factor and PCIe 4.0 NVMe interface for system files, applications and games. Check your motherboard's storage interface and supported module length before choosing it for an upgrade.","source":"https://www.msi.com/Storage/SPATIUM-M450-PCIe-4.0-NVMe-M.2/Specification"},
  "part-msi-m100r-white": {"description":"The white MAG FORGE M100R is a compact case for Micro-ATX and Mini-ITX systems, with four pre-installed ARGB fans and a mesh front. Confirm graphics-card length, cooler height and radiator clearance before selecting components. This is an empty case.","source":"https://www.msi.com/PC-Case/MAG-FORGE-M100R/Specification"},
  "part-msi-h610m-g": {"description":"The PRO H610M-G DDR4 is a Micro-ATX LGA1700 platform with DDR4 memory support, M.2 storage and Gigabit Ethernet. Check MSI's processor support list and required BIOS version for the CPU you plan to install.","source":"https://www.msi.com/Motherboard/PRO-H610M-G-DDR4/Specification"},
  "accessory-msi-gk30": {"description":"The VIGOR GK30 combines a full-size layout with plunger-style switches and RGB lighting. Its wired USB connection and anti-ghosting support make it a practical keyboard for everyday tasks and gaming. Key layout varies by regional version.","source":"https://www.msi.com/Gaming-Gear/VIGOR-GK30/Specification"},
  "lap-msi-thin-15-b13ve": {"description":"The Thin 15 B13VE combines GeForce RTX 4050 laptop graphics with a 15.6-inch high-refresh Full HD display. Its blue-backlit keyboard and USB-C display output suit a portable gaming workspace, with final processor, memory and storage details determined by the regional configuration.","source":"https://www.msi.com/Laptop/Thin-15-B13VX/Specification","note":"Processor model, installed RAM and SSD capacity depend on the regional SKU. Confirm the exact configuration before ordering."},
  "lap-msi-modern-15-b13m": {"description":"The Modern 15 B13M provides a spacious Full HD screen and backlit keyboard for documents, study and daily productivity. USB-C display and power-delivery support and a microSD reader add useful desk connections. This Star Blue chassis uses onboard memory, so confirm installed capacity before buying.","source":"https://www.msi.com/Business-Productivity/Modern-15-B13X/Specification","note":"Processor model, installed RAM and SSD capacity depend on the regional SKU. Onboard memory is not a standard replaceable DIMM."},
  "lap-msi-modern-14-c13m": {
    description: "The Modern 14 C13M is a compact everyday laptop for documents, classes, and work on the move. Its Full HD screen and backlit keyboard suit daily tasks, while USB-C, HDMI, and a microSD reader provide useful connections beyond your desk.",
    source: "https://www.msi.com/Business-Productivity/Modern-14-C13X/Specification",
    note: 'Color availability and regional model codes vary. Confirm the listed store configuration and keyboard layout before ordering.'
  },
  "lap-msi-cyborg-15-a13v": {
    description: "The Cyborg 15 A13VF pairs a translucent, cyberpunk-inspired chassis with GeForce RTX graphics. Its high-refresh Full HD display suits fast-moving games, and the shared CPU and GPU heat-pipe design helps manage heat during demanding sessions.",
    source: "https://www.msi.com/Laptop/Cyborg-15-A13VX"
  },
  "lap-dell-16-plus": {
    description: "The Dell 16 Plus DB16250 gives you a spacious 16-inch screen for spreadsheets, side-by-side documents, and creative work. This Ice Blue configuration combines a Core Ultra processor with Intel Arc graphics, while USB-C, Thunderbolt 4, and HDMI support a connected workspace.",
    source: "https://www.dell.com/en-us/shop/dell-laptops/dell-16-plus-laptop/spd/dell-db16250-laptop"
  },
  "pc-msi-codex-6-14": {
    description: "The MAG Codex 6 14th is a gaming tower with a see-through side panel and customizable Mystic Light lighting. Its separated cooling chambers help direct airflow, and an upgrade-friendly layout leaves room to adapt the system as your needs change.",
    source: "https://www.msi.com/Desktop/MAG-Codex-6-14th"
  },
  "monitor-msi-274qrf-qd-e2": {
    description: "The MAG 274QRF QD E2 combines a 27-inch WQHD Rapid IPS panel with Quantum Dot color and a 180Hz refresh rate. Adaptive-Sync helps reduce tearing with compatible graphics hardware, while the adjustable stand lets you position the screen for a more comfortable desk setup.",
    source: "https://www.msi.com/Monitor/MAG-274QRF-QD-E2"
  },
  "part-msi-pro-b650-s": {
    description: "The PRO B650-S WIFI is an ATX foundation for an AMD AM5 desktop. DDR5 memory support, M.2 storage connections, and built-in Wi-Fi 6E cover the essentials for a connected system. Check the processor support list and required BIOS version before installation.",
    source: "https://www.msi.com/Motherboard/PRO-B650-S-WIFI"
  },
  "part-msi-4060-ti-gaming-x": {
    description: "MSI's RTX 4060 Ti GAMING X 8G combines NVIDIA Ada Lovelace graphics with the TWIN FROZR 9 dual-fan cooler. It supports ray tracing and DLSS in supported games, with HDMI and DisplayPort connections for your monitor. Check case clearance and power requirements before upgrading.",
    source: "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-Ti-GAMING-X-8G"
  },
  "part-corsair-3000d": {
    description: "The 3000D AIRFLOW is an ATX mid-tower with a ventilated front panel and tempered-glass side window. Two included SP120 fans provide a starting point for cooling, with space for additional fans or radiators when your build needs them. This is an empty case, not a complete PC.",
    source: "https://www.corsair.com/ww/en/p/pc-cases/CC-9011251-WW/3000d-tempered-glass-mid-tower-black-cc-9011251-ww"
  },
  "accessory-corsair-k65-plus": {
    description: "The K65 PLUS WIRELESS keeps the function row and arrow keys in a compact 75% layout. Pre-lubricated mechanical switches and RGB lighting bring a customizable feel to work and gaming, with wireless or USB connections to suit your setup.",
    source: "https://www.corsair.com/us/en/p/keyboards/ch-91d401l-na/k65-plus-wireless-75-percent-rgb-mechanical-gaming-keyboard-ch-91d401l-na"
  },
  "lap-dell-latitude-5440": {
    description: "The Latitude 5440 is a 14-inch business laptop designed for everyday productivity and collaboration. Its compact format makes it practical for moving between meetings and a home office, with connections for workplace peripherals. Optional security features depend on the exact configuration.",
    source: "https://www.delltechnologies.com/asset/en-us/products/laptops-and-2-in-1s/technical-support/latitude-5x40-spec-sheet.pdf"
  },
  "lap-dell-g15-5530": {
    description: "The Dell G15 5530 brings Core HX processing and dedicated GeForce RTX graphics to a 15.6-inch gaming laptop. The listed 165Hz Full HD screen is suited to fast-moving gameplay, while the desktop-style chassis makes room for gaming-focused cooling.",
    source: "https://www.dell.com/en-us/shop/dell-laptops/g15-gaming-laptop/spd/g-series-15-5530-laptop"
  },
  "pc-hp-pro-mini-400-g9": {
    description: "The Pro Mini 400 G9 puts an everyday business desktop into a compact enclosure that takes up less desk space than a tower. It suits office documents, browsing, and shared work areas. A monitor, keyboard, and mouse are separate unless explicitly included in your order.",
    source: "https://support.hp.com/us-en/document/ish_6181857-6182018-16"
  },
  "part-corsair-4000d": {
    description: "The 4000D AIRFLOW combines a ventilated steel front panel with a tempered-glass side window. Its RapidRoute cable channel helps keep wiring organized, and two included AirGuide fans start the cooling setup. Check radiator and graphics-card clearance together when planning your build; components are sold separately.",
    source: "https://www.corsair.com/ww/en/p/pc-cases/CC-9011200-WW/4000d-airflow-tempered-glass-mid-tower-atx-case-black-cc-9011200-ww"
  },
  "part-corsair-ml120-red": {
    description: "This single 120mm ML120 LED ELITE fan adds red illumination and directed airflow to a compatible PC case. A magnetic-levitation bearing and PWM speed control support adjustable cooling. The lighting is red, not a selectable RGB color system.",
    source: "https://www.corsair.com/ww/en/p/case-fans/co-9050120-ww/ml120-led-elite-red-premium-120mm-pwm-magnetic-levitation-fan-co-9050120-ww"
  },
  "part-corsair-vengeance-32": {
    description: "This VENGEANCE kit provides 32GB of desktop DDR5 memory across two 16GB modules, with low-profile aluminum heatspreaders. The CMK32GX5M2B6000C36 kit has a tested 6000MT/s CL36 XMP profile; reaching that setting requires a compatible motherboard, processor, and BIOS configuration. It does not fit DDR4 slots.",
    source: "https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mhz-c36-memory-kit-black-cmk32gx5m2b6000c36"
  },
  "part-msi-b760-gaming-plus": {
    description: "The B760 GAMING PLUS WIFI is an ATX motherboard for a compatible Intel LGA1700 processor and DDR5 desktop memory. PCIe 4.0 M.2 storage and Wi-Fi 6E provide a practical base for a gaming system. Verify the CPU support list and BIOS requirements for your chosen processor.",
    source: "https://www.msi.com/Motherboard/B760-GAMING-PLUS-WIFI"
  },
  "part-msi-4070-super": {
    description: "The RTX 4070 SUPER VENTUS 2X OC combines 12GB of graphics memory with a dual-fan cooler. NVIDIA ray tracing and DLSS features are available in supported applications and games. HDMI and DisplayPort outputs support your display setup; confirm power connectors and case space before installation.",
    source: "https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-2X-OC"
  },
  "part-samsung-990-pro-1tb": {
    description: "The Samsung 990 PRO is a high-performance internal NVMe SSD for a compatible PCIe 4.0 M.2 slot. This 1TB MZ-V9P1T0BW model uses the M.2 2280 format for game libraries, applications, and project files. It is not a 2.5-inch SATA drive or an external USB drive.",
    source: "https://www.samsung.com/sg/memory-storage/nvme-ssd/990-pro-1tb-nvme-pcie-gen-4-mz-v9p1t0bw/"
  },
  "accessory-logitech-g502": {
    description: "The wired G502 HERO offers a HERO gaming sensor, 11 programmable buttons, and removable weights for adjusting its feel. Use Logitech G HUB to tailor button assignments to your games or daily shortcuts. Its USB connection means there is no wireless battery to recharge.",
    source: "https://www.logitechg.com/en-us/shop/p/g502-hero-gaming-mouse"
  },
  "accessory-logitech-g435": {
    description: "The G435 is a lightweight wireless headset with LIGHTSPEED receiver and Bluetooth connectivity. Built-in beamforming microphones keep the design free of a microphone boom, and USB-C is used for charging. Choose a finish that matches your setup and check compatibility with your intended device.",
    source: "https://www.logitechg.com/en-us/shop/p/g435-wireless-bluetooth-gaming-headset"
  },
  "lap-microsoft-studio-2": {
    description: "Surface Laptop Studio 2 has a flexible hinge that moves its touchscreen between laptop, stage, and studio positions. The 14.4-inch PixelSense Flow display supports up to 120Hz, while the listed RTX configuration suits creative applications. Surface Slim Pen 2 is an optional accessory, not included here.",
    source: "https://support.microsoft.com/en-us/surface/models/surface-laptop-studio-2-features"
  },
  "lap-dell-xps-13": {
    description: "The XPS 13 9340 combines a compact 13.4-inch design with Intel Core Ultra processing. Its minimalist keyboard deck and haptic touchpad suit a portable workspace. Display options vary across the range, so do not assume this listing includes the optional OLED touchscreen.",
    source: "https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-9340-laptop",
    note: "The exact display panel and regional SKU need confirmation; this listing specifies only the screen size."
  },
  "pc-hp-omen-35l": {
    description: "The OMEN 35L GT16-0066m is a gaming desktop with a Ryzen 7 8700G processor and dedicated RTX 4060 graphics. Its 35-liter tower provides a larger home for the hardware than a mini desktop, with a windowed design that puts the system on show.",
    source: "https://www.hp.com/us-en/shop/pdp/omen-35l-gaming-desktop-gt16-0066m-pc"
  },
  "pc-apple-mac-mini-m4": {
    description: "Mac mini with M4 brings Apple's desktop platform to a compact enclosure, with front USB-C ports and rear Thunderbolt 4, HDMI, and Ethernet connections. The listed configuration uses unified memory shared by the CPU and graphics. A display, keyboard, and mouse are sold separately.",
    source: "https://support.apple.com/en-us/121555"
  },
  "lap-acer-office": {
    description: "The Aspire 14 AS14H-53 is a portable everyday laptop with a Core 5 210H processor and a 14-inch WUXGA screen. Its compact format suits classes, documents, and work between locations, while the listed SSD provides local space for your applications and files.",
    source: "https://store.acer.com/en-in/laptops/aspire/screen_size-35_6_cm_14"
  },
  "lap-asus-gaming": {
    description: "The ROG Strix G16 (2023) is a 16-inch gaming laptop built around dedicated GeForce RTX graphics and gaming-focused cooling. Its taller 16:10 display gives you extra vertical room for work between games. Use the selected configuration below rather than the maximum specifications advertised for the wider range.",
    source: "https://rog.asus.com/us/laptops/rog-strix/rog-strix-g16-2023-series/",
    note: "The full regional SKU and exact Core i7 processor model need confirmation."
  },
  "lap-lenovo-office": {
    description: "The ThinkBook 14 G6 IRL is a 14-inch business laptop with a practical selection of USB-C, Thunderbolt 4, HDMI, Ethernet, and SD-card connections. The platform supports DDR5 memory and M.2 SSD storage for an office or study workspace. Exact hardware depends on the regional model.",
    source: "https://psref.lenovo.com/WDProduct/ThinkBook/ThinkBook_14_G6_IRL",
    note: "Processor needs confirmation: Lenovo's model-family reference does not list the Core i5-13420H currently recorded in this catalog. Confirm the full SKU before ordering."
  },
  "lap-apple-creator": {
    description: "The 13-inch MacBook Air with M3 combines a 13.6-inch Liquid Retina display with a compact aluminum body. MagSafe charging leaves its two Thunderbolt / USB 4 ports available for accessories, and Touch ID offers a convenient way to unlock your Mac. Choose your preferred finish without changing the listed memory or storage.",
    source: "https://support.apple.com/en-us/118551"
  },
  "pc-gaming": {
    description: "The MAG Infinite S3 13th combines a 13th-generation Intel platform with dedicated GeForce graphics in a ventilated gaming tower. A transparent side window shows the hardware, and Mystic Light lets you personalize the lighting. The installed memory and SSD are the amounts shown in this listing, not the family's maximum options.",
    source: "https://www.msi.com/Desktop/MAG-Infinite-S3-13th"
  },
  "pc-office": {
    description: "The ThinkCentre neo 50t Gen 4 is a business tower for an everyday desk-based workspace. Its Intel desktop platform, memory expansion, and internal storage options offer a practical alternative to an all-in-one PC. Connect your own monitor and peripherals; the tower does not include a display unless separately listed.",
    source: "https://psref.lenovo.com/Product/ThinkCentre/ThinkCentre_neo_50t_Gen_4?MT=12JB"
  },
  "pc-creator": {
    description: "The ProArt Station PD5 PD500TC is a desktop designed around creative workloads rather than a conventional gaming appearance. Dedicated NVIDIA graphics support compatible creative applications, while ASUS Lumiwiz indicators provide a visual system-status cue. Use the installed configuration listed here, not the higher-end options available elsewhere in the PD5 family.",
    source: "https://www.asus.com/us/displays-desktops/tower-pcs/proart-station/proart-station-pd5-pd500tc/"
  },
  "monitor-27": {
    description: "The TUF Gaming VG27AQ pairs a 27-inch QHD IPS panel with Adaptive-Sync and ASUS ELMB Sync for compatible gaming setups. Its refresh rate reaches up to 165Hz when overclocked. Connection type and graphics hardware affect available modes, so check your system before selecting a refresh rate.",
    source: "https://www.asus.com/us/displays-desktops/monitors/tuf-gaming/tuf-gaming-vg27aq/",
    variants: {
      "24inch": {
        description: "The TUF Gaming VG249Q1A is a 23.8-inch Full HD IPS monitor with a refresh rate up to 165Hz when overclocked. Adaptive-Sync and ASUS ELMB support clear motion in compatible gaming setups. Its smaller screen is a practical choice where desk space is limited.",
        source: "https://www.asus.com/pt/displays-desktops/monitors/tuf-gaming/tuf-gaming-vg249q1a/"
      },
      "32inch": {
        description: "The ProArt PA329CV is a 32-inch 4K IPS monitor intended for color-focused creative work. Factory calibration and Calman verification support consistent color, while USB-C, HDMI, and DisplayPort provide flexible connections. This is a 60Hz creative display, not the high-refresh TUF Gaming model.",
        source: "https://www.asus.com/uk/displays-desktops/monitors/proart/proart-display-pa329cv/"
      }
    }
  },
  "keyboard-rgb": {
    description: "The Keychron K8 Pro keeps the function row and navigation keys in a tenkeyless layout that leaves more room for your mouse. Bluetooth and USB-C support wireless or wired use, while QMK-based customization lets you remap keys and create shortcuts. This listing uses the photographed Thai/English keycap layout.",
    source: "https://www.keychron.com/products/keychron-k8-pro-qmk-via-wireless-mechanical-keyboard"
  },
  "mouse-wireless": {
    description: "The MX Master 3S is a rechargeable productivity mouse with quiet clicks, an 8000 DPI sensor, and a thumb wheel for horizontal scrolling. Connect through Bluetooth or Logi Bolt and customize supported shortcuts with Logi Options+. Its sculpted shape is designed for right-handed use.",
    source: "https://www.logitech.com/es-es/products/mice/mx-master-3s.910-006560.html"
  },
  "pc-aurora-elite": {
    description: "The ROG G22CH puts dedicated gaming graphics into a compact small-form-factor desktop. Its space-conscious enclosure suits desks where a full-size tower is impractical, while the listed Core i7 and RTX configuration handles gaming and supported creative software. Cooling and included accessories vary by regional SKU.",
    source: "https://rog.asus.com/ph/desktops/small-form-factor/rog-g22ch-series/spec/"
  },
  "lap-creator-pro": {
    description: "The Vivobook Pro 16 OLED K6602 is a creator-focused laptop that pairs a large OLED display with dedicated NVIDIA graphics. It provides room for editing timelines, photographs, and everyday multitasking without needing a separate desktop. Check the complete K6602 model suffix before confirming the order.",
    source: "https://www.asus.com/event/2023/productguide/au/ASUS_Lifestyle_Product_Guide_2023.pdf",
    note: "K6602 is a product family; the full model suffix and regional configuration need confirmation."
  },
  "accessory-stream-kit": {
    description: "The Facecam MK.2 is a Full HD webcam for streaming and video calls, with up to 60fps capture and HDR support. Camera Hub software provides image adjustments, while a built-in privacy shutter covers the lens when it is not needed. Use a compatible USB 3.0 connection.",
    source: "https://www.elgato.com/en-UK/uk/en/p/facecam-mk2"
  },
  "lap-hp-pavilion-plus": {
    description: "The Pavilion Plus 14 combines a compact screen size with Intel Core Ultra processing for daily work and creative applications. Its portable format suits a desk, classroom, or shared workspace. Panel type and other options vary by model; an OLED display is not assumed for this listing.",
    source: "https://support.hp.com/es-es/document/ish_9857615-9863648-16",
    note: "The full HP product number, exact Core Ultra 5 processor, and display panel need confirmation."
  },
  "pc-msi-aegis-rgb": {
    description: "The Aegis R 13th is a gaming tower with customizable RGB lighting and standardized components intended to simplify later upgrades. Its Intel and GeForce platform supports gaming and creative workloads. Installed hardware varies by SKU, so the selected configuration should be confirmed rather than inferred from the family's maximum specifications.",
    source: "https://us.msi.com/Desktop/Aegis-R-13th",
    note: "The exact Core i7 processor and complete Aegis model code need confirmation."
  },
  "lap-dell-inspiron-plus": {
    description: "The Inspiron 14 Plus 7440 offers a compact 14-inch workspace built around Intel Core Ultra processing. Its taller display format gives documents and creative projects more vertical space than a conventional widescreen. Different panel and memory options exist, so use the listed configuration rather than assuming an optional upgrade is included.",
    source: "https://www.dell.com/en-us/shop/dell-laptops/new-inspiron-14-plus-laptop/spd/inspiron-14-7440-laptop/useichbto7440gnsf",
    note: "The precise screen resolution, processor suffix, and regional SKU need confirmation."
  },
  "part-ssd-kingston-kc600": {
    description: "The KC600 is an internal SATA SSD using 3D TLC flash and hardware-based encryption support. This listing is the 2.5-inch version for a compatible SATA bay, not the smaller mSATA model. Choose the capacity you need and check mounting space and available SATA connections before upgrading.",
    source: "https://www.kingston.com/en/ssd/kc600-sata-solid-state-drive"
  },
  "part-cpu-i5-14600k": {
    description: "The Core i5-14600K combines six performance cores and eight efficient cores for a total of 14 cores and 20 threads. This unlocked LGA1700 desktop processor includes Intel UHD Graphics 770. Use a compatible motherboard and suitable cooling; memory support and overclocking depend on the rest of the system.",
    source: "https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/specifications.html"
  },
  "part-gpu-rtx-4060": {
    description: "The RTX 4060 VENTUS 2X BLACK 8G combines 8GB of GDDR6 memory with MSI's dual-fan cooling design. It supports ray tracing and DLSS in compatible games, with HDMI and DisplayPort monitor outputs. The black VENTUS design is not an RGB-lit GAMING X model.",
    source: "https://www.msi.com/Graphics-Card/GeForce-RTX-4060-VENTUS-2X-BLACK-8G",
    specs: "8GB GDDR6, NVIDIA Ada Lovelace graphics, dual-fan cooling, HDMI and DisplayPort outputs"
  },
  "part-ram-32gb-ddr5": {
    description: "Kingston FURY Beast DDR5 provides desktop memory with a low-profile heatspreader for compatible DDR5 systems. Select the capacity and module arrangement that fit your workload and motherboard. It is not laptop SO-DIMM memory or a DDR4 replacement; rated speeds depend on the selected kit and platform settings.",
    source: "https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory"
  },
  "part-ssd-1tb-nvme": {
    description: "The Kingston NV3 is an internal PCIe 4.0 NVMe SSD in the M.2 2280 format. It offers a compact way to add storage for applications, games, and everyday files. Choose your capacity and confirm that the computer has a compatible NVMe slot; a SATA-only M.2 slot is not sufficient.",
    source: "https://www.kingston.com/en/ssd/nv3-nvme-pcie-ssd"
  },
  "part-cpu-ryzen-7-7700x": {
    description: "The Ryzen 7 7700X is an eight-core, 16-thread Zen 4 desktop processor for the AMD AM5 platform. It uses DDR5 memory and suits gaming, multitasking, and supported creative applications. A CPU cooler is not included, so plan a compatible cooling solution alongside your motherboard and case.",
    source: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html"
  },
  "part-board-gigabyte-b650": {
    description: "The B650 AORUS ELITE AX is an ATX motherboard for an AMD AM5 processor and DDR5 memory. M.2 storage slots and built-in wireless connectivity support a versatile desktop build. Board revisions can differ, so confirm the revision, CPU support list, and required BIOS before choosing other components.",
    source: "https://www.gigabyte.com/Motherboard/B650-AORUS-ELITE-AX-rev-10-11/Support"
  },
  "part-cooler-master-240": {
    description: "The MasterLiquid ML240L RGB is an all-in-one liquid CPU cooler with a 240mm radiator and RGB lighting. It moves heat from the CPU to a radiator mounted in your case. Check radiator clearance and the included socket brackets, especially for newer platforms; this is the original ML240L RGB, not the V2 model.",
    source: "https://legacy.coolermaster.com/en-global/products/masterliquid-ml240l-rgb/"
  },
  "part-corsair-psu-850": {
    description: "The Corsair RMe series uses fully modular cables so you can connect the leads your PC needs and keep unused cables out of the case. Choose a wattage suited to your complete system. Connector bundles and ATX standards vary by generation, so confirm the exact model year and never mix incompatible modular PSU cables.",
    source: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/corsair-rme-series-2025/",
    note: "The catalog does not specify an RMe model year. Confirm the generation and supplied GPU power connectors before ordering."
  },
  "part-kingston-fury-32": {
    description: "FURY Beast DDR5 is desktop memory for a compatible DDR5 platform, with a heatspreader designed to fit a wide range of builds. Choose the capacity and module layout shown for your selected option. Check the motherboard's memory support list; a profile's rated speed is not guaranteed on every processor and board combination.",
    source: "https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory"
  }
};
