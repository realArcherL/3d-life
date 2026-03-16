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
  [-398.7, -275.2], // 45 Top straight
  [-410.1, -267.7], // 46
  [-405.6, -242.4], // 47
  [-317.7, -185.5], // 48
  [-292.5, -180.6], // 49
  [-139.3, -238.7], // 50
  [-48.7, -229.3], // 51 Final approach
];

// ═══════════════════════════════════════════════
// TURN LABELS — from FIA media map
// ═══════════════════════════════════════════════
const TURN_LABELS = [
  { n: 1, x: 375, z: 30 },
  { n: 2, x: 310, z: 80 },
  { n: 3, x: 305, z: 180 },
  { n: 4, x: 245, z: 248 },
  { n: 5, x: 155, z: 270 },
  { n: 6, x: 110, z: 268 },
  { n: 7, x: 50, z: 255 },
  { n: 8, x: 15, z: 230 },
  { n: 9, x: -175, z: 88 },
  { n: 10, x: -248, z: 96 },
  { n: 11, x: -345, z: 152 },
  { n: 12, x: -430, z: 78 },
  { n: 13, x: -482, z: 70 },
  { n: 14, x: -520, z: 78 },
  { n: 15, x: -562, z: 100 },
  { n: 16, x: -600, z: 155 },
  { n: 17, x: 175, z: 325 },
  { n: 18, x: 395, z: 305 },
  { n: 19, x: 835, z: 70 },
];

// ═══════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x000508, 0.00018);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  10000,
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.body.appendChild(renderer.domElement);

// ─── Lighting (minimal, TRON relies on emissives) ───
scene.add(new THREE.AmbientLight(0x112233, 0.3));

const keyLight = new THREE.DirectionalLight(0x88ccff, 0.4);
keyLight.position.set(400, 600, -200);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.15);
rimLight.position.set(-500, 300, 500);
scene.add(rimLight);

// ═══════════════════════════════════════════════
// GROUND — dark with TRON grid
// ═══════════════════════════════════════════════
function buildGrid() {
  const group = new THREE.Group();

  // Dark ground plane
  const groundGeo = new THREE.PlaneGeometry(6000, 4000);
  const groundMat = new THREE.MeshStandardMaterial({
    color: TRON.darkGround,
    roughness: 0.98,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  group.add(ground);

  // Grid lines
  const gridMat = new THREE.LineBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.04,
  });
  const spacing = 50;
  const extentX = 1500,
    extentZ = 1000;

  for (let x = -extentX; x <= extentX; x += spacing) {
    const pts = [
      new THREE.Vector3(x, -1.5, -extentZ),
      new THREE.Vector3(x, -1.5, extentZ),
    ];
    group.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
    );
  }
  for (let z = -extentZ; z <= extentZ; z += spacing) {
    const pts = [
      new THREE.Vector3(-extentX, -1.5, z),
      new THREE.Vector3(extentX, -1.5, z),
    ];
    group.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat),
    );
  }

  return group;
}
scene.add(buildGrid());

// ═══════════════════════════════════════════════
// STADIUM (glowing wireframe block)
// ═══════════════════════════════════════════════
function buildStadium() {
  const g = new THREE.Group();

  // Solid dark base
  const baseGeo = new THREE.BoxGeometry(260, 35, 220);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x050a0d,
    roughness: 0.8,
    metalness: 0.2,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 17;
  g.add(base);

  // Wireframe glow
  const wireGeo = new THREE.BoxGeometry(262, 36, 222);
  const wireMat = new THREE.MeshBasicMaterial({
    color: TRON.cyan,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  g.add(new THREE.Mesh(wireGeo, wireMat).translateY(17));

  // Roof edge glow
  const roofGeo = new THREE.BoxGeometry(280, 2, 240);
  const roofMat = new THREE.MeshBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.08,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 40;
  g.add(roof);

  // Edge lines on roof
  const edgesGeo = new THREE.EdgesGeometry(roofGeo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.3,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  edges.position.y = 40;
  g.add(edges);

  // Pylons (4 corner supports)
  const pylonGeo = new THREE.CylinderGeometry(2.5, 2.5, 50, 6);
  const pylonMat = new THREE.MeshBasicMaterial({
    color: TRON.cyan,
    transparent: true,
    opacity: 0.2,
  });
  [
    [-100, -80],
    [100, -80],
    [100, 80],
    [-100, 80],
  ].forEach(([px, pz]) => {
    const p = new THREE.Mesh(pylonGeo, pylonMat);
    p.position.set(px, 25, pz);
    g.add(p);
  });

  // "HARD ROCK" text indicator — just a glowing plane
  const labelGeo = new THREE.PlaneGeometry(100, 20);
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const lctx = labelCanvas.getContext('2d');
  lctx.fillStyle = '#00f0ff';
  lctx.font = 'bold 60px Orbitron, monospace';
  lctx.textAlign = 'center';
  lctx.textBaseline = 'middle';
  lctx.fillText('HARD ROCK', 256, 64);
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMat = new THREE.MeshBasicMaterial({
    map: labelTex,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.y = 38;
  g.add(label);

  g.rotation.y = -0.08;
  g.position.set(-10, 0, -80);
  return g;
}
scene.add(buildStadium());

// ═══════════════════════════════════════════════
// TRACK CURVE
// ═══════════════════════════════════════════════
const curvePoints = TRACK_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
const curve = new THREE.CatmullRomCurve3(curvePoints, true, 'catmullrom', 0.25);

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
    pts.push(p.clone().add(n.clone().multiplyScalar(offset)).setY(0.5));
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
cl.position.y = 0.3;
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
    outer.position.y = 0.25;
    outer.lookAt(outer.position.clone().add(tang));
    group.add(outer);

    // Inner
    const inner = new THREE.Mesh(kerbGeo, mat);
    inner.position.copy(
      p.clone().add(norm.clone().multiplyScalar(-(TRACK_HALF + 1.2))),
    );
    inner.position.y = 0.25;
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
      botPts.push(base.clone().setY(0));
      topPts.push(base.clone().setY(wallH));
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
// START / FINISH LINE — neon chequered
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
  mesh.position.set(p.x, 0.6, p.z);
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
          .setY(0.6),
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
      p.clone().add(n.clone().multiplyScalar(TRACK_HALF)).setY(0.6),
      p.clone().add(n.clone().multiplyScalar(-TRACK_HALF)).setY(0.6),
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
    sphere.position.copy(p).setY(4);
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
      .setY(0.8 + h),
    p
      .clone()
      .add(n.clone().multiplyScalar(-(TRACK_HALF + 5)))
      .setY(0.8 + h),
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
    const top = base.clone().setY(15);
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
// TURN LABELS — glowing TRON-style sprites
// ═══════════════════════════════════════════════
function makeTurnSprite(text, color, size) {
  const px = 256;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');

  // Outer glow ring
  const gradient = ctx.createRadialGradient(
    px / 2,
    px / 2,
    px * 0.25,
    px / 2,
    px / 2,
    px * 0.48,
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.7, 'transparent');
  gradient.addColorStop(
    1,
    color === '#00f0ff' ? 'rgba(0,240,255,0.15)' : 'rgba(255,45,0,0.15)',
  );
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, px, px);

  // Circle
  ctx.beginPath();
  ctx.arc(px / 2, px / 2, px * 0.32, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Fill with dark
  ctx.fillStyle = 'rgba(0,5,8,0.85)';
  ctx.fill();

  // Text
  ctx.fillStyle = color;
  ctx.font = `bold ${text.length > 2 ? 60 : text.length > 1 ? 72 : 84}px Orbitron, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, px / 2, px / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size || 28, size || 28, 1);
  return sprite;
}

TURN_LABELS.forEach(({ n, x, z }) => {
  const sprite = makeTurnSprite(String(n), '#ff2d00', 26);
  sprite.position.set(x, 32, z);
  scene.add(sprite);
});

// S/F label
const sfSprite = makeTurnSprite('S/F', '#00f0ff', 30);
sfSprite.position.set(53, 35, -190);
scene.add(sfSprite);

// Sector labels
const s1Sprite = makeTurnSprite('S1', '#ff2d00', 22);
s1Sprite.position.set(5, 35, 215);
scene.add(s1Sprite);

const s2Sprite = makeTurnSprite('S2', '#a855f7', 22);
s2Sprite.position.set(-598, 35, 140);
scene.add(s2Sprite);

// Speed trap
const stSprite = makeTurnSprite('T', '#ff8800', 22);
stSprite.position.set(-420, 35, 225);
scene.add(stSprite);

// ═══════════════════════════════════════════════
// CONTROL POINT DEBUG DOTS (faint, toggleable)
// ═══════════════════════════════════════════════
const dotGroup = new THREE.Group();
const dotGeo = new THREE.SphereGeometry(2.5, 8, 8);
TRACK_POINTS.forEach(([x, z], i) => {
  const mat = new THREE.MeshBasicMaterial({
    color: i === 0 ? TRON.green : TRON.cyan,
    transparent: true,
    opacity: i === 0 ? 0.6 : 0.15,
  });
  const dot = new THREE.Mesh(dotGeo, mat);
  dot.position.set(x, 1.5, z);
  dotGroup.add(dot);
});
scene.add(dotGroup);

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
// MARSHAL SECTOR MARKERS (from FIA map: MS01-MS20)
// Small dim labels placed roughly at sector boundaries
// ═══════════════════════════════════════════════
function makeMarshalLabel(text, x, z) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,240,255,0.3)';
  ctx.font = '18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, 64, 30);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
    opacity: 0.5,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.set(x, 18, z);
  sprite.scale.set(20, 7, 1);
  scene.add(sprite);
}

// Approximate MS positions from FIA media map
const marshalSectors = [
  ['MS01', 150, -150],
  ['MS02', 320, 50],
  ['MS03', 270, 140],
  ['MS04', 180, 210],
  ['MS05', 100, 250],
  ['MS06', 60, 245],
  ['MS07', -80, 175],
  ['MS08', -150, 120],
  ['MS09', -260, 115],
  ['MS10', -360, 140],
  ['MS11', -450, 75],
  ['MS12', -530, 90],
  ['MS13', -575, 120],
  ['MS14', -590, 170],
  ['MS15', -540, 218],
  ['MS16', -300, 240],
  ['MS17', -60, 245],
  ['MS18', 250, 310],
  ['MS19', 450, 280],
  ['MS20', 700, 130],
];
marshalSectors.forEach(([name, x, z]) => makeMarshalLabel(name, x, z));

// ═══════════════════════════════════════════════
// CAMERA CONTROLS
// ═══════════════════════════════════════════════
const ctrl = {
  target: new THREE.Vector3(100, 0, 50),
  phi: Math.PI * 0.3,
  theta: Math.PI * 0.15,
  radius: 1200,
  dragging: false,
  panning: false,
  prev: { x: 0, y: 0 },
};

function syncCamera() {
  const { radius, phi, theta, target } = ctrl;
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta),
  );
  camera.lookAt(target);
}
syncCamera();

const el = renderer.domElement;

el.addEventListener('mousedown', e => {
  if (e.button === 0) ctrl.dragging = true;
  if (e.button === 2) ctrl.panning = true;
  ctrl.prev = { x: e.clientX, y: e.clientY };
});

el.addEventListener('mousemove', e => {
  const dx = e.clientX - ctrl.prev.x;
  const dy = e.clientY - ctrl.prev.y;
  ctrl.prev = { x: e.clientX, y: e.clientY };

  if (ctrl.dragging) {
    ctrl.theta -= dx * 0.004;
    ctrl.phi = Math.max(0.05, Math.min(Math.PI * 0.49, ctrl.phi + dy * 0.004));
    syncCamera();
  }
  if (ctrl.panning) {
    const right = new THREE.Vector3();
    camera.getWorldDirection(right).cross(camera.up).normalize();
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    ctrl.target.add(right.multiplyScalar(-dx * ctrl.radius * 0.001));
    ctrl.target.add(fwd.multiplyScalar(dy * ctrl.radius * 0.001));
    syncCamera();
  }
});

window.addEventListener('mouseup', () => {
  ctrl.dragging = false;
  ctrl.panning = false;
});
el.addEventListener('contextmenu', e => e.preventDefault());

el.addEventListener(
  'wheel',
  e => {
    ctrl.radius = Math.max(
      60,
      Math.min(4000, ctrl.radius * (1 + e.deltaY * 0.0008)),
    );
    syncCamera();
  },
  { passive: true },
);

// Touch
let lastTouchDist = 0;
el.addEventListener(
  'touchstart',
  e => {
    if (e.touches.length === 1) {
      ctrl.dragging = true;
      ctrl.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      ctrl.dragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    }
  },
  { passive: true },
);

el.addEventListener(
  'touchmove',
  e => {
    if (e.touches.length === 1 && ctrl.dragging) {
      const dx = e.touches[0].clientX - ctrl.prev.x;
      const dy = e.touches[0].clientY - ctrl.prev.y;
      ctrl.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      ctrl.theta -= dx * 0.005;
      ctrl.phi = Math.max(
        0.05,
        Math.min(Math.PI * 0.49, ctrl.phi + dy * 0.005),
      );
      syncCamera();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      ctrl.radius = Math.max(
        60,
        Math.min(4000, ctrl.radius - (dist - lastTouchDist) * 2),
      );
      lastTouchDist = dist;
      syncCamera();
    }
  },
  { passive: true },
);

el.addEventListener('touchend', () => {
  ctrl.dragging = false;
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

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // Animate racing dot
  racerT = (racerT + dt * 0.035) % 1;
  const rPos = curve.getPointAt(racerT);
  racer.position.set(rPos.x, 3, rPos.z);
  trailGlow.position.set(rPos.x, 3, rPos.z);

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
