import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Skull, Zap } from 'lucide-react';
import { useHeroTimeline, HERO_TIMINGS } from '@/lib/heroTimeline';

const VIDEO_SRC =
  "https://cdn-cf-east.streamable.com/video/mp4/0irt4d.mp4?Expires=1785296811493&Key-Pair-Id=APKAIEYUVEN4EVB2OKEQ&Signature=if2iiOf5c1oUM-VqxXgH4oFnmxMtb3VozqDGQave~KX5N9XTBiTzJImgsOQ19qB8VJQ87CtirW3rghB0340QzSTRt6MLbmU~icZVYnV6Nx1hyTGrZU9jicEMZqv6N6Hj~dgFnru-wgemGCAPqfZIZL32XwPp3LdYqw4mK0LCP7DV9acELOeZxSEwXjPtjcr-8fjSxg4sLUVkbAdxH8C2wdS31XwJmqAAo3i02IfhFTuGCU0Xw6RZt0EwBumPL6AkhatK~y0c8R1qgIVD-d1hM9p76~MnwXsYdBYMWJTStB7pR9pO6JQYTNEbYyOs7-Rb33ySZDFn3Dgno3Nlfl8PnQ__";

const ROTATING_WORDS = ['CYBERPSYCHO', 'SAMURAI', 'EDGERUNNER', 'NIGHT CITY', 'WAKE UP'];

export default function Hero({ booted = true }: { booted?: boolean }) {
  const [idx, setIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { registerVideo, showLogo, showTagline, showButtons, showContract, showScroll, lucyPulse, idle } = useHeroTimeline();

  useEffect(() => {
    registerVideo(videoRef.current);
  }, [registerVideo]);

  // Hold the video at the first frame until the loading screen has dismissed,
  // then start it from frame 0. The HeroTimeline continues to read
  // video.currentTime exactly as before.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!booted) {
      v.pause();
      try { v.currentTime = 0; } catch { /* not yet loaded */ }
    } else {
      try { v.currentTime = 0; } catch { /* not yet loaded */ }
      v.play().catch(() => {});
    }
  }, [booted]);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ROTATING_WORDS.length), 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Shared transition for the cinematic reveals.
  const revealTransition = 'opacity 600ms cubic-bezier(0.215,0.61,0.355,1), transform 600ms cubic-bezier(0.215,0.61,0.355,1), filter 600ms cubic-bezier(0.215,0.61,0.355,1)';

  return (
    <section id="top" className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-24">
      {/* Background video */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          loop
          muted
          playsInline
          preload="auto"
          style={{ filter: 'contrast(1.1) saturate(1.2) brightness(0.7)' }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-darker/60 via-cyber-darker/30 to-cyber-darker" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-magenta/10 via-transparent to-cyber-cyan/10" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        {/* Warning badge — reveals with the logo block at 2.7s */}
        <div
         className={`mb-8 inline-flex items-center gap-2 border border-cyber-yellow/50 bg-cyber-yellow/10 px-4 py-1.5 font-mono text-[11px] tracking-widest text-cyber-yellow backdrop-blur-sm ${
  showLogo ? "animate-flicker" : ""
}`}
          style={{
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'translateY(0)' : 'translateY(24px)',
            filter: showLogo ? 'blur(0px)' : 'blur(10px)',
            transition: revealTransition,
          }}
        >
          <Skull className="h-4 w-4 animate-shake" />
          WARNING: CYBERPSYCHO RISK LEVEL — CRITICAL
        </div>

        {/* Title — cinematic fade/rise/blur/scale at 2.7s, subtle Lucy glitch at 4.8s */}
        <h1
          className={`font-display text-5xl font-black leading-none tracking-tighter text-white sm:text-7xl md:text-8xl ${lucyPulse ? 'hero-lucy-pulse' : ''} ${idle ? 'hero-glow-breathe' : ''}`}
          style={{
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'translateY(0) scale(1)' : 'translateY(24px) scale(1.03)',
            filter: showLogo ? 'blur(0px)' : 'blur(10px)',
            transition: revealTransition,
          }}
        >
          <span className="glitch-text rgb-hover text-glow-yellow" data-text="CYBER">CYBER</span>
          <span className="text-cyber-magenta text-glow-magenta rgb-hover">COIN</span>
        </h1>

        {/* Rotating subtitle — fades in at 3.1s */}
        <div className="mt-6 h-10 overflow-hidden">
          <div
            className="font-display text-xl font-bold tracking-[0.3em] text-cyber-cyan text-glow-cyan"
            style={{
              opacity: showTagline ? 1 : 0,
              transform: showTagline ? 'translateY(0)' : 'translateY(18px)',
              transition: 'opacity 500ms cubic-bezier(0.215,0.61,0.355,1) 100ms, transform 500ms cubic-bezier(0.215,0.61,0.355,1) 100ms',
            }}
          >
            <span key={idx} className="animate-rise inline-block type-cursor">// {ROTATING_WORDS[idx]}</span>
          </div>
        </div>

        {/* CTAs — reveal together at 3.3s */}
        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 450ms cubic-bezier(0.215,0.61,0.355,1), transform 450ms cubic-bezier(0.215,0.61,0.355,1)',
          }}
        >
          <a
            href="#buy"
            className="clip-cyber group relative flex items-center gap-1.5 bg-cyber-yellow px-5 py-2.5 font-display text-xs font-bold tracking-widest text-cyber-dark transition-all hover:bg-cyber-cyan hover:animate-shake box-glow-yellow"
          >
            <Zap className="h-3.5 w-3.5 fill-cyber-dark" />
            BUY $CYBER NOW
          </a>
          <a
            href="#about"
            className="clip-cyber flex items-center gap-1.5 border border-cyber-cyan/50 bg-cyber-panel/40 px-5 py-2.5 font-display text-xs font-bold tracking-widest text-cyber-cyan backdrop-blur-sm transition-all hover:bg-cyber-cyan/10 hover:animate-neon-pulse"
          >
            READ THE DOSSIER
          </a>
        </div>

        {/* Contract address — fades in at 3.5s */}
        <div
          className="mx-auto mt-8 max-w-md"
          style={{
            opacity: showContract ? 1 : 0,
            transform: showContract ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 400ms cubic-bezier(0.215,0.61,0.355,1), transform 400ms cubic-bezier(0.215,0.61,0.355,1)',
          }}
        >
          <div className="font-mono text-[10px] tracking-widest text-gray-500">CONTRACT ADDRESS</div>
          <div className="mt-1 truncate border border-cyber-magenta/30 bg-cyber-dark/60 px-3 py-2 font-mono text-xs text-cyber-magenta backdrop-blur-sm animate-neon-pulse">
            0xCH00M...wAk3UpS4muR4i...d34d
          </div>
        </div>

        {/* Scroll cue — slow fade in at 3.9s */}
        <div
          className="mt-14 flex flex-col items-center gap-1 text-cyber-cyan/60"
          style={{
            opacity: showScroll ? 1 : 0,
            transition: 'opacity 800ms ease-out',
          }}
        >
          <span className="font-mono text-[10px] tracking-widest animate-blink">SCROLL TO JACK IN</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </div>

      {/* Soft floating particles — only in idle state */}
      {idle && (
        <div className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
          {[
            { left: '12%', top: '30%', delay: '0s', dur: '7s', size: 3 },
            { left: '78%', top: '22%', delay: '1.4s', dur: '9s', size: 2 },
            { left: '38%', top: '70%', delay: '0.8s', dur: '8s', size: 3 },
            { left: '88%', top: '60%', delay: '2.2s', dur: '10s', size: 2 },
            { left: '22%', top: '55%', delay: '3.1s', dur: '7.5s', size: 2 },
          ].map((p, i) => (
            <span
              key={i}
              className="hero-particle absolute rounded-full bg-cyber-cyan"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animation: `hero-float ${p.dur} ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
