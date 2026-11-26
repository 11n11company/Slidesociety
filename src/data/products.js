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
      'conspit-ares-12nm-holding-torque-direct-drive-sim-',
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
      'conspit-ares-platinum-20nm-holding-torque-direct-d',
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
      'conspit-ares-12nm-holding-torque-direct-drive-sim-',
      'conspit-h-oa-hub',
      'conspit-cpp-lite-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit',
      'vnm-sequential-h-pattern-shifter-dual-mode',
      'conspit-h3-hydraulic-hand-brake'
    ]
  }
];

// Master products catalogue baseline (100% synchronized with PostgreSQL database)
export const products = [
  {
    "id": "conspit-ares-apex-8nm-cdr-qr-nrg-style-direct-driv",
    "name": "CONSPIT ARES APEX 8Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 49999,
    "priceInr": 49999,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC7700.png?v=1769018117&width=360",
    "image": "https://racesims.in/cdn/shop/files/DSC7700.png?v=1769018117&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-r9-v3",
    "name": "MOZA R9 V3",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 53299,
    "priceInr": 53299,
    "imageUrl": "https://racesims.in/cdn/shop/files/r9_1.webp?v=1751281017&width=360",
    "image": "https://racesims.in/cdn/shop/files/r9_1.webp?v=1751281017&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-dd-wheelbase-5-nm-with-qr2-lite-psu",
    "name": "Fanatec CSL DD Wheelbase (5 Nm) with QR2 Lite & PSU",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_DD_QR2L_90-01.png?v=1783693385&width=360",
    "image": "https://racesims.in/cdn/shop/files/CSL_DD_QR2L_90-01.png?v=1783693385&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-r12-v2",
    "name": "MOZA R12 V2",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 69199,
    "priceInr": 69199,
    "imageUrl": "https://racesims.in/cdn/shop/files/R12_V2-1.webp?v=1783512108&width=360",
    "image": "https://racesims.in/cdn/shop/files/R12_V2-1.webp?v=1783512108&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-ares-12nm-holding-torque-direct-drive-sim-",
    "name": "CONSPIT ARES 12Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 69499,
    "priceInr": 69499,
    "imageUrl": "https://racesims.in/cdn/shop/files/1758859357120.png?v=1759663253&width=360",
    "image": "https://racesims.in/cdn/shop/files/1758859357120.png?v=1759663253&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-premier-13-nm-sim-racing-wheelbas",
    "name": "VNM Direct Drive Premier 13 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 75000,
    "priceInr": 75000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&width=360",
    "image": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-ares-platinum-20nm-holding-torque-direct-d",
    "name": "CONSPIT ARES Platinum 20Nm CDR QR (NRG Style) Direct Drive Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 90000,
    "priceInr": 90000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1758856015197_1.png?v=1759662242&width=360",
    "image": "https://racesims.in/cdn/shop/files/1758856015197_1.png?v=1759662242&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-elite-18-nm-sim-racing-wheelbase",
    "name": "VNM Direct Drive Elite 18 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 95000,
    "priceInr": 95000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&width=360",
    "image": "https://racesims.in/cdn/shop/files/vnmPremier13nmsideview.jpg?v=1767854581&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-gran-turismo-dd-pro-bundle-5-nm-wheel-peda",
    "name": "Fanatec Gran Turismo DD Pro Bundle (5 Nm) — Wheel, Pedals & QR2",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 114999,
    "priceInr": 114999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CRD-9020007_01B.png?v=1783693387&width=360",
    "image": "https://racesims.in/cdn/shop/files/CRD-9020007_01B.png?v=1783693387&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-supreme-25-nm-sim-racing-wheelbas",
    "name": "VNM Direct Drive Supreme 25 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 125000,
    "priceInr": 125000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6912-2048x1367.jpg?v=1767880174&width=360",
    "image": "https://racesims.in/cdn/shop/files/750_6912-2048x1367.jpg?v=1767880174&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-dd-wheelbase-15-nm",
    "name": "Fanatec ClubSport DD+ Wheelbase (15 Nm)",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 139999,
    "priceInr": 139999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_DD-P-01.png?v=1783693387&width=360",
    "image": "https://racesims.in/cdn/shop/files/CS_DD-P-01.png?v=1783693387&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-direct-drive-xtream-32-nm-sim-racing-wheelbase",
    "name": "VNM Direct Drive Xtreme 32 Nm Sim Racing Wheelbase",
    "category": "Wheelbase",
    "cat": "Wheelbase",
    "price": 159000,
    "priceInr": 159000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6878-2048x1367.jpg?v=1767880512&width=360",
    "image": "https://racesims.in/cdn/shop/files/750_6878-2048x1367.jpg?v=1767880512&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "spec": "Wheelbase engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-ks-steering-wheel",
    "name": "MOZA KS steering wheel",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 35699,
    "priceInr": 35699,
    "imageUrl": "https://racesims.in/cdn/shop/files/KS_Steering_Wheel-1_23c60008-75ed-4be7-8dfd-f0f6396b1696.webp?v=1783513105&width=360",
    "image": "https://racesims.in/cdn/shop/files/KS_Steering_Wheel-1_23c60008-75ed-4be7-8dfd-f0f6396b1696.webp?v=1783513105&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-steering-wheel-gt3",
    "name": "Fanatec CSL Steering Wheel GT3",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 37999,
    "priceInr": 37999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CRD-9020021-WW-01.png?v=1783693387&width=360",
    "image": "https://racesims.in/cdn/shop/files/CRD-9020021-WW-01.png?v=1783693387&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-elite-steering-wheel-wrc-qr2-lite",
    "name": "Fanatec CSL Elite Steering Wheel WRC (QR2 Lite)",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 39999,
    "priceInr": 39999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_E_SW_WRC_PURE-01.png?v=1783693387&width=360",
    "image": "https://racesims.in/cdn/shop/files/CSL_E_SW_WRC_PURE-01.png?v=1783693387&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-310-apex-racing-wheel",
    "name": "CONSPIT 310 APEX Racing Wheel",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 46499,
    "priceInr": 46499,
    "imageUrl": "https://racesims.in/cdn/shop/files/conspit-310-apex-racing-wheel-fully-featured-controller.png?v=1763526926&width=360",
    "image": "https://racesims.in/cdn/shop/files/conspit-310-apex-racing-wheel-fully-featured-controller.png?v=1763526926&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-300gt-sim-racing-wheel",
    "name": "CONSPIT 300GT",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 54999,
    "priceInr": 54999,
    "imageUrl": "https://racesims.in/cdn/shop/files/conspit-300gt-sim-racing-wheel-detailed-controls.png?v=1763526934&width=360",
    "image": "https://racesims.in/cdn/shop/files/conspit-300gt-sim-racing-wheel-detailed-controls.png?v=1763526934&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-300gt-champion-edition",
    "name": "CONSPIT 300GT Champion Edition",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 58999,
    "priceInr": 58999,
    "imageUrl": "https://racesims.in/cdn/shop/files/1783569131042.webp?v=1793299779&width=360",
    "image": "https://racesims.in/cdn/shop/files/1783569131042.webp?v=1793299779&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-gt-steering-wheel-v1",
    "name": "VNM GT Steering Wheel V1",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_6618-2048x1367.jpg?v=1767878950&width=360",
    "image": "https://racesims.in/cdn/shop/files/750_6618-2048x1367.jpg?v=1767878950&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-h-o-a-hub",
    "name": "CONSPIT H.OA Hub",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 62500,
    "priceInr": 62500,
    "imageUrl": "https://racesims.in/cdn/shop/files/774d43bbf7c8f35d756d315e9195fd4.jpg?v=1746551829&width=360",
    "image": "https://racesims.in/cdn/shop/files/774d43bbf7c8f35d756d315e9195fd4.jpg?v=1746551829&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-steering-wheel-formula-v2-5x-qr2",
    "name": "Fanatec ClubSport Steering Wheel Formula V2.5X (QR2)",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 66999,
    "priceInr": 66999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_SWFORM_V25X-01.png?v=1783693415&width=360",
    "image": "https://racesims.in/cdn/shop/files/CS_SWFORM_V25X-01.png?v=1783693415&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-290gp",
    "name": "CONSPIT 290GP",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 79000,
    "priceInr": 79000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1751000577919.png?v=1753615227&width=360",
    "image": "https://racesims.in/cdn/shop/files/1751000577919.png?v=1753615227&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-max-01",
    "name": "CONSPIT MAX-01",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 89500,
    "priceInr": 89500,
    "imageUrl": "https://racesims.in/cdn/shop/files/1751001390576.png?v=1753615276&width=360",
    "image": "https://racesims.in/cdn/shop/files/1751001390576.png?v=1753615276&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-pw-1",
    "name": "CONSPIT PW-1",
    "category": "Steering Wheel",
    "cat": "Steering Wheel",
    "price": 210000,
    "priceInr": 210000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1750997854344.png?v=1759664061&width=360",
    "image": "https://racesims.in/cdn/shop/files/1750997854344.png?v=1759664061&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "spec": "Steering Wheel engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-apex-pedals-sim-racing-pedals",
    "name": "CONSPIT CPP Apex Pedals sim racing pedals",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 38000,
    "priceInr": 38000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1757999961966.png?v=1767876838&width=360",
    "image": "https://racesims.in/cdn/shop/files/1757999961966.png?v=1767876838&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-lite-2-pedal",
    "name": "VNM Lite Pedal",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 42000,
    "priceInr": 42000,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_5528-2048x1367.png?v=1767881377&width=360",
    "image": "https://racesims.in/cdn/shop/files/750_5528-2048x1367.png?v=1767881377&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-csl-elite-pedals-v2-load-cell",
    "name": "Fanatec CSL Elite Pedals V2 (Load Cell)",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 54999,
    "priceInr": 54999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSL_EP_V2-01.png?v=1783693414&width=360",
    "image": "https://racesims.in/cdn/shop/files/CSL_EP_V2-01.png?v=1783693414&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-v1-pedal",
    "name": "VNM V1 Pedal",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/750_5547-1000x673.jpg?v=1781000917&width=360",
    "image": "https://racesims.in/cdn/shop/files/750_5547-1000x673.jpg?v=1781000917&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-pedals-v3",
    "name": "Fanatec ClubSport Pedals V3",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 59999,
    "priceInr": 59999,
    "imageUrl": "https://racesims.in/cdn/shop/files/CSP_V3-01.png?v=1783693416&width=360",
    "image": "https://racesims.in/cdn/shop/files/CSP_V3-01.png?v=1783693416&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-lite-pedals",
    "name": "CONSPIT CPP Lite Pedals sim racing pedals",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 67499,
    "priceInr": 67499,
    "imageUrl": "https://racesims.in/cdn/shop/files/20240129-182321.png?v=1746147286&width=360",
    "image": "https://racesims.in/cdn/shop/files/20240129-182321.png?v=1746147286&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-cpp-evo-v2",
    "name": "CONSPIT CPP EVO V2 sim racing pedals",
    "category": "Pedals",
    "cat": "Pedals",
    "price": 89999,
    "priceInr": 89999,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC8489.png?v=1767878304&width=360",
    "image": "https://racesims.in/cdn/shop/files/DSC8489.png?v=1767878304&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Pedals engineered for ultra-rigid professional sim racing.",
    "spec": "Pedals engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gt-sim-cockpit",
    "name": "RaceSims GT Sim Cockpit",
    "category": "Cockpit",
    "cat": "Cockpit",
    "price": 38500,
    "priceInr": 38500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.27.05_AM.png?v=1752717607&width=360",
    "image": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.27.05_AM.png?v=1752717607&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Cockpit engineered for ultra-rigid professional sim racing.",
    "spec": "Cockpit engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-fp-lite-formula-style-cockpit",
    "name": "CONSPIT FP-Lite Formula Style cockpit",
    "category": "Cockpit",
    "cat": "Cockpit",
    "price": 115000,
    "priceInr": 115000,
    "imageUrl": "https://racesims.in/cdn/shop/files/fplite.487.png?v=1753612512&width=360",
    "image": "https://racesims.in/cdn/shop/files/fplite.487.png?v=1753612512&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Cockpit engineered for ultra-rigid professional sim racing.",
    "spec": "Cockpit engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-gt-b-kids-cockpit",
    "name": "CONSPIT GT-B Kids cockpit",
    "category": "Cockpit",
    "cat": "Cockpit",
    "price": 65000,
    "priceInr": 65000,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC3756.jpg?v=1778327287&width=360",
    "image": "https://racesims.in/cdn/shop/files/DSC3756.jpg?v=1778327287&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Cockpit engineered for ultra-rigid professional sim racing.",
    "spec": "Cockpit engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-fc-formula-cockpit",
    "name": "CONSPIT FC Formula cockpit",
    "category": "Cockpit",
    "cat": "Cockpit",
    "price": 1050000,
    "priceInr": 1050000,
    "imageUrl": "https://racesims.in/cdn/shop/files/1750822342124.png?v=1753613702&width=360",
    "image": "https://racesims.in/cdn/shop/files/1750822342124.png?v=1753613702&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Cockpit engineered for ultra-rigid professional sim racing.",
    "spec": "Cockpit engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "fanatec-clubsport-gt-cockpit-complete-with-seat",
    "name": "Fanatec ClubSport GT Cockpit — Complete with Seat",
    "category": "Cockpit",
    "cat": "Cockpit",
    "price": 188497,
    "priceInr": 188497,
    "imageUrl": "https://racesims.in/cdn/shop/files/CS_GT_C_BLK-02.png?v=1783693760&width=360",
    "image": "https://racesims.in/cdn/shop/files/CS_GT_C_BLK-02.png?v=1783693760&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Cockpit engineered for ultra-rigid professional sim racing.",
    "spec": "Cockpit engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-3-dof-motion-kit-with-4-linear-actuator-150",
    "name": "VNM 3 Dof motion kit with 4 linear actuator 150",
    "category": "Motion System",
    "cat": "Motion System",
    "price": 600000,
    "priceInr": 600000,
    "imageUrl": "https://racesims.in/cdn/shop/files/vnm12-2048x1638.jpg?v=1766776830&width=360",
    "image": "https://racesims.in/cdn/shop/files/vnm12-2048x1638.jpg?v=1766776830&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Motion System engineered for ultra-rigid professional sim racing.",
    "spec": "Motion System engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-single-screen-stand-for-sim-rig",
    "name": "Standalone Single screen stand for sim rig",
    "category": "Monitor Stand",
    "cat": "Monitor Stand",
    "price": 12000,
    "priceInr": 12000,
    "imageUrl": "https://racesims.in/cdn/shop/files/single_monitor_stand.webp?v=1771611367&width=360",
    "image": "https://racesims.in/cdn/shop/files/single_monitor_stand.webp?v=1771611367&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-triple-screen",
    "name": "Standalone Triple screen stand for sim rig",
    "category": "Monitor Stand",
    "cat": "Monitor Stand",
    "price": 20500,
    "priceInr": 20500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&width=360",
    "image": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "standalone-triple-screen-stand-with-precision-alig",
    "name": "Standalone Triple screen stand with Precision Alignment mount for sim rig",
    "category": "Monitor Stand",
    "cat": "Monitor Stand",
    "price": 30500,
    "priceInr": 30500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&width=360",
    "image": "https://racesims.in/cdn/shop/files/Screenshot_2025-07-17_at_7.28.15_AM.png?v=1752717691&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "intergraded-single-screen",
    "name": "Integrated Single Screen Stand for Sim Rig",
    "category": "Monitor Stand",
    "cat": "Monitor Stand",
    "price": 8000,
    "priceInr": 8000,
    "imageUrl": "https://racesims.in/cdn/shop/files/Intergraded-Single-screen-stand-for-sim-rig.jpg?v=1743646336&width=360",
    "image": "https://racesims.in/cdn/shop/files/Intergraded-Single-screen-stand-for-sim-rig.jpg?v=1743646336&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor Stand engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "pro-sim-racing-bucket-seats",
    "name": "RaceSims Pro Sim Racing Bucket Seats",
    "category": "Seat",
    "cat": "Seat",
    "price": 15000,
    "priceInr": 15000,
    "imageUrl": "https://racesims.in/cdn/shop/files/pro-sim-racing-bucket-seats-black-red-white-striped.jpg?v=1745893599&width=360",
    "image": "https://racesims.in/cdn/shop/files/pro-sim-racing-bucket-seats-black-red-white-striped.jpg?v=1745893599&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Seat engineered for ultra-rigid professional sim racing.",
    "spec": "Seat engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-premium-recliner-v1-seats-copy",
    "name": "RaceSims Premium Recliner Seats",
    "category": "Seat",
    "cat": "Seat",
    "price": 32500,
    "priceInr": 32500,
    "imageUrl": "https://racesims.in/cdn/shop/files/premiumreclinerv1main.png?v=1778326689&width=360",
    "image": "https://racesims.in/cdn/shop/files/premiumreclinerv1main.png?v=1778326689&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Seat engineered for ultra-rigid professional sim racing.",
    "spec": "Seat engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-fixed-back-sim-racing-bucket-seats-mo",
    "name": "RaceSims Pro Fixed Back Bucket Seats (Motorsport Grade)",
    "category": "Seat",
    "cat": "Seat",
    "price": 39500,
    "priceInr": 39500,
    "imageUrl": "https://racesims.in/cdn/shop/files/fixed_back_main.png?v=1778326824&width=360",
    "image": "https://racesims.in/cdn/shop/files/fixed_back_main.png?v=1778326824&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Seat engineered for ultra-rigid professional sim racing.",
    "spec": "Seat engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-sport-recliner-seats",
    "name": "RaceSims Sport Recliner Seats",
    "category": "Seat",
    "cat": "Seat",
    "price": 39500,
    "priceInr": 39500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Sports_recliner_main.png?v=1778326749&width=360",
    "image": "https://racesims.in/cdn/shop/files/Sports_recliner_main.png?v=1778326749&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Seat engineered for ultra-rigid professional sim racing.",
    "spec": "Seat engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "racesims-pro-x-large-fixed-back-sim-racing-bucket-",
    "name": "RaceSims Pro X-Large Fixed Back Bucket Seats (Motorsport Grade)",
    "category": "Seat",
    "cat": "Seat",
    "price": 45500,
    "priceInr": 45500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Fixed_back_xl_main.png?v=1778326909&width=360",
    "image": "https://racesims.in/cdn/shop/files/Fixed_back_xl_main.png?v=1778326909&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Seat engineered for ultra-rigid professional sim racing.",
    "spec": "Seat engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-hgp-shifter",
    "name": "MOZA HGP Shifter",
    "category": "Shifter",
    "cat": "Shifter",
    "price": 18699,
    "priceInr": 18699,
    "imageUrl": "https://racesims.in/cdn/shop/files/MOZA-HGP-Shifter-2.webp?v=1750845988&width=360",
    "image": "https://racesims.in/cdn/shop/files/MOZA-HGP-Shifter-2.webp?v=1750845988&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Shifter engineered for ultra-rigid professional sim racing.",
    "spec": "Shifter engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-sgp-sequential-shifter",
    "name": "MOZA SGP Sequential Shifter",
    "category": "Shifter",
    "cat": "Shifter",
    "price": 16099,
    "priceInr": 16099,
    "imageUrl": "https://racesims.in/cdn/shop/files/MOZA-SGP-Sequential-Shifter-1.jpg?v=1750846284&width=360",
    "image": "https://racesims.in/cdn/shop/files/MOZA-SGP-Sequential-Shifter-1.jpg?v=1750846284&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Shifter engineered for ultra-rigid professional sim racing.",
    "spec": "Shifter engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-sequential-h-pattern-shifter",
    "name": "VNM Sequential / H-Pattern Shifter (Dual Mode)",
    "category": "Shifter",
    "cat": "Shifter",
    "price": 35000,
    "priceInr": 35000,
    "imageUrl": "https://racesims.in/cdn/shop/files/9_eeec3f26-8264-4c15-aad2-109058b89d6e.jpg?v=1759670594&width=360",
    "image": "https://racesims.in/cdn/shop/files/9_eeec3f26-8264-4c15-aad2-109058b89d6e.jpg?v=1759670594&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Shifter engineered for ultra-rigid professional sim racing.",
    "spec": "Shifter engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "vnm-1-5-rally-handbrake",
    "name": "VNM 1.5 Rally Handbrake",
    "category": "Handbrake",
    "cat": "Handbrake",
    "price": 35000,
    "priceInr": 35000,
    "imageUrl": "https://racesims.in/cdn/shop/files/5-3.jpg?v=1759670267&width=360",
    "image": "https://racesims.in/cdn/shop/files/5-3.jpg?v=1759670267&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Handbrake engineered for ultra-rigid professional sim racing.",
    "spec": "Handbrake engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "conspit-h3-hydraulic-hand-brake",
    "name": "CONSPIT H3 Hydraulic Hand Brake",
    "category": "Handbrake",
    "cat": "Handbrake",
    "price": 35500,
    "priceInr": 35500,
    "imageUrl": "https://racesims.in/cdn/shop/files/DSC9720.png?v=1746151636&width=360",
    "image": "https://racesims.in/cdn/shop/files/DSC9720.png?v=1746151636&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Handbrake engineered for ultra-rigid professional sim racing.",
    "spec": "Handbrake engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-gs32qc",
    "name": "Samsung G5 (32\" 165Hz 1440p Curved monitor)",
    "category": "Monitor",
    "cat": "Monitor",
    "price": 22500,
    "priceInr": 22500,
    "imageUrl": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&width=360",
    "image": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-g34wqc",
    "name": "GIGABYTE G34WQC (34\" widescreen 2K Curved monitor)",
    "category": "Monitor",
    "cat": "Monitor",
    "price": 34500,
    "priceInr": 34500,
    "imageUrl": "https://racesims.in/cdn/shop/files/61mzM7JeQ2L._SL1000.jpg?v=1746153392&width=360",
    "image": "https://racesims.in/cdn/shop/files/61mzM7JeQ2L._SL1000.jpg?v=1746153392&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-gs27f",
    "name": "Triple 27\" GIGABYTE GS27F (27\" 165hz 1080P Flat monitor)",
    "category": "Monitor",
    "cat": "Monitor",
    "price": 37500,
    "priceInr": 37500,
    "imageUrl": "https://racesims.in/cdn/shop/files/51E5HHGeM4L._SL1000.jpg?v=1746153070&width=360",
    "image": "https://racesims.in/cdn/shop/files/51E5HHGeM4L._SL1000.jpg?v=1746153070&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "triple-32-gigabyte-gs32qc-32-165hz-1440p-curved-mo",
    "name": "Triple 32\" Samsung G5 (32\" 165Hz 1440p Curved monitor)",
    "category": "Monitor",
    "cat": "Monitor",
    "price": 67500,
    "priceInr": 67500,
    "imageUrl": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&width=360",
    "image": "https://racesims.in/cdn/shop/files/81VWg3IBSDL._SX679.jpg?v=1791885617&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "gigabyte-co49dq",
    "name": "GIGABYTE CO49DQ (49\" Ultra Widescreen, 144Hz OLED, Curved Monitor)",
    "category": "Monitor",
    "cat": "Monitor",
    "price": 134500,
    "priceInr": 134500,
    "imageUrl": "https://racesims.in/cdn/shop/files/AORUS_CO49DQ_Gaming_Monitor-01.png?v=1746153667&width=360",
    "image": "https://racesims.in/cdn/shop/files/AORUS_CO49DQ_Gaming_Monitor-01.png?v=1746153667&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Monitor engineered for ultra-rigid professional sim racing.",
    "spec": "Monitor engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "race-sims-entry-sim-pc",
    "name": "RaceSims SPEC SIM PC",
    "category": "Sim PC",
    "cat": "Sim PC",
    "price": 210000,
    "priceInr": 210000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "image": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Sim PC engineered for ultra-rigid professional sim racing.",
    "spec": "Sim PC engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "sim-racing-pc-for-sale-core-spec",
    "name": "RaceSims CORE-SPEC SIM PC",
    "category": "Sim PC",
    "cat": "Sim PC",
    "price": 260000,
    "priceInr": 260000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "image": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Sim PC engineered for ultra-rigid professional sim racing.",
    "spec": "Sim PC engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "race-sims-pro-sim-pc",
    "name": "RaceSims PRO-SPEC SIM PC",
    "category": "Sim PC",
    "cat": "Sim PC",
    "price": 320000,
    "priceInr": 320000,
    "imageUrl": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "image": "https://racesims.in/cdn/shop/files/racepc-sim-racing-pc-for-sale-white-tempered-glass-aio-geforce-rtx-rgb-fans.jpg?v=1756350250&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Sim PC engineered for ultra-rigid professional sim racing.",
    "spec": "Sim PC engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-brake-performance-kit-for-sr-p-lite",
    "name": "Moza Brake Performance Kit for SR-P Lite",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 4099,
    "priceInr": 4099,
    "imageUrl": "https://racesims.in/cdn/shop/files/PerformanceKitforSR-PLite-3.webp?v=1783512647&width=360",
    "image": "https://racesims.in/cdn/shop/files/PerformanceKitforSR-PLite-3.webp?v=1783512647&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "moza-sr-p-lite-pedal-clutch-for-r5-r3-bundle",
    "name": "Moza SR-P Lite Pedal - Clutch (for R5& R3 bundle)",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 5499,
    "priceInr": 5499,
    "imageUrl": "https://racesims.in/cdn/shop/files/SR-P_Lite_Clutch_Pedal-1.webp?v=1783512523&width=360",
    "image": "https://racesims.in/cdn/shop/files/SR-P_Lite_Clutch_Pedal-1.webp?v=1783512523&width=360",
    "isAvailable": false,
    "stockQuantity": 0,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "keyboard-tray",
    "name": "Keyboard tray for sim rig",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 7500,
    "priceInr": 7500,
    "imageUrl": "https://racesims.in/cdn/shop/files/Keyboard-tray-for-sim-rig.jpg?v=1743646340&width=360",
    "image": "https://racesims.in/cdn/shop/files/Keyboard-tray-for-sim-rig.jpg?v=1743646340&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "integrated-pc-stand",
    "name": "RaceSims Integrated PC Stand for Sim Rig",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 5000,
    "priceInr": 5000,
    "imageUrl": "https://racesims.in/cdn/shop/files/simlab-integrated-pc-stand-for-sim-rig-black-steel-shelf-angled-mount-brackets.webp?v=1756349982&width=360",
    "image": "https://racesims.in/cdn/shop/files/simlab-integrated-pc-stand-for-sim-rig-black-steel-shelf-angled-mount-brackets.webp?v=1756349982&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "hd-castor-wheels",
    "name": "HD Leveling Castor wheels for sim rig",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 5000,
    "priceInr": 5000,
    "imageUrl": "https://racesims.in/cdn/shop/files/HD-Leveling-Castor-wheels-for-sim-rig.jpg?v=1743646334&width=360",
    "image": "https://racesims.in/cdn/shop/files/HD-Leveling-Castor-wheels-for-sim-rig.jpg?v=1743646334&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
    "compatibilityNotes": "Verified 100% Direct Drive & Aluminium Profile Compatible."
  },
  {
    "id": "handbrake-shifter-mount",
    "name": "Handbrake & shifter mount for sim rig",
    "category": "Accessories",
    "cat": "Accessories",
    "price": 4000,
    "priceInr": 4000,
    "imageUrl": "https://racesims.in/cdn/shop/files/Handbrake-shifter-mount-for-sim-rig.webp?v=1743646402&width=360",
    "image": "https://racesims.in/cdn/shop/files/Handbrake-shifter-mount-for-sim-rig.webp?v=1743646402&width=360",
    "isAvailable": true,
    "stockQuantity": 30,
    "specDescription": "Accessories engineered for ultra-rigid professional sim racing.",
    "spec": "Accessories engineered for ultra-rigid professional sim racing.",
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
