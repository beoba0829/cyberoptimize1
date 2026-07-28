import { useMemo } from 'react';

/* ──────────────────────────────────────────────────────────────────────
   HowToBuyBackground — Arasaka/Militech acquisition-terminal ambient layer.
   Sits absolutely behind the section content. Pure CSS transforms/opacity.
   ────────────────────────────────────────────────────────────────────── */

const AURORA = [
  { left: '5%', top: '15%', size: 640, color: 'rgba(0,240,255,0.10)', dur: 40, delay: 0 },
  { left: '70%', top: '18%', size: 600, color: 'rgba(255,0,168,0.09)', dur: 46, delay: -8 },
  { left: '38%', top: '60%', size: 660, color: 'rgba(0,160,255,0.08)', dur: 52, delay: -16 },
  { left: '88%', top: '70%', size: 520, color: 'rgba(255,0,168,0.07)', dur: 42, delay: -22 },
  { left: '18%', top: '72%', size: 480, color: 'rgba(0,200,255,0.06)', dur: 48, delay: -4 },
];

const BINARY = [
  '0x4F1B', '11010101', '0xAF23', 'SYNC', 'NET-77', 'AUTH',
  '10110010', '0xC9D2', 'RELAY', '01001110', '0x77E0', 'LINK',
  'CONNECT', '11100011', '0xB3A8', 'VERIFY', '01010100', 'HANDSHAKE',
  '0xD4E9', 'PING', '10011100', '0xE8F1', 'SIGNED', '01101011',
];

const SCAN_LABELS = [
  { text: 'CHANNEL SECURE', x: 6, y: 12, blink: true },
  { text: 'AUTH OK', x: 90, y: 16, blink: false },
  { text: 'NODE LISTENING', x: 8, y: 48, blink: false },
  { text: 'RELAY ACTIVE', x: 92, y: 52, blink: true },
  { text: 'ENCRYPTED', x: 12, y: 88, blink: false },
  { text: 'HANDSHAKE', x: 88, y: 90, blink: true },
];

interface Hexagon { x: number; y: number; dur: number; delay: number; }
interface Particle { x: number; y: number; size: number; dur: number; delay: number; }
interface ScanLine { top: number; dur: number; delay: number; }
interface BinLine { x: number; y: number; dur: number; delay: number; text: string; }
interface FloatText { x: number; y: number; text: string; dur: number; delay: number; }

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

export default function HowToBuyBackground() {
  const hexagons = useMemo<Hexagon[]>(
    () => Array.from({ length: 14 }, () => ({
      x: rnd(4, 96), y: rnd(6, 94), dur: rnd(7, 14), delay: rnd(0, 8),
    })),
    [],
  );
  const particles = useMemo<Particle[]>(
    () => Array.from({ length: 16 }, () => ({
      x: rnd(4, 96), y: rnd(4, 96), size: rnd(1.5, 3), dur: rnd(6, 13), delay: rnd(0, 7),
    })),
    [],
  );
  const scans = useMemo<ScanLine[]>(
    () => Array.from({ length: 6 }, () => ({ top: rnd(4, 96), dur: rnd(8, 15), delay: rnd(0, 10) })),
    [],
  );
  const bins = useMemo<BinLine[]>(
    () => Array.from({ length: 18 }, () => ({
      x: rnd(2, 94), y: rnd(2, 98), dur: rnd(6, 14), delay: rnd(0, 12), text: pick(BINARY),
    })),
    [],
  );
  const floaters = useMemo<FloatText[]>(
    () => Array.from({ length: 14 }, () => ({
      x: rnd(2, 90), y: rnd(55, 105), text: pick(BINARY), dur: rnd(20, 36), delay: rnd(0, 22),
    })),
    [],
  );

  return (
    <div className="howto-bg" aria-hidden>
      {/* Aurora — slow drifting fog */}
      <div className="hb-aurora-layer">
        {AURORA.map((a, i) => (
          <div
            key={i}
            className="hb-aurora"
            style={{
              left: a.left,
              top: a.top,
              width: a.size,
              height: a.size,
              background: `radial-gradient(circle, ${a.color}, transparent 70%)`,
              animation: `hbAuroraDrift ${a.dur}s ease-in-out ${a.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Animated grid */}
      <div className="hb-grid" />

      {/* Hexagon lattice */}
      <div className="hb-hexagons">
        {hexagons.map((h, i) => (
          <span
            key={i}
            className="hb-hex"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              animationDuration: `${h.dur}s`,
              animationDelay: `${h.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Binary streams */}
      <div className="hb-binary">
        {bins.map((b, i) => (
          <span
            key={i}
            className="hb-bin"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          >
            {b.text}
          </span>
        ))}
      </div>

      {/* Rising floating text */}
      <div className="hb-floaters">
        {floaters.map((f, i) => (
          <span
            key={i}
            className="hb-floater"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            }}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* Digital particles */}
      <div className="hb-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            className="hb-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Horizontal scanlines */}
      <div className="hb-scans">
        {scans.map((s, i) => (
          <div
            key={i}
            className="hb-scan"
            style={{ top: `${s.top}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>

      {/* Floating status labels */}
      <div className="hb-labels">
        {SCAN_LABELS.map((s, i) => (
          <span
            key={i}
            className={`hb-label ${s.blink ? 'hb-label-blink' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.4}s` }}
          >
            {s.text}
          </span>
        ))}
      </div>

      {/* Noise texture */}
      <div className="hb-noise" aria-hidden />

      <style>{`
@keyframes hbAuroraDrift {
  0%   { transform: translate(0,0) scale(1); opacity: 0.5; }
  50%  { transform: translate(40px,-30px) scale(1.15); opacity: 0.85; }
  100% { transform: translate(-30px,20px) scale(0.95); opacity: 0.55; }
}
@keyframes hbGridDrift {
  0%   { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}
@keyframes hbHexPulse {
  0%, 100% { opacity: 0.08; transform: rotate(0deg) scale(1); }
  50%      { opacity: 0.22; transform: rotate(180deg) scale(1.15); }
}
@keyframes hbBinFlicker {
  0%, 100% { opacity: 0; }
  20%      { opacity: 0.18; }
  50%      { opacity: 0.28; }
  80%      { opacity: 0.12; }
}
@keyframes hbFloaterRise {
  0%   { transform: translateY(0); opacity: 0; }
  10%  { opacity: 0.08; }
  90%  { opacity: 0.08; }
  100% { transform: translateY(-120vh); opacity: 0; }
}
@keyframes hbParticleFloat {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  50%      { transform: translateY(-22px) translateX(8px); opacity: 0.7; }
}
@keyframes hbScanSweep {
  0%   { transform: translateX(-100%); opacity: 0; }
  10%  { opacity: 0.5; } 90% { opacity: 0.5; }
  100% { transform: translateX(100%); opacity: 0; }
}
@keyframes hbLabelBlink {
  0%, 48% { opacity: 0.4; }
  50%, 100% { opacity: 0.12; }
}

.howto-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }

.hb-aurora-layer { position: absolute; inset: 0; }
.hb-aurora { position: absolute; border-radius: 50%; filter: blur(80px); will-change: transform, opacity; }

.hb-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 25%, transparent 80%);
  animation: hbGridDrift 40s linear infinite;
}

.hb-hexagons { position: absolute; inset: 0; }
.hb-hex {
  position: absolute; width: 26px; height: 30px;
  background: rgba(0,240,255,0.06);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  border: 1px solid rgba(0,240,255,0.12);
  animation: hbHexPulse 10s ease-in-out infinite;
  will-change: transform, opacity;
}

.hb-binary { position: absolute; inset: 0; }
.hb-bin {
  position: absolute;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px; letter-spacing: 0.12em;
  color: rgba(0,240,255,0.22);
  animation: hbBinFlicker 7s ease-in-out infinite;
  will-change: opacity;
}

.hb-floaters { position: absolute; inset: 0; }
.hb-floater {
  position: absolute;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px; letter-spacing: 0.15em;
  color: rgba(0,240,255,0.06);
  white-space: nowrap; filter: blur(0.5px);
  animation-name: hbFloaterRise;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
}

.hb-particles { position: absolute; inset: 0; }
.hb-particle {
  position: absolute; border-radius: 50%;
  background: rgba(0,240,255,0.5);
  box-shadow: 0 0 6px rgba(0,240,255,0.5);
  animation: hbParticleFloat 9s ease-in-out infinite;
  will-change: transform, opacity;
}

.hb-scans { position: absolute; inset: 0; }
.hb-scan {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.2), transparent);
  animation: hbScanSweep 11s ease-in-out infinite;
  will-change: transform, opacity;
}

.hb-labels { position: absolute; inset: 0; }
.hb-label {
  position: absolute;
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px; letter-spacing: 0.28em;
  color: rgba(0,240,255,0.35);
  animation: hbLabelBlink 2.4s steps(1) infinite;
}
.hb-label-blink { animation: hbLabelBlink 1.6s steps(1) infinite; }

.hb-noise {
  position: absolute; inset: 0; opacity: 0.04; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

@media (prefers-reduced-motion: reduce) {
  .howto-bg *, .howto-bg *::before, .howto-bg *::after {
    animation: none !important;
  }
}
`}</style>
    </div>
  );
}
