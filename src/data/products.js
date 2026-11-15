// Slidescoiety Product Catalog & Configurator Data

export const categories = [
  'All',
  'Cockpit frames',
  'Racing seats',
  'Wheel bases',
  'Pedals',
  'Shifters',
  'Handbrakes',
  'Monitor mounts',
  'Keyboard trays',
  'Cable-management kits',
  'Motion systems',
  'Bundles'
];

export const products = [
  {
    id: 'frame-x',
    name: 'P1-X Apex Cockpit Frame',
    cat: 'Cockpit frames',
    price: 132450, // approx 1.487,45 €
    priceEur: '1.487,45 €',
    spec: 'Zero-flex anodized aluminum extrusion chassis, Team Redline edition. Engineered for direct drive wheelbases up to 35Nm.',
    rating: 4.9,
    available: true,
    compat: 'Universal wheel & pedal deck pattern (Fanatec, Simucube, Heusinkveld, Asetek).',
    image: '/hero-backdrop-hd.jpg'
  },
  {
    id: 'frame-s',
    name: 'Vector S Compact Cockpit',
    cat: 'Cockpit frames',
    price: 34999,
    priceEur: '399,00 €',
    spec: 'Compact 8040 profile aluminum chassis designed for apartments and smaller driving spaces.',
    rating: 4.8,
    available: true,
    compat: 'Supports wheelbases up to 15Nm and standard load-cell pedals.',
    image: 'https://images.pexels.com/photos/13251222/pexels-photo-13251222.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'frame-p',
    name: 'Vector P Pro Cockpit',
    cat: 'Cockpit frames',
    price: 54999,
    priceEur: '649,00 €',
    spec: 'Heavy-duty 16040/8040 extrusion architecture with reinforced pedal deck gussets.',
    rating: 4.9,
    available: true,
    compat: 'High-torque direct drive bases up to 25Nm and heavy hydraulic pedals.',
    image: 'https://images.pexels.com/photos/36899773/pexels-photo-36899773.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'seat',
    name: 'GT Motorsport Bucket Seat',
    cat: 'Racing seats',
    price: 24999,
    priceEur: '289,00 €',
    spec: 'Ergonomic fiberglass shell with high-density foam padding and breathable fabric.',
    rating: 4.7,
    available: true,
    compat: 'Standard side-mounting brackets included. Fits all Vector & P1-X cockpits.',
    image: 'https://images.pexels.com/photos/18760172/pexels-photo-18760172.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'seat-lite',
    name: 'Apex Carbon Fiber Seat',
    cat: 'Racing seats',
    price: 42999,
    priceEur: '499,00 €',
    spec: 'Ultra-light carbon fiber composite shell with premium alcantara inserts and Slidescoiety stitching.',
    rating: 4.9,
    available: true,
    compat: 'Compatible with standard FIA side-mount brackets.',
    image: 'https://images.pexels.com/photos/21777020/pexels-photo-21777020.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'wheel',
    name: 'Direct Drive Pro Wheelbase 25Nm',
    cat: 'Wheel bases',
    price: 84999,
    priceEur: '989,00 €',
    spec: 'Industrial servo direct-drive motor with ultra-low latency, 25Nm peak torque, and active cooling.',
    rating: 5.0,
    available: true,
    compat: 'Front-mount and side-mount bracket compatible for zero chassis flex.',
    image: 'https://images.pexels.com/photos/28993123/pexels-photo-28993123.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pedals',
    name: 'Hydraulic Load-Cell 3-Pedal Set',
    cat: 'Pedals',
    price: 48999,
    priceEur: '569,00 €',
    spec: 'CNC machined billet aluminum pedal set with 200kg load cell brake and hydraulic damping.',
    rating: 4.9,
    available: true,
    compat: 'Adjustable pedal face angles, travel stops, and spring stiffness.',
    image: 'https://images.pexels.com/photos/9787476/pexels-photo-9787476.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pedals-pro',
    name: 'ActiveForce Haptic Pedal System',
    cat: 'Pedals',
    price: 89999,
    priceEur: '1.049,00 €',
    spec: 'Motorsport active haptic motors delivering live telemetry ABS pulses and traction feedback.',
    rating: 5.0,
    available: true,
    compat: 'Direct USB connection with automated game telemetry integration.',
    image: 'https://images.pexels.com/photos/9787475/pexels-photo-9787475.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'shifter',
    name: 'Sequential & H-Pattern Shifter',
    cat: 'Shifters',
    price: 18999,
    priceEur: '219,00 €',
    spec: 'Dual-mode selector mechanism with tactile mechanical gates and magnetic resistance.',
    rating: 4.8,
    available: true,
    compat: 'Direct profile mounting with included T-nuts.',
    image: 'https://images.pexels.com/photos/33878052/pexels-photo-33878052.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'handbrake',
    name: 'Progressive Hydraulic Handbrake',
    cat: 'Handbrakes',
    price: 13999,
    priceEur: '159,00 €',
    spec: 'Real hydraulic master cylinder with progressive polyurethane elastomer spring.',
    rating: 4.7,
    available: true,
    compat: 'Horizontal and vertical handle mounting configurations.',
    image: 'https://images.pexels.com/photos/28920609/pexels-photo-28920609.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'display',
    name: 'Integrated Triple Monitor Mount',
    cat: 'Monitor mounts',
    price: 22999,
    priceEur: '269,00 €',
    spec: 'Heavy-duty 4080 extrusion crossbar and pivot arms supporting triple 27\" to 43\" screens.',
    rating: 4.9,
    available: true,
    compat: 'VESA 75/100/200 compatible micro-adjustment plates.',
    image: 'https://images.pexels.com/photos/28534969/pexels-photo-28534969.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'tray',
    name: 'Articulated Keyboard & Mouse Tray',
    cat: 'Keyboard trays',
    price: 7499,
    priceEur: '89,00 €',
    spec: 'Swivel arm aluminum tray with non-slip neoprene surface for racing telemetry keyboards.',
    rating: 4.6,
    available: true,
    compat: 'Attaches to any standard 40mm/80mm profile groove.',
    image: 'https://images.pexels.com/photos/15372896/pexels-photo-15372896.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'cable',
    name: 'Motorsport Cable Management Kit',
    cat: 'Cable-management kits',
    price: 3499,
    priceEur: '39,00 €',
    spec: 'Push-in cable clips, braided sleeving, and profile slot covers for a clean race-ready cockpit.',
    rating: 4.8,
    available: true,
    compat: 'Fits all Series 40 extrusion slots.',
    image: 'https://images.pexels.com/photos/20213730/pexels-photo-20213730.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'motion',
    name: 'Quad-Actuator 4DOF Motion System',
    cat: 'Motion systems',
    price: 245000,
    priceEur: '2.890,00 €',
    spec: 'High-speed linear actuators providing pitch, roll, heave, and surge with millisecond latency.',
    rating: 5.0,
    available: false,
    compat: 'Requires reinforced P1-X or Vector P chassis with professional floor anchoring.',
    image: 'https://images.pexels.com/photos/6498307/pexels-photo-6498307.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bundle-s',
    name: 'Vector S ClubSport Starter Bundle',
    cat: 'Bundles',
    price: 98999,
    priceEur: '1.149,00 €',
    spec: 'Complete package: Vector S chassis, GT Bucket Seat, and Load-Cell 3-pedal set.',
    rating: 4.9,
    available: true,
    compat: 'Everything needed to mount your steering wheel and start driving.',
    image: 'https://images.pexels.com/photos/28993110/pexels-photo-28993110.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bundle-p',
    name: 'P1-X Pro Apex Championship Bundle',
    cat: 'Bundles',
    price: 224999,
    priceEur: '2.599,00 €',
    spec: 'Flagship bundle: P1-X Team Redline chassis, Carbon Seat, Direct Drive 25Nm, and Triple Monitor Mount.',
    rating: 5.0,
    available: true,
    compat: 'Turn-key championship grade setup for serious sim racers.',
    image: 'https://images.pexels.com/photos/28993109/pexels-photo-28993109.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export const stages = [
  {
    name: 'Cockpit Frame',
    help: 'Select the chassis foundation. Rigid extrusion ensures zero flex under extreme braking and high-torque direct drive forces.',
    ids: ['frame-x', 'frame-p', 'frame-s'],
    multi: false
  },
  {
    name: 'Racing Seat',
    help: 'Choose an ergonomic racing bucket seat that translates tactile force feedback directly to your body.',
    ids: ['seat', 'seat-lite'],
    multi: false
  },
  {
    name: 'Wheelbase',
    help: 'Select your direct-drive wheelbase. Direct drive delivers instant force feedback with true 1:1 motorsport torque.',
    ids: ['wheel'],
    multi: false
  },
  {
    name: 'Pedals',
    help: 'Configure your pedal set. High-pressure load cells and hydraulic damping are vital for muscle memory under hard braking.',
    ids: ['pedals', 'pedals-pro'],
    multi: false
  },
  {
    name: 'Shifter & Handbrake',
    help: 'Add tactile sequential shifting and progressive analog handbrake controls for GT, rally, and drift racing.',
    ids: ['shifter', 'handbrake'],
    multi: true
  },
  {
    name: 'Mounts & Finish',
    help: 'Finish your rig with integrated display mounts, articulated keyboard trays, and cable routing kits.',
    ids: ['display', 'tray', 'cable', 'motion'],
    multi: true
  },
  {
    name: 'Review & Complete',
    help: 'Review your configured custom cockpit, verify estimated total, and export your build specifications.',
    ids: []
  }
];

export const gallery = [
  { id: 'frame-x', name: 'P1-X Team Redline in Competition Studio', group: 'Studio' },
  { id: 'display', name: 'Triple 32\" Display Cockpit Configuration', group: 'Home' },
  { id: 'wheel', name: 'Direct Drive 25Nm Force Feedback Rig', group: 'Studio' },
  { id: 'pedals-pro', name: 'Active Haptic Telemetry Pedals Deck', group: 'Event' },
  { id: 'seat-lite', name: 'Apex Carbon Seat Cockpit Integration', group: 'Home' }
];

export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const byId = (id) => products.find(p => p.id === id);
