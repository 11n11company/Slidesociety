// Slidescoiety Product Catalog & Configurator Data

export const categories = [
  'All',
  'Wheelbase',
  'Steering Wheel',
  'Pedals',
  'Cockpit',
  'Motion System',
  'Monitor Stand',
  'Seat',
  'Shifter',
  'Handbrake',
  'Monitor',
  'Sim PC',
  'Accessories'
];

export const RIG_SECTIONS = [
  {
    num: '01',
    id: 'wheelbase',
    title: 'Wheelbase',
    categories: ['Wheelbase', 'Wheel bases'],
    status: 'REQUIRED',
    hint: 'The motor that drives your wheel. More Nm = stronger, more detailed force feedback.',
    multi: false,
    hasSkip: false
  },
  {
    num: '02',
    id: 'steering-wheel',
    title: 'Steering Wheel',
    categories: ['Steering Wheel', 'Steering wheels', 'Rims'],
    status: 'PICK ONE OR MORE',
    hint: 'Pick one or more rims — GT for endurance, formula for open-wheel. We auto-add a matching quick release for every Conspit rim.',
    multi: true,
    hasSkip: false
  },
  {
    num: '03',
    id: 'pedals',
    title: 'Pedals',
    categories: ['Pedals'],
    status: 'REQUIRED',
    hint: 'Load cell = consistent braking. Hydraulic = maximum realism. Choose 2 or 3 pedals on the card.',
    multi: false,
    hasSkip: false
  },
  {
    num: '04',
    id: 'cockpit',
    title: 'Cockpit',
    categories: ['Cockpit', 'Cockpit frames'],
    status: 'REQUIRED',
    hint: 'Aluminium profile rigs — zero flex under direct drive load.',
    multi: false,
    hasSkip: false
  },
  {
    num: '05',
    id: 'motion-system',
    title: 'Motion System',
    categories: ['Motion System', 'Motion systems'],
    status: 'OPTIONAL',
    hint: 'Add real motion — feel pitch, roll and heave under braking, cornering and kerbs. Pairs with your cockpit for the closest thing to the real car.',
    multi: false,
    hasSkip: true
  },
  {
    num: '06',
    id: 'monitor-stand',
    title: 'Monitor Stand',
    categories: ['Monitor Stand', 'Monitor mounts'],
    status: 'OPTIONAL',
    hint: 'Standalone or integrated — pairs with your cockpit and screen setup.',
    multi: false,
    hasSkip: true
  },
  {
    num: '07',
    id: 'seat',
    title: 'Seat',
    categories: ['Seat', 'Racing seats'],
    status: 'OPTIONAL',
    hint: 'Skip if your cockpit choice already includes a seat.',
    multi: false,
    hasSkip: true
  },
  {
    num: '08',
    id: 'shifter',
    title: 'Shifter',
    categories: ['Shifter', 'Shifters'],
    status: 'OPTIONAL',
    hint: 'H-pattern or sequential — for manual, rally and historic racing.',
    multi: false,
    hasSkip: true
  },
  {
    num: '09',
    id: 'handbrake',
    title: 'Handbrake',
    categories: ['Handbrake', 'Handbrakes'],
    status: 'OPTIONAL',
    hint: 'Hydraulic or load cell — essential for rally and drift.',
    multi: false,
    hasSkip: true
  },
  {
    num: '10',
    id: 'monitor',
    title: 'Monitor',
    categories: ['Monitor', 'Monitors'],
    status: 'OPTIONAL',
    hint: 'Single ultrawide or triples — ask us about mounting.',
    multi: false,
    hasSkip: true
  },
  {
    num: '11',
    id: 'sim-pc',
    title: 'Sim PC',
    categories: ['Sim PC', 'Gaming PC'],
    status: 'OPTIONAL',
    hint: "Spec'd for triple-screen iRacing and ACC.",
    multi: false,
    hasSkip: true
  },
  {
    num: '12',
    id: 'accessories',
    title: 'Accessories',
    categories: ['Accessories', 'Keyboard trays', 'Cable-management kits'],
    status: 'OPTIONAL',
    hint: 'Pick as many as you need — mounts, trays, castor wheels and more.',
    multi: true,
    hasSkip: false
  }
];

export const QUICK_PRESETS = [
  {
    id: 'starter-gt',
    name: 'STARTER GT',
    desc: 'ClubSport DD 8Nm with GT3 Rim & Load Cell Pedals on GT Chassis',
    productIds: [
      'conspit-ares-apex-8nm-cdr-qr-nrg-style-direct-driv',
      'fanatec-csl-steering-wheel-gt3',
      'conspit-cpp-apex-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit'
    ]
  },
  {
    id: 'gt-pro',
    name: 'GT PRO',
    desc: 'High-Torque 12Nm Base with Pro Rim, Hydraulic Pedals & GT Rig',
    productIds: [
      'conspit-ares-12nm-cdr-qr-nrg-style-direct-drive-sim',
      'conspit-300gt',
      'conspit-cpp-lite-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit'
    ]
  },
  {
    id: 'formula',
    name: 'FORMULA',
    desc: '20Nm Direct Drive, Formula Rim & Formula Inverted Seating Position',
    productIds: [
      'conspit-ares-platinum-20nm-cdr-qr-nrg-style-direct',
      'conspit-290gp',
      'conspit-cpp-evo-v2-sim-racing-pedals',
      'conspit-fp-lite-formula-style-cockpit'
    ]
  },
  {
    id: 'rally',
    name: 'RALLY',
    desc: '12Nm DD with Round WRC Wheel, Load Cell, Dual Shifter & Rally Handbrake',
    productIds: [
      'conspit-ares-12nm-cdr-qr-nrg-style-direct-drive-sim',
      'conspit-h-oa-hub',
      'conspit-cpp-lite-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit',
      'vnm-sequential-h-pattern-shifter-dual-mode',
      'conspit-h3-hydraulic-hand-brake'
    ]
  }
];

// Master products catalogue baseline
export const products = [
  {
    "id": "conspit-ares-apex-8nm-cdr-qr-nrg-style-direct-dr",
    "name": "CONSPIT ARES APEX 8Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 49999,
    "priceInr": 49999,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC7700.png?v=1769018117&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-r9-v3",
    "name": "MOZA R9 V3",
    "category": "Wheelbase",
    "price": 53299,
    "priceInr": 53299,
    "imageUrl": "https://racesims.in/cdn/shop/files/r9_1.webp?v=1751281017&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-dd-wheelbase-5-nm-with-qr2-lite-amp-",
    "name": "Fanatec CSL DD Wheelbase (5 Nm) with QR2 Lite &amp; PSU",
    "category": "Wheelbase",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_DD_QR2L_90-01.png?v=1783693385&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-r12-v2",
    "name": "MOZA R12 V2",
    "category": "Wheelbase",
    "price": 69199,
    "priceInr": 69199,
    "imageUrl": "https://racesims.in/cdn/shop/files/R12_V2-1.webp?v=1783512108&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-ares-12nm-cdr-qr-nrg-style-direct-drive-",
    "name": "CONSPIT ARES 12Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 69499,
    "priceInr": 69499,
    "imageUrl": "https://racesims.in/cdn/shop/files/1758859357120.png?v=1759663253&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-premier-13-nm-sim-racing-wheelb",
    "name": "VNM Direct Drive Premier 13 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 75000,
    "priceInr": 75000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-ares-platinum-20nm-cdr-qr-nrg-style-dire",
    "name": "CONSPIT ARES Platinum 20Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 90000,
    "priceInr": 90000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1758856015197_1.png?v=1759662242&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-elite-18-nm-sim-racing-wheelbas",
    "name": "VNM Direct Drive Elite 18 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 95000,
    "priceInr": 95000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-gran-turismo-dd-pro-bundle-5-nm-wheel-pe",
    "name": "Fanatec Gran Turismo DD Pro Bundle (5 Nm) — Wheel, Pedals &amp; QR2",
    "category": "Wheelbase",
    "price": 114999,
    "priceInr": 114999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CRD-9020007_01B.png?v=1783693387&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-supreme-25-nm-sim-racing-wheelb",
    "name": "VNM Direct Drive Supreme 25 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 125000,
    "priceInr": 125000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6912-2048x1367.jpg?v=1767880174&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-dd-wheelbase-15-nm",
    "name": "Fanatec ClubSport DD+ Wheelbase (15 Nm)",
    "category": "Wheelbase",
    "price": 139999,
    "priceInr": 139999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_DD-P-01.png?v=1783693387&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-xtreme-32-nm-sim-racing-wheelba",
    "name": "VNM Direct Drive Xtreme 32 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "price": 159000,
    "priceInr": 159000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6878-2048x1367.jpg?v=1767880512&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Wheelbase engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-ks-steering-wheel",
    "name": "MOZA KS steering wheel",
    "category": "Steering Wheel",
    "price": 35699,
    "priceInr": 35699,
    "imageUrl": "https://racesims.in/cdn/shop/files/KS_Steering_Wheel-1_23c60008-75ed-4be7-8dfd-f0f6396b1696.webp?v=1783513105&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-steering-wheel-gt3",
    "name": "Fanatec CSL Steering Wheel GT3",
    "category": "Steering Wheel",
    "price": 37999,
    "priceInr": 37999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CRD-9020021-WW-01.png?v=1783693387&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-elite-steering-wheel-wrc-qr2-lite",
    "name": "Fanatec CSL Elite Steering Wheel WRC (QR2 Lite)",
    "category": "Steering Wheel",
    "price": 39999,
    "priceInr": 39999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_E_SW_WRC_PURE-01.png?v=1783693387&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-310-apex-racing-wheel",
    "name": "CONSPIT 310 APEX Racing Wheel",
    "category": "Steering Wheel",
    "price": 46499,
    "priceInr": 46499,
    "imageUrl": "https://racesims.in/cdn/shop/files/conspit-310-apex-racing-wheel-fully-featured-controller.png?v=1763526926&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-300gt",
    "name": "CONSPIT 300GT",
    "category": "Steering Wheel",
    "price": 54999,
    "priceInr": 54999,
    "imageUrl": "https://racesims.in/cdn/shop/files/conspit-300gt-sim-racing-wheel-detailed-controls.png?v=1763526934&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-300gt-champion-edition",
    "name": "CONSPIT 300GT Champion Edition",
    "category": "Steering Wheel",
    "price": 58999,
    "priceInr": 58999,
    "imageUrl": "https://racesims.in/cdn/shop/files/1783569131042.webp?v=1793299779&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-gt-steering-wheel-v1",
    "name": "VNM GT Steering Wheel V1",
    "category": "Steering Wheel",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6618-2048x1367.jpg?v=1767878950&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-h-oa-hub",
    "name": "CONSPIT H.OA Hub",
    "category": "Steering Wheel",
    "price": 62500,
    "priceInr": 62500,
    "imageUrl": "https://racesims.in/cdn/shop/files/774d43bbf7c8f35d756d315e9195fd4.jpg?v=1746551829&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-steering-wheel-formula-v2-5x-q",
    "name": "Fanatec ClubSport Steering Wheel Formula V2.5X (QR2)",
    "category": "Steering Wheel",
    "price": 66999,
    "priceInr": 66999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_SWFORM_V25X-01.png?v=1783693415&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-290gp",
    "name": "CONSPIT 290GP",
    "category": "Steering Wheel",
    "price": 79000,
    "priceInr": 79000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1751000577919.png?v=1753615227&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-max-01",
    "name": "CONSPIT MAX-01",
    "category": "Steering Wheel",
    "price": 89500,
    "priceInr": 89500,
    "imageUrl": "https://racesims.in/cdn/shop/files/1751001390576.png?v=1753615276&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-pw-1",
    "name": "CONSPIT PW-1",
    "category": "Steering Wheel",
    "price": 210000,
    "priceInr": 210000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1750997854344.png?v=1759664061&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Steering Wheel engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-apex-pedals-sim-racing-pedals",
    "name": "CONSPIT CPP Apex Pedals sim racing pedals",
    "category": "Pedals",
    "price": 38000,
    "priceInr": 38000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1757999961966.png?v=1767876838&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-lite-pedal",
    "name": "VNM Lite Pedal",
    "category": "Pedals",
    "price": 42000,
    "priceInr": 42000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_5528-2048x1367.png?v=1767881377&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-elite-pedals-v2-load-cell",
    "name": "Fanatec CSL Elite Pedals V2 (Load Cell)",
    "category": "Pedals",
    "price": 54999,
    "priceInr": 54999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_EP_V2-01.png?v=1783693414&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-v1-pedal",
    "name": "VNM V1 Pedal",
    "category": "Pedals",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_5547-1000x673.jpg?v=1781000917&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-pedals-v3",
    "name": "Fanatec ClubSport Pedals V3",
    "category": "Pedals",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSP_V3-01.png?v=1783693416&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-lite-pedals-sim-racing-pedals",
    "name": "CONSPIT CPP Lite Pedals sim racing pedals",
    "category": "Pedals",
    "price": 67499,
    "priceInr": 67499,
    "imageUrl": "https://racesims.in/cdn/shop/files/20240129-182321.png?v=1746147286&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-evo-v2-sim-racing-pedals",
    "name": "CONSPIT CPP EVO V2 sim racing pedals",
    "category": "Pedals",
    "price": 89999,
    "priceInr": 89999,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC8489.png?v=1767878304&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Pedals engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-gt-sim-cockpit",
    "name": "RaceSims GT Sim Cockpit",
    "category": "Cockpit",
    "price": 38500,
    "priceInr": 38500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.27.05_AM.png?v=1752717607&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Cockpit engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-fp-lite-formula-style-cockpit",
    "name": "CONSPIT FP-Lite Formula Style cockpit",
    "category": "Cockpit",
    "price": 115000,
    "priceInr": 115000,
    "imageUrl": "https://racesims.in/cdn/shop/files/fplite.487.png?v=1753612512&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Cockpit engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-gt-b-kids-cockpit",
    "name": "CONSPIT GT-B Kids cockpit",
    "category": "Cockpit",
    "price": 65000,
    "priceInr": 65000,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC3756.jpg?v=1778327287&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Cockpit engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-fc-formula-cockpit",
    "name": "CONSPIT FC Formula cockpit",
    "category": "Cockpit",
    "price": 1050000,
    "priceInr": 1050000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1750822342124.png?v=1753613702&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Cockpit engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-gt-cockpit-complete-with-seat",
    "name": "Fanatec ClubSport GT Cockpit — Complete with Seat",
    "category": "Cockpit",
    "price": 188497,
    "priceInr": 188497,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_GT_C_BLK-02.png?v=1783693760&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Cockpit engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-3-dof-motion-kit-with-4-linear-actuator-150",
    "name": "VNM 3 Dof motion kit with 4 linear actuator 150",
    "category": "Motion System",
    "price": 600000,
    "priceInr": 600000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnm12-2048x1638.jpg?v=1766776830&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Motion System engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-single-screen-stand-for-sim-rig",
    "name": "Standalone Single screen stand for sim rig",
    "category": "Monitor Stand",
    "price": 12000,
    "priceInr": 12000,
    "imageUrl": "https://racesims.in/cdn/shop/files/single_monitor_stand.webp?v=1771611367&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor Stand engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-triple-screen-stand-for-sim-rig",
    "name": "Standalone Triple screen stand for sim rig",
    "category": "Monitor Stand",
    "price": 20500,
    "priceInr": 20500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor Stand engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-triple-screen-stand-with-precision-al",
    "name": "Standalone Triple screen stand with Precision Alignment mount for sim rig",
    "category": "Monitor Stand",
    "price": 30500,
    "priceInr": 30500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor Stand engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "integrated-single-screen-stand-for-sim-rig",
    "name": "Integrated Single Screen Stand for Sim Rig",
    "category": "Monitor Stand",
    "price": 8000,
    "priceInr": 8000,
    "imageUrl": "https://racesims.in/cdn/shop/files/Intergraded-Single-screen-stand-for-sim-rig.jpg?v=1743646336&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Monitor Stand engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-sim-racing-bucket-seats",
    "name": "RaceSims Pro Sim Racing Bucket Seats",
    "category": "Seat",
    "price": 15000,
    "priceInr": 15000,
    "imageUrl": "https://racesims.in/cdn/shop/files/pro-sim-racing-bucket-seats-black-red-white-striped.jpg?v=1745893599&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Seat engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-premium-recliner-seats",
    "name": "RaceSims Premium Recliner Seats",
    "category": "Seat",
    "price": 32500,
    "priceInr": 32500,
    "imageUrl": "https://racesims.in/cdn/shop/files/premiumreclinerv1main.png?v=1778326689&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Seat engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-fixed-back-bucket-seats-motorsport-",
    "name": "RaceSims Pro Fixed Back Bucket Seats (Motorsport Grade)",
    "category": "Seat",
    "price": 39500,
    "priceInr": 39500,
    "imageUrl": "https://racesims.in/cdn/shop/files/fixed_back_main.png?v=1778326824&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Seat engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-sport-recliner-seats",
    "name": "RaceSims Sport Recliner Seats",
    "category": "Seat",
    "price": 39500,
    "priceInr": 39500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Sports_recliner_main.png?v=1778326749&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Seat engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-x-large-fixed-back-bucket-seats-mot",
    "name": "RaceSims Pro X-Large Fixed Back Bucket Seats (Motorsport Grade)",
    "category": "Seat",
    "price": 45500,
    "priceInr": 45500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Fixed_back_xl_main.png?v=1778326909&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Seat engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-hgp-shifter",
    "name": "MOZA HGP Shifter",
    "category": "Shifter",
    "price": 18699,
    "priceInr": 18699,
    "imageUrl": "https://racesims.in/cdn/shop/files/MOZA-HGP-Shifter-2.webp?v=1750845988&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Shifter engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-sgp-sequential-shifter",
    "name": "MOZA SGP Sequential Shifter",
    "category": "Shifter",
    "price": 16099,
    "priceInr": 16099,
    "imageUrl": "https://racesims.in/cdn/shop/files/MOZA-SGP-Sequential-Shifter-1.jpg?v=1750846284&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Shifter engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-sequential-h-pattern-shifter-dual-mode",
    "name": "VNM Sequential / H-Pattern Shifter (Dual Mode)",
    "category": "Shifter",
    "price": 35000,
    "priceInr": 35000,
    "imageUrl": "https://racesims.in/cdn/shop/files/9_eeec3f26-8264-4c15-aad2-109058b89d6e.jpg?v=1759670594&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Shifter engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-1-5-rally-handbrake",
    "name": "VNM 1.5 Rally Handbrake",
    "category": "Handbrake",
    "price": 35000,
    "priceInr": 35000,
    "imageUrl": "https://racesims.in/cdn/shop/files/5-3.jpg?v=1759670267&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Handbrake engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-h3-hydraulic-hand-brake",
    "name": "CONSPIT H3 Hydraulic Hand Brake",
    "category": "Handbrake",
    "price": 35500,
    "priceInr": 35500,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC9720.png?v=1746151636&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Handbrake engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "samsung-g5-32-quot-165hz-1440p-curved-monitor",
    "name": "Samsung G5 (32&quot; 165Hz 1440p Curved monitor)",
    "category": "Monitor",
    "price": 22500,
    "priceInr": 22500,
    "imageUrl": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-g34wqc-34-quot-widescreen-2k-curved-mon",
    "name": "GIGABYTE G34WQC (34&quot; widescreen 2K Curved monitor)",
    "category": "Monitor",
    "price": 34500,
    "priceInr": 34500,
    "imageUrl": "https://racesims.in/cdn/shop/files/61mzM7JeQ2L._SL1000.jpg?v=1746153392&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "triple-27-quot-gigabyte-gs27f-27-quot-165hz-1080",
    "name": "Triple 27&quot; GIGABYTE GS27F (27&quot; 165hz 1080P Flat monitor)",
    "category": "Monitor",
    "price": 37500,
    "priceInr": 37500,
    "imageUrl": "https://racesims.in/cdn/shop/files/51E5HHGeM4L._SL1000.jpg?v=1746153070&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "triple-32-quot-samsung-g5-32-quot-165hz-1440p-cu",
    "name": "Triple 32&quot; Samsung G5 (32&quot; 165Hz 1440p Curved monitor)",
    "category": "Monitor",
    "price": 67500,
    "priceInr": 67500,
    "imageUrl": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-co49dq-49-quot-ultra-widescreen-144hz-o",
    "name": "GIGABYTE CO49DQ (49&quot; Ultra Widescreen, 144Hz OLED, Curved Monitor)",
    "category": "Monitor",
    "price": 134500,
    "priceInr": 134500,
    "imageUrl": "https://racesims.in/cdn/shop/files/AORUS_CO49DQ_Gaming_Monitor-01.png?v=1746153667&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Monitor engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-spec-sim-pc",
    "name": "RaceSims SPEC SIM PC",
    "category": "Sim PC",
    "price": 210000,
    "priceInr": 210000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Sim PC engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-core-spec-sim-pc",
    "name": "RaceSims CORE-SPEC SIM PC",
    "category": "Sim PC",
    "price": 260000,
    "priceInr": 260000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Sim PC engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-spec-sim-pc",
    "name": "RaceSims PRO-SPEC SIM PC",
    "category": "Sim PC",
    "price": 320000,
    "priceInr": 320000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Sim PC engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-brake-performance-kit-for-sr-p-lite",
    "name": "Moza Brake Performance Kit for SR-P Lite",
    "category": "Accessories",
    "price": 4099,
    "priceInr": 4099,
    "imageUrl": "https://racesims.in/cdn/shop/files/PerformanceKitforSR-PLite-3.webp?v=1783512647&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-sr-p-lite-pedal-clutch-for-r5-amp-r3-bundle",
    "name": "Moza SR-P Lite Pedal - Clutch (for R5&amp; R3 bundle)",
    "category": "Accessories",
    "price": 5499,
    "priceInr": 5499,
    "imageUrl": "https://racesims.in/cdn/shop/files/SR-P_Lite_Clutch_Pedal-1.webp?v=1783512523&amp;width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "keyboard-tray-for-sim-rig",
    "name": "Keyboard tray for sim rig",
    "category": "Accessories",
    "price": 7500,
    "priceInr": 7500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Keyboard-tray-for-sim-rig.jpg?v=1743646340&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-integrated-pc-stand-for-sim-rig",
    "name": "RaceSims Integrated PC Stand for Sim Rig",
    "category": "Accessories",
    "price": 5000,
    "priceInr": 5000,
    "imageUrl": "https://racesims.in/cdn/shop/files/simlab-integrated-pc-stand-for-sim-rig-black-steel-shelf-angled-mount-brackets.webp?v=1756349982&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "hd-leveling-castor-wheels-for-sim-rig",
    "name": "HD Leveling Castor wheels for sim rig",
    "category": "Accessories",
    "price": 5000,
    "priceInr": 5000,
    "imageUrl": "https://racesims.in/cdn/shop/files/HD-Leveling-Castor-wheels-for-sim-rig.jpg?v=1743646334&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "handbrake-amp-shifter-mount-for-sim-rig",
    "name": "Handbrake &amp; shifter mount for sim rig",
    "category": "Accessories",
    "price": 4000,
    "priceInr": 4000,
    "imageUrl": "https://racesims.in/cdn/shop/files/Handbrake-shifter-mount-for-sim-rig.webp?v=1743646402&amp;width=360",
    "isAvailable": true,
    "stockQuantity": 25,
    "specDescription": "Accessories engineered for ultra-rigid direct drive sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  }
];

export const stages = RIG_SECTIONS.map(s => ({
  name: s.title,
  category: s.title,
  categories: s.categories,
  help: s.hint,
  multi: s.multi,
  hasSkip: s.hasSkip
}));

export const gallery = [];

export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Dynamic in-memory live catalog initialized with baseline products
export const liveProductMap = new Map();

products.forEach((p) => {
  liveProductMap.set(p.id, { ...p });
});

/**
 * Hydrates or batch updates the live product catalog from database response.
 */
export function setLiveProducts(list) {
  if (!Array.isArray(list)) return;
  list.forEach((item) => {
    if (!item || !item.id) return;
    const existing = liveProductMap.get(item.id) || {};
    const priceNum = typeof item.priceInr === 'number'
      ? item.priceInr
      : (!isNaN(Number(item.priceInr)) ? Number(item.priceInr) : (typeof item.price === 'number' ? item.price : existing.price || 0));

    liveProductMap.set(item.id, {
      ...existing,
      ...item,
      image: item.imageUrl || item.image || existing.image || '/hero-backdrop-hd.jpg',
      imageUrl: item.imageUrl || item.image || existing.imageUrl || '/hero-backdrop-hd.jpg',
      price: priceNum,
      priceInr: priceNum,
      cat: item.category || item.cat || existing.cat || 'General',
      category: item.category || item.cat || existing.category || 'General',
      spec: item.specDescription || item.spec || existing.spec || '',
      specDescription: item.specDescription || item.spec || existing.specDescription || ''
    });
  });
}

/**
 * Synchronizes a single updated or newly created product into the live catalog.
 */
export function updateSingleLiveProduct(item) {
  if (!item || !item.id) return null;
  const existing = liveProductMap.get(item.id) || {};
  const priceNum = typeof item.priceInr === 'number'
    ? item.priceInr
    : (!isNaN(Number(item.priceInr)) ? Number(item.priceInr) : (typeof item.price === 'number' ? item.price : existing.price || 0));

  const updated = {
    ...existing,
    ...item,
    image: item.imageUrl || item.image || existing.image || '/hero-backdrop-hd.jpg',
    imageUrl: item.imageUrl || item.image || existing.imageUrl || '/hero-backdrop-hd.jpg',
    price: priceNum,
    priceInr: priceNum,
    cat: item.category || item.cat || existing.cat || 'General',
    category: item.category || item.cat || existing.category || 'General',
    spec: item.specDescription || item.spec || existing.spec || '',
    specDescription: item.specDescription || item.spec || existing.specDescription || ''
  };

  liveProductMap.set(item.id, updated);
  return updated;
}

/**
 * Returns all current live products as an array.
 */
export function getAllLiveProducts() {
  return Array.from(liveProductMap.values());
}

/**
 * Resolves a product by ID, checking the live dynamic registry first.
 */
export const byId = (id) => {
  if (!id) return null;
  return liveProductMap.get(id) || products.find((p) => p.id === id) || null;
};
