import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useCameraScroll } from '@/lib/cameraController';
import { useCrewBoot } from '@/lib/useCrewBoot';
import gsap from 'gsap';
import { IMAGES } from '@/lib/images';
import TrueFocus from '@/components/TrueFocus';

/* ═══════════════════════════════════════════════════════════════════
   CREW DATA
   ═══════════════════════════════════════════════════════════════════ */

type Side = 'left' | 'right' | 'center';

interface CrewMember {
  file: string;
  codename: string;
  name: string;
  img: string;
  side: Side;
  meta: [string, string];
}

const CREW: CrewMember[] = [
  { file: 'FILE 01', codename: 'THE LITTLE DEVIL', name: 'Rebecca', img: IMAGES.crew.rebecca, side: 'left', meta: ['SECURITY LEVEL: BLACK', 'ARASAKA ARCHIVE'] },
  { file: 'FILE 02', codename: 'THE PATRIARCH', name: 'Maine', img: IMAGES.crew.maine, side: 'right', meta: ['SECURITY LEVEL: RED', 'MILITECH RECORD'] },
  { file: 'FILE 03', codename: 'THE GHOST', name: 'Kiwi', img: IMAGES.crew.kiwi, side: 'left', meta: ['STATUS: VERIFIED', 'NET-77 ARCHIVE'] },
  { file: 'FILE 04', codename: 'THE BLADE', name: 'Dorio', img: IMAGES.crew.dorio, side: 'right', meta: ['SECURITY LEVEL: BLACK', 'MILITECH RECORD'] },
  { file: 'FILE 05', codename: 'THE LOUDMOUTH', name: 'Pilar', img: IMAGES.crew.pilar, side: 'left', meta: ['BIO-CHIP: ACTIVE', 'NIGHT CITY DB'] },
  { file: 'FILE 06', codename: 'THE MOON DREAMER', name: 'Lucy Kushinada', img: IMAGES.crew.lucy, side: 'right', meta: ['SECURITY LEVEL: CLASSIFIED', 'ARASAKA ARCHIVE'] },
  { file: 'FILE 07', codename: 'THE KID', name: 'David Martinez', img: IMAGES.crew.david, side: 'center', meta: ['STATUS: VERIFIED', 'MILITECH RECORD'] },
];

const COUNT = CREW.length;          // 7
const DAVID_INDEX = COUNT - 1;      // 6

/* ═══════════════════════════════════════════════════════════════════
   DEPTH SYSTEM — evenly spaced translateZ, real perspective
   ═══════════════════════════════════════════════════════════════════ */
const START_Z = 650;        // thêm dòng này
const SPACING = 1500;               // px between characters (translateZ)
const PERSPECTIVE = 1000;           // parent perspective px
const CAMERA_TRAVEL = COUNT * SPACING; // 7000 — full camera travel

// Visibility windows measured in rendered-z (px from camera)
const FADE_IN = 1900;                // begins fading in this far before camera
const HOLD = 200;                   // fully visible band around camera
const FADE_OUT = 1400;               // fades out this far past camera
const REVEAL_START = 1900;           // text begins revealing this far before camera

// Scroll progress mapping
const P_CAMERA = 0.8;               // camera reaches David at this progress
const DAVID_DWELL = 0.1;            // David's reveal window after reaching camera

// Reveal throttling: revealText is only re-run when the reveal parameter f
// changes by at least this much. Below this, text opacity/transform deltas
// are sub-pixel and invisible.
const REVEAL_THRESHOLD = 0.003;

// Per-scene DOM write cache. Tracks the last value written for each property
// so we can skip style mutations that would not change anything.
interface SceneCache {
  transform: string;
  opacity: string;
  bgOpacity: string;
  revealF: number;       // last f fed to revealText (NaN = never)
  textOpacity: string[]; // per-slot last opacity
  textTransform: string[]; // per-slot last transform
}
function makeCache(): SceneCache {
  return { transform: '', opacity: '', bgOpacity: '', revealF: NaN, textOpacity: [], textTransform: [] };
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Depth-driven opacity: 0 far → 1 at camera → 0 past camera
const depthOpacity = (z: number): number => {
  if (z <= -FADE_IN) return 0;
  if (z < -HOLD) return (z + FADE_IN) / (FADE_IN - HOLD);
  if (z <= HOLD) return 1;
  if (z < HOLD + FADE_OUT) return 1 - (z - HOLD) / FADE_OUT;
  return 0;
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════ */

function SectionHeader() {
  return (
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-20 text-center">
      <p className="crew-boot-label font-mono text-[11px] tracking-[0.5em] text-cyber-magenta">
        // CREW DATABASE
      </p>
      <h2 className="crew-boot-title mt-5 font-display text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-white">
        <TrueFocus
          block
          groups={[
            { content: 'LEGENDS' },
            {
              content: (
                <>
                  <span style={{ color: '#FFE600' }}>NEVER</span>{' '}
                  <span>DIE.</span>
                </>
              ),
            },
          ]}
          frameColor="#FF00A8"
        />
      </h2>
      <p className="crew-boot-subtitle mt-6 font-body text-lg italic text-gray-500">
        Every legend leaves a mark.
      </p>
      <div
        className="crew-boot-divider mt-10 h-px w-20"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent)' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CREW SCENE — one character, portrait + text as a single 3D object
   ═══════════════════════════════════════════════════════════════════ */

interface SceneRefs {
  scene: (el: HTMLDivElement | null) => void;
  text: (slot: number, el: HTMLElement | null) => void;
}

function CrewScene({ member, index, refs }: { member: CrewMember; index: number; refs: SceneRefs }) {
  const isFinal = member.side === 'center';
  const isLeft = member.side === 'left';
  const sceneRootRef = useRef<HTMLDivElement | null>(null);

  const sceneStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
transform: `translateZ(${-START_Z - index * SPACING}px)`,
    opacity: 0,
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  };

  const portrait = (
    <div
      className="crew-card"
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <CyberFrame member={member} index={index} />
    </div>
  );

  const align = isFinal
    ? 'items-center text-center'
    : isLeft
    ? 'items-start text-left'
    : 'items-end text-right';

  const justify = isFinal ? 'justify-center' : isLeft ? 'justify-start' : 'justify-end';

  const textBlock = (
    <div className={`flex flex-col max-w-sm ${align}`}>
      <div className={`flex items-center gap-2 ${justify}`}>
        <span
          ref={(el) => refs.text(4, el)}
          className="crew-file-led"
          style={{ opacity: 0, willChange: 'opacity' }}
        />
        <p
          ref={(el) => refs.text(0, el)}
          className="font-mono text-[13px] md:text-[14px] font-semibold tracking-[0.42em] text-cyan-300"
          style={{ opacity: 0, willChange: 'transform, opacity' }}
        >
          {member.file}
        </p>
      </div>
      <p
        ref={(el) => refs.text(1, el)}
        className="crew-codename mt-5 font-mono text-[16px] font-semibold uppercase tracking-[0.22em]"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {member.codename}
      </p>
      <div
  ref={(el) => refs.text(3, el)}
  className={`mt-3 flex flex-col ${align}`}
  style={{ opacity: 0, willChange: 'transform, opacity' }}
>
  <span
    className="font-mono text-[11px] tracking-[0.25em]"
    style={{
      color: '#FFE86A',
      textShadow: '0 0 5px rgba(255,230,0,.35)',
    }}
  >
    {member.meta[0]}
  </span>

  <span
    className="crew-cursor mt-1 font-mono text-[11px] tracking-[0.25em]"
    style={{
      color: '#FFE86A',
      textShadow: '0 0 5px rgba(255,230,0,.35)',
    }}
  >
    {member.meta[1]}
  </span>

  <div className="crew-divider mt-4 w-32" />
</div>
      <h3
        ref={(el) => refs.text(2, el)}
        data-final-name={member.name}
        className={`crew-name mt-4 font-display font-black leading-[0.92] tracking-tight ${
          isFinal ? 'text-[clamp(3.2rem,9vw,6.5rem)]' : 'text-[clamp(2.6rem,6.5vw,5rem)]'
        }`
      }
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {member.name}
      </h3>
    </div>
  );

  return (
    <div ref={(el) => { sceneRootRef.current = el; refs.scene(el); }} data-crew-scene style={sceneStyle}>
      {isFinal ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:gap-12"
          style={{ transform: 'translateY(-70px)', pointerEvents: 'auto' }}
        >
          <div style={{ width: 'min(560px,54vw)' }}>{portrait}</div>
          {textBlock}
        </div>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="flex items-center gap-6 md:gap-12"
            style={{
              flexDirection: isLeft ? 'row' : 'row-reverse',
              transform: `translateX(${isLeft ? '-6vw' : '6vw'})`,
            }}
          >
            <div style={{ width: 'min(420px,38vw)' }}>{portrait}</div>
            {textBlock}
          </div>
        </div>
      )}

      <span className="pointer-events-none absolute bottom-7 right-6 font-mono text-[10px] tracking-[0.32em] text-gray-700">
        {String(index + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */

// One-shot decode scramble: characters briefly resolve from random symbols
// into the final text, like an encrypted record decrypting. Fires once per
// element, never replays while the record stays visible.
const SCRAMBLE_CHARS = '#@%/_=01*<>$';

// Tracks the in-flight decode RAF per element so we never accidentally run
// two decode loops on the same element (the dataset.decoded guard in
// revealText already prevents this, but the WeakMap is a hard guarantee).
const decodeRafs = new WeakMap<HTMLElement, number>();
function startDecode(el: HTMLElement) {
  const prev = decodeRafs.get(el);
  if (prev) cancelAnimationFrame(prev);
  const finalText = el.textContent ?? '';
  if (!finalText) return;
  const len = finalText.length;
  const duration = 170 + Math.random() * 70; // 170–240ms
  const start = performance.now();
  const step = (now: number) => {
    const t = (now - start) / duration;
    if (t >= 1) {
      el.textContent = finalText;
      decodeRafs.delete(el);
      return;
    }
    const resolved = Math.floor(t * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ' || i < resolved) out += ch;
      else out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
    }
    el.textContent = out;
    decodeRafs.set(el, requestAnimationFrame(step));
  };
  decodeRafs.set(el, requestAnimationFrame(step));
}

// Progressive text reveal: FILE → CODENAME → NAME (timing unchanged).
// Slots 0–2 are the decoded labels; slot 3 (metadata + divider) rides the
// codename's timing, slot 4 (status LED) rides the FILE label's timing.
function revealText(els: (HTMLElement | null)[], f: number, cache: SceneCache) {
  const fe = easeInOutCubic(clamp01(f));
  for (let j = 0; j < 3; j++) {
    const el = els[j];
    if (!el) continue;
    const op = clamp01((fe - j * 0.33) / 0.33);
    const opStr = String(op);
    if (opStr !== cache.textOpacity[j]) {
      el.style.opacity = opStr;
      cache.textOpacity[j] = opStr;
    }
    const tf = `translateY(${(1 - op) * 12}px)`;
    if (tf !== cache.textTransform[j]) {
      el.style.transform = tf;
      cache.textTransform[j] = tf;
    }
    if (op > 0.04 && !el.dataset.decoded) {
      el.dataset.decoded = '1';
      startDecode(el);
    }
  }
  const meta = els[3];
  if (meta) {
    const op = clamp01((fe - 0.33) / 0.33);
    const opStr = String(op);
    if (opStr !== cache.textOpacity[3]) {
      meta.style.opacity = opStr;
      cache.textOpacity[3] = opStr;
    }
    const tf = `translateY(${(1 - op) * 12}px)`;
    if (tf !== cache.textTransform[3]) {
      meta.style.transform = tf;
      cache.textTransform[3] = tf;
    }
  }
  const led = els[4];
  if (led) {
    const opStr = String(clamp01(fe));
    if (opStr !== cache.textOpacity[4]) {
      led.style.opacity = opStr;
      cache.textOpacity[4] = opStr;
    }
  }
}

function useCrewEngine(
  sectionRef: React.RefObject<HTMLElement | null>,
  sceneRefs: React.RefObject<(HTMLDivElement | null)[]>,
  textRefs: React.RefObject<(HTMLElement | null)[][]>,
) {
  const cacheRef = useRef<(SceneCache | null)[]>([]);

  // The camera target is driven by ScrollTrigger progress (which Lenis feeds).
  // The controller eases toward that target with momentum — a tiny cinematic
  // glide after the wheel stops, no overshoot, no bounce.
  useCameraScroll(
    sectionRef,
    (p) => (p < P_CAMERA ? (p / P_CAMERA) * CAMERA_TRAVEL : CAMERA_TRAVEL),
    (offset) => {
      const scenes = sceneRefs.current;
      const texts = textRefs.current;
      const caches = cacheRef.current;
      if (!scenes || !texts) return;

      // Active-scene windowing: only update current ± 1. All other scenes are
      // frozen at their last-written values (always opacity 0 when they left
      // the window, so they stay invisible). This covers every scene whose
      // depthOpacity is > 0, so visuals are identical.
      const current = Math.round((offset - START_Z) / SPACING);
      const lo = Math.max(0, current - 1);
      const hi = Math.min(COUNT - 1, current + 1);

      // Mark inactive scenes so CSS animations and glitch timers freeze.
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        if (!scene) continue;
        const shouldBeActive = i >= lo && i <= hi;
        const isActive = !scene.classList.contains('crew-scene-inactive');
        if (shouldBeActive && !isActive) scene.classList.remove('crew-scene-inactive');
        if (!shouldBeActive && isActive) scene.classList.add('crew-scene-inactive');
      }

      for (let i = lo; i <= hi; i++) {
        const scene = scenes[i];
        if (!scene) continue;

        let cache = caches[i];
        if (!cache) { cache = makeCache(); caches[i] = cache; }

        const z = -START_Z - i * SPACING + offset;
        const op = depthOpacity(z);

        // Cached transform + opacity — only write when the value actually
        // changes. No layout recalculation, just style mutation.
        const tf = `translateZ(${z}px)`;
        if (tf !== cache.transform) {
          scene.style.transform = tf;
          cache.transform = tf;
        }
        const opStr = String(op);
        if (opStr !== cache.opacity) {
          scene.style.opacity = opStr;
          cache.opacity = opStr;
        }

        // Throttled reveal: skip revealText entirely when the reveal
        // parameter hasn't moved enough to produce a visible change.
        let f: number;
        if (i === DAVID_INDEX) {
          // David reveals only during the dwell (after reaching camera).
          // Progress is reconstructed from the realized camera offset so the
          // text reveal inherits the same physical momentum.
          const p = offset / CAMERA_TRAVEL;
          f = (p - P_CAMERA) / DAVID_DWELL;
        } else {
          // Others reveal as they approach the camera.
          f = (z + REVEAL_START) / REVEAL_START;
        }
        if (Number.isNaN(cache.revealF) || Math.abs(f - cache.revealF) >= REVEAL_THRESHOLD) {
          cache.revealF = f;
          revealText(texts[i] ?? [], f, cache);
        }
      }
    },
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function CrewDatabase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[][]>([]);

  useCrewEngine(sectionRef, sceneRefs, textRefs);
  useCrewBoot(sectionRef);

  return (
    <section ref={sectionRef} id="crew" className="relative bg-[#050507]">
      <SectionHeader />
      <CrewFXStyles />

      {/* Scroll runway */}
 <div style={{ height: '480vh', position: 'relative' }}>
        {/* Pinned viewport */}
        <div
          className="crew-boot-stage"
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Background atmosphere — single static background for the entire Crew section */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
            <img
              src="https://ik.imagekit.io/zznoau6lx/Cybercoin%20webp/5248762.webp"
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#050507]/65" />
          </div>

          {/* Foreground 3D scene */}
          <div
            className="absolute inset-0"
            style={{
              perspective: `${PERSPECTIVE}px`,
              transformStyle: 'preserve-3d',
              overflow: 'visible',
              zIndex: 1,
            }}
          >
            {CREW.map((m, i) => (
              <CrewScene
                key={m.name}
                member={m}
                index={i}
                refs={{
                  scene: (el) => { sceneRefs.current[i] = el; },
                  text: (slot, el) => {
                    const row = textRefs.current[i] ?? [null, null, null, null, null];
                    row[slot] = el;
                    textRefs.current[i] = row;
                  },
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* End of transmission */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div
          className="h-px w-20"
          style={{ background: 'linear-gradient(90deg, transparent, #FF2D2D, transparent)' }}
        />
        <p className="mt-8 font-mono text-[10px] tracking-[0.45em] text-gray-700">
          END OF TRANSMISSION
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CYBER FRAME — cyberpunk data-chip portrait frame (HTML + Tailwind only)
   Keeps the image at exactly the same size/position; only adds the shell.
   ═══════════════════════════════════════════════════════════════════ */

/* Injected once. Only LED pulse + subtle holo border pulse animate.
   All other effects are static — premium frame without GPU cost. */
function CrewFXStyles() {
  return (
    <style>{`
/* ── The only two infinite animations kept ── */
@keyframes crewLedPulse {
  0%,100% { opacity: 0.4; box-shadow: 0 0 3px currentColor; }
  50% { opacity: 1; box-shadow: 0 0 6px currentColor; }
}
@keyframes crewHoloGlow {
  0%,100% { box-shadow: 0 0 14px rgba(0,240,255,0.18), inset 0 0 14px rgba(0,240,255,0.08); }
  50% { box-shadow: 0 0 22px rgba(0,240,255,0.3), inset 0 0 18px rgba(0,240,255,0.14); }
}
@keyframes crewFileLed {
  0%,100% { box-shadow: 0 0 2px rgba(0,240,255,0.4); }
  50% { box-shadow: 0 0 5px rgba(0,240,255,0.8); }
}
@keyframes crewCursorBlink {
  0%, 48% { opacity: 0.85; }
  50%, 100% { opacity: 0; }
}

/* ── Static decorative layers (no animation) ── */
.crew-scanlines { position:absolute; inset:0; background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.32) 2px, rgba(0,0,0,0.32) 3px); opacity:0.22; mix-blend-mode:multiply; pointer-events:none; }
.crew-holo { position:absolute; inset:0; border:1px solid rgba(0,240,255,0.28); animation: crewHoloGlow 5s ease-in-out infinite; pointer-events:none; }

/* ── Animations — paused on inactive scenes, running only on active ── */
.crew-led { animation: crewLedPulse 2s ease-in-out infinite; }
.crew-file-led {
  width: 5px; height: 5px; border-radius: 9999px;
  background: #00f0ff;
  animation: crewFileLed 2.6s ease-in-out infinite;
}

/* When a scene is not active, freeze all animations to save GPU. */
.crew-scene-inactive .crew-led,
.crew-scene-inactive .crew-holo,
.crew-scene-inactive .crew-file-led {
  animation-play-state: paused;
}

/* ── Static text gradients (shimmer/flow animations removed) ── */
.crew-codename {
  background: linear-gradient(100deg,
    rgba(0,240,255,0.45) 0%,
    rgba(0,240,255,0.95) 42%,
    rgba(210,250,255,0.98) 50%,
    rgba(0,240,255,0.95) 58%,
    rgba(0,240,255,0.45) 100%);
  background-size: 250% 100%;
  background-position: 50% 0;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 0 5px rgba(0,240,255,0.45));
}
.crew-name {
  background: linear-gradient(90deg,
    #00f0ff 0%, #4d7fff 12%, #b14dff 24%, #ff2ec4 36%,
    #ff4d8d 48%, #ffe600 60%, #ffffff 72%, #4d7fff 84%, #00f0ff 100%);
  background-size: 300% 100%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 0 8px rgba(0,240,255,0.28));
  transition: filter 0.35s ease-out;
  position: relative;
}

/* ── Static divider (sweep animation removed) ── */
.crew-divider {
  position: relative;
  height: 1px;
  overflow: hidden;
  opacity: 0.6;
  background: linear-gradient(90deg, transparent, rgba(0,240,255,0.45), transparent);
}

.crew-cursor::after {
  content: '▌';
  margin-left: 5px;
  color: rgba(0,240,255,0.7);
  animation: crewCursorBlink 1.3s steps(1) infinite;
}
.crew-scene-inactive .crew-cursor::after { animation-play-state: paused; }
    `}</style>
  );
}

/* Random micro-glitch + brief RGB split on the portrait image only.
   Fires every 6–12s, lasts 100–150ms. Only runs while the scene is active
   (no crew-scene-inactive class on an ancestor). No React re-renders, no layout. */
function useCyberGlitch(imgRef: React.RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    let killed = false;
    let to: ReturnType<typeof setTimeout>;
    const fire = () => {
      if (killed) return;
      // Skip glitch entirely if the scene is not in the active window.
      const scene = img.closest('[data-crew-scene]');
      if (scene && scene.classList.contains('crew-scene-inactive')) {
        to = setTimeout(fire, 4000);
        return;
      }
      const dur = 0.1 + Math.random() * 0.05; // 100–150ms
      const tx = (Math.random() - 0.5) * 5;
      const tl = gsap.timeline({ onComplete: () => gsap.set(img, { filter: 'none', x: 0 }) });
      tl.fromTo(
        img,
        { filter: 'drop-shadow(3px 0 #ff003c) drop-shadow(-3px 0 #00f0ff)' },
        { filter: 'drop-shadow(0px 0 rgba(255,0,60,0)) drop-shadow(0px 0 rgba(0,240,255,0))', duration: dur, ease: 'power2.out' },
      );
      tl.to(img, { x: tx, duration: dur * 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
      to = setTimeout(fire, 6000 + Math.random() * 6000);
    };
    to = setTimeout(fire, 6000 + Math.random() * 6000);
    return () => {
      killed = true;
      clearTimeout(to);
      gsap.killTweensOf(img);
    };
  }, [imgRef]);
}

function CyberFrame({ member, index }: { member: CrewMember; index: number }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  useCyberGlitch(imgRef);
  const d = (n: number) => `${(index * 0.7 + n).toFixed(2)}s`;
  return (
    <div className="relative h-full w-full">
      {/* Thick dark metallic outer shell with bevel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #23262b 0%, #0a0b0d 38%, #15171b 62%, #050608 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(0,240,255,0.18), inset 0 0 0 2px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,255,255,0.06), inset 0 -3px 10px rgba(0,0,0,0.9), 0 0 0 1px #000, 0 22px 50px rgba(0,0,0,0.85), 0 0 40px rgba(0,240,255,0.12)',
          clipPath:
            'polygon(0 14px, 14px 0, calc(100% - 28px) 0, 100% 28px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 28px 100%, 0 calc(100% - 28px))',
        }}
      >
        {/* Inner layered border — metallic mid plate */}
        <div
          className="absolute"
          style={{
            inset: '8px',
            background: 'linear-gradient(150deg, #14161a, #070809)',
            boxShadow:
              'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 2px rgba(0,0,0,0.6), inset 0 0 22px rgba(0,0,0,0.85)',
            clipPath:
              'polygon(0 10px, 10px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 22px 100%, 0 calc(100% - 22px))',
          }}
        >
          {/* Image well */}
          <div
            className="crew-card-well absolute overflow-hidden"
            style={{
              inset: '12px',
              boxShadow:
                'inset 0 0 0 1px rgba(0,240,255,0.25), inset 0 0 0 2px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.9)',
              clipPath:
                'polygon(0 8px, 8px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 18px 100%, 0 calc(100% - 18px))',
            }}
          >
            <img
              ref={imgRef}
              src={member.img}
              alt={member.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            {/* Color grade + diagonal holographic sheen (merged static overlay) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,5,7,0.15) 0%, transparent 22%, transparent 62%, rgba(5,5,7,0.72) 100%), repeating-linear-gradient(115deg, transparent 0px, transparent 5px, rgba(0,240,255,0.04) 5px, rgba(0,240,255,0.04) 6px)',
                mixBlendMode: 'screen',
              }}
            />
            {/* CRT scanlines (static) */}
            <div className="crew-scanlines" />
          </div>

          {/* Cyan glowing corner brackets */}
          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          {/* Top scan label bar */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between font-mono"
            style={{ top: '14px', fontSize: '7px', letterSpacing: '0.18em' }}
          >
            <span style={{ color: 'rgba(0,240,255,0.85)' }}>FILE VERIFIED</span>
            <span style={{ color: 'rgba(255,230,0,0.85)' }}>NC-2077</span>
          </div>

          {/* Bottom scan label bar */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between font-mono"
            style={{ bottom: '14px', fontSize: '7px', letterSpacing: '0.18em' }}
          >
            <span style={{ color: 'rgba(255,230,0,0.85)' }}>CREW DATA</span>
            <span style={{ color: 'rgba(0,240,255,0.7)' }}>{member.file}</span>
          </div>

          {/* Side micro text */}
          <div
            className="absolute font-mono"
            style={{
              left: '5px',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              fontSize: '6px',
              letterSpacing: '0.3em',
              color: 'rgba(255,230,0,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            NET-77//CHROME-2.1
          </div>
          <div
            className="absolute font-mono"
            style={{
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%) rotate(90deg)',
              transformOrigin: 'right center',
              fontSize: '6px',
              letterSpacing: '0.3em',
              color: 'rgba(0,240,255,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            ID:{member.file.replace(/\s/g, '')}
          </div>

          {/* Bolts / screws */}
          <Bolt style={{ top: '10px', left: '10px' }} />
          <Bolt style={{ top: '10px', right: '10px' }} />
          <Bolt style={{ bottom: '10px', left: '10px' }} />
          <Bolt style={{ bottom: '10px', right: '10px' }} />

          {/* Indicator LEDs (only animated elements kept) */}
          <div
            className="crew-led absolute"
            style={{
              top: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#00f0ff',
              background: '#00f0ff',
              animationDelay: d(0.1),
            }}
          />
          <div
            className="crew-led absolute"
            style={{
              top: '26px',
              right: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#ffe600',
              background: '#ffe600',
              animationDelay: d(0.5),
            }}
          />
          <div
            className="crew-led absolute"
            style={{
              bottom: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#ff2d2d',
              background: '#ff2d2d',
              animationDelay: d(0.9),
            }}
          />

          {/* Yellow industrial warning stripes — top + bottom edges (merged static) */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: '24px',
              right: '24px',
              top: '4px',
              height: '2px',
              background:
                'repeating-linear-gradient(45deg, rgba(255,230,0,0.6) 0px, rgba(255,230,0,0.6) 3px, transparent 3px, transparent 6px)',
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              left: '24px',
              right: '24px',
              bottom: '4px',
              height: '3px',
              background:
                'repeating-linear-gradient(45deg, #ffe600 0px, #ffe600 4px, #0a0b0d 4px, #0a0b0d 8px)',
              opacity: 0.7,
            }}
          />

          {/* Holographic edge glow (subtle pulse — only animation kept besides LEDs) */}
          <div className="crew-holo" style={{ animationDelay: d(0) }} />
        </div>
      </div>
    </div>
  );
}

function CornerBracket({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const base = 'absolute h-4 w-4';
  const map: Record<string, string> = {
    'top-left': 'left-2 top-2',
    'top-right': 'right-2 top-2',
    'bottom-left': 'left-2 bottom-2',
    'bottom-right': 'right-2 bottom-2',
  };
  const borderMap: Record<string, string> = {
    'top-left': 'border-l-2 border-t-2',
    'top-right': 'border-r-2 border-t-2',
    'bottom-left': 'border-l-2 border-b-2',
    'bottom-right': 'border-r-2 border-b-2',
  };
  return (
    <div
      className={`${base} ${map[position]} ${borderMap[position]}`}
      style={{ borderColor: '#00f0ff', boxShadow: '0 0 6px rgba(0,240,255,0.7)' }}
    />
  );
}

function Bolt({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        width: '7px',
        height: '7px',
        borderRadius: '9999px',
        background: 'radial-gradient(circle at 35% 35%, #5a5e66, #15171b 70%, #050608)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
        ...style,
      }}
    >
      <div
        style={{
          width: '3px',
          height: '1px',
          background: 'rgba(0,0,0,0.85)',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
}
