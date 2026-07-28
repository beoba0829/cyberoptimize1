import { useEffect, useRef, Children } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * DirectionalParallaxTransition
 *
 * Wraps two adjacent sections and gives the hand-off between them a
 * cinematic sense of depth using only GPU-friendly transforms (translate3d,
 * scale) and opacity. No glitches, flashes, distortion, blur, masks,
 * clip-path, canvas, shaders, or fullscreen overlays.
 *
 * How it feels:
 *   - As the boundary nears the viewport center, the exiting section drifts
 *     away: it lags the scroll, scales down subtly, and dims slightly.
 *   - The incoming section starts a touch closer to the viewer (scaled down,
 *     dimmed, pushed down) and settles into its resting position as it
 *     becomes the dominant layer around the viewport center.
 *   - Multiple depth tiers move independently so the scene reads as layered
 *     3D space rather than a flat cut.
 *
 * The strongest motion is concentrated in the middle of the transition
 * window (boundary ~25%→75% of viewport height); outside that, everything
 * eases back to its resting state so there is no visible pop on enter/leave.
 *
 * Performance:
 *   - An IntersectionObserver on a zero-height sentinel at the boundary
 *     gates a single requestAnimationFrame loop. The loop only runs while
 *     the boundary is near the viewport and is killed the instant it leaves.
 *   - Per frame: one getBoundingClientRect (the sentinel) + N transform/
 *     opacity writes. No layout reads on the layers, no reflows, no
 *     paint-heavy properties. All work is GPU-composited.
 *   - will-change is set on enter and cleared on leave.
 *
 * Reuse:
 *   <DirectionalParallaxTransition>
 *     <SectionA />
 *     <SectionB />
 *   </DirectionalParallaxTransition>
 *
 * Sections opt their layers in by tagging elements with:
 *   data-depth="background" | "decorative" | "content"
 * Untagged elements are left untouched. Tag nested groups independently
 * for richer depth — the component moves every tagged element, so a tagged
 * wrapper plus tagged children compound their motion (useful for extra
 * parallax between a group and its members).
 */

type Depth = 'background' | 'decorative' | 'content';

// Per-tier magnitudes. Translate is a fraction of viewport height; scale and
// opacity are absolute deltas from the resting (1 / 1) state. Background is
// the most "distant" so it deviates the most; content stays closest to natural.
const TIER = {
  background: { t: 0.06, s: 0.04, o: 0.18 },
  decorative: { t: 0.04, s: 0.03, o: 0.14 },
  content: { t: 0.02, s: 0.02, o: 0.10 },
} as const;

interface Layer {
  el: HTMLElement;
  t: number;
  s: number;
  o: number;
  exiting: boolean;
}

interface Props {
  children: ReactNode;
  /** Half-height of the active zone as a fraction of viewport height. */
  zone?: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// Hermite smoothstep — cinematic ease, flat tangent at both ends so motion
// starts and settles without any visible jerk.
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

export default function DirectionalParallaxTransition({ children, zone = 1 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const sentinel = sentinelRef.current;
    if (!wrap || !sentinel) return;

    const secA = sentinel.previousElementSibling as HTMLElement | null;
    const secB = sentinel.nextElementSibling as HTMLElement | null;
    if (!secA || !secB) return;

    const layers: Layer[] = Array.from(
      wrap.querySelectorAll<HTMLElement>('[data-depth]'),
    ).map((el) => {
      const d = (el.dataset.depth as Depth | undefined) ?? 'content';
      const tier = TIER[d] ?? TIER.content;
      return {
        el,
        t: tier.t,
        s: tier.s,
        o: tier.o,
        exiting: secA.contains(el),
      };
    });
    if (!layers.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let active = false;

    const update = () => {
      raf = requestAnimationFrame(update);
      const vh = window.innerHeight;
      const boundaryY = sentinel.getBoundingClientRect().top;
      // 0 when boundary is at the bottom of the viewport, 1 at the top.
      const t = clamp01((vh - boundaryY) / vh);

      // Exiting recedes over the first half (boundary 75%→50% of viewport);
      // incoming settles over the second half (50%→25%). Both ease fully
      // across the middle 50% of the transition window.
      const e = smooth(0.25, 0.5, t);
      const i = smooth(0.5, 0.75, t);

      for (const l of layers) {
        if (l.exiting) {
          const y = l.t * e * vh;
          const sc = 1 - l.s * e;
          const op = 1 - l.o * e;
          l.el.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
          l.el.style.opacity = op.toFixed(3);
        } else {
          const r = 1 - i; // 1 at rest-start, 0 once settled
          const y = l.t * r * vh;
          const sc = 1 - l.s * r;
          const op = 1 - l.o * r;
          l.el.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
          l.el.style.opacity = op.toFixed(3);
        }
      }
    };

    const start = () => {
      if (active) return;
      active = true;
      for (const l of layers) l.el.style.willChange = 'transform, opacity';
      raf = requestAnimationFrame(update);
    };

    const stop = () => {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      for (const l of layers) {
        l.el.style.willChange = '';
        l.el.style.transform = '';
        l.el.style.opacity = '';
      }
    };

    const margin = `${zone * 100}% 0px ${zone * 100}% 0px`;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.isIntersecting ? start : stop)();
      },
      { rootMargin: margin },
    );
    obs.observe(sentinel);

    return () => {
      obs.disconnect();
      stop();
    };
  }, [zone]);

  const items = Children.toArray(children) as ReactElement[];

  return (
    <div ref={wrapRef}>
      {items[0]}
      <div ref={sentinelRef} aria-hidden style={{ height: 0 }} />
      {items[1]}
    </div>
  );
}
