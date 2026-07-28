import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';

/**
 * TrueFocus — faithful adaptation of the ReactBits TrueFocus component.
 *
 * Instead of splitting a string by spaces into words, this version accepts
 * arbitrary focus "groups" (each group can be any ReactNode, e.g. multiple
 * styled spans). Exactly one group is in focus at a time; the others are
 * blurred. A neon L-bracket HUD frame smoothly moves + resizes to surround
 * the focused group, alternating forever.
 *
 * Pure React + TypeScript + requestAnimationFrame. No GSAP, no Motion.
 */

export interface TrueFocusGroup {
  content: ReactNode;
  className?: string;
}

export interface TrueFocusProps {
  groups: TrueFocusGroup[];
  className?: string;
  frameColor?: string;
  blurAmount?: number;
  /** Time the frame takes to move/resize between groups (ms). */
  movementDuration?: number;
  /** Time spent holding on a group before moving on (ms). */
  pauseDuration?: number;
  /** Time to resume auto-cycling after a manual click (ms). */
  manualResumeDelay?: number;
  /** Padding around a group for the frame, in px. */
  framePadding?: number;
  /** Length of each corner bracket arm, in px. */
  cornerSize?: number;
  /** Corner bracket border thickness, in px. */
  cornerThickness?: number;
  /** When true, groups stack vertically (each on its own line). */
  block?: boolean;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function TrueFocus({
  groups,
  className = '',
  frameColor = '#FF00A8',
  blurAmount = 5,
  movementDuration = 500,
  pauseDuration = 1000,
  manualResumeDelay = 1000,
  framePadding = 8,
  cornerSize = 24,
  cornerThickness = 2,
  block = false,
}: TrueFocusProps) {
  const count = groups.length;
  const containerRef = useRef<HTMLSpanElement>(null);
  const groupRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameRef = useRef<HTMLSpanElement>(null);
  const cornersRef = useRef<(HTMLSpanElement | null)[]>([null, null, null, null]);
  const rafRef = useRef<number | null>(null);

  // Manual focus request: when set, the loop jumps to move toward this group.
  const manualTargetRef = useRef<number | null>(null);
  const manualUntilRef = useRef(0);

  // activeIndex only changes when the focused group changes (for cursor/aria).
  const [activeIndex, setActiveIndex] = useState(0);

  const measureGroup = useCallback((i: number): Rect | null => {
    const el = groupRefs.current[i];
    const container = containerRef.current;
    if (!el || !container) return null;
    const eb = el.getBoundingClientRect();
    const cb = container.getBoundingClientRect();
    return {
      left: eb.left - cb.left,
      top: eb.top - cb.top,
      width: eb.width,
      height: eb.height,
    };
  }, []);

  const applyFrame = useCallback(
    (r: Rect, opacity: number, glow: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const pad = framePadding;
      frame.style.transform = `translate(${(r.left - pad).toFixed(2)}px, ${(r.top - pad).toFixed(2)}px)`;
      frame.style.width = `${(r.width + pad * 2).toFixed(2)}px`;
      frame.style.height = `${(r.height + pad * 2).toFixed(2)}px`;
      frame.style.opacity = String(opacity);
      const glowIntensity = 4 + 12 * glow;
      const glowAlpha = Math.round(clamp01(glow) * 255)
        .toString(16)
        .padStart(2, '0');
      for (const c of cornersRef.current) {
        if (!c) continue;
        c.style.boxShadow = `0 0 ${glowIntensity.toFixed(1)}px ${frameColor}${glowAlpha}`;
      }
    },
    [frameColor, framePadding],
  );

  const applyBlur = useCallback((i: number, blur: number) => {
    const el = groupRefs.current[i];
    if (!el) return;
    el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  }, []);

  // Single animation loop: auto-cycles forever, but yields to a manual
  // click request and resumes auto-cycling after manualResumeDelay.
  useEffect(() => {
    if (count < 2) return;
    let cancelled = false;
    let from = 0;
    let to = 1 % count;
    let phase: 'move' | 'hold' = 'hold';
    let phaseStart = performance.now();
    let fromRect: Rect | null = measureGroup(from);
    let toRect: Rect | null = measureGroup(to);

    // initial: group 0 sharp, others blurred, frame on group 0
    for (let i = 0; i < count; i++) applyBlur(i, i === from ? 0 : blurAmount);
    if (fromRect) applyFrame(fromRect, 1, 1);
    setActiveIndex(from);

    const loop = (now: number) => {
      if (cancelled) return;

      // Manual request: jump to move from current `to` (the last focused)
      // toward the requested target, and pause auto-advance for a while.
      const target = manualTargetRef.current;
      if (target !== null) {
        manualTargetRef.current = null;
        if (target !== to) {
          from = to;
          to = target;
          fromRect = measureGroup(from);
          toRect = measureGroup(to);
          phase = 'move';
          phaseStart = now;
        }
        manualUntilRef.current = now + manualResumeDelay;
      }

      const elapsed = now - phaseStart;

      if (phase === 'move') {
        const p = clamp01(elapsed / movementDuration);
        const e = easeInOutCubic(p);
        if (fromRect && toRect) {
          const r: Rect = {
            left: fromRect.left + (toRect.left - fromRect.left) * e,
            top: fromRect.top + (toRect.top - fromRect.top) * e,
            width: fromRect.width + (toRect.width - fromRect.width) * e,
            height: fromRect.height + (toRect.height - fromRect.height) * e,
          };
          applyFrame(r, 1, 1);
        }
        applyBlur(from, blurAmount * e);
        applyBlur(to, blurAmount * (1 - e));

        if (p >= 1) {
          applyBlur(from, blurAmount);
          applyBlur(to, 0);
          setActiveIndex(to);
          phase = 'hold';
          phaseStart = now;
        }
      } else {
        if (toRect) applyFrame(toRect, 1, 1);
        if (now >= manualUntilRef.current && elapsed >= pauseDuration) {
          from = to;
          to = (to + 1) % count;
          fromRect = measureGroup(from);
          toRect = measureGroup(to);
          phase = 'move';
          phaseStart = now;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      fromRect = measureGroup(from);
      toRect = measureGroup(to);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [count, movementDuration, pauseDuration, manualResumeDelay, blurAmount, measureGroup, applyFrame, applyBlur]);

  const focusGroup = useCallback((i: number) => {
    manualTargetRef.current = i;
  }, []);

  const cornerBase: CSSProperties = {
    position: 'absolute',
    width: cornerSize,
    height: cornerSize,
    pointerEvents: 'none',
  };
  const cornerStyle = (pos: 0 | 1 | 2 | 3): CSSProperties => {
    const o = framePadding;
    const map: CSSProperties[] = [
      { top: -o, left: -o, borderTop: `${cornerThickness}px solid ${frameColor}`, borderLeft: `${cornerThickness}px solid ${frameColor}` },
      { top: -o, right: -o, borderTop: `${cornerThickness}px solid ${frameColor}`, borderRight: `${cornerThickness}px solid ${frameColor}` },
      { bottom: -o, left: -o, borderBottom: `${cornerThickness}px solid ${frameColor}`, borderLeft: `${cornerThickness}px solid ${frameColor}` },
      { bottom: -o, right: -o, borderBottom: `${cornerThickness}px solid ${frameColor}`, borderRight: `${cornerThickness}px solid ${frameColor}` },
    ];
    return { ...cornerBase, ...map[pos] };
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {groups.map((g, i) => (
        <span
          key={i}
          ref={(el) => { groupRefs.current[i] = el; }}
          className={g.className}
          onClick={(e) => {
            e.stopPropagation();
            focusGroup(i);
          }}
          style={{
            display: block ? 'block' : 'inline-block',
            cursor: 'pointer',
            filter: i === 0 ? 'none' : `blur(${blurAmount}px)`,
          }}
          aria-label={`Focus group ${i + 1}`}
        >
          {g.content}
        </span>
      ))}
      <span
        ref={frameRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'transform, width, height, opacity',
        }}
      >
        <span ref={(el) => { cornersRef.current[0] = el; }} style={cornerStyle(0)} />
        <span ref={(el) => { cornersRef.current[1] = el; }} style={cornerStyle(1)} />
        <span ref={(el) => { cornersRef.current[2] = el; }} style={cornerStyle(2)} />
        <span ref={(el) => { cornersRef.current[3] = el; }} style={cornerStyle(3)} />
      </span>
    </span>
  );
}
