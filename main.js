/**
 * Miami International Autodrome — TRON Edition
 *
 * Control points traced on satellite imagery by the user.
 *
 * Specs:
 *   Length:  5.412 km  |  Turns: 19  |  Direction: Anti-clockwise
 *   Designed by Apex Circuit Design
 *   Lap record: 1:29.708 — Max Verstappen (2023)
 *
 * Sectors:
 *   S1 (Red):   S/F → Turn 8
 *   S2 (Blue):  Turn 8 → Turn 16
 *   S3 (Green): Turn 16 → S/F
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ═══════════════════════════════════════════════
// TRON PALETTE
// ═══════════════════════════════════════════════
const TRON = {
  cyan: 0x00f0ff,
  cyanDim: 0x005566,
  blue: 0x2d7fff,
  magenta: 0xff00aa,
  orange: 0xff8800,
  red: 0xff2d00,
  green: 0x00ff88,
  yellow: 0xffd700,
  purple: 0xa855f7,
  white: 0xffffff,
  darkGround: 0x020405,
  gridLine: 0x0a1a22,
  asphalt: 0x06090b,
  wall: 0x0d1a22,
};

// ═══════════════════════════════════════════════
// USER-TRACED TRACK DATA — 52 points, closed loop
// [x, z] metres from stadium centre
// ═══════════════════════════════════════════════
const TRACK_POINTS = [
  [53.4, -175.1],
  [357.4, 15.1],
  [361.0, 41.8],
  [300.3, 92.3],
  [293.2, 117.3],
  [294.8, 190.9],
  [240.2, 238.4],
  [159.6, 260.4],
  [118.2, 259.6],
  [69.8, 248.3],
  [-184.1, 96.4],
  [-237.3, 100.3],
  [-298.5, 137.7],
  [-334.5, 147.1],
  [-370.4, 138.8],
  [-439.7, 81.9],
  [-476.8, 77.2],
  [-510.7, 84.2],
  [-552.6, 103.6],
  [-574.0, 127.7],
  [-588.0, 159.4],
  [-585.7, 198.4],
  [-557.8, 222.0],
  [-495.6, 215.8],
  [-342.6, 246.5],
  [-55.3, 241.3],
  [165.0, 310.9],
  [197.7, 316.3],
  [286.8, 318.1],
  [379.1, 299.3],
  [685.7, 180.7],
  [821.8, 98.7],
  [827.2, 78.3],
  [804.1, 61.6],
  [776.7, 40.7],
  [762.2, 14.9],
  [766.0, -14.7],
  [781.5, -33.5],
  [804.9, -41.6],
  [857.3, -41.5],
  [878.7, -48.5],
  [914.7, -111.9],
  [893.2, -125.9],
  [910.4, -210.7],
  [894.8, -224.7],
  [571.4, -237.3],
  [248.0, -250.0],
  [-75.3, -262.6],
  [-398.7, -275.2],
  [-410.1, -267.7],
  [-405.6, -242.4],
  [-317.7, -185.5],
  [-292.5, -180.6],
  [-139.3, -238.7],
  [-48.7, -229.3],
];

// ═══════════════════════════════════════════════
// GRANDSTANDS DATA
// Traced via draw-track.html — paste exported STANDS_DATA here.
// { name, cx, cz, width(m), depth(m), angle(rad), height(m) }
// angle = atan2(dz, dx) of the front edge (track-facing face)
// ═══════════════════════════════════════════════
const STANDS_DATA = [
  // ── S/F Straight — main grandstand (right-hand side of start/finish)
  {
    name: 'Main Grandstand',
    cx: 125.7,
    cz: -156.0,
    width: 21.2,
    depth: 211.5,
    angle: -1.0392,
    height: 24,
  },

  // ── T1 approach — stand on inside of long straight
  {
    name: 'T1 Stand',
    cx: 364.1,
    cz: -8.1,
    width: 23.2,
    depth: 153.1,
    angle: -0.9829,
    height: 18,
  },

  // ── T16 complex — three stepped stands wrapping the high-speed left-handers
  {
    name: 'T16 North Stand',
    cx: -634.4,
    cz: 65.0,
    width: 37.9,
    depth: 62.7,
    angle: 0.5527,
    height: 16,
  },
  {
    name: 'T16 Centre Stand',
    cx: -654.7,
    cz: 138.3,
    width: 40.8,
    depth: 63.0,
    angle: 0.0263,
    height: 16,
  },
  {
    name: 'T16 South Stand',
    cx: -645.3,
    cz: 210.9,
    width: 38.2,
    depth: 59.1,
    angle: -0.3441,
    height: 16,
  },

  // ── T19 / Hard Rock Beach Club — four-stand complex on the NE side
  {
    name: 'Hard Rock Stand A',
    cx: 818.5,
    cz: 128.5,
    width: 28.7,
    depth: 79.3,
    angle: 0.905,
    height: 20,
  },
  {
    name: 'Hard Rock Stand B',
    cx: 745.2,
    cz: 33.5,
    width: 35.4,
    depth: 74.7,
    angle: 0.0,
    height: 20,
  },
  {
    name: 'Hard Rock Stand C',
    cx: 750.0,
    cz: -34.7,
    width: 34.5,
    depth: 39.0,
    angle: 0.3661,
    height: 18,
  },
  {
    name: 'NE Hairpin Stand',
    cx: 800.2,
    cz: -74.6,
    width: 30.6,
    depth: 70.5,
    angle: -1.948,
    height: 15,
  },
];

// ═══════════════════════════════════════════════
// VIEWING SPOTS — Grandstands, Clubs & Hospitality
// Pricing from f1miamigp.com (May 2026 race weekend)
// ═══════════════════════════════════════════════
const TIER_COLORS = {
  budget:  { hex: '#00ff88', num: 0x00ff88, label: 'Budget (<$800)'      },
  mid:     { hex: '#00f0ff', num: 0x00f0ff, label: 'Mid-Range ($800–$1.2K)' },
  team:    { hex: '#2d7fff', num: 0x2d7fff, label: 'Team Section'         },
  premium: { hex: '#ff8800', num: 0xff8800, label: 'Premium Club'         },
  luxury:  { hex: '#ff00aa', num: 0xff00aa, label: 'Luxury ($4K+)'        },
  ultra:   { hex: '#ffd700', num: 0xffd700, label: 'Ultra VIP ($3K+/day)' },
};

const VIEWING_SPOTS = [
  // ── Grandstands
  {
    label: 'START / FINISH',
    sub: 'Pit Lane · Grid · Race Start · Best Atmosphere',
    price: '$1,175', priceNote: '3-Day Pass  ·  Sun only $895',
    tier: 'mid', x: 155, z: -190,
    notes: [
      'Watch the starting grid light sequence live — lap 1 from the best seat',
      'Pit lane windows below — see tire changes happening in real time',
      'Presented by Gainbridge · North Campus grandstand',
      'Most electric atmosphere anywhere on the circuit on race day',
      'Friday-only: $130 · Saturday-only: $475',
    ],
    verdict: 'Best all-round grandstand. Grid, pits & finish line in one view.',
  },
  {
    label: 'TURN 1 STAND',
    sub: 'Turns 1–3 · Lap-1 Chaos · Overtaking Hotspot',
    price: '$900', priceNote: '3-Day Pass  ·  Sun only $740',
    tier: 'mid', x: 390, z: -65,
    notes: [
      'Top r/formula1 pick for race-day spectacle — consistently recommended',
      'Cars brake from 320+ km/h into Turn 1 — you hear and feel it',
      'Sweeping views across Turns 1, 2 & 3',
      'Lap-1 carnage spot: if a crash happens, it usually starts here',
      'Friday-only: $100 · Saturday-only: $350',
    ],
    verdict: 'Best place for the drama. Turn 1 lap-1 is always unforgettable.',
  },
  {
    label: 'TURN 18 STAND',
    sub: '2nd Fastest Straight · 330 km/h · Speed Spectacle',
    price: '$950', priceNote: '3-Day Pass  ·  Sun only $675',
    tier: 'mid', x: -360, z: -215,
    notes: [
      '2nd fastest straight on the entire F1 calendar — cars hit 330+ km/h',
      'You physically feel the shockwave as cars pass at full speed',
      'Less overtaking action but the pure speed spectacle is unmatched',
      'Great for photography — long exposures blur the cars dramatically',
      'Friday-only: $105 · Saturday-only: $275',
    ],
    verdict: 'Speed freaks only. Pure sensory overload, minimal strategy watching.',
  },
  {
    label: 'MARINA STAND',
    sub: 'Turns 6–8 · Picturesque Marina · Best Budget Pick',
    // Anchored to T16 South Stand (cx:-645, cz:210) — the T6–8 west section
    price: '$700', priceNote: '3-Day Pass  ·  Sun only $535',
    tier: 'budget', x: -720, z: 265,
    notes: [
      'Most picturesque grandstand location — marina backdrop behind the cars',
      'Views across Turns 6, 7 & 8 — mid-speed technical section',
      'MSC Yacht Club nearby adds to the atmosphere without the price tag',
      'Best value named grandstand with a genuine sense of place',
      'Friday-only: $85 · Saturday-only: $205',
    ],
    verdict: 'Best budget grandstand. You get location, views and real atmosphere.',
  },
  {
    label: 'BEACH GRANDSTAND',
    sub: 'Turns 11–12 · LED Videoboard · Festival Vibe',
    // Anchored to Hard Rock Stand A (cx:818, cz:128) — T11 NE section
    price: '$670', priceNote: '3-Day Pass  ·  Sun only $535',
    tier: 'budget', x: 920, z: 180,
    notes: [
      'Cheapest named grandstand at the entire event',
      'Giant trackside LED videoboard for live replays and entertainment',
      'Hard Rock Beach Club literally next door — festival energy all weekend',
      'Turns 11–12 see genuine race action including some overtakes',
      'Friday-only: $75 · Saturday-only: $230',
    ],
    verdict: 'The budget pick. Solid for first-timers or casual fans.',
  },
  {
    label: 'GRANDSTAND PASS',
    sub: 'Roaming · All Stands · Best Flexibility',
    // Floats above the S/F straight — roaming pass covers all stands
    price: '$785', priceNote: '3-Day Roaming Pass',
    tier: 'budget', x: 220, z: -75,
    notes: [
      '#1 Reddit recommendation for first-time Miami visitors, bar none',
      'Full access to ALL grandstands across the entire weekend',
      'Move to wherever the action is — no regrets about your fixed seat',
      'Watch from S/F in the morning, be at T1 before race start',
      'Best way to understand the full circuit layout in one visit',
    ],
    verdict: '★ Most recommended by the F1 community for first visits to Miami.',
  },
  // ── Team Sections
  {
    label: 'ATLASSIAN × WILLIAMS',
    sub: 'Turns 17–19 · Williams Partner Section · Ask Your Friend!',
    // T17(x:-420,z:-294) → T18(x:-316,z:-161) → T19(x:-117,z:-214) — south section
    price: '$1,085', priceNote: '3-Day Pass  ·  Team Section',
    tier: 'team', x: -400, z: -340,
    notes: [
      'Atlassian is an official partner of Williams Racing — this is their named section',
      'Located at Turns 17–19, covering the fastest part of Sector 3',
      'Your Atlassian contact may unlock complimentary team hospitality access',
      'Team hospitality typically includes: garage tours, driver appearances, motorhome dining',
      'Ask before buying — corporate partner passes are not sold publicly',
    ],
    verdict: '🔑 Talk to your friend first. Team hospitality > any grandstand ticket.',
  },
  {
    label: 'McLAREN MASTERCARD',
    sub: 'Marina · Turns 6–8 · Team Branded Section',
    // Anchored to T16 Centre Stand (cx:-654, cz:138) — T6–7 west section
    price: '$865', priceNote: '3-Day Pass  ·  Team Section',
    tier: 'team', x: -720, z: 120,
    notes: [
      'McLaren Mastercard branded section in the marina area',
      'Same circuit views as the Marina Grandstand — Turns 6–8',
      'Enhanced amenities and team branding vs standard marina seats',
      'Good pick for McLaren fans wanting a step up from general admission',
    ],
    verdict: 'Solid if you\'re a McLaren fan. Views identical to Marina Stand.',
  },
  // ── Clubs & Hospitality
  {
    label: 'HARD ROCK BEACH CLUB',
    sub: 'Turns 11–14 · Pool · Live Music · Best Club Value',
    // Anchored to NE Hairpin Stand (cx:800, cz:-74) + Hard Rock Stand C (cx:750, cz:-34) — T13–14
    price: '$1,500', priceNote: '3-Day Deck Pass',
    tier: 'premium', x: 960, z: -100,
    notes: [
      'Best value hospitality experience — music festival + racing in one',
      'Pool deck access with private daybed add-ons available',
      'Past performers: Kaytranada, Kaskade (grid DJ), Marc Anthony',
      'Live race broadcast on LED screens throughout the venue',
      'Trackside views of Turns 11, 12, 13 & 14',
      'Cabana packages: $50K for 1–10 guests (usually sold out)',
    ],
    verdict: 'Best balance of experience and actual race watching at Miami.',
  },
  {
    label: 'PODIUM CLUB',
    sub: 'Turns 4 & 9 · Podium Ceremony Access · Thu Night Party',
    // T4(x:-216,z:81) and T9(x:-56,z:262) — Fountain Zone inside circuit
    price: '$4,500', priceNote: '3-Day Pass  ·  All-Inclusive',
    tier: 'luxury', x: -270, z: 145,
    notes: [
      'Only place where you\'re literally inside the podium ceremony zone',
      'Front-row access when the winner sprays champagne — no screen needed',
      'Thursday night party with headline DJs included in the package',
      'Climate-controlled lounge · beer, wine & sparkling wine included',
      'Dual-angle track views of Turns 4 & 9 from the Fountain Zone',
      'Hard Rock Stadium · located in the heart of the circuit',
    ],
    verdict: 'Unique experience no other ticket replicates. Worth it for the podium alone.',
  },
  {
    label: 'MSC YACHT CLUB',
    sub: 'Turns 5–9 · All-Inclusive · Bagatelle Dining',
    // T7(x:-612,z:199) → T8(x:-549,z:249) → T9(x:-56,z:262) marina bend — outward south
    price: '$4,250', priceNote: '3-Day Deck Pass  ·  All-Inclusive',
    tier: 'luxury', x: -450, z: 320,
    notes: [
      'Three-deck venue with panoramic marina views across Turns 5–9',
      'Bagatelle — French-Mediterranean dining experience on-site',
      'Jack Daniel\'s Lounge: craft cocktails, beer, wine, all-inclusive',
      'Private cabanas for 20 guests (sold out every year — book early)',
      'You\'re paying for the social scene — racing is the backdrop here',
      'Presented by MSC Cruises · Marina District',
    ],
    verdict: 'Stunning social experience. More luxury party than race watching.',
  },
  {
    label: 'PADDOCK CLUB',
    sub: 'S/F Rooftop · Team Garages · The Ultimate',
    // Above Main Grandstand (cx:125, cz:-156) — pit-lane rooftop, north of S/F straight
    price: 'From $3K/day', priceNote: 'Per Person Per Day  ·  Up to $9K/day',
    tier: 'ultra', x: 300, z: -250,
    notes: [
      'The pinnacle of F1 hospitality — exists at every race, Miami\'s is spectacular',
      'Rooftop aerial views of the start/finish straight and pit lane below',
      'Direct sightline to team garages — watch engineers and mechanics at work',
      'Premium culinary and beverage experience · climate-controlled',
      'Rooftop Club: $3K–$9K per person per day',
      'Private suites: $500,000 for 50–100 guests for the full weekend',
    ],
    verdict: 'The ultimate. If price is no object, nothing else comes close.',
  },
];

// ═══════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020208);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  20000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ─── Lighting ───
scene.add(new THREE.AmbientLight(0x223344, 0.5));

const keyLight = new THREE.DirectionalLight(0x88ccff, 0.6);
keyLight.position.set(500, 800, -300);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.25);
rimLight.position.set(-600, 400, 600);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x334466, 0.2);
fillLight.position.set(0, 200, -800);
scene.add(fillLight);

// ═══════════════════════════════════════════════
// PLATFORM — GitHub Skyline-style raised pedestal
// ═══════════════════════════════════════════════
const PLATFORM_Y = 30; // track sits this high above the void

function buildPlatform() {
  const group = new THREE.Group();

  // Main slab (rounded-rect feel via a box for now)
  const slabW = 2200,
    slabD = 1100,
    slabH = PLATFORM_Y;
  const slabGeo = new THREE.BoxGeometry(slabW, slabH, slabD);
  const slabMat = new THREE.MeshStandardMaterial({
    color: 0x060c12,
    roughness: 0.85,
    metalness: 0.2,
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.set(100, PLATFORM_Y / 2, 20);
  slab.receiveShadow = true;
  group.add(slab);

  // Glowing top edge (neon rim like Skyline)
  const edgesGeo = new THREE.EdgesGeometry(slabGeo);
  const edgeMat = new THREE.LineBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.18,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgeMat);
  edges.position.copy(slab.position);
  group.add(edges);

  // Bright rim line along the top perimeter
  const hw = slabW / 2,
    hd = slabD / 2;
  const cx = 100,
    cz = 20,
    y = PLATFORM_Y + 0.1;
  const rimPts = [
    new THREE.Vector3(cx - hw, y, cz - hd),
    new THREE.Vector3(cx + hw, y, cz - hd),
    new THREE.Vector3(cx + hw, y, cz + hd),
    new THREE.Vector3(cx - hw, y, cz + hd),
    new THREE.Vector3(cx - hw, y, cz - hd),
  ];
  group.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(rimPts),
      new THREE.LineBasicMaterial({
        color: TRON.cyan,
        transparent: true,
        opacity: 0.45,
      }),
    ),
  );

  // Grid lines on top surface
  const gridMat = new THREE.LineBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.035,
  });
  const spacing = 50;
  for (let x = cx - hw; x <= cx + hw; x += spacing) {
    const pts = [
      new THREE.Vector3(x, y, cz - hd),
      new THREE.Vector3(x, y, cz + hd),
    ];
    group.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
    );
  }
  for (let z = cz - hd; z <= cz + hd; z += spacing) {
    const pts = [
      new THREE.Vector3(cx - hw, y, z),
      new THREE.Vector3(cx + hw, y, z),
    ];
    group.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
    );
  }

  // Ambient floor far below (for depth)
  const floorGeo = new THREE.PlaneGeometry(12000, 12000);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x010204,
    roughness: 1.0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -5;
  group.add(floor);

  return group;
}
scene.add(buildPlatform());

// ═══════════════════════════════════════════════
// SATELLITE MAP UNDERLAY (toggleable)
// Esri World Imagery projected onto the platform top surface
// ═══════════════════════════════════════════════
const mapUnderlayGroup = new THREE.Group();
mapUnderlayGroup.visible = false; // hidden by default

(function buildMapUnderlay() {
  // Platform dimensions & position
  const slabW = 2200,
    slabD = 1100;
  const cx = 100,
    cz = 20;

  // Coordinate conversion (must match draw-track.html exactly)
  const CENTER_LAT = 25.9581,
    CENTER_LON = -80.2389;
  const M_LAT = 111320;
  const M_LON = 111320 * Math.cos((CENTER_LAT * Math.PI) / 180);

  // Geographic bounds from platform edges → lat/lng
  const halfW = slabW / 2,
    halfD = slabD / 2;
  const lngL = CENTER_LON + (cx - halfW) / M_LON;
  const lngR = CENTER_LON + (cx + halfW) / M_LON;
  const latTop = CENTER_LAT - (cz - halfD) / M_LAT; // north
  const latBot = CENTER_LAT - (cz + halfD) / M_LAT; // south

  // Image pixel dimensions must match bbox aspect ratio IN DEGREES
  // so the Esri API doesn't silently expand/crop the extent.
  const degW = lngR - lngL;
  const degH = latTop - latBot;
  const w = 2048,
    h = Math.round((w * degH) / degW);
  const bbox = `${lngL},${latBot},${lngR},${latTop}`;
  const url = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&size=${w},${h}&imageSR=4326&format=png32&f=image`;

  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    tex => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;

      const geo = new THREE.PlaneGeometry(slabW, slabD);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const plane = new THREE.Mesh(geo, mat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(cx, PLATFORM_Y + 0.3, cz);
      mapUnderlayGroup.add(plane);

      console.log('%c Satellite map underlay loaded', 'color: #00ff88;');
    },
    undefined,
    err => {
      console.warn('Map underlay failed to load:', err);
    },
  );
})();
scene.add(mapUnderlayGroup);

// ─── Map underlay toggle via keyboard (M key) or button ───
function toggleMapUnderlay() {
  mapUnderlayGroup.visible = !mapUnderlayGroup.visible;
  const btn = document.getElementById('btn-map');
  if (btn) {
    btn.classList.toggle('active', mapUnderlayGroup.visible);
    btn.textContent = mapUnderlayGroup.visible ? '🗺 Map ON' : '🗺 Map OFF';
  }
}
window.addEventListener('keydown', e => {
  if (e.key === 'm' || e.key === 'M') toggleMapUnderlay();
});

// ═══════════════════════════════════════════════
// TRACK CURVE
// ═══════════════════════════════════════════════
const curvePoints = TRACK_POINTS.map(
  ([x, z]) => new THREE.Vector3(x, PLATFORM_Y, z),
);
const curve = new THREE.CatmullRomCurve3(curvePoints, true, 'centripetal', 0.5);

const TRACK_WIDTH = 14;
const TRACK_HALF = TRACK_WIDTH / 2;
const N_SEG = 1600;

function getNormal(t) {
  const tang = curve.getTangentAt(t).normalize();
  return new THREE.Vector3(-tang.z, 0, tang.x);
}

// (Asphalt strip removed — track defined by neon edge lines)

// ═══════════════════════════════════════════════
// NEON EDGE LINES (the TRON signature look)
// Multiple passes for glow effect
// ═══════════════════════════════════════════════
function buildGlowEdge(offset, color, layers) {
  const group = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= N_SEG; i++) {
    const t = i / N_SEG;
    const p = curve.getPointAt(t);
    const n = getNormal(t);
    pts.push(
      p
        .clone()
        .add(n.clone().multiplyScalar(offset))
        .setY(PLATFORM_Y + 0.5),
    );
  }

  layers.forEach(({ opacity, yOff }) => {
    const geo = new THREE.BufferGeometry().setFromPoints(
      pts.map(p => p.clone().setY(p.y + (yOff || 0))),
    );
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    group.add(new THREE.Line(geo, mat));
  });
  return group;
}

// Outer edge — bright cyan glow
scene.add(
  buildGlowEdge(TRACK_HALF - 0.3, TRON.cyan, [
    { opacity: 0.7 },
    { opacity: 0.25, yOff: 0.3 },
    { opacity: 0.08, yOff: 0.6 },
  ]),
);

// Inner edge — dimmer cyan
scene.add(
  buildGlowEdge(-(TRACK_HALF - 0.3), TRON.cyan, [
    { opacity: 0.7 },
    { opacity: 0.25, yOff: 0.3 },
    { opacity: 0.08, yOff: 0.6 },
  ]),
);

// ─── Centreline (dashed, subtle) ───
const clPts = curve.getSpacedPoints(N_SEG);
const clGeo = new THREE.BufferGeometry().setFromPoints(clPts);
const clMat = new THREE.LineDashedMaterial({
  color: TRON.cyan,
  transparent: true,
  opacity: 0.06,
  dashSize: 6,
  gapSize: 10,
});
const cl = new THREE.Line(clGeo, clMat);
cl.computeLineDistances();
cl.position.y = PLATFORM_Y + 0.3;
scene.add(cl);

// ═══════════════════════════════════════════════
// KERBS — Neon red/cyan alternating blocks
// ═══════════════════════════════════════════════
function buildKerbs() {
  const group = new THREE.Group();

  // t-parameter ranges for turn zones
  const zones = [
    [0.015, 0.04],
    [0.04, 0.065],
    [0.065, 0.095], // T1, T2, T3
    [0.095, 0.12],
    [0.12, 0.145],
    [0.145, 0.175], // T4, T5, T6-7
    [0.175, 0.2],
    [0.205, 0.225],
    [0.225, 0.25], // T8, T9, T10
    [0.25, 0.29],
    [0.29, 0.325],
    [0.325, 0.36], // T11, T12-13, T14-15
    [0.36, 0.41], // T16
    [0.49, 0.535],
    [0.545, 0.58], // T17, T18
    [0.595, 0.635], // T19
    [0.72, 0.77],
    [0.775, 0.815], // NE hairpin turns
  ];

  const kerbGeo = new THREE.BoxGeometry(2.2, 0.5, 1.0);
  const redMat = new THREE.MeshBasicMaterial({
    color: TRON.red,
    transparent: true,
    opacity: 0.8,
  });
  const cyanMat = new THREE.MeshBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.5,
  });

  const STEPS = 4000;
  for (let i = 0; i < STEPS; i++) {
    const t = i / STEPS;
    if (!zones.some(([a, b]) => t >= a && t <= b)) continue;

    const p = curve.getPointAt(t);
    const tang = curve.getTangentAt(t).normalize();
    const norm = new THREE.Vector3(-tang.z, 0, tang.x);
    const isRed = i % 8 < 4;
    const mat = isRed ? redMat : cyanMat;

    // Outer
    const outer = new THREE.Mesh(kerbGeo, mat);
    outer.position.copy(
      p.clone().add(norm.clone().multiplyScalar(TRACK_HALF + 1.2)),
    );
    outer.position.y = PLATFORM_Y + 0.25;
    outer.lookAt(outer.position.clone().add(tang));
    group.add(outer);

    // Inner
    const inner = new THREE.Mesh(kerbGeo, mat);
    inner.position.copy(
      p.clone().add(norm.clone().multiplyScalar(-(TRACK_HALF + 1.2))),
    );
    inner.position.y = PLATFORM_Y + 0.25;
    inner.lookAt(inner.position.clone().add(tang));
    group.add(inner);
  }
  return group;
}
scene.add(buildKerbs());

// ═══════════════════════════════════════════════
// BARRIER WALLS (subtle glowing edges)
// ═══════════════════════════════════════════════
function buildWalls() {
  const group = new THREE.Group();
  const wallH = 3;

  [TRACK_HALF + 10, -(TRACK_HALF + 10)].forEach(offset => {
    // Bottom edge
    const botPts = [];
    const topPts = [];
    for (let i = 0; i <= 800; i++) {
      const t = i / 800;
      const p = curve.getPointAt(t);
      const n = getNormal(t);
      const base = p.clone().add(n.clone().multiplyScalar(offset));
      botPts.push(base.clone().setY(PLATFORM_Y));
      topPts.push(base.clone().setY(PLATFORM_Y + wallH));
    }

    const wallMat = new THREE.LineBasicMaterial({
      color: TRON.cyan,
      transparent: true,
      opacity: 0.08,
    });
    group.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(topPts), wallMat),
    );

    // Occasional vertical posts
    for (let i = 0; i < botPts.length; i += 20) {
      const postPts = [botPts[i], topPts[i]];
      const postMat = new THREE.LineBasicMaterial({
        color: TRON.cyan,
        transparent: true,
        opacity: 0.05,
      });
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(postPts),
          postMat,
        ),
      );
    }
  });

  return group;
}
scene.add(buildWalls());

// ═══════════════════════════════════════════════
// GRANDSTAND LABELS — text-only markers at each stand location
// ═══════════════════════════════════════════════
await document.fonts.load('bold 100px "Orbitron"').catch(() => {});

function makeStandLabel(name, cx, cz) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 128);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.88)';
  ctx.font = 'bold 48px "Orbitron", "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 512, 64);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      depthTest: false,
      transparent: true,
      opacity: 0.85,
    }),
  );
  sprite.scale.set(65, 8, 1);
  sprite.position.set(cx, PLATFORM_Y + 22, cz);
  return sprite;
}

STANDS_DATA.forEach(s => scene.add(makeStandLabel(s.name, s.cx, s.cz)));

// ═══════════════════════════════════════════════
// VIEWING SPOT MARKERS — togglable with T key
// Color-coded price cards floating above each zone
// ═══════════════════════════════════════════════
function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function makeViewingSprite(spot) {
  const W = 560, H = 234;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tc = TIER_COLORS[spot.tier];
  const isWilliams = spot.tier === 'team' && spot.label.includes('WILLIAMS');

  // Background
  ctx.fillStyle = 'rgba(0,4,10,0.95)';
  rrPath(ctx, 0, 0, W, H, 14);
  ctx.fill();

  // Header stripe
  ctx.fillStyle = tc.hex;
  ctx.globalAlpha = 0.20;
  rrPath(ctx, 0, 0, W, 42, 14);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Border (extra glow for Williams)
  ctx.strokeStyle = tc.hex;
  ctx.lineWidth = isWilliams ? 3.5 : 2.5;
  ctx.shadowColor = tc.hex;
  ctx.shadowBlur = isWilliams ? 20 : 10;
  rrPath(ctx, 1.5, 1.5, W - 3, H - 3, 14);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Name
  const fontSize = spot.label.length > 18 ? 21 : 25;
  ctx.font = `bold ${fontSize}px "Orbitron", monospace`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(spot.label, W / 2, 21);

  // Price (big, glowing)
  ctx.font = 'bold 52px "Orbitron", monospace';
  ctx.fillStyle = tc.hex;
  ctx.shadowColor = tc.hex;
  ctx.shadowBlur = 22;
  ctx.fillText(spot.price, W / 2, 90);
  ctx.shadowBlur = 0;

  // Price note (3-day label)
  ctx.font = '18px "Rajdhani", sans-serif';
  ctx.fillStyle = `${tc.hex}99`;
  ctx.fillText(spot.priceNote || '3-Day Pass', W / 2, 118);

  // Hairline divider
  ctx.strokeStyle = `${tc.hex}33`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, 132);
  ctx.lineTo(W - 32, 132);
  ctx.stroke();

  // Sub-label lines
  ctx.font = '19px "Rajdhani", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.52)';
  const words = spot.sub.split('·').map(w => w.trim());
  ctx.fillText(words.slice(0, 2).join(' · '), W / 2, 152);
  if (words.length > 2) ctx.fillText(words.slice(2).join(' · '), W / 2, 173);

  // "▸ click for details" hint
  ctx.font = '14px "Rajdhani", sans-serif';
  ctx.fillStyle = `${tc.hex}66`;
  ctx.letterSpacing = '2px';
  ctx.fillText('▸  CLICK FOR DETAILS', W / 2, 210);

  // Connector dot
  ctx.fillStyle = tc.hex;
  ctx.shadowColor = tc.hex;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(W / 2, H - 7, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  const isLarge = isWilliams || spot.tier === 'ultra';
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, opacity: 0.95 }),
  );
  sprite.scale.set(isLarge ? 90 : 80, isLarge ? 37 : 33, 1);
  sprite.position.set(spot.x, PLATFORM_Y + 65, spot.z);
  return sprite;
}

// Connector lines from card bottom to track surface
function makeConnectorLine(spot) {
  const tc = TIER_COLORS[spot.tier];
  const pts = [
    new THREE.Vector3(spot.x, PLATFORM_Y + 1, spot.z),
    new THREE.Vector3(spot.x, PLATFORM_Y + 46, spot.z),
  ];
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: tc.num,
    transparent: true,
    opacity: 0.35,
  });
  return new THREE.Line(geo, mat);
}

const viewingGroup = new THREE.Group();
viewingGroup.visible = false;

// Map sprite → spot data for raycasting
const spriteToSpot = new Map();

VIEWING_SPOTS.forEach(spot => {
  const sprite = makeViewingSprite(spot);
  spriteToSpot.set(sprite, spot);
  viewingGroup.add(sprite);
  viewingGroup.add(makeConnectorLine(spot));
});
scene.add(viewingGroup);

// ── Detail panel (HTML overlay) ──
function showSpotPanel(spot) {
  const tc = TIER_COLORS[spot.tier];
  const panel = document.getElementById('spot-panel');

  panel.style.setProperty('--tier-color', tc.hex);
  document.getElementById('sp-tier').textContent = tc.label.toUpperCase();
  document.getElementById('sp-tier').style.color = tc.hex;
  document.getElementById('sp-name').textContent = spot.label;
  document.getElementById('sp-price').textContent = spot.price;
  document.getElementById('sp-price').style.color = tc.hex;
  document.getElementById('sp-price-note').textContent = spot.priceNote || '3-Day Pass';
  document.getElementById('sp-sub').textContent = spot.sub.replaceAll('·', '—');
  document.getElementById('sp-verdict').textContent = spot.verdict;
  document.getElementById('sp-verdict').style.borderLeftColor = tc.hex;

  const ul = document.getElementById('sp-notes');
  ul.innerHTML = '';
  (spot.notes || []).forEach(n => {
    const li = document.createElement('li');
    li.textContent = n;
    ul.appendChild(li);
  });

  panel.classList.add('open');
}

function hideSpotPanel() {
  document.getElementById('spot-panel').classList.remove('open');
}

// ── Raycaster for sprite clicks ──
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', e => {
  if (!viewingGroup.visible) return;
  _mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  _mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  _raycaster.setFromCamera(_mouse, camera);
  const sprites = [...spriteToSpot.keys()];
  const hits = _raycaster.intersectObjects(sprites);
  if (hits.length > 0) {
    const spot = spriteToSpot.get(hits[0].object);
    if (spot) { showSpotPanel(spot); return; }
  }
  hideSpotPanel();
});

function toggleViewingSpots() {
  viewingGroup.visible = !viewingGroup.visible;
  if (!viewingGroup.visible) hideSpotPanel();
  const btn = document.getElementById('btn-tickets');
  if (btn) {
    btn.classList.toggle('active', viewingGroup.visible);
    btn.textContent = viewingGroup.visible ? '🎟 Tickets ON' : '🎟 Tickets OFF';
  }
  const legend = document.getElementById('ticket-legend');
  if (legend) legend.style.display = viewingGroup.visible ? 'block' : 'none';
}

window.addEventListener('keydown', e => {
  if (e.key === 't' || e.key === 'T') toggleViewingSpots();
  if (e.key === 'Escape') hideSpotPanel();
});

const TURN_POSITIONS = [
  { n: 1, x: 371.4, z: 15 },
  { n: 2, x: 276.9, z: 109.6 },
  { n: 3, x: 300.5, z: 205.2 },
  { n: 4, x: -216.1, z: 81.6 },
  { n: 5, x: -343.9, z: 166.5 },
  { n: 6, x: -464.3, z: 55.9 },
  { n: 7, x: -612.5, z: 199.8 },
  { n: 8, x: -549.1, z: 249.2 },
  { n: 9, x: -56.1, z: 262.1 },
  { n: 10, x: 192, z: 298.7 },
  { n: 11, x: 850.5, z: 95.6 },
  { n: 12, x: 739.8, z: 1.1 },
  { n: 13, x: 868.7, z: -34.4 },
  { n: 14, x: 939.6, z: -108.5 },
  { n: 15, x: 862.3, z: -133.2 },
  { n: 16, x: 908.5, z: -231 },
  { n: 17, x: -420.2, z: -294.4 },
  { n: 18, x: -316, z: -161.2 },
  { n: 19, x: -117.3, z: -214.9 },
];

function makeTurnSprite(num) {
  const px = 256;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');

  // Dark filled circle with bright border
  ctx.beginPath();
  ctx.arc(px / 2, px / 2, px * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 5, 8, 0.88)';
  ctx.fill();
  ctx.strokeStyle = '#ff2d00';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Two-digit number text (01, 02, ... 19) matching FIA style
  const label = String(num).padStart(2, '0');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 90px "Orbitron", "Helvetica Neue", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px / 2, px / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(22, 22, 1);
  return sprite;
}

TURN_POSITIONS.forEach(({ n, x, z }) => {
  const sprite = makeTurnSprite(n);
  sprite.position.set(x, PLATFORM_Y + 30, z);
  scene.add(sprite);
});

// S/F marker sprite
(function addSFMarker() {
  const px = 256;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(px / 2, px / 2, px * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 5, 8, 0.88)';
  ctx.fill();
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 72px "Orbitron", "Helvetica Neue", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S/F', px / 2, px / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(26, 26, 1);
  sprite.position.set(53, PLATFORM_Y + 35, -190);
  scene.add(sprite);
})();

// ═══════════════════════════════════════════════
function buildStartFinish() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? '#00f0ff' : '#000508';
      ctx.fillRect(i * 16, j * 16, 16, 16);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(TRACK_WIDTH, 5);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;

  const p = curve.getPointAt(0);
  const t = curve.getTangentAt(0).normalize();
  mesh.position.set(p.x, PLATFORM_Y + 0.6, p.z);
  mesh.rotation.z = Math.atan2(t.x, t.z);

  return mesh;
}
scene.add(buildStartFinish());

// ═══════════════════════════════════════════════
// SECTOR DIVIDERS — Transparent walls (toggleable)
// S1 (Red): S/F → Turn 8  |  S2 (Blue): Turn 8 → Turn 16  |  S3 (Green): Turn 16 → S/F
// ═══════════════════════════════════════════════
const sectorWallGroup = new THREE.Group();
sectorWallGroup.visible = false; // hidden by default

function buildSectorWall(t, color, label) {
  const p = curve.getPointAt(t);
  const n = getNormal(t);
  const wallHeight = 40;

  // Four corners of the wall quad
  const halfSpan = TRACK_HALF + 8;
  const left = p.clone().add(n.clone().multiplyScalar(halfSpan));
  const right = p.clone().add(n.clone().multiplyScalar(-halfSpan));

  const bl = new THREE.Vector3(left.x, PLATFORM_Y, left.z);
  const br = new THREE.Vector3(right.x, PLATFORM_Y, right.z);
  const tl = new THREE.Vector3(left.x, PLATFORM_Y + wallHeight, left.z);
  const tr = new THREE.Vector3(right.x, PLATFORM_Y + wallHeight, right.z);

  // Build geometry from two triangles
  const vertices = new Float32Array([
    bl.x,
    bl.y,
    bl.z,
    br.x,
    br.y,
    br.z,
    tl.x,
    tl.y,
    tl.z,
    br.x,
    br.y,
    br.z,
    tr.x,
    tr.y,
    tr.z,
    tl.x,
    tl.y,
    tl.z,
  ]);
  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  wallGeo.computeVertexNormals();

  // Transparent glowing wall
  const wallMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  sectorWallGroup.add(new THREE.Mesh(wallGeo, wallMat));

  // Bright border edges
  const edgePts = [bl, br, tr, tl, bl];
  const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePts);
  const edgeMat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
  });
  sectorWallGroup.add(new THREE.Line(edgeGeo, edgeMat));

  // Bottom bright line on track surface
  const basePts = [
    bl.clone().setY(PLATFORM_Y + 0.5),
    br.clone().setY(PLATFORM_Y + 0.5),
  ];
  const baseMat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });
  sectorWallGroup.add(
    new THREE.Line(new THREE.BufferGeometry().setFromPoints(basePts), baseMat),
  );
}

// S1→S2 boundary at Turn 8 — RED
buildSectorWall(0.3081, TRON.red, 'S1');
// S2→S3 boundary at Turn 16 — BLUE
buildSectorWall(0.6588, TRON.blue, 'S2');
// S3→S1 boundary at S/F — GREEN
buildSectorWall(0.0, TRON.green, 'S3');

scene.add(sectorWallGroup);

// ─── Sector wall toggle via keyboard (S key) or button ───
function toggleSectorWalls() {
  sectorWallGroup.visible = !sectorWallGroup.visible;
  const btn = document.getElementById('btn-sectors');
  if (btn) {
    btn.classList.toggle('active', sectorWallGroup.visible);
    btn.textContent = sectorWallGroup.visible
      ? '⬡ Sectors ON'
      : '⬡ Sectors OFF';
  }
}
window.addEventListener('keydown', e => {
  if (e.key === 's' || e.key === 'S') toggleSectorWalls();
});

// ═══════════════════════════════════════════════
// ANIMATED PARTICLE — racing ball + glow + trail
// ═══════════════════════════════════════════════
const racerGeo = new THREE.SphereGeometry(4, 24, 24);
const racerMat = new THREE.MeshBasicMaterial({ color: TRON.cyan });
const racer = new THREE.Mesh(racerGeo, racerMat);
scene.add(racer);

// Subtle point light on ball for TRON glow on nearby edges/kerbs
const racerLight = new THREE.PointLight(TRON.cyan, 1.5, 80);
racerLight.position.set(0, 2, 0);
racer.add(racerLight);

let racerT = 0;

// ─── Pre-compute curvature for speed modulation ───
const CURV_N = 2000;
const curvatureMap = new Float32Array(CURV_N);
const CURV_EPS = 0.0005;
for (let i = 0; i < CURV_N; i++) {
  const t = i / CURV_N;
  const t1 = (((t - CURV_EPS) % 1) + 1) % 1;
  const t2 = (t + CURV_EPS) % 1;
  const tang1 = curve.getTangentAt(t1);
  const tang2 = curve.getTangentAt(t2);
  curvatureMap[i] = tang1.angleTo(tang2) / (2 * CURV_EPS);
}
// Smooth the curvature map (3-pass box blur, kernel 31) to remove noise
for (let pass = 0; pass < 3; pass++) {
  const tmp = new Float32Array(CURV_N);
  const K = 15; // half-kernel
  for (let i = 0; i < CURV_N; i++) {
    let sum = 0;
    for (let j = -K; j <= K; j++)
      sum += curvatureMap[(((i + j) % CURV_N) + CURV_N) % CURV_N];
    tmp[i] = sum / (2 * K + 1);
  }
  curvatureMap.set(tmp);
}
const BASE_SPEED = 0.035;
const MIN_SPEED_FACTOR = 0.28;
// Interpolated curvature lookup (no bin-snapping jitter)
function getCurvature(t) {
  const nt = ((t % 1) + 1) % 1;
  const fi = nt * CURV_N;
  const i0 = Math.floor(fi) % CURV_N;
  const i1 = (i0 + 1) % CURV_N;
  const frac = fi - Math.floor(fi);
  return curvatureMap[i0] * (1 - frac) + curvatureMap[i1] * frac;
}
function getTargetSpeedFactor(t) {
  const k = getCurvature(t);
  const f = 1 / (1 + k * 0.8);
  return Math.max(MIN_SPEED_FACTOR, f);
}
// Smoothed live speed (lerped to avoid instant jumps)
let liveSpeedFactor = 1;

// ─── Glowing trail behind the ball (TRON light-cycle style) ───
const TRAIL_LEN = 50;
const TRAIL_STEP = 0.0012; // how far behind each trail point is in t-space
const trailPositions = new Float32Array(TRAIL_LEN * 3);
const trailColors = new Float32Array(TRAIL_LEN * 3);
for (let i = 0; i < TRAIL_LEN; i++) {
  const fade = 1 - i / TRAIL_LEN;
  // Cyan fading to black (matches dark background)
  trailColors[i * 3] = 0.0 * fade; // R
  trailColors[i * 3 + 1] = 0.94 * fade; // G
  trailColors[i * 3 + 2] = 1.0 * fade; // B
}
const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(trailPositions, 3),
);
trailGeo.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(trailColors, 3),
);
const trailMat = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.7,
});
const trailLine = new THREE.Line(trailGeo, trailMat);
scene.add(trailLine);

// ═══════════════════════════════════════════════
// CAMERA — OrbitControls (Skyline-style smooth orbit)
// ═══════════════════════════════════════════════
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(100, PLATFORM_Y, 20);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 1.0;
controls.panSpeed = 0.8;
controls.minDistance = 200;
controls.maxDistance = 4000;
controls.maxPolarAngle = Math.PI * 0.48; // prevent going under the platform
controls.minPolarAngle = 0.05;
controls.screenSpacePanning = false; // pan parallel to ground

// Initial camera position — elevated angle showing depth like Skyline
const DEFAULT_CAM_POS = new THREE.Vector3(-400, PLATFORM_Y + 600, 1100);
const DEFAULT_CAM_TARGET = new THREE.Vector3(100, PLATFORM_Y, 20);
camera.position.copy(DEFAULT_CAM_POS);
controls.update();

// ═══════════════════════════════════════════════
// CAMERA MODES: 'orbit' (free) or 'follow' (tracks ball)
// ═══════════════════════════════════════════════
let cameraMode = 'orbit';
const FOLLOW_HEIGHT = 60;
const FOLLOW_DISTANCE = 120;

function toggleFollowCam() {
  if (cameraMode === 'orbit') {
    cameraMode = 'follow';
    controls.enabled = false;
  } else {
    cameraMode = 'orbit';
    controls.enabled = true;
    // Smoothly return to a good overview after leaving follow mode
    controls.target.copy(DEFAULT_CAM_TARGET);
    controls.update();
  }
  const btn = document.getElementById('btn-follow');
  if (btn) {
    btn.classList.toggle('active', cameraMode === 'follow');
    btn.textContent =
      cameraMode === 'follow' ? '🎥 Follow ON' : '🎥 Follow OFF';
  }
}

function resetView() {
  cameraMode = 'orbit';
  controls.enabled = true;
  camera.position.copy(DEFAULT_CAM_POS);
  controls.target.copy(DEFAULT_CAM_TARGET);
  controls.update();
  const btn = document.getElementById('btn-follow');
  if (btn) {
    btn.classList.remove('active');
    btn.textContent = '🎥 Follow OFF';
  }
}

window.addEventListener('keydown', e => {
  if (e.key === 'f' || e.key === 'F') toggleFollowCam();
  if (e.key === 'r' || e.key === 'R') resetView();
});

// ═══════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════
// RENDER LOOP
// ═══════════════════════════════════════════════
const clock = new THREE.Clock();
const _smoothCamPos = new THREE.Vector3();
const _smoothCamTarget = new THREE.Vector3();
let _followInitialized = false;

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // Animate racing ball — smooth speed transitions
  const targetSF = getTargetSpeedFactor(racerT);
  const speedLerp = 1 - Math.exp(-4.0 * dt); // smooth ramp
  liveSpeedFactor += (targetSF - liveSpeedFactor) * speedLerp;
  racerT = (racerT + dt * BASE_SPEED * liveSpeedFactor) % 1;
  const rPos = curve.getPointAt(racerT);
  racer.position.set(rPos.x, PLATFORM_Y + 4, rPos.z);

  // Update trailing glow line
  for (let i = 0; i < TRAIL_LEN; i++) {
    const tt = (((racerT - i * TRAIL_STEP) % 1) + 1) % 1;
    const tp = curve.getPointAt(tt);
    trailPositions[i * 3] = tp.x;
    trailPositions[i * 3 + 1] = PLATFORM_Y + 2;
    trailPositions[i * 3 + 2] = tp.z;
  }
  trailGeo.attributes.position.needsUpdate = true;

  if (cameraMode === 'follow') {
    // Get tangent to look ahead
    const tang = curve.getTangentAt(racerT).normalize();
    // Camera sits behind the ball, elevated
    const idealPos = new THREE.Vector3(
      rPos.x - tang.x * FOLLOW_DISTANCE,
      PLATFORM_Y + FOLLOW_HEIGHT,
      rPos.z - tang.z * FOLLOW_DISTANCE,
    );
    // Look-at point slightly ahead of the ball
    const idealTarget = new THREE.Vector3(
      rPos.x + tang.x * 40,
      PLATFORM_Y + 4,
      rPos.z + tang.z * 40,
    );

    if (!_followInitialized) {
      _smoothCamPos.copy(idealPos);
      _smoothCamTarget.copy(idealTarget);
      _followInitialized = true;
    }

    // Smooth lerp for cinematic feel
    const lerpFactor = 1 - Math.exp(-3.5 * dt);
    _smoothCamPos.lerp(idealPos, lerpFactor);
    _smoothCamTarget.lerp(idealTarget, lerpFactor);

    camera.position.copy(_smoothCamPos);
    camera.lookAt(_smoothCamTarget);
  } else {
    _followInitialized = false;
    controls.update(); // smooth damping for orbit mode
  }

  renderer.render(scene, camera);
}

// Kick off
requestAnimationFrame(() => {
  animate();
  setTimeout(
    () => document.getElementById('loading').classList.add('done'),
    400,
  );
});

// ═══════════════════════════════════════════════
// CONSOLE DIAGNOSTICS
// ═══════════════════════════════════════════════
const len = curve.getLength();
console.log(
  `%c Miami International Autodrome — TRON Edition`,
  'color: #00f0ff; font-weight: bold;',
);
console.log(
  `Spline length: ${len.toFixed(0)}m  |  Official: 5412m  |  Scale: ${(5412 / len).toFixed(3)}`,
);
console.log(
  `Control points: ${TRACK_POINTS.length}  |  Curve segments: ${N_SEG}`,
);
