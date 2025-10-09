"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo, useEffect, useState } from "react";

type AuroraAnimationKeyframes = {
  opacity: number[];
  scale: number[];
  x: string[];
  y: string[];
};

type LeafAnimationKeyframes = AuroraAnimationKeyframes & {
  rotate: number[];
};

type RepeatingTransition = {
  duration: number;
  ease: "easeInOut";
  repeat: number;
  repeatType: "mirror" | "loop";
  times: number[];
};

const baseAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.18, 0.28, 0.22] as number[],
  scale: [0.98, 1.05, 1.01] as number[],
  x: ["-12%", "4%", "-6%"] as string[],
  y: ["-6%", "8%", "2%"] as string[],
};

const baseAuroraTransition: RepeatingTransition = {
  duration: 28,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.5, 1],
};

const delayedAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.255, 0.28, 0.22, 0.28, 0.18, 0.255] as number[],
  scale: [1.0325, 1.05, 1.01, 1.05, 0.98, 1.0325] as number[],
  x: ["0%", "4%", "-6%", "4%", "-12%", "0%"] as string[],
  y: ["4.5%", "8%", "2%", "8%", "-6%", "4.5%"] as string[],
};

const delayedAuroraTransition: RepeatingTransition = {
  duration: 64,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
  times: [0, 0.0625, 0.3125, 0.5625, 0.8125, 1],
};

const haloAnimation: AuroraAnimationKeyframes = {
  opacity: [0.2354, 0.3, 0.2, 0.3, 0.18, 0.2354] as number[],
  scale: [1.0662, 1.12, 1.04, 1.12, 1.02, 1.0662] as number[],
  x: ["-1.85%", "-4%", "6%", "-4%", "0%", "-1.85%"] as string[],
  y: ["-2.77%", "-6%", "4%", "-6%", "0%", "-2.77%"] as string[],
};

const haloTransition: RepeatingTransition = {
  duration: 52,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
  times: [0, 0.1346, 0.3846, 0.6346, 0.8846, 1],
};

const leafAnimation: LeafAnimationKeyframes = {
  opacity: [0.04, 0.085, 0.06] as number[],
  scale: [0.88, 1.02, 0.95] as number[],
  x: ["-22%", "6%", "-12%"] as string[],
  y: ["-16%", "14%", "-6%"] as string[],
  rotate: [-6, 4, -3] as number[],
};

const leafTransition: RepeatingTransition = {
  duration: 46,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.52, 1],
};

const createAuroraMotionProps = (
  animation: AuroraAnimationKeyframes,
  transition: RepeatingTransition,
  delay = 0,
) => ({
  initial: {
    opacity: animation.opacity[0],
    scale: animation.scale[0],
    x: animation.x[0],
    y: animation.y[0],
  },
  animate: {
    opacity: animation.opacity,
    scale: animation.scale,
    x: animation.x,
    y: animation.y,
  },
  transition: {
    opacity: { ...transition, delay },
    scale: { ...transition, delay },
    x: { ...transition, delay },
    y: { ...transition, delay },
  },
});

const createLeafMotionProps = (
  animation: LeafAnimationKeyframes,
  transition: RepeatingTransition,
  delay = 0,
) => ({
  initial: {
    opacity: animation.opacity[0],
    scale: animation.scale[0],
    x: animation.x[0],
    y: animation.y[0],
    rotate: animation.rotate[0],
  },
  animate: {
    opacity: animation.opacity,
    scale: animation.scale,
    x: animation.x,
    y: animation.y,
    rotate: animation.rotate,
  },
  transition: {
    opacity: { ...transition, delay },
    scale: { ...transition, delay },
    x: { ...transition, delay },
    y: { ...transition, delay },
    rotate: { ...transition, delay },
  },
});

const BASE_AURORA_MOTION_PROPS = createAuroraMotionProps(
  baseAuroraAnimation,
  baseAuroraTransition,
  0.1,
);

const DELAYED_AURORA_MOTION_PROPS = createAuroraMotionProps(
  delayedAuroraAnimation,
  delayedAuroraTransition,
  0.2,
);

const HALO_MOTION_PROPS = createAuroraMotionProps(haloAnimation, haloTransition, 0.25);

const LEAF_MOTION_PROPS = createLeafMotionProps(leafAnimation, leafTransition, 0.32);


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

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f7] via-[#f3f1ec] to-[#ece8e0]" />
      {shouldReduceMotion || isLowCapability ? (
        <>
          <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_70%)] opacity-45" />
          <svg
            aria-hidden
            className="absolute left-[14%] top-[22%] h-[260px] w-[260px] text-[#a8c6aa]"
            fill="currentColor"
            viewBox="0 0 120 120"
          >
            <path d="M60 6c18 9 36 39 30 63-5 19-24 30-42 27-16-2-29-15-31-31-3-24 25-54 43-59Z" opacity={0.35} />
            <path d="M36 48c12-12 32-18 48-12-4 14-17 26-30 32-14 8-33 12-42 0 4-9 13-16 24-20Z" opacity={0.18} />
          </svg>
        </>
      ) : (
        <>
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[18%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_72%)]"
            {...BASE_AURORA_MOTION_PROPS}
          />
          <motion.div
            aria-hidden
            className="absolute left-[22%] top-[42%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(183,146,90,0.28)_0%,rgba(183,146,90,0)_70%)]"
            {...DELAYED_AURORA_MOTION_PROPS}
          />
          <motion.div
            aria-hidden
            className="absolute right-[14%] top-[26%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,247,236,0.3)_0%,rgba(255,247,236,0)_68%)]"
            {...HALO_MOTION_PROPS}
          />
          <motion.svg
            aria-hidden
            className="absolute left-[12%] top-[18%] h-[300px] w-[300px] text-[#9dbb9f]"
            fill="currentColor"
            viewBox="0 0 120 120"
            {...LEAF_MOTION_PROPS}
          >
            <path d="M60 6c18 9 36 39 30 63-5 19-24 30-42 27-16-2-29-15-31-31-3-24 25-54 43-59Z" opacity={0.4} />
            <path d="M36 48c12-12 32-18 48-12-4 14-17 26-30 32-14 8-33 12-42 0 4-9 13-16 24-20Z" opacity={0.22} />
          </motion.svg>
        </>
      )}
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
