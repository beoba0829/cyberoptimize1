import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Crew Database — one-time hologram materialization.
 *
 * Fires once when the Crew section first enters the viewport (~15-20%).
 * Projects the visible stage and header like a holographic record:
 *   1. The pinned 3D stage materializes (opacity / y / scale / blur /
 *      brightness + subtle cyan glow in the first 300ms + a single
 *      horizontal scanline sweep + a tiny <80ms RGB split glitch).
 *   2. "// CREW DATABASE" label resolves.
 *   3. "LEGENDS NEVER DIE." title resolves.
 *   4. Italic tagline + decorative divider resolve.
 *   5. Control returns to the existing camera-driven experience.
 *
 * Only opacity / transform / filter / box-shadow are written, and only on
 * the stage wrapper and header pieces — never on the scene roots the camera
 * engine owns. Existing depth reveal, hover, idle, particles and background
 * effects are untouched. Total run ~1.0-1.2s.
 */
export function useCrewBoot(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const label = root.querySelector<HTMLElement>('.crew-boot-label');
      const title = root.querySelector<HTMLElement>('.crew-boot-title');
      const subtitle = root.querySelector<HTMLElement>('.crew-boot-subtitle');
      const divider = root.querySelector<HTMLElement>('.crew-boot-divider');
      const stage = root.querySelector<HTMLElement>('.crew-boot-stage');

      if (reduce) {
        gsap.set([label, title, subtitle, divider, stage],
          { opacity: 1, y: 0, scale: 1, filter: 'none', scaleX: 1, x: 0 });
        return;
      }

      // ── Initial hidden states ────────────────────────────────────────
      gsap.set([label, title, subtitle],
        { opacity: 0, y: 20, filter: 'blur(8px) brightness(0.6)' });
      gsap.set(divider, { opacity: 0, scaleX: 0, transformOrigin: 'center center' });
      gsap.set(stage, { opacity: 0, y: 20, scale: 0.98, filter: 'blur(10px) brightness(0.6)' });

      // One-shot scanline overlay appended to the stage (absolute, no layout).
      const scanline = document.createElement('div');
      scanline.style.cssText =
        'position:absolute;left:0;right:0;top:0;height:14px;z-index:50;pointer-events:none;' +
        'background:linear-gradient(180deg, transparent, rgba(0,240,255,0.55), transparent);' +
        'box-shadow:0 0 18px rgba(0,240,255,0.5);opacity:0;will-change:transform,opacity;';
      stage?.appendChild(scanline);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
        onComplete: () => scanline.remove(),
      });

      // 1. CREW STAGE (visible 3D viewport) materializes.
      tl.to(stage, {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px) brightness(1)',
          duration: 0.6, ease: 'power2.out',
        })
        // Subtle cyan glow during the first ~300ms.
        .fromTo(stage, { boxShadow: '0 0 0 rgba(0,240,255,0)' },
          { boxShadow: '0 0 40px rgba(0,240,255,0.35)', duration: 0.3, ease: 'power2.out' }, 0)
        .to(stage, { boxShadow: '0 0 0 rgba(0,240,255,0)', duration: 0.3, ease: 'power2.out' }, 0.3)
        // Very small RGB split / glitch, <80ms, right at the start.
        .fromTo(stage,
          { x: -2, filter: 'blur(10px) brightness(0.6) drop-shadow(2px 0 rgba(255,0,168,0.7))' },
          { x: 2, filter: 'blur(10px) brightness(0.6) drop-shadow(-2px 0 rgba(0,240,255,0.7))', duration: 0.04, ease: 'none' }, 0)
        .to(stage, { x: 0, duration: 0.04, ease: 'none' })
        // Horizontal scanline sweep across the stage while it appears.
        .fromTo(scanline, { y: -20, opacity: 0 },
          { y: (stage?.offsetHeight ?? 600) + 20, opacity: 0.8, duration: 0.7, ease: 'power1.inOut' }, 0.05)
        .to(scanline, { opacity: 0, duration: 0.1 }, '-=0.1')

        // 2. "// CREW DATABASE" label resolves.
        .to(label, { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.35, ease: 'power3.out' }, 0.2)
        // 3. "LEGENDS NEVER DIE." title resolves.
        .to(title, { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.4, ease: 'power3.out' }, 0.35)
        // 4. Italic tagline + decorative divider resolve.
        .to(subtitle, { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)', duration: 0.35, ease: 'power3.out' }, 0.45)
        .to(divider, { opacity: 1, scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0.5);
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
