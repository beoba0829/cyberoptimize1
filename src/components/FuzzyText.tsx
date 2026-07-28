import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * FuzzyText — lightweight CSS/SVG replacement for the canvas-based original.
 *
 * Renders text with a subtle horizontal distortion driven by an SVG
 * feTurbulence + feDisplacementMap filter. The turbulence baseFrequency is
 * animated very gently via a single requestAnimationFrame loop that only
 * runs while the element is in the viewport (IntersectionObserver-gated).
 *
 * Idle distortion is intentionally minimal. Hovering increases the
 * displacement scale briefly, then eases back to the idle level. No
 * getImageData / putImageData / continuous canvas redraws — the SVG filter
 * is GPU-composited and the only animated property is the filter region's
 * baseFrequency (a cheap attribute write) plus the displacement scale.
 *
 * Preserves the existing heading font and glow via the supplied className.
 */

interface Props {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

const IDLE_SCALE = 2.5;
const HOVER_SCALE = 7;
const HOVER_DECAY = 0.92;

export default function FuzzyText({ text, className = '', as: Tag = 'h2' }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const scaleRef = useRef(IDLE_SCALE);
  const targetRef = useRef(IDLE_SCALE);
  const phaseRef = useRef(0);
  const [uid] = useState(() => `fz-${Math.random().toString(36).slice(2, 9)}`);

  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);
    const root = rootRef.current;
    if (!root) return;

    // Ease hover scale back toward idle.
    scaleRef.current += (targetRef.current - scaleRef.current) * 0.12;
    targetRef.current += (IDLE_SCALE - targetRef.current) * (1 - HOVER_DECAY);

    phaseRef.current += 0.006;
    const drift = Math.sin(phaseRef.current) * 0.0008;
    const baseFreq = (0.012 + drift).toFixed(5);
    const scale = scaleRef.current.toFixed(2);

    const turb = root.querySelector(`#${uid}-turb`);
    const disp = root.querySelector(`#${uid}-disp`);
    if (turb) turb.setAttribute('baseFrequency', baseFreq);
    if (disp) disp.setAttribute('scale', scale);
  }, [uid]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!activeRef.current) return;
      activeRef.current = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // Reset to idle once stopped.
      scaleRef.current = IDLE_SCALE;
      targetRef.current = IDLE_SCALE;
      const root2 = rootRef.current;
      if (root2) {
        const disp = root2.querySelector(`#${uid}-disp`);
        if (disp) disp.setAttribute('scale', String(IDLE_SCALE));
      }
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.isIntersecting ? start : stop)();
      },
      { threshold: 0.2 },
    );
    obs.observe(root);

    const onEnter = () => { targetRef.current = HOVER_SCALE; };
    root.addEventListener('mouseenter', onEnter);

    return () => {
      obs.disconnect();
      root.removeEventListener('mouseenter', onEnter);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick, uid]);

  return (
    <Tag
      ref={rootRef as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={{ filter: `url(#${uid}-filter)` }}
    >
      {text}
      <svg aria-hidden style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={`${uid}-filter`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              id={`${uid}-turb`}
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              id={`${uid}-disp`}
              in="SourceGraphic"
              in2="noise"
              scale={IDLE_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </Tag>
  );
}
