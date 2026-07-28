import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const HOVER_SOUND =
  'https://ik.imagekit.io/zznoau6lx/mixkit-sci-fi-interface-zoom-890.mp3?updatedAt=1785183860410';

const SPIN_DURATION = 4;
const HOVER_DURATION = 0.18;
const CURSOR_COLOR = '#FFFFFF';
const CURSOR_COLOR_ON_TARGET = '#B497CF';

const TARGET_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'textarea',
  'select',
  'label[for]',
  'summary',
  '[data-cursor-target]',
].join(',');

interface TargetCursorProps {
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  parallaxOn?: boolean;
  hoverDuration?: number;
  cursorColor?: string;
  cursorColorOnTarget?: string;
}

const RETICLE_HALF = 14;    // px — half-size of bracket box
const BRACKET_ARM = 8;      // px — arm length
const BRACKET_TH  = 1.5;    // px — stroke
const HOV_ARM     = 12;     // px — hover bracket arm length
const HOV_PAD     = 10;     // px — padding around hovered element

export default function TargetCursor({
  spinDuration      = SPIN_DURATION,
  hideDefaultCursor = true,
  parallaxOn        = true,
  hoverDuration     = HOVER_DURATION,
  cursorColor       = CURSOR_COLOR,
  cursorColorOnTarget = CURSOR_COLOR_ON_TARGET,
}: TargetCursorProps) {
  // Layer 1: translate(x,y) ONLY
  const wrapperRef  = useRef<HTMLDivElement>(null);
  // Layer 2: rotate() ONLY
  const innerRef    = useRef<HTMLDivElement>(null);
  // Layer 3: scale() ONLY (click feedback)
  const graphicRef  = useRef<HTMLDivElement>(null);

  // Hover bracket corners — four individual spans
  const hTLRef = useRef<HTMLSpanElement>(null);
  const hTRRef = useRef<HTMLSpanElement>(null);
  const hBLRef = useRef<HTMLSpanElement>(null);
  const hBRRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const wrapper  = wrapperRef.current;
    const inner    = innerRef.current;
    const graphic  = graphicRef.current;
    const hTL = hTLRef.current;
    const hTR = hTRRef.current;
    const hBL = hBLRef.current;
    const hBR = hBRRef.current;
    if (!wrapper || !inner || !graphic || !hTL || !hTR || !hBL || !hBR) return;

    if (hideDefaultCursor) document.documentElement.style.cursor = 'none';

    // ── Audio — preload once, reuse ───────────────────────────────────
    const audio = new Audio(HOVER_SOUND);
    audio.preload = 'auto';
    audio.volume  = 0.25;

    // ── Mouse tracking ────────────────────────────────────────────────
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos   = { x: mouse.x, y: mouse.y };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });

    const onLeave = () => gsap.to(wrapper, { autoAlpha: 0, duration: 0.2 });
    const onEnter = () => gsap.to(wrapper, { autoAlpha: 1, duration: 0.2 });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    // RAF loop — lerp factor 0.55 → ~92% real-time, barely-there smoothing
    let raf = 0;
    const loop = () => {
      pos.x += (mouse.x - pos.x) * 0.55;
      pos.y += (mouse.y - pos.y) * 0.55;

      // Optional tiny parallax offset (does NOT add more lag — computed from
      // the already-converged pos, not from a secondary lerp chain)
      let px = 0, py = 0;
      if (parallaxOn) {
        px = (mouse.x - pos.x) * 0.04;
        py = (mouse.y - pos.y) * 0.04;
      }

      gsap.set(wrapper, { x: pos.x + px, y: pos.y + py });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // ── Rotation ──────────────────────────────────────────────────────
    const spin = gsap.to(inner, {
      rotation: '+=360',
      duration: spinDuration,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    });

    // ── Click — scale graphic only ────────────────────────────────────
    const onDown = () => {
      gsap.to(graphic, {
        scale: 0.85,
        duration: 0.08,
        ease: 'power2.out',
        onComplete: () =>
          gsap.to(graphic, { scale: 1, duration: 0.15, ease: 'back.out(2)' }),
      });
    };
    window.addEventListener('mousedown', onDown);

    // ── Color helper ──────────────────────────────────────────────────
    const setColor = (color: string) => {
      // cursor brackets
      graphic.querySelectorAll<HTMLSpanElement>('span').forEach((s) => {
        s.style.borderColor = color;
        s.style.boxShadow   = `0 0 5px ${color}66`;
      });
      const dot = graphic.querySelector<HTMLSpanElement>('.tc-dot');
      if (dot) { dot.style.background = color; dot.style.boxShadow = `0 0 5px ${color}`; }
      // hover brackets
      [hTL, hTR, hBL, hBR].forEach((s) => {
        s.style.borderColor = color;
        s.style.boxShadow   = `0 0 7px ${color}99`;
      });
    };

    // ── Hover bracket animation ───────────────────────────────────────
    // Each span is positioned absolute relative to the viewport (fixed).
    // We animate their left/top so each corner bracket sits at the correct
    // corner of the target's bounding box.
    const showBrackets = (rect: DOMRect) => {
      const left   = rect.left   - HOV_PAD;
      const top    = rect.top    - HOV_PAD;
      const right  = rect.right  + HOV_PAD - HOV_ARM;
      const bottom = rect.bottom + HOV_PAD - HOV_ARM;

      const opts = { duration: hoverDuration, ease: 'power3.out' };

      gsap.to(hTL, { left, top,    opacity: 1, ...opts });
      gsap.to(hTR, { left: right, top,    opacity: 1, ...opts });
      gsap.to(hBL, { left, top: bottom,    opacity: 1, ...opts });
      gsap.to(hBR, { left: right, top: bottom, opacity: 1, ...opts });
    };

    const hideBrackets = () => {
      const opts = { opacity: 0, duration: hoverDuration, ease: 'power2.out' };
      gsap.to([hTL, hTR, hBL, hBR], opts);
    };

    // ── Hover detection ───────────────────────────────────────────────
    let activeTarget: Element | null = null;

    const onOver = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(TARGET_SELECTOR) as HTMLElement | null;
      if (!el || el === activeTarget) return;
      activeTarget = el;

      showBrackets(el.getBoundingClientRect());
      spin.pause();
      setColor(cursorColorOnTarget);

      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    const onOut = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(TARGET_SELECTOR) as HTMLElement | null;
      if (!el || el !== activeTarget) return;
      // ignore if mouse moved to a child of the same target
      const related = (e as MouseEvent).relatedTarget as Element | null;
      if (related && el.contains(related)) return;
      activeTarget = null;

      hideBrackets();
      spin.resume();
      setColor(cursorColor);
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout',  onOut,  { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      cancelAnimationFrame(raf);
      spin.kill();
      if (hideDefaultCursor) document.documentElement.style.cursor = '';
    };
  }, [spinDuration, hideDefaultCursor, parallaxOn, hoverDuration, cursorColor, cursorColorOnTarget]);

  // ── Styles ────────────────────────────────────────────────────────────
  const th   = BRACKET_TH;
  const arm  = BRACKET_ARM;
  const half = RETICLE_HALF;

  const bBase: React.CSSProperties = {
    position:    'absolute',
    width:       arm,
    height:      arm,
    borderColor: cursorColor,
    boxShadow:   `0 0 5px ${cursorColor}66`,
  };

  // Hover bracket spans: fixed positioning, initially off-screen/hidden
  const hBase: React.CSSProperties = {
    position:    'fixed',
    width:       HOV_ARM,
    height:      HOV_ARM,
    opacity:     0,
    pointerEvents: 'none',
    zIndex:      99998,
    borderColor: cursorColor,
  };

  return (
    <>
      {/* WRAPPER — translate only */}
      <div
        ref={wrapperRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 0, height: 0,
          pointerEvents: 'none',
          zIndex: 99999,
        }}
      >
        {/* INNER — rotate only */}
        <div
          ref={innerRef}
          style={{
            position: 'absolute',
            width:  half * 2,
            height: half * 2,
            top:   -half,
            left:  -half,
          }}
        >
          {/* GRAPHIC — scale only */}
          <div
            ref={graphicRef}
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: '50% 50%',
            }}
          >
            {/* Top-left */}
            <span style={{ ...bBase, top: 0, left: 0,
              borderTopWidth: th, borderTopStyle: 'solid',
              borderLeftWidth: th, borderLeftStyle: 'solid',
              borderRightWidth: 0, borderBottomWidth: 0 }} />
            {/* Top-right */}
            <span style={{ ...bBase, top: 0, right: 0,
              borderTopWidth: th, borderTopStyle: 'solid',
              borderRightWidth: th, borderRightStyle: 'solid',
              borderLeftWidth: 0, borderBottomWidth: 0 }} />
            {/* Bottom-left */}
            <span style={{ ...bBase, bottom: 0, left: 0,
              borderBottomWidth: th, borderBottomStyle: 'solid',
              borderLeftWidth: th, borderLeftStyle: 'solid',
              borderTopWidth: 0, borderRightWidth: 0 }} />
            {/* Bottom-right */}
            <span style={{ ...bBase, bottom: 0, right: 0,
              borderBottomWidth: th, borderBottomStyle: 'solid',
              borderRightWidth: th, borderRightStyle: 'solid',
              borderTopWidth: 0, borderLeftWidth: 0 }} />
            {/* Center dot */}
            <span
              className="tc-dot"
              style={{
                position:     'absolute',
                top: '50%', left: '50%',
                width: 3, height: 3,
                marginTop: -1.5, marginLeft: -1.5,
                borderRadius: '50%',
                background:  cursorColor,
                boxShadow:   `0 0 5px ${cursorColor}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* HOVER BRACKETS — four independent fixed spans */}
      {/* Top-left */}
      <span ref={hTLRef} aria-hidden style={{ ...hBase,
        borderTopWidth: th, borderTopStyle: 'solid',
        borderLeftWidth: th, borderLeftStyle: 'solid',
        borderRightWidth: 0, borderBottomWidth: 0 }} />
      {/* Top-right */}
      <span ref={hTRRef} aria-hidden style={{ ...hBase,
        borderTopWidth: th, borderTopStyle: 'solid',
        borderRightWidth: th, borderRightStyle: 'solid',
        borderLeftWidth: 0, borderBottomWidth: 0 }} />
      {/* Bottom-left */}
      <span ref={hBLRef} aria-hidden style={{ ...hBase,
        borderBottomWidth: th, borderBottomStyle: 'solid',
        borderLeftWidth: th, borderLeftStyle: 'solid',
        borderTopWidth: 0, borderRightWidth: 0 }} />
      {/* Bottom-right */}
      <span ref={hBRRef} aria-hidden style={{ ...hBase,
        borderBottomWidth: th, borderBottomStyle: 'solid',
        borderRightWidth: th, borderRightStyle: 'solid',
        borderTopWidth: 0, borderLeftWidth: 0 }} />
    </>
  );
}
