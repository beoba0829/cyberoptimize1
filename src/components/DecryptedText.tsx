import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  type CSSProperties,
} from 'react';

/**
 * DecryptedText — hacker/glitch "decrypt" reveal.
 *
 * Pure React + TypeScript. No external animation libraries.
 *
 * The full text first scrambles for `maxIterations` frames, then characters
 * lock in left → right. Spaces and line breaks are preserved and never
 * scrambled. The automatic reveal plays exactly once, the first time the
 * element enters the viewport; afterwards the text stays readable. Clicking
 * the element manually replays the animation from the beginning.
 *
 * Rich text is supported via `segments` (each with its own className); the
 * reveal pointer advances across the concatenated text so the whole heading
 * decrypts as one continuous stream.
 */

export interface DecryptedTextSegment {
  text: string;
  className?: string;
}

export interface DecryptedTextProps {
  /** Plain text mode. Use `segments` instead for styled sub-parts. */
  text?: string;
  /** Rich text mode: array of { text, className } segments. */
  segments?: DecryptedTextSegment[];
  /** Base scramble frame interval in ms. */
  speed?: number;
  /** Number of full-text scramble frames before left-to-right reveal begins. */
  maxIterations?: number;
  /** Character pool used while scrambling. */
  characters?: string;
  /** className applied to the wrapper span. */
  className?: string;
  /** className applied to still-encrypted characters. */
  encryptedClassName?: string;
  /** Inline style for the wrapper span. */
  style?: CSSProperties;
  /** Number of trailing characters that reveal more slowly. */
  slowTail?: number;
  /** Slowdown factor applied to the trailing characters (1.0 = no change). */
  slowFactor?: number;
}

const DEFAULT_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+<>?/=';

const isPreserved = (ch: string) => ch === ' ' || ch === '\n' || ch === '\t';

export default function DecryptedText({
  text,
  segments,
  speed = 30,
  maxIterations = 8,
  characters = DEFAULT_CHARS,
  className = '',
  encryptedClassName = '',
  style,
  slowTail = 8,
  slowFactor = 1.15,
}: DecryptedTextProps) {
  // ── Flatten segments into a token list: one entry per character ──────────
  const tokens = useMemo(() => {
    const segs: DecryptedTextSegment[] =
      segments ?? [{ text: text ?? '', className: undefined }];
    const out: { char: string; className: string }[] = [];
    for (const s of segs) {
      const cls = s.className ?? '';
      for (const ch of Array.from(s.text)) {
        out.push({ char: ch, className: cls });
      }
    }
    return out;
  }, [text, segments]);

  const length = tokens.length;

  // ── Random character pool ───────────────────────────────────────────────
  const pool = useMemo(() => Array.from(characters), [characters]);
  const randomChar = useCallback(() => {
    return pool[(Math.random() * pool.length) | 0];
  }, [pool]);

  // ── State ────────────────────────────────────────────────────────────────
  const [display, setDisplay] = useState<string[]>(() =>
    tokens.map((t) => (isPreserved(t.char) ? t.char : t.char)),
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [done, setDone] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards the automatic viewport trigger so it fires at most once.
  const hasAnimatedRef = useRef(false);
  // Guards the animation loop so only one runs at a time.
  const animatingRef = useRef(false);
  // Tracks the last-seen text content so we only reset on real changes.
  const lastTextRef = useRef<string>('');

  // ── Per-frame delay: slow down for the trailing characters ───────────────
  const frameDelay = useCallback(
    (revealUpTo: number) => {
      const slowStart = Math.max(0, length - slowTail);
      return revealUpTo >= slowStart ? speed * slowFactor : speed;
    },
    [length, slowTail, slowFactor, speed],
  );

  // ── Core animation loop (recursive setTimeout for variable speed) ───────
  const runAnimation = useCallback(() => {
    // Only one animation loop may exist at any time.
    if (animatingRef.current) return;
    animatingRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    let frame = 0;
    setRevealedCount(0);
    setDone(false);
    setDisplay(
      tokens.map((t) => (isPreserved(t.char) ? t.char : randomChar())),
    );

    const finish = () => {
      setDisplay(tokens.map((t) => t.char));
      setRevealedCount(length);
      setDone(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      animatingRef.current = false;
    };

    const tick = () => {
      frame += 1;

      if (frame <= maxIterations) {
        // Phase 1 — full scramble, preserve whitespace.
        setDisplay(
          tokens.map((t) => (isPreserved(t.char) ? t.char : randomChar())),
        );
        timeoutRef.current = setTimeout(tick, speed);
        return;
      }

      // Phase 2 — lock characters left → right, one per frame.
      const revealUpTo = frame - maxIterations;
      if (revealUpTo >= length) {
        finish();
        return;
      }

      setRevealedCount(revealUpTo);
      setDisplay(
        tokens.map((t, i) => {
          if (isPreserved(t.char)) return t.char;
          return i < revealUpTo ? t.char : randomChar();
        }),
      );
      timeoutRef.current = setTimeout(tick, frameDelay(revealUpTo));
    };

    timeoutRef.current = setTimeout(tick, speed);
  }, [tokens, length, maxIterations, speed, randomChar, frameDelay]);

  // ── Reset display/state only when the actual text content changes ────────
  const textContent = useMemo(() => tokens.map((t) => t.char).join(''), [tokens]);
  useEffect(() => {
    if (lastTextRef.current === textContent) return;
    lastTextRef.current = textContent;
    setDisplay(
      tokens.map((t) => (isPreserved(t.char) ? t.char : randomChar())),
    );
    setRevealedCount(0);
    setDone(false);
  }, [textContent, tokens, randomChar]);

  // ── Viewport-triggered one-shot reveal (fires only once) ──────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || length === 0 || hasAnimatedRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            obs.disconnect();
            runAnimation();
            break;
          }
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
    };
  }, [length, runAnimation]);

  // ── Manual replay on click ────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    runAnimation();
  }, [runAnimation]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      animatingRef.current = false;
    };
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <span
      ref={containerRef}
      className={className}
      style={{ whiteSpace: 'pre-wrap', ...style }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {tokens.map((t, i) => {
        const ch = display[i] ?? t.char;
        const revealed = done || i < revealedCount;
        const cls = revealed ? t.className : encryptedClassName;
        return (
          <span key={i} className={cls}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}
