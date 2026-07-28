import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Camera physics controller for the Crew Database.
 *
 * Pipeline:
 *   wheel → Lenis → ScrollTrigger.progress → targetOffset
 *     → physics (velocity + friction + damping) → currentOffset
 *     → translateZ / opacity / text reveal
 *
 * The physics is a critically-damped first-order system (NOT a spring, NOT a
 * nested LERP). It tracks the target with momentum so the image keeps drifting
 * a hair forward after the user stops, then settles — like a heavy cinematic
 * camera. No overshoot, no bounce.
 *
 * Tuned constants:
 *   STIFFNESS — how hard the camera pulls toward target (higher = snappier)
 *   DAMPING   — velocity decay (higher = less glide)
 *
 * Critical damping (no overshoot) requires DAMPING = 2 * sqrt(STIFFNESS).
 * We keep a touch of sub-critical glide by staying just above critical.
 */

const STIFFNESS = 90;   // pull toward target
const DAMPING = 20;     // velocity friction (> 2*sqrt(90) ≈ 18.97 → no overshoot)
const SUBSTEP = 1 / 120; // fixed physics timestep (s)

// Idle / dead-zone thresholds (in px). The camera is considered at rest when
// both position-error and velocity are within these bounds. Below these, the
// RAF loop self-terminates and no DOM work is produced.
const IDLE_EPSILON = 0.01;    // |position - target| below this = settled
const IDLE_VEPSILON = 0.01;   // |velocity| below this = settled
// onUpdate is only re-invoked when the realized position moves by at least this
// much since the last dispatch. Sub-pixel jitter below this is invisible.
const UPDATE_THRESHOLD = 0.001;
// Dead-zone: while settled AND |delta| stays below this, skip dispatch entirely.
// Larger than IDLE_EPSILON so a hair of residual motion is swallowed.
const DEAD_ZONE = 0.05;

export interface CameraState {
  position: number; // current camera offset (px)
  velocity: number; // px/s
}

export interface CameraController {
  setTarget: (t: number) => void;
  state: CameraState;
  /** True while the RAF loop is stopped (camera at rest). */
  isIdle: () => boolean;
  kill: () => void;
}

export function createCameraController(
  initial: number,
  onUpdate: (offset: number) => void,
): CameraController {
  const state: CameraState = { position: initial, velocity: 0 };
  let target = initial;
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  let running = false;
  let lastDispatched = initial - 999; // forces first dispatch

  // Run the physics + dispatch loop. Self-terminates when the camera settles.
  const step = (now: number) => {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05; // clamp huge gaps (tab switch)

    acc += dt;
    while (acc >= SUBSTEP) {
      // Spring-damper: a = -k(x - target) - c*v
      const accel = STIFFNESS * (target - state.position) - DAMPING * state.velocity;
      state.velocity += accel * SUBSTEP;
      state.position += state.velocity * SUBSTEP;
      acc -= SUBSTEP;
    }

    // Dead-zone + idle gate: if residual motion is below the dead-zone and we
    // are effectively at the target, snap to rest and stop the loop.
    const delta = target - state.position;
    const atTarget = Math.abs(delta) < DEAD_ZONE;
    const stopped = Math.abs(state.velocity) < IDLE_VEPSILON;
    if (atTarget && stopped) {
      // Snap exactly onto target to avoid a permanent sub-threshold offset.
      if (state.position !== target) state.position = target;
      state.velocity = 0;
      // Final dispatch so consumers see the exact settled value.
      if (Math.abs(state.position - lastDispatched) >= UPDATE_THRESHOLD) {
        lastDispatched = state.position;
        onUpdate(state.position);
      }
      running = false;
      return;
    }

    // Throttle: only dispatch when the realized position moved enough to be
    // visually meaningful. Sub-UPDATE_THRESHOLD jitter is swallowed.
    if (Math.abs(state.position - lastDispatched) >= UPDATE_THRESHOLD) {
      lastDispatched = state.position;
      onUpdate(state.position);
    }

    raf = requestAnimationFrame(step);
  };

  // (Re)start the loop if it isn't already running.
  const ensureRunning = () => {
    if (running) return;
    running = true;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(step);
  };

  // Any new target wakes the loop. The loop will put itself back to sleep once
  // it settles on the new target. Identical target is a no-op.
  const setTarget = (t: number) => {
    if (t !== target) {
      target = t;
      ensureRunning();
    }
  };

  // Kick off the initial loop so the first frame is produced.
  ensureRunning();

  return {
    state,
    setTarget,
    isIdle: () => !running,
    kill: () => {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}

/**
 * Hook: binds a ScrollTrigger to a physics-driven camera.
 *
 * `mapProgress` converts ScrollTrigger progress (0..1) into a target camera
 * offset. The controller then eases toward that target with momentum, and
 * `onUpdate` is called (only when the realized offset actually changes) with
 * the realized offset.
 */
export function useCameraScroll(
  triggerEl: React.RefObject<HTMLElement | null>,
  mapProgress: (p: number) => number,
  onCameraUpdate: (offset: number) => void,
) {
  const controllerRef = useRef<CameraController | null>(null);

  useEffect(() => {
    const el = triggerEl.current;
    if (!el) return;

    const controller = createCameraController(0, onCameraUpdate);
    controllerRef.current = controller;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        controller.setTarget(mapProgress(self.progress));
      },
    });

    return () => {
      trigger.kill();
      controller.kill();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return controllerRef;
}
