import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Single global Lenis instance — created once, shared across the app.
let lenisInstance: Lenis | null = null;

/**
 * Global smooth-scroll engine.
 *
 * Lenis is used ONLY for light wheel interpolation — a subtle iOS-style settle
 * when scrolling stops. It is intentionally NOT a heavy inertia layer: duration
 * is short and the easing snaps in quickly so wheel input feels immediate.
 *
 * Integration: Lenis drives the real scroll position (no transform wrapper, so
 * position:sticky keeps working), and we pipe its scroll event into
 * ScrollTrigger.update so GSAP stays in sync. Lenis's own rAF is driven by the
 * gsap ticker to keep a single clock for all motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (lenisInstance) return;

    const lenis = new Lenis({
      duration: 0.85,
      // easeOutCubic — settles fast, leaves only a hint of glide
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true,
    });
    lenisInstance = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Intercept in-page anchor clicks so Lenis handles the smooth scroll
    // instead of the browser's instant jump.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as Element | null)?.closest?.('a') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href[0] !== '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.1 });
    };
    document.addEventListener('click', onClick, { passive: false });

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
