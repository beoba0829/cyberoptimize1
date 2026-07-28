import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// The Hero background video is 7.13s long. The UI reveal sequence is synced to
// this timeline (all values in milliseconds from video start).
export const HERO_TIMINGS = {
  logo: 2700, // 2.7s — David's face cut; logo + badge begin to appear
  tagline: 3100, // 3.1s
  buttons: 3300, // 3.3s
  contract: 3500, // 3.5s
  navbar: 3700, // 3.7s
  scroll: 3900, // 3.9s
  lucyPulse: 4800, // 4.8s — Lucy appears; subtle logo glitch pulse
  lucyPulseEnd: 4980, // ~180ms later, stabilize
  idle: 4500, // scroll + 600ms — ambient idle state begins
  videoEnd: 7130, // 7.13s — video length
} as const;

const BIT = {
  logo: 1,
  tagline: 2,
  buttons: 4,
  contract: 8,
  navbar: 16,
  scroll: 32,
  lucyPulse: 64,
  idle: 128,
} as const;

function computeMask(t: number): number {
  let m = 0;
  if (t >= HERO_TIMINGS.logo) m |= BIT.logo;
  if (t >= HERO_TIMINGS.tagline) m |= BIT.tagline;
  if (t >= HERO_TIMINGS.buttons) m |= BIT.buttons;
  if (t >= HERO_TIMINGS.contract) m |= BIT.contract;
  if (t >= HERO_TIMINGS.navbar) m |= BIT.navbar;
  if (t >= HERO_TIMINGS.scroll) m |= BIT.scroll;
  if (t >= HERO_TIMINGS.lucyPulse && t < HERO_TIMINGS.lucyPulseEnd) m |= BIT.lucyPulse;
  if (t >= HERO_TIMINGS.idle) m |= BIT.idle;
  return m;
}

interface HeroTimelineValue {
  showLogo: boolean;
  showTagline: boolean;
  showButtons: boolean;
  showContract: boolean;
  showNavbar: boolean;
  showScroll: boolean;
  lucyPulse: boolean;
  idle: boolean;
  registerVideo: (el: HTMLVideoElement | null) => void;
}

const HeroTimelineContext = createContext<HeroTimelineValue | null>(null);

export function HeroTimelineProvider({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const maskRef = useRef(0);
  const [mask, setMask] = useState(0);

  const registerVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  useEffect(() => {
    let raf = 0;
    let maxSeen = -1;
    const loop = () => {
      const v = videoRef.current;
      // Only track time while the video is actively playing, so the timeline
      // stays synchronized with the real footage. Before playback begins (e.g.
      // during the loading screen, when the video is held at frame 0) we don't
      // advance — this prevents reveals from firing prematurely.
      if (v && !v.paused && !v.seeking && v.readyState >= 2) {
        const raw = v.currentTime * 1000;
        // Keep the timeline monotonic so a video loop never re-hides the UI.
        if (raw > maxSeen) maxSeen = raw;
      }
      const m = computeMask(maxSeen);
      if (m !== maskRef.current) {
        maskRef.current = m;
        setMask(m);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const value: HeroTimelineValue = {
    showLogo: !!(mask & BIT.logo),
    showTagline: !!(mask & BIT.tagline),
    showButtons: !!(mask & BIT.buttons),
    showContract: !!(mask & BIT.contract),
    showNavbar: !!(mask & BIT.navbar),
    showScroll: !!(mask & BIT.scroll),
    lucyPulse: !!(mask & BIT.lucyPulse),
    idle: !!(mask & BIT.idle),
    registerVideo,
  };

  return (
    <HeroTimelineContext.Provider value={value}>
      {children}
    </HeroTimelineContext.Provider>
  );
}

export function useHeroTimeline() {
  const ctx = useContext(HeroTimelineContext);
  if (!ctx) {
    throw new Error('useHeroTimeline must be used within HeroTimelineProvider');
  }
  return ctx;
}
