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

  // Geographic bounds matching the platform
  // Computed from: CENTER (25.9581, -80.2389), M_LAT=111320, M_LON=~100175
  const latBot = 25.95298,
    latTop = 25.962861;
  const lngL = -80.248891,
    lngR = -80.226911;

  // Esri World Imagery static export — 2048px wide for good detail
  const w = 2048,
    h = Math.round(2048 * (slabD / slabW));
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

// ─── Dark asphalt surface ───
const trackShape = new THREE.Shape();
trackShape.moveTo(-TRACK_HALF, -0.1);
trackShape.lineTo(TRACK_HALF, -0.1);
trackShape.lineTo(TRACK_HALF, 0.1);
trackShape.lineTo(-TRACK_HALF, 0.1);
trackShape.closePath();

const trackGeo = new THREE.ExtrudeGeometry(trackShape, {
  steps: N_SEG,
  extrudePath: curve,
  bevelEnabled: false,
});
const trackMat = new THREE.MeshStandardMaterial({
  color: TRON.asphalt,
  roughness: 0.9,
  metalness: 0.05,
});
scene.add(new THREE.Mesh(trackGeo, trackMat));

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
// ANIMATED PARTICLE (simple racing ball along track)
// ═══════════════════════════════════════════════
const racerGeo = new THREE.SphereGeometry(4, 24, 24);
const racerMat = new THREE.MeshBasicMaterial({
  color: TRON.cyan,
});
const racer = new THREE.Mesh(racerGeo, racerMat);
scene.add(racer);

let racerT = 0;

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
camera.position.set(-400, PLATFORM_Y + 600, 1100);
controls.update();

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

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  controls.update(); // smooth damping

  // Animate racing ball (simple, no pulsing)
  racerT = (racerT + dt * 0.035) % 1;
  const rPos = curve.getPointAt(racerT);
  racer.position.set(rPos.x, PLATFORM_Y + 4, rPos.z);

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
