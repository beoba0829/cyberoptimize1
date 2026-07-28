import { useEffect, useRef, useState } from 'react';
import DecryptedText from "@/components/DecryptedText";
const MANIFESTO = [
  {
    line: 'REBELS',
    text: 'We don\'t follow trends.\nWe create them.',
  },
  {
    line: 'NO LIMITS',
    text: 'Built for the streets,\nnot the boardroom.',
  },
  {
    line: 'STAY ALIVE',
    text: 'The strongest communities\nnever stop running.',
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);


  // Slow parallax on the artwork tied to the section's position in the viewport.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh - rect.top) / (vh + rect.height);
        setOffset((progress - 0.5) * 80);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-cyber-darker px-6 pt-32 pb-16 sm:pt-40 sm:pb-20"
    >

      {/* faint horizon glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyber-magenta/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-cyber-cyan/5 blur-[120px]" />
      </div>

      {/* ── CRT signal-scanner glitch overlay (no DOM clone) ── */}


      <div className="mx-auto max-w-6xl">
        {/* Editorial two-column block */}
        <div className="grid items-center gap-16 lg:grid-cols-[55%_45%] lg:gap-20">
          {/* Text column */}
          <div>
            <div
              className="reveal font-mono text-xs tracking-[0.4em] text-cyber-magenta"
              style={{ transitionDelay: '0ms' }}
            >
              // THE DOSSIER
            </div>

<h2
  className="reveal mt-6 font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
  style={{ transitionDelay: "80ms" }}
>
  <DecryptedText
    speed={50}
    maxIterations={8}
    segments={[
      { text: "THE CITY\n" },
      { text: "NEVER", className: "text-cyber-yellow" },
      { text: " SLEEPS." },
    ]}
  />
</h2>

            <div
              className="reveal mt-10 max-w-md space-y-4 font-body text-lg leading-relaxed text-gray-400"
              style={{ transitionDelay: '320ms' }}
            >
              <p>The city never sleeps.</p>
              <p>Neither do dreamers.</p>
              <p>
                Every generation has its rebels. Every rebellion needs a
                symbol.
              </p>
              <p>
                <span className="text-cyber-cyan">CyberCoin</span> isn't trying
                to change the future.
              </p>
              <p className="text-gray-300">
                It belongs to the people already living in it.
              </p>
            </div>
          </div>

          {/* Artwork column — one cinematic image, slow parallax */}
          <div className="reveal-right relative" style={{ transitionDelay: '200ms' }}>
            <div
              ref={imgRef}
              className="relative aspect-[3/4] overflow-hidden"
              style={{ transform: `translateY(${offset}px)` }}
            >
             <video
  autoPlay
  muted
  loop
  playsInline
  className="h-full w-full object-cover"
  style={{
    filter: 'contrast(1.1) saturate(1.15) brightness(0.78)',
  }}
>
  <source
   src="https://cdn-cf-east.streamable.com/video/mp4/jb3r6e.mp4?Expires=1785420687364&Key-Pair-Id=APKAIEYUVEN4EVB2OKEQ&Signature=JroWPey04vwvKiPQbw3ZF1poMn3N8l7oa2adZMiO~55n48-3KTuSeuEh3KXft40e~U54ERdNPlsZkSFTVz5tlNJr42LTFIk7UwfW4Bi84X11~S0MDNwVgYGqwunvlZ6x-D5BKzgBIsrH4tHhvvdACf~kzlUS-q~YIGoVC1Lcbs73A012shw30HR8iCVZ5AQb87rssOMjREW4ipxYkG5cj6Epz5WvUG2oXprF0oDw6pyvLrX746tc92XCdkxtdPin0UORaMuKy1VVnDYUvDToZsthjqJ3-iW-t57K2O~NqGpdApHEFUORH0k~9TWU6yU55xYCRgT5WE5CceU5ZVBtcg__"
    type="video/mp4"
  />
</video>
              {/* cinematic grade */}
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-darker via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-darker/40 via-transparent to-cyber-magenta/10" />
              {/* thin neon edge */}
              <div className="absolute inset-0 border border-white/5" />
            </div>
            {/* caption */}
            <div className="mt-4 font-mono text-[10px] tracking-[0.3em] text-gray-600">
              NIGHT CITY — 23:59
            </div>
          </div>
        </div>

        {/* Manifesto blocks */}
        <div className="mt-20 grid gap-12 sm:grid-cols-3 sm:gap-8">
          {MANIFESTO.map((m, i) => (
            <div
              key={i}
              className="reveal"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="h-px w-10 bg-cyber-cyan/60" />
              <h3 className="mt-5 font-display text-sm font-bold tracking-[0.3em] text-cyber-cyan">
                {m.line}
              </h3>
              <p className="mt-3 whitespace-pre-line font-body text-base leading-relaxed text-gray-300">
                {m.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
