import { IMAGES } from '@/lib/images';
import { Eye } from 'lucide-react';

const CAPTIONS = [
  'THE KID — WATSON',
  'NETRUNNER — THE NET',
  'THE BOSS — PACIFICA',
  'THE GUNNER — JAPANTOWN',
  'THE FIXER — WATSON',
  'THE GHOST — CITY CENTER',
];

export default function Gallery() {
  return (
    <section id="gallery" className="relative px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center reveal-glitch">
          <div className="font-mono text-xs tracking-[0.4em] text-cyber-green">// VISUAL FEED</div>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
            STREETS OF <span className="text-cyber-cyan text-glow-cyan rgb-hover">NIGHT CITY</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-gray-400">
            Intercepted transmissions from the underbelly. No filters. No edits. Just the city as it breathes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {IMAGES.gallery.map((src, i) => (
            <div
              key={i}
              className="reveal-pop group relative aspect-[4/5] overflow-hidden clip-cyber border border-cyber-cyan/20 transition-all hover:border-cyber-cyan/60 scan-card"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <img
                src={src}
                alt={CAPTIONS[i] ?? `Night City frame ${i + 1}`}
                className="h-full w-full object-cover img-cyber transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-darker via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
              {/* Scanline overlay on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.08) 0px, transparent 2px, transparent 3px)' }}
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[10px] tracking-widest text-cyber-cyan opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Eye className="h-3 w-3 animate-blink" />
                {CAPTIONS[i] ?? `FRAME ${i + 1}`}
              </div>
              <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-cyber-cyan/60 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
