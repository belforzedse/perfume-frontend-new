"use client";

import {
  LazyMotion,
  animate,
  domAnimation,
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";

type AuroraAnimationKeyframes = {
  opacity: number[];
  scale: number[];
  x: number[];
  y: number[];
  rotate?: number[];
};

type RepeatingTransition = {
  duration: number;
  ease: "easeInOut";
  repeat: number;
  repeatType: "mirror" | "loop";
  times: number[];
};

const baseAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.34, 0.52, 0.42] as number[],
  scale: [0.96, 1.08, 1.02] as number[],
  x: [-18, 6, -10] as number[],
  y: [-12, 10, -2] as number[],
};

const baseAuroraTransition: RepeatingTransition = {
  duration: 28,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.5, 1],
};

const delayedAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.42, 0.56, 0.46, 0.58, 0.36, 0.42] as number[],
  scale: [1.02, 1.12, 1.06, 1.12, 0.98, 1.02] as number[],
  x: [-4, 12, -8, 10, -16, -4] as number[],
  y: [12, 18, 6, 18, -4, 12] as number[],
};

const delayedAuroraTransition: RepeatingTransition = {
  duration: 64,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
  times: [0, 0.0625, 0.3125, 0.5625, 0.8125, 1],
};

const leafAnimation: AuroraAnimationKeyframes = {
  opacity: [0.36, 0.5, 0.4] as number[],
  scale: [0.82, 1.06, 0.92] as number[],
  x: [-24, 8, -14] as number[],
  y: [-24, 16, -10] as number[],
  rotate: [-18, -6, 6] as number[],
};

const leafTransition: RepeatingTransition = {
  duration: 46,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.52, 1],
};

const streakAnimation: AuroraAnimationKeyframes = {
  opacity: [0.16, 0.32, 0.22, 0.3] as number[],
  scale: [0.92, 1.08, 1.02, 0.96] as number[],
  x: [18, 22, 16, 20] as number[],
  y: [-8, -2, -6, -10] as number[],
  rotate: [-8, -2, -6, -10] as number[],
};

const streakTransition: RepeatingTransition = {
  duration: 38,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.28, 0.64, 1],
};

const ringAnimation: AuroraAnimationKeyframes = {
  opacity: [0.08, 0.2, 0.12, 0.24, 0.1] as number[],
  scale: [0.88, 1.04, 0.92, 1.08, 0.94] as number[],
  x: [-26, -20, -24, -18, -26] as number[],
  y: [24, 20, 28, 18, 24] as number[],
};

const ringTransition: RepeatingTransition = {
  duration: 56,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.22, 0.48, 0.78, 1],
};

const useAuroraAnimation = (
  animation: AuroraAnimationKeyframes,
  transition: RepeatingTransition,
  delay: number,
  isEnabled: boolean,
) => {
  const x = useMotionValue(animation.x[0]);
  const y = useMotionValue(animation.y[0]);
  const scale = useMotionValue(animation.scale[0]);
  const opacity = useMotionValue(animation.opacity[0]);
  const rotate = useMotionValue(animation.rotate?.[0] ?? 0);

  useEffect(() => {
    if (!isEnabled) {
      x.set(animation.x[0]);
      y.set(animation.y[0]);
      scale.set(animation.scale[0]);
      opacity.set(animation.opacity[0]);
      rotate.set(animation.rotate?.[0] ?? 0);
      return;
    }

    const animations = [
      animate(x, animation.x, { ...transition, delay }),
      animate(y, animation.y, { ...transition, delay }),
      animate(scale, animation.scale, { ...transition, delay }),
      animate(opacity, animation.opacity, { ...transition, delay }),
    ];

    if (animation.rotate) {
      animations.push(animate(rotate, animation.rotate, { ...transition, delay }));
    }

    return () => {
      animations.forEach((controls) => controls.stop());
    };
  }, [animation, delay, isEnabled, opacity, rotate, scale, transition, x, y]);

  const transform = useMotionTemplate`translate3d(${x}%, ${y}%, 0) rotate(${rotate}deg) scale(${scale})`;

  return useMemo(
    () => ({
      opacity,
      transform,
      willChange: "transform, opacity",
    }),
    [opacity, transform],
  );
};


/**
 * Animated aurora background that gracefully degrades on lower-capability devices.
 *
 * The component checks for coarse pointers, limited `navigator.deviceMemory`, and an
 * opt-in `staticBackground` query parameter to decide whether to bypass GPU-heavy
 * animations. When any of those signals are present (or motion reduction is requested)
 * the static fallback markup is rendered so that other pages can safely reuse this
 * component without worrying about device capability checks.
 */
const AnimatedBackground = memo(function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();
  const [isLowCapability, setIsLowCapability] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const prefersStatic = searchParams.has("staticBackground");

    const coarsePointerQuery = window.matchMedia?.("(pointer: coarse)");

    const nav = window.navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = nav.deviceMemory;
    const isLowMemory = typeof deviceMemory === "number" && deviceMemory > 0 && deviceMemory <= 4;

    const computeCapability = (hasCoarsePointer: boolean) =>
      prefersStatic || isLowMemory || hasCoarsePointer;

    setIsLowCapability(computeCapability(coarsePointerQuery?.matches ?? false));

    if (!coarsePointerQuery) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setIsLowCapability(computeCapability(event.matches));
    };

    coarsePointerQuery.addEventListener("change", handleChange);

    return () => {
      coarsePointerQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const isAnimated = !(shouldReduceMotion || isLowCapability);

  const baseAuroraStyle = useAuroraAnimation(baseAuroraAnimation, baseAuroraTransition, 0.1, isAnimated);
  const delayedAuroraStyle = useAuroraAnimation(
    delayedAuroraAnimation,
    delayedAuroraTransition,
    0.2,
    isAnimated,
  );
  const leafStyle = useAuroraAnimation(leafAnimation, leafTransition, 0.32, isAnimated);
  const streakStyle = useAuroraAnimation(streakAnimation, streakTransition, 0.18, isAnimated);
  const ringStyle = useAuroraAnimation(ringAnimation, ringTransition, 0.28, isAnimated);

  return (
    <LazyMotion features={domAnimation}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,250,244,0.8)_0%,rgba(247,239,224,0.85)_48%,rgba(236,230,216,0.95)_100%)]" />
        {isAnimated ? (
          <>
            <m.div
              aria-hidden
              className="absolute left-[44%] top-[12%] h-[520px] w-[620px] -translate-x-1/2 -rotate-[22deg] rounded-[120px] bg-[linear-gradient(120deg,rgba(255,193,135,0.65)_0%,rgba(238,144,154,0.55)_42%,rgba(255,255,255,0.5)_100%)] shadow-[0_48px_140px_rgba(217,144,128,0.35)] mix-blend-screen"
              style={baseAuroraStyle}
            />
            <m.div
              aria-hidden
              className="absolute left-[18%] top-[42%] h-[460px] w-[540px] -rotate-[12deg] rounded-[130px] bg-[linear-gradient(145deg,rgba(125,170,157,0.6)_0%,rgba(168,205,185,0.5)_35%,rgba(247,255,215,0.45)_100%)] shadow-[0_42px_120px_rgba(120,169,150,0.38)] mix-blend-screen"
              style={delayedAuroraStyle}
            />
            <m.div
              aria-hidden
              className="pointer-events-none absolute right-[16%] top-[12%] h-[320px] w-[240px] -rotate-[28deg] rounded-[100px] bg-[linear-gradient(110deg,rgba(255,255,255,0.32)_0%,rgba(255,199,155,0.26)_36%,rgba(238,151,170,0.24)_100%)] opacity-70 mix-blend-screen"
              style={streakStyle}
            />
            <m.div
              aria-hidden
              className="pointer-events-none absolute left-[10%] bottom-[20%] h-[360px] w-[360px] rounded-full border border-white/30 bg-[radial-gradient(circle,rgba(247,255,247,0.12)_0%,rgba(189,214,193,0.16)_45%,rgba(255,255,255,0.04)_100%)] opacity-70 mix-blend-screen"
              style={ringStyle}
            />
            <m.svg
              aria-hidden
              className="absolute left-[10%] top-[12%] h-[340px] w-[340px] text-[#9dbb9f]"
              fill="currentColor"
              viewBox="0 0 120 120"
              style={leafStyle}
            >
              <path d="M60 6c18 9 36 39 30 63-5 19-24 30-42 27-16-2-29-15-31-31-3-24 25-54 43-59Z" opacity={0.55} />
              <path d="M36 48c12-12 32-18 48-12-4 14-17 26-30 32-14 8-33 12-42 0 4-9 13-16 24-20Z" opacity={0.32} />
            </m.svg>
          </>
        ) : (
          <>
            <div className="absolute left-[42%] top-[18%] h-[420px] w-[560px] -translate-x-1/2 -rotate-[22deg] rounded-[72px] bg-[linear-gradient(115deg,rgba(255,196,132,0.66)_0%,rgba(241,140,140,0.5)_45%,rgba(255,255,255,0.45)_100%)] opacity-80 mix-blend-screen" />
            <div className="pointer-events-none absolute right-[16%] top-[20%] h-[280px] w-[220px] -rotate-[28deg] rounded-[90px] bg-[linear-gradient(110deg,rgba(255,255,255,0.28)_0%,rgba(255,205,164,0.22)_40%,rgba(235,163,176,0.18)_100%)] opacity-65 mix-blend-screen" />
            <div className="pointer-events-none absolute left-[10%] bottom-[18%] h-[320px] w-[320px] rounded-full border border-white/25 bg-[radial-gradient(circle,rgba(244,255,244,0.1)_0%,rgba(187,210,190,0.14)_45%,rgba(255,255,255,0.04)_100%)] opacity-65 mix-blend-screen" />
          </>
        )}
      </div>
    </LazyMotion>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
