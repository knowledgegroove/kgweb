export interface EpisodeCoverSpec {
  tag: string;
  tone: string;
  render: () => React.ReactNode;
}

const INK = "#1A1712";
const RUST = "#A8431F";
const NAVY = "#223347";

/** Ascending bars — growth, economics. */
function CoverGrowth() {
  const heights = [30, 46, 38, 58, 50, 70, 62, 84];
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#EFE3CE" />
      {heights.map((h, i) => (
        <rect
          key={i}
          x={24 + i * 34}
          y={330 - h}
          width="20"
          height={h}
          fill={i === heights.length - 1 ? RUST : INK}
          opacity={i === heights.length - 1 ? 1 : 0.8}
        />
      ))}
      <line x1="16" y1="330" x2="304" y2="330" stroke={INK} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

/** Concentric radiating arcs — unity, geopolitics. */
function CoverUnity() {
  const radii = [40, 80, 120, 160, 200];
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#E7DEC8" />
      {radii.map((r, i) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke={INK} strokeWidth="1.2" opacity={0.5 - i * 0.07} />
      ))}
      <circle cx="60" cy="60" r="10" fill={RUST} />
    </svg>
  );
}

/** Node grid connected by thin lines — technology, business. */
function CoverNetwork() {
  const nodes: [number, number][] = [
    [40, 60], [140, 40], [250, 90], [70, 160], [190, 180],
    [290, 200], [50, 280], [170, 300], [270, 330],
  ];
  const edges: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [3, 6], [6, 7], [7, 8], [1, 4]];
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#EAE1CB" />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={INK}
          strokeWidth="1"
          opacity="0.4"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 8 ? 6 : 4} fill={i === 8 ? RUST : INK} opacity={i === 8 ? 1 : 0.75} />
      ))}
    </svg>
  );
}

/** Converging diagonal lines — infrastructure, highways. */
function CoverRoutes() {
  const lines = [-40, 0, 40, 80, 120, 160, 200];
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#E9DCC3" />
      {lines.map((offset, i) => (
        <line
          key={offset}
          x1={160}
          y1={40}
          x2={-60 + offset * 2.6}
          y2={400}
          stroke={i === 3 ? RUST : INK}
          strokeWidth={i === 3 ? 2 : 1}
          opacity={i === 3 ? 0.9 : 0.28}
        />
      ))}
    </svg>
  );
}

/** Topographic contour lines — history, terrain. */
function CoverContours() {
  const rows = [90, 150, 210, 270, 330];
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#E4D9C4" />
      {rows.map((y, i) => (
        <path
          key={y}
          d={`M -20 ${y} Q 60 ${y - 26} 140 ${y} T 340 ${y}`}
          fill="none"
          stroke={i === 2 ? RUST : NAVY}
          strokeWidth={i === 2 ? 1.6 : 1}
          opacity={i === 2 ? 0.7 : 0.32}
        />
      ))}
    </svg>
  );
}

/** Rising flame-like wave — fire, transformation. */
function CoverFlame() {
  return (
    <svg viewBox="0 0 320 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="400" fill="#EFE0C5" />
      <path
        d="M -10 400 C 40 260 10 220 60 140 C 90 190 80 210 110 190 C 100 120 140 60 170 20 C 150 110 190 120 200 190 C 230 170 220 130 250 110 C 240 220 300 260 330 400 Z"
        fill={INK}
        opacity="0.14"
      />
      <path
        d="M 20 400 C 60 290 40 250 80 190 C 100 225 95 240 115 225 C 108 170 138 120 160 90 C 146 155 172 165 180 215 C 200 200 195 172 215 158 C 208 240 255 270 280 400 Z"
        fill={RUST}
        opacity="0.85"
      />
    </svg>
  );
}

export const EPISODE_COVERS: EpisodeCoverSpec[] = [
  { tag: "#Economics", tone: "#EFE3CE", render: CoverGrowth },
  { tag: "#Geopolitics", tone: "#E7DEC8", render: CoverUnity },
  { tag: "#Business", tone: "#EAE1CB", render: CoverNetwork },
  { tag: "#Infrastructure", tone: "#E9DCC3", render: CoverRoutes },
  { tag: "#History", tone: "#E4D9C4", render: CoverContours },
  { tag: "#History", tone: "#EFE0C5", render: CoverFlame },
];
