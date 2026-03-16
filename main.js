/**
 * Miami International Autodrome — TRON Edition
 *
 * 52 GPS control points traced on satellite imagery by the user.
 * DRS zones, sectors, marshal sectors from the official FIA Media Map.
 *
 * Specs:
 *   Length:  5.412 km  |  Turns: 19  |  Direction: Anti-clockwise
 *   Designed by Apex Circuit Design
 *   Lap record: 1:29.708 — Max Verstappen (2023)
 *
 * DRS Data (FIA Media Map):
 *   Detection 1: 90m after T8   | Activation 1: 30m after T9
 *   Detection 2: 70m after T16  | Activation 2: 450m after T16
 *   Detection 3: 15m after T17  | Activation 3: On T19 apex
 *
 * Sectors:
 *   S1 end: 110m after T8  |  S2 end: 70m after T16
 *   Speed trap: 150m before T17
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ═══════════════════════════════════════════════
// TRON PALETTE
// ═══════════════════════════════════════════════
const TRON = {
  cyan: 0x00f0ff,
  cyanDim: 0x005566,
  magenta: 0xff00aa,
  orange: 0xff8800,
  red: 0xff2d00,
  green: 0x00ff88,
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
  [53.4, -175.1], // 0  S/F area
  [357.4, 15.1], // 1
  [361.0, 41.8], // 2  T1
  [300.3, 92.3], // 3  T2
  [293.2, 117.3], // 4
  [294.8, 190.9], // 5  T3
  [240.2, 238.4], // 6  T4
  [159.6, 260.4], // 7  T5
  [118.2, 259.6], // 8  T6
  [69.8, 248.3], // 9  T7-T8
  [-184.1, 96.4], // 10 T9
  [-237.3, 100.3], // 11 T10
  [-298.5, 137.7], // 12
  [-334.5, 147.1], // 13 T11
  [-370.4, 138.8], // 14
  [-439.7, 81.9], // 15 T12-T13
  [-476.8, 77.2], // 16
  [-510.7, 84.2], // 17 T14
  [-552.6, 103.6], // 18 T15
  [-574.0, 127.7], // 19
  [-588.0, 159.4], // 20 T16
  [-585.7, 198.4], // 21
  [-557.8, 222.0], // 22
  [-495.6, 215.8], // 23 Back straight start
  [-342.6, 246.5], // 24
  [-55.3, 241.3], // 25
  [165.0, 310.9], // 26 T17 approach
  [197.7, 316.3], // 27 T17
  [286.8, 318.1], // 28
  [379.1, 299.3], // 29 T18
  [685.7, 180.7], // 30
  [821.8, 98.7], // 31 T19 area
  [827.2, 78.3], // 32
  [804.1, 61.6], // 33
  [776.7, 40.7], // 34
  [762.2, 14.9], // 35
  [766.0, -14.7], // 36
  [781.5, -33.5], // 37
  [804.9, -41.6], // 38
  [857.3, -41.5], // 39
  [878.7, -48.5], // 40
  [914.7, -111.9], // 41 NE hairpin
  [893.2, -125.9], // 42
  [910.4, -210.7], // 43
  [894.8, -224.7], // 44
  [571.4, -237.3], // 44a — top straight ¼
  [248.0, -250.0], // 44b — top straight ½
  [-75.3, -262.6], // 44c — top straight ¾
  [-398.7, -275.2], // 45 Top straight
  [-410.1, -267.7], // 46
  [-405.6, -242.4], // 47
  [-317.7, -185.5], // 48
  [-292.5, -180.6], // 49
  [-139.3, -238.7], // 50
  [-48.7, -229.3], // 51 Final approach
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
// DRS ZONES (from FIA Media Map — exact specs)
//
// Detection 1: 90m after T8   → Activation 1: 30m after T9
// Detection 2: 70m after T16  → Activation 2: 450m after T16
// Detection 3: 15m after T17  → Activation 3: On T19 apex
// ═══════════════════════════════════════════════
function buildDRSZones() {
  const group = new THREE.Group();

  // DRS Activation zones (GREEN — where DRS can be used)
  const activations = [
    { tStart: 0.208, tEnd: 0.244, label: 'DRS 1: 30m after T9 → T10' },
    {
      tStart: 0.415,
      tEnd: 0.49,
      label: 'DRS 2: 450m after T16 → back straight',
    },
    { tStart: 0.935, tEnd: 0.008, label: 'DRS 3: T19 apex → S/F' },
  ];

  activations.forEach(zone => {
    const pts = [];
    const steps = 500;
    for (let i = 0; i <= steps; i++) {
      let t = zone.tStart + (i / steps) * (zone.tEnd - zone.tStart);
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      const p = curve.getPointAt(t);
      const n = getNormal(t);
      // Green line on the right side of track
      pts.push(
        p
          .clone()
          .add(n.clone().multiplyScalar(TRACK_HALF - 2))
          .setY(PLATFORM_Y + 0.6),
      );
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);

    // Bright line
    group.add(
      new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: TRON.green,
          transparent: true,
          opacity: 0.7,
        }),
      ),
    );
    // Glow
    const glowPts = pts.map(p => p.clone().setY(p.y + 0.4));
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(glowPts),
        new THREE.LineBasicMaterial({
          color: TRON.green,
          transparent: true,
          opacity: 0.15,
        }),
      ),
    );
  });

  // DRS Detection points (ORANGE markers)
  const detections = [
    { t: 0.195, label: 'DET 1: 90m after T8' },
    { t: 0.395, label: 'DET 2: 70m after T16' },
    { t: 0.505, label: 'DET 3: 15m after T17' },
  ];

  detections.forEach(det => {
    const p = curve.getPointAt(det.t);
    const n = getNormal(det.t);

    // Cross-track orange line
    const pts = [
      p
        .clone()
        .add(n.clone().multiplyScalar(TRACK_HALF))
        .setY(PLATFORM_Y + 0.6),
      p
        .clone()
        .add(n.clone().multiplyScalar(-TRACK_HALF))
        .setY(PLATFORM_Y + 0.6),
    ];
    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: TRON.orange,
          transparent: true,
          opacity: 0.6,
        }),
      ),
    );

    // Glowing sphere marker
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(3, 12, 12),
      new THREE.MeshBasicMaterial({
        color: TRON.orange,
        transparent: true,
        opacity: 0.5,
      }),
    );
    sphere.position.copy(p).setY(PLATFORM_Y + 4);
    group.add(sphere);
  });

  return group;
}
scene.add(buildDRSZones());

// ═══════════════════════════════════════════════
// SECTOR DIVIDERS (from FIA Media Map)
// S1 end: 110m after T8  |  S2 end: 70m after T16
// Speed trap: 150m before T17
// ═══════════════════════════════════════════════
function buildSectorLine(t, color, heightBoost) {
  const p = curve.getPointAt(t);
  const n = getNormal(t);
  const h = heightBoost || 0;

  const pts = [
    p
      .clone()
      .add(n.clone().multiplyScalar(TRACK_HALF + 5))
      .setY(PLATFORM_Y + 0.8 + h),
    p
      .clone()
      .add(n.clone().multiplyScalar(-(TRACK_HALF + 5)))
      .setY(PLATFORM_Y + 0.8 + h),
  ];

  // Bright line
  scene.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }),
    ),
  );

  // Vertical glow column at each end
  [0, 1].forEach(idx => {
    const base = pts[idx].clone();
    const top = base.clone().setY(PLATFORM_Y + 15);
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([base, top]),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.15,
        }),
      ),
    );
  });
}

// S1 end ≈ t=0.198 (110m after T8)
buildSectorLine(0.198, TRON.red);
// S2 end ≈ t=0.398 (70m after T16)
buildSectorLine(0.398, TRON.purple);
// Speed trap ≈ t=0.475 (150m before T17)
buildSectorLine(0.475, TRON.orange, 2);

// ═══════════════════════════════════════════════
// ANIMATED PARTICLE (racing dot along track)
// ═══════════════════════════════════════════════
const racerGeo = new THREE.SphereGeometry(4, 16, 16);
const racerMat = new THREE.MeshBasicMaterial({
  color: TRON.cyan,
  transparent: true,
  opacity: 0.9,
});
const racer = new THREE.Mesh(racerGeo, racerMat);
scene.add(racer);

// Trailing glow
const trailGeo = new THREE.SphereGeometry(8, 8, 8);
const trailMat = new THREE.MeshBasicMaterial({
  color: TRON.cyan,
  transparent: true,
  opacity: 0.15,
});
const trailGlow = new THREE.Mesh(trailGeo, trailMat);
scene.add(trailGlow);

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

  // Animate racing dot
  racerT = (racerT + dt * 0.035) % 1;
  const rPos = curve.getPointAt(racerT);
  racer.position.set(rPos.x, PLATFORM_Y + 3, rPos.z);
  trailGlow.position.set(rPos.x, PLATFORM_Y + 3, rPos.z);

  // Pulse the racer glow
  const pulse = 0.7 + Math.sin(clock.elapsedTime * 4) * 0.3;
  racerMat.opacity = pulse;
  trailGlow.scale.setScalar(1 + Math.sin(clock.elapsedTime * 6) * 0.3);

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
