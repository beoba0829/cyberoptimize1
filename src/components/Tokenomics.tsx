import { useEffect, useRef, useState } from 'react';
import { Flame, Users, Lock, Skull } from 'lucide-react';
import TokenomicsBackground from './TokenomicsBackground';

const STATS = [
  { label: 'TOTAL SUPPLY', value: 69420, suffix: 'T', color: 'text-cyber-cyan', desc: '69,420 trillion $CYBER. Because of course.' },
  { label: 'BURNED', value: 42, suffix: '%', color: 'text-cyber-magenta', desc: 'Tossed into the incinerator. Forever flatlined.' },
  { label: 'LIQUIDITY', value: 95, suffix: '%', color: 'text-cyber-green', desc: 'Locked for 69 years. Arasaka can\'t even touch it.' },
  { label: 'MARKETING', value: 4, suffix: '%', color: 'text-cyber-yellow', desc: 'Funds the bounty board. Pay the streets.' },
];

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(eased * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="font-display text-4xl font-black sm:text-5xl">
      {val.toLocaleString()}
      <span className="text-2xl">{suffix}</span>
    </span>
  );
}

export default function Tokenomics() {
  return (
    <section id="tokenomics" className="relative overflow-hidden px-5 pt-24 pb-60">
      <div data-depth="background"><TokenomicsBackground /></div>
      <div data-depth="content" className="relative z-10 mx-auto max-w-6xl">
        <div data-depth="decorative" className="mb-14 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-cyan animate-flicker">// THE NUMBERS</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            <span className="text-glow-magenta text-cyber-magenta rgb-hover">TOKENOMICS</span> 2.0
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
            Math so clean it'd make a netrunner weep. Every number means something. Probably.
          </p>
        </div>

        <div data-depth="decorative" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className="reveal-pop clip-cyber scan-card holo-card border border-cyber-cyan/20 bg-cyber-panel/60 p-6 text-center transition-all hover:border-cyber-cyan/50" style={{ transitionDelay: `${i * 80}ms` }}>
              <CountUp end={s.value} suffix={s.suffix} />
              <div className={`mt-2 font-mono text-xs tracking-widest ${s.color}`}>{s.label}</div>
              <p className="mt-3 font-body text-sm leading-relaxed text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Tax breakdown bar */}
        <div data-depth="content" className="reveal-pop mt-12 clip-cyber scan-card border border-cyber-magenta/30 bg-cyber-dark/60 p-6 box-glow-magenta">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold tracking-wide text-cyber-magenta">
              <Flame className="mr-2 inline h-5 w-5" /> TRANSACTION TAX — 6.9%
            </h3>
            <span className="font-mono text-xs text-gray-500">AUTO-APPLIED ON EVERY SWAP</span>
          </div>
          <div className="flex h-8 w-full overflow-hidden rounded-sm border border-cyber-cyan/20">
            <div className="flex items-center justify-center bg-cyber-magenta/70 text-[10px] font-bold text-white" style={{ width: '50%' }}>
              BURN 3.45%
            </div>
            <div className="flex items-center justify-center bg-cyber-yellow/70 text-[10px] font-bold text-cyber-dark" style={{ width: '28%' }}>
              LP 1.93%
            </div>
            <div className="flex items-center justify-center bg-cyber-cyan/70 text-[10px] font-bold text-cyber-dark" style={{ width: '15%' }}>
              MKT 1.04%
            </div>
            <div className="flex items-center justify-center bg-cyber-green/70 text-[10px] font-bold text-cyber-dark" style={{ width: '7%' }}>
              .48%
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
            <div className="flex items-center gap-2 text-gray-300"><Skull className="h-4 w-4 text-cyber-magenta" /> BURN VAULT</div>
            <div className="flex items-center gap-2 text-gray-300"><Lock className="h-4 w-4 text-cyber-yellow" /> LIQUIDITY POOL</div>
            <div className="flex items-center gap-2 text-gray-300"><Flame className="h-4 w-4 text-cyber-cyan" /> MARKETING</div>
            <div className="flex items-center gap-2 text-gray-300"><Users className="h-4 w-4 text-cyber-green" /> HOLDERS AIRDROP</div>
          </div>
        </div>
      </div>
    </section>
  );
}
