import { useMemo } from 'react';

/* ──────────────────────────────────────────────────────────────────────
   TokenomicsBackground — a living blockchain OS ambient layer.
   Sits absolutely behind the section content. Pure CSS transforms/opacity.
   ────────────────────────────────────────────────────────────────────── */

const AURORA = [
  { left: '8%', top: '12%', size: 680, color: 'rgba(0,240,255,0.10)', dur: 38, delay: 0 },
  { left: '72%', top: '20%', size: 620, color: 'rgba(120,80,255,0.10)', dur: 46, delay: -8 },
  { left: '40%', top: '68%', size: 700, color: 'rgba(0,160,255,0.09)', dur: 52, delay: -16 },
  { left: '85%', top: '72%', size: 540, color: 'rgba(140,60,255,0.08)', dur: 42, delay: -22 },
  { left: '20%', top: '55%', size: 500, color: 'rgba(0,200,255,0.07)', dur: 48, delay: -4 },
];

const FLOAT_TEXT = [
  '95%', 'BURN', 'LP LOCKED', 'TOKEN', '0xAF23...', 'BLOCK', 'CONFIRMED',
  '69420T', 'AUTO', 'SYNC', '0x4F1B...', 'HASH', 'VERIFY', 'CHAIN',
  'GAS 12', 'MINT', '0xC9D2...', 'AUDIT', 'RENOUNCED', 'LOCK 69Y',
  '0x77E0...', 'NODE', 'PEER', 'RELAY', '0xB3A8...', 'SIGNED',
];

const PANEL_LINES = [
  ['SYNC STATUS', 'OK', 'NODES ONLINE', '12 / 12'],
  ['GAS PRICE', '12 GWEI', 'BLOCK', '#18,942,069'],
  ['BURN RATE', '3.45%', 'EPOCH', '2077'],
  ['LIQUIDITY', 'LOCKED', 'DURATION', '69 YEARS'],
  ['CONTRACT', 'RENOUNCED', 'AUDIT', 'PASSED'],
  ['HOLDERS', '69,420', 'NET HASH', '420 TH/s'],
];

export default function TokenomicsBackground() {
  const dataLines = useMemo(() => makeDataLines(42), []);
  const nodes = useMemo(() => makeNodes(22), []);
  const connections = useMemo(() => makeConnections(nodes, 28), []);
  const pulses = useMemo(() => makePulses(connections, 14), []);
  const floaters = useMemo(() => makeFloaters(FLOAT_TEXT, 22), []);
  const panels = useMemo(() => makePanels(PANEL_LINES, 5), []);
  const scans = useMemo(() => makeScans(8), []);

  return (
    <div className="tokenomics-bg" aria-hidden>
      {/* Aurora — huge slow blurred gradients for depth */}
      <div className="tb-aurora-layer">
        {AURORA.map((a, i) => (
          <div
            key={i}
            className="tb-aurora"
            style={{
              left: a.left,
              top: a.top,
              width: a.size,
              height: a.size,
              background: `radial-gradient(circle, ${a.color}, transparent 70%)`,
              animation: `tbAuroraDrift ${a.dur}s ease-in-out ${a.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Faint grid */}
      <div className="tb-grid" />

      {/* Data flow lines */}
      <div className="tb-data-lines">
        {dataLines.map((l, i) => (
          <div
            key={i}
            className="tb-data-line"
            style={{
              top: `${l.top}%`,
              left: l.left,
              width: l.width,
              transform: `rotate(${l.angle}deg)`,
              animation: `tbDataFlow ${l.dur}s linear ${l.delay}s infinite`,
              animationName: l.horizontal ? 'tbDataFlowH' : 'tbDataFlow',
            }}
          />
        ))}
      </div>

      {/* Blockchain network */}
      <svg className="tb-network" preserveAspectRatio="none">
        {connections.map((c, i) => {
          const a = nodes[c.from];
          const b = nodes[c.to];
          return (
            <line
              key={i}
              x1={`${a.x}%`} y1={`${a.y}%`}
              x2={`${b.x}%`} y2={`${b.y}%`}
              stroke="rgba(0,240,255,0.07)"
              strokeWidth={1}
            />
          );
        })}
        {pulses.map((p, i) => {
          const c = connections[p.conn];
          const a = nodes[c.from];
          const b = nodes[c.to];
          return (
            <circle
              key={i}
              r={2.5}
              fill="rgba(0,240,255,0.9)"
              style={{ animation: `tbPulseFlash ${p.flashDur}s ease-in-out ${p.delay}s infinite` }}
            >
              <animate
                attributeName="cx"
                from={`${a.x}%`} to={`${b.x}%`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                from={`${a.y}%`} to={`${b.y}%`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle
              cx={`${n.x}%`} cy={`${n.y}%`} r={2}
              fill="rgba(0,240,255,0.5)"
              style={{ animation: `tbNodePulse ${n.pulseDur}s ease-in-out ${n.pulseDelay}s infinite` }}
            />
          </g>
        ))}
      </svg>

      {/* Floating blockchain text */}
      <div className="tb-floaters">
        {floaters.map((f, i) => (
          <span
            key={i}
            className="tb-floater"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              fontSize: `${f.size}px`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* Holographic diagnostic panels */}
      <div className="tb-panels">
        {panels.map((p, i) => (
          <div
            key={i}
            className="tb-panel"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <div className="tb-panel-header">
              <span className="tb-panel-dot" />
              DIAGNOSTIC // {String(i + 1).padStart(2, '0')}
            </div>
            <div className="tb-panel-rows">
              {p.rows.map((r, j) => (
                <div key={j} className="tb-panel-row">
                  <span className="tb-panel-k">{r[0]}</span>
                  <span className="tb-panel-v">{r[1]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scan bars — horizontal, vertical, diagonal */}
      <div className="tb-scans">
        {scans.map((s, i) => (
          <div
            key={i}
            className={`tb-scan tb-scan-${s.dir}`}
            style={{
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              ...(s.dir === 'v' ? { left: `${s.pos}%` } : { top: `${s.pos}%` }),
            }}
          />
        ))}
      </div>

      <style>{`
@keyframes tbPulseFlash {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; filter: drop-shadow(0 0 4px rgba(0,240,255,0.8)); }
}
@keyframes tbNodePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; filter: drop-shadow(0 0 4px rgba(0,240,255,0.6)); }
}
`}</style>
    </div>
  );
}

/* ── Generators (run once via useMemo) ── */

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

interface DataLine {
  top: number; left: string; width: string; angle: number;
  dur: number; delay: number; horizontal: boolean;
}
function makeDataLines(n: number): DataLine[] {
  return Array.from({ length: n }, () => {
    const horizontal = Math.random() > 0.35;
    return {
      top: rnd(2, 98),
      left: `${rnd(-20, 60)}%`,
      width: `${rnd(80, 320)}px`,
      angle: horizontal ? 0 : rnd(-8, 8),
      dur: rnd(7, 18),
      delay: rnd(0, 12),
      horizontal,
    };
  });
}

interface Node { x: number; y: number; pulseDur: number; pulseDelay: number; }
function makeNodes(n: number): Node[] {
  return Array.from({ length: n }, () => ({
    x: rnd(4, 96),
    y: rnd(4, 96),
    pulseDur: rnd(2.5, 6),
    pulseDelay: rnd(0, 4),
  }));
}

interface Conn { from: number; to: number; }
function makeConnections(nodes: Node[], n: number): Conn[] {
  const out: Conn[] = [];
  for (let i = 0; i < n; i++) {
    const from = (Math.random() * nodes.length) | 0;
    let to = (Math.random() * nodes.length) | 0;
    if (to === from) to = (to + 1) % nodes.length;
    out.push({ from, to });
  }
  return out;
}

interface Pulse { conn: number; dur: number; delay: number; flashDur: number; }
function makePulses(conns: Conn[], n: number): Pulse[] {
  return Array.from({ length: n }, () => ({
    conn: (Math.random() * conns.length) | 0,
    dur: rnd(3, 8),
    delay: rnd(0, 8),
    flashDur: rnd(1.2, 2.4),
  }));
}

interface Floater {
  text: string; x: number; y: number; size: number; dur: number; delay: number;
}
function makeFloaters(words: string[], n: number): Floater[] {
  return Array.from({ length: n }, () => ({
    text: pick(words),
    x: rnd(2, 92),
    y: rnd(60, 105),
    size: rnd(10, 16),
    dur: rnd(18, 34),
    delay: rnd(0, 20),
  }));
}

interface Panel {
  x: number; y: number; dur: number; delay: number;
  rows: [string, string][];
}
function makePanels(lines: [string, string, string, string][], n: number): Panel[] {
  return Array.from({ length: n }, (_, i) => {
    const base = lines[i % lines.length];
    return {
      x: rnd(3, 78),
      y: rnd(8, 78),
      dur: rnd(9, 16),
      delay: rnd(0, 14),
      rows: [[base[0], base[1]], [base[2], base[3]]] as [string, string][],
    };
  });
}

interface Scan { dir: 'h' | 'v' | 'd'; pos: number; dur: number; delay: number; }
function makeScans(n: number): Scan[] {
  const dirs: Scan['dir'][] = ['h', 'v', 'd'];
  return Array.from({ length: n }, () => ({
    dir: pick(dirs),
    pos: rnd(10, 90),
    dur: rnd(6, 14),
    delay: rnd(0, 10),
  }));
}
