import { useEffect } from 'react';

// Adds `.in` class to every `.reveal`, `.reveal-pop`, `.reveal-left`, `.reveal-right`,
// `.reveal-glitch` element when it scrolls into view.
export function useScrollReveal() {
  useEffect(() => {
    const selectors = ['.reveal', '.reveal-pop', '.reveal-left', '.reveal-right', '.reveal-glitch'];
    const els = Array.from(document.querySelectorAll<HTMLElement>(selectors.join(', ')));
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
