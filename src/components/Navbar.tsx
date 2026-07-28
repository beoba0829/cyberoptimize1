import { useEffect, useState } from 'react';
import { Menu, X, Zap } from 'lucide-react';
import { useHeroTimeline } from '@/lib/heroTimeline';

const LINKS = [
  { label: 'LORE', href: '#about' },
  { label: 'LEGEND', href: '#crew' },
  { label: 'TOKENOMICS', href: '#tokenomics' },
  { label: 'PSYCHO METER', href: '#meter' },
  { label: 'ROADMAP', href: '#roadmap' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { showNavbar: revealed } = useHeroTimeline();
  // Once the cinematic reveal has played, let scroll-based styling take over.
  const showSolid = revealed && scrolled;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[opacity,transform,background-color,border-color] duration-500 ${
        showSolid ? 'bg-cyber-dark/80 backdrop-blur-md border-b border-cyber-cyan/30' : 'bg-transparent'
      }`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(-16px)',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-black tracking-widest text-cyber-yellow text-glow-yellow rgb-hover">
          <Zap className="h-6 w-6 fill-cyber-yellow animate-flicker" />
          $CYBER
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs tracking-widest text-gray-300 transition-colors hover:text-cyber-cyan hover:text-glow-cyan"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#buy"
            className="clip-cyber-sm bg-cyber-yellow px-5 py-2 font-display text-xs font-bold tracking-widest text-cyber-dark transition-all hover:bg-cyber-cyan hover:text-cyber-dark hover:animate-shake box-glow-yellow"
          >
            BUY NOW
          </a>
        </div>

        <button
          className="text-cyber-cyan md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-cyber-cyan/20 bg-cyber-dark/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono text-sm tracking-widest text-gray-300 hover:text-cyber-cyan"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#buy"
              onClick={() => setOpen(false)}
              className="clip-cyber-sm bg-cyber-yellow px-5 py-2 text-center font-display text-xs font-bold tracking-widest text-cyber-dark"
            >
              BUY NOW
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
