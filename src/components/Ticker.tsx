import { useEffect, useState } from 'react';
import { Rocket, Skull, TrendingUp } from 'lucide-react';

const TICKER_ITEMS = [
  { label: '$CYBER', value: '0.0420', change: '+420%' },
  { label: 'HOLDERS', value: '69,420', change: '+1,337' },
  { label: 'MARKET CAP', value: '$6.90M', change: 'WAGMI' },
  { label: 'LIQUIDITY', value: 'LOCKED', change: '100%' },
  { label: 'CYBERPSYCHO INDEX', value: 'CRITICAL', change: '!!!' },
  { label: 'NIGHT CITY TIME', value: '02:13 AM', change: 'RAIN' },
  { label: 'ARASAKA STOCK', value: '-69%', change: 'REKT' },
  { label: 'SAMURAI APPROVAL', value: '100%', change: 'V' },
];

export default function Ticker() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative overflow-hidden border-y border-cyber-cyan/30 bg-cyber-dark/70 py-2 border-flicker">
      <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 font-mono text-xs">
            <span className="text-cyber-cyan">{it.label}</span>
            <span className="text-gray-200">{it.value}</span>
            <span
              className={
                it.change.startsWith('-')
                  ? 'text-cyber-red'
                  : 'text-cyber-green'
              }
            >
              {it.change}
            </span>
            <span className="text-cyber-magenta">◆</span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-2 font-mono text-xs text-cyber-yellow md:flex">
        <Skull className="h-4 w-4" />
        NIGHT CITY LIVE — {time.toLocaleTimeString()}
      </div>
    </div>
  );
}

export function MiniStats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { icon: Rocket, label: 'LAUNCH', val: 'LIVE', color: 'text-cyber-green' },
        { icon: TrendingUp, label: '24H VOL', val: '$4.20M', color: 'text-cyber-cyan' },
        { icon: Skull, label: 'REKT COUNT', val: '6,942', color: 'text-cyber-magenta' },
        { icon: Rocket, label: 'TO THE MOON', val: 'CONFIRMED', color: 'text-cyber-yellow' },
      ].map((s, i) => (
        <div key={i} className="reveal-pop clip-cyber-sm scan-card border border-cyber-cyan/30 bg-cyber-panel/60 p-3 text-center transition-all hover:border-cyber-cyan/60" style={{ transitionDelay: `${i * 60}ms` }}>
          <s.icon className={`mx-auto mb-1 h-5 w-5 ${s.color}`} />
          <div className="font-mono text-[10px] tracking-widest text-gray-400">{s.label}</div>
          <div className={`font-display text-sm font-bold ${s.color}`}>{s.val}</div>
        </div>
      ))}
    </div>
  );
}
