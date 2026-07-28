import { Twitter, Send, Github, Music2, Zap } from 'lucide-react';
import { getLenis } from '@/lib/useSmoothScroll';

const SOCIALS = [
  { icon: Twitter, label: 'X', href: 'https://x.com/' },
  { icon: Music2, label: 'TIKTOK', href: 'https://www.tiktok.com/' },
  { icon: Send, label: 'TELEGRAM', href: 'https://telegram.org/' },
  { icon: Github, label: 'GITHUB', href: 'https://github.com/' },
];

const FOOTER_BG = 'https://ik.imagekit.io/zznoau6lx/Cybercoin%20webp/6a1517ff337bf3da3718055203b67a40.webp';

export default function Footer() {
  return (
    <footer
      className="sticky bottom-0 overflow-hidden px-5 py-16"
      style={{
        backgroundColor: '#050507',
        backgroundImage: `url(${FOOTER_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }}
    >
      {/* Dark overlay — keeps text perfectly readable while the image stays cinematic */}
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundColor: 'rgba(5, 5, 7, 0.72)' }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-cyber-darker/60 via-transparent to-cyber-darker" />
      <div className="mx-auto max-w-5xl">
        {/* CTA */}
        <div className="reveal-glitch mb-12 text-center">
          <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-5xl">
            THE STREET IS <span className="text-cyber-yellow text-glow-yellow rgb-hover">WATCHING</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-lg text-gray-400">
            Jack in or get left in the rain. Night City waits for no one, cyber.
          </p>
          <a
            href="#buy"
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById('buy');
              if (!target) return;
              const lenis = getLenis();
              if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.1 });
              else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="clip-cyber mt-6 inline-flex items-center gap-2 bg-cyber-yellow px-8 py-4 font-display text-sm font-bold tracking-widest text-cyber-dark transition-all hover:bg-cyber-cyan hover:animate-shake box-glow-yellow"
          >
            <Zap className="h-5 w-5 fill-cyber-dark animate-flicker" />
            BUY $CYBER NOW
          </a>
        </div>

        {/* Socials */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
          {SOCIALS.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="reveal-pop clip-cyber-sm flex h-12 w-12 items-center justify-center border border-cyber-cyan/30 bg-cyber-panel text-cyber-cyan transition-all hover:bg-cyber-cyan/10 hover:box-glow-cyan scan-card"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <s.icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mx-auto max-w-3xl border-t border-cyber-cyan/10 pt-8 text-center">
          <p className="font-mono text-xs leading-relaxed text-gray-500">
            $CYBER is a meme coin with no intrinsic value, no expectation of profit, and no utility.
            This is not financial advice. Crypto is volatile and you may lose everything.
            Nothing here is affiliated with, endorsed by, or connected to CD Projekt Red, Studio Trigger,
            or the Cyberpunk franchise. We're just cybers who love the vibe. DYOR. Stay chrome.
          </p>
          <div className="mt-6 font-display text-sm font-bold tracking-widest text-cyber-yellow animate-flicker">
            $CYBER © 2077 — NIGHT CITY
          </div>
        </div>
      </div>
    </footer>
  );
}
