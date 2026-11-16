"use client";

import { PlayToggle, useSceneClock } from "./SceneClock";

// Animated factory floor: parcels arrive at inbound, rest in a flow rack, ride the conveyor, are
// stacked on a pallet by the robot arm, and the full pallet leaves through outbound. All motion is synthetic.

// Isometric projection: x runs to the lower right, y to the lower left, z up; one unit is S px.
const S = 13;
const OX = 168;
const OY = 40;
const iso = (x: number, y: number, z = 0) =>
  `${((x - y) * S * 0.866 + OX).toFixed(1)},${((x + y) * S * 0.5 - z * S + OY).toFixed(1)}`;

type Vec = [number, number, number];
type Key = [t: number, x: number, y: number, z: number];
type Tone = { top: string; left: string; right: string };
type Solid = { x: number; y: number; z: number; w: number; d: number; h: number; tone: Tone; opacity?: number; bias?: number };

const blue: Tone = { top: "#93b4f8", left: "#0071fd", right: "#2f6ff2" };
const navy: Tone = { top: "#4a6595", left: "#022162", right: "#1d3a6e" };
const grey: Tone = { top: "#e2e8f0", left: "#94a3b8", right: "#cbd5e1" };
const slate: Tone = { top: "#cbd5e1", left: "#64748b", right: "#94a3b8" };
const amber: Tone = { top: "#fcd34d", left: "#d97706", right: "#f59e0b" };

const smooth = (s: number) => s * s * (3 - 2 * s);

/** Position along keyframes at time u, eased per segment; holds the first and last key outside the range. */
function track(keys: Key[], u: number): Vec {
  for (let i = 1; i < keys.length; i++) {
    const [t0, ...a] = keys[i - 1];
    const [t1, ...b] = keys[i];
    if (u <= t1) {
      const s = smooth(Math.max(0, (u - t0) / (t1 - t0)));
      return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
    }
  }
  const [, ...last] = keys[keys.length - 1];
  return last as Vec;
}

// Painter's order: nearer (larger x + y + z centre) draws later. Parcels get a bias so they draw over what they sit on.
const depth = (b: Solid) => b.x + b.w / 2 + b.y + b.d / 2 + b.z + b.h / 2 + (b.bias ?? 0);

const parcel = (cx: number, cy: number, z: number, opacity = 1): Solid => ({ x: cx - 0.35, y: cy - 0.35, z, w: 0.7, d: 0.7, h: 0.7, tone: amber, opacity, bias: 0.5 });

const RACK_Y = [1, 3.6, 6.2]; // the middle rack is the live flow rack: loaded from the back aisle, picked from the front
const slotX = (seg: number) => 7.75 + seg * 1.5;
const levelZ = (level: number) => (level ? 1.4 : 0.15);
const STOCK = [[0, 0, 0], [0, 1, 1], [0, 2, 0], [0, 3, 1], [0, 3, 0], [2, 0, 1], [2, 1, 0], [2, 2, 1], [2, 3, 0]]; // [rack, segment, level]

const scenery = ([
  { x: 0, y: 0, z: 0, w: 4, d: 3, h: 0.12, tone: navy },
  { x: 17, y: 0, z: 0, w: 3, d: 4, h: 0.12, tone: navy },
  { x: 16, y: 10.4, z: 0, w: 1, d: 1, h: 0.8, tone: navy },
  ...Array.from({ length: 6 }, (_, i) => ({ x: 13.9, y: 4.8 + i * 0.9, z: 0, w: 1.2, d: 0.9, h: 0.4, tone: grey })),
  ...RACK_Y.flatMap((y) => [
    ...[0, 1, 2, 3].flatMap((seg) => [0, 1.25, 2.5].map((z) => ({ x: 7 + seg * 1.5, y, z, w: 1.5, d: 1, h: 0.15, tone: blue }))),
    ...[7, 12.85].flatMap((x) => [y, y + 0.85].map((py) => ({ x, y: py, z: 0, w: 0.15, d: 0.15, h: 2.65, tone: blue }))),
  ]),
  ...STOCK.map(([rack, seg, level]) => parcel(slotX(seg), RACK_Y[rack] + 0.5, levelZ(level))),
] as Solid[]).map((b) => ({ ...b, order: depth(b) }));

// Timeline, in seconds. Parcel k starts at k * P; four parcels fill a pallet.
const P = 3;
const PLACE = 16.8; // parcel-local time it is set down on the pallet
const PALLET = { x: 18.5, y: 9.4 };
const STACK = [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]];
const FLOW_SLOTS = [[0, 0], [2, 1], [1, 0], [3, 1], [0, 1], [2, 0], [1, 1], [3, 0]]; // [segment, level]
const REST: Vec = [14.5, 9.6, 2.5]; // gripper waiting above the conveyor end
const START = 45; // opening frame with the floor already busy

function route(k: number): Key[] {
  const [seg, level] = FLOW_SLOTS[k % 8];
  const [ox, oy] = STACK[k % 4];
  const sx = slotX(seg);
  const lz = levelZ(level);
  const px = PALLET.x + ox;
  const py = PALLET.y + oy;
  return [
    [0, -1.5, 1.5, 0],
    [1, 2, 1.5, 0],
    [1.6, 2, 1.5, 0],
    [2.6, 5.5, 1.5, 0],
    [3.1, 5.5, 2.8, 0],
    [4.4, sx, 2.8, 0],
    [4.9, sx, 2.8, lz],
    [5.5, sx, 4.1, lz],
    [10.5, sx, 4.1, lz],
    [11.1, sx, 5.4, lz],
    [11.6, sx, 5.4, 0],
    [12.4, 13.6, 5.4, 0],
    [12.6, 14.5, 5.4, 0.4],
    [15.1, 14.5, 9.6, 0.4],
    [15.4, 14.5, 9.6, 0.4],
    [15.8, 14.5, 9.6, 1.8],
    [16.5, px, py, 1.8],
    [PLACE, px, py, 0.2],
  ];
}

const depart = (m: number) => (4 * m + 3) * P + PLACE + 0.5;

function palletAt(m: number, t: number) {
  const appear = depart(m - 1) + 1;
  const leave = depart(m);
  if (t < appear || t > leave + 4) return null;
  const pos = track([[leave, PALLET.x, PALLET.y, 0], [leave + 3.2, PALLET.x, 2.2, 0]], t);
  return { pos, opacity: Math.max(0, Math.min(1, (t - appear) / 0.4, (leave + 4 - t) / 0.8)) };
}

function parcelAt(k: number, t: number): Solid | null {
  const u = t - k * P;
  if (u < 0) return null;
  if (u < PLACE) {
    const [x, y, z] = track(route(k), u);
    return parcel(x, y, z, Math.min(1, u / 0.8));
  }
  const pallet = palletAt(Math.floor(k / 4), t);
  if (!pallet) return null;
  const [ox, oy] = STACK[k % 4];
  const [x, y, z] = pallet.pos;
  return parcel(x + ox, y + oy, z + 0.2, pallet.opacity);
}

function gripAt(t: number): Vec {
  // Only one parcel can be in its pick window (local 15.1 to 17.5 s) at a time.
  const k = Math.max(0, Math.floor((t - 15.1) / P)); // before the first pick the arm waits at REST
  const [ox, oy] = STACK[k % 4];
  const px = PALLET.x + ox;
  const py = PALLET.y + oy;
  return track(
    [
      [15.1, ...REST],
      [15.4, 14.5, 9.6, 1.1],
      [15.8, 14.5, 9.6, 2.5],
      [16.5, px, py, 2.5],
      [PLACE, px, py, 0.9],
      [17.5, ...REST],
    ],
    t - k * P,
  );
}

function frame(t: number) {
  const solids: (Solid & { order: number })[] = [...scenery];
  const last = Math.floor(t / P);
  for (let k = Math.max(0, last - 11); k <= last; k++) {
    const p = parcelAt(k, t);
    if (p) solids.push({ ...p, order: depth(p) });
  }
  for (let m = Math.max(0, Math.floor(last / 4) - 2); m <= Math.floor(last / 4) + 1; m++) {
    const pallet = palletAt(m, t);
    if (!pallet) continue;
    const [x, y, z] = pallet.pos;
    const b: Solid = { x: x - 0.8, y: y - 0.8, z, w: 1.6, d: 1.6, h: 0.2, tone: slate, opacity: pallet.opacity };
    solids.push({ ...b, order: depth(b) });
  }
  return solids.sort((a, b) => a.order - b.order);
}

function Box({ x, y, z, w, d, h, tone, opacity = 1 }: Solid) {
  return (
    <g opacity={opacity}>
      <polygon points={[iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)].join(" ")} fill={tone.left} />
      <polygon points={[iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)].join(" ")} fill={tone.right} />
      <polygon points={[iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)].join(" ")} fill={tone.top} />
    </g>
  );
}

function Arm({ t }: { t: number }) {
  const [gx, gy, gz] = gripAt(t);
  const wrist: Vec = [gx, gy, gz + 0.5];
  const elbow: Vec = [(16.5 + gx) / 2, (10.9 + gy) / 2, gz + 1.5];
  const line = { fill: "none", stroke: "#022162", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <g>
      <polyline points={[iso(16.5, 10.9, 0.8), iso(16.5, 10.9, 1.6), iso(...elbow), iso(...wrist)].join(" ")} strokeWidth={3} {...line} />
      <polyline points={[iso(gx - 0.35, gy, gz + 0.15), iso(gx - 0.35, gy, gz + 0.5), iso(gx + 0.35, gy, gz + 0.5), iso(gx + 0.35, gy, gz + 0.15)].join(" ")} strokeWidth={2} {...line} />
    </g>
  );
}

function Label({ x, y, z = 0, children }: { x: number; y: number; z?: number; children: string }) {
  const [px, py] = iso(x, y, z).split(",").map(Number);
  return (
    <g transform={`translate(${px},${py})`}>
      <rect x={-children.length * 2.9 - 6} y={-9} width={children.length * 5.8 + 12} height={14} rx={7} fill="#022162" />
      <text textAnchor="middle" y={1.5} fontSize={8} fontWeight={600} fill="#fff">
        {children}
      </text>
    </g>
  );
}

export function DigitalTwinScene() {
  const { ref, t, playing, toggle } = useSceneClock<SVGSVGElement>(START);

  return (
    <>
      <svg
        ref={ref}
        viewBox="0 0 400 270"
        className="h-full w-full"
        role="img"
        aria-label="Animated isometric factory floor: parcels arrive at inbound, are stored on shelves, picked onto a conveyor, stacked on a pallet by a robot arm and shipped from outbound"
      >
        <polygon points={[iso(0, 0), iso(20, 0), iso(20, 14), iso(0, 14)].join(" ")} fill="#ffffff" stroke="#cbd5e1" />
        <polyline
          points={[iso(2, 1.5), iso(5.5, 1.5), iso(5.5, 2.8), iso(10, 2.8), iso(10, 5.4), iso(14.5, 5.4), iso(14.5, 9.6), iso(18.5, 9.4), iso(18.5, 2.2)].join(" ")}
          fill="none"
          stroke="#0071fd"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        {frame(t).map((b, i) => (
          <Box key={i} {...b} />
        ))}
        <Arm t={t} />
        <Label x={2} y={1.5} z={1.4}>Inbound</Label>
        <Label x={10} y={1.5} z={3.3}>Storage</Label>
        <Label x={11.6} y={10.2}>Conveyor</Label>
        <Label x={14.3} y={13.4}>Robot arm</Label>
        <Label x={18.5} y={2} z={1.4}>Outbound</Label>
      </svg>
      <PlayToggle playing={playing} onToggle={toggle} />
    </>
  );
}
