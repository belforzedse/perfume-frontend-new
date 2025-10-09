"use client";

import {
  AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
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

const baseAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.18, 0.28, 0.22] as number[],
  scale: [0.98, 1.05, 1.01] as number[],
  x: ["-12%", "4%", "-6%"] as string[],
  y: ["-6%", "8%", "2%"] as string[],
};

const baseAuroraTransition = {
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

const delayedAuroraTransition = {
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

const haloTransition = {
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

const leafTransition = {
  duration: 46,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.52, 1],
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

  const baseOpacity = useMotionValue(0);
  const baseScale = useMotionValue(0.9);
  const baseX = useMotionValue(baseAuroraAnimation.x[0]);
  const baseY = useMotionValue(baseAuroraAnimation.y[0]);

  const delayedOpacity = useMotionValue(0);
  const delayedScale = useMotionValue(0.92);
  const delayedX = useMotionValue(delayedAuroraAnimation.x[0]);
  const delayedY = useMotionValue(delayedAuroraAnimation.y[0]);

  const haloOpacity = useMotionValue(0);
  const haloScale = useMotionValue(0.9);
  const haloX = useMotionValue(haloAnimation.x[0]);
  const haloY = useMotionValue(haloAnimation.y[0]);

  const leafOpacity = useMotionValue(0);
  const leafScale = useMotionValue(0.82);
  const leafX = useMotionValue(leafAnimation.x[0]);
  const leafY = useMotionValue(leafAnimation.y[0]);
  const leafRotate = useMotionValue(leafAnimation.rotate[0]);

  useEffect(() => {
    if (shouldReduceMotion || isLowCapability) {
      return;
    }

    const controls: AnimationPlaybackControls[] = [];
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    let isActive = true;

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, ms);
        timeouts.push(timeout);
      });

    const startBase = async () => {
      await delay(100);

      if (!isActive) {
        return;
      }

      const fadeOpacity = animate(baseOpacity, baseAuroraAnimation.opacity[0], {
        duration: 1.2,
        ease: "easeOut",
      });
      const fadeScale = animate(baseScale, baseAuroraAnimation.scale[0], {
        duration: 1.2,
        ease: "easeOut",
      });

      controls.push(fadeOpacity, fadeScale);
      await Promise.all([fadeOpacity.finished, fadeScale.finished]);

      if (!isActive) {
        return;
      }

      const opacityLoop = animate(
        baseOpacity,
        baseAuroraAnimation.opacity,
        baseAuroraTransition,
      );
      const scaleLoop = animate(baseScale, baseAuroraAnimation.scale, baseAuroraTransition);
      controls.push(opacityLoop, scaleLoop);
    };

    const startDelayed = async () => {
      await delay(200);

      if (!isActive) {
        return;
      }

      const fadeOpacity = animate(delayedOpacity, delayedAuroraAnimation.opacity[0], {
        duration: 1.5,
        ease: "easeOut",
      });
      const fadeScale = animate(delayedScale, delayedAuroraAnimation.scale[0], {
        duration: 1.5,
        ease: "easeOut",
      });

      controls.push(fadeOpacity, fadeScale);
      await Promise.all([fadeOpacity.finished, fadeScale.finished]);

      if (!isActive) {
        return;
      }

      const opacityLoop = animate(
        delayedOpacity,
        delayedAuroraAnimation.opacity,
        delayedAuroraTransition,
      );
      const scaleLoop = animate(
        delayedScale,
        delayedAuroraAnimation.scale,
        delayedAuroraTransition,
      );
      controls.push(opacityLoop, scaleLoop);
    };

    const startHalo = async () => {
      await delay(250);

      if (!isActive) {
        return;
      }

      const fadeOpacity = animate(haloOpacity, haloAnimation.opacity[0], {
        duration: 1.6,
        ease: "easeOut",
      });
      const fadeScale = animate(haloScale, haloAnimation.scale[0], {
        duration: 1.6,
        ease: "easeOut",
      });

      controls.push(fadeOpacity, fadeScale);
      await Promise.all([fadeOpacity.finished, fadeScale.finished]);

      if (!isActive) {
        return;
      }

      const opacityLoop = animate(haloOpacity, haloAnimation.opacity, haloTransition);
      const scaleLoop = animate(haloScale, haloAnimation.scale, haloTransition);
      controls.push(opacityLoop, scaleLoop);
    };

    const startLeaf = async () => {
      await delay(320);

      if (!isActive) {
        return;
      }

      const fadeOpacity = animate(leafOpacity, leafAnimation.opacity[0], {
        duration: 1.8,
        ease: "easeOut",
      });
      const fadeScale = animate(leafScale, leafAnimation.scale[0], {
        duration: 1.8,
        ease: "easeOut",
      });

      controls.push(fadeOpacity, fadeScale);
      await Promise.all([fadeOpacity.finished, fadeScale.finished]);

      if (!isActive) {
        return;
      }

      const opacityLoop = animate(leafOpacity, leafAnimation.opacity, leafTransition);
      const scaleLoop = animate(leafScale, leafAnimation.scale, leafTransition);
      controls.push(opacityLoop, scaleLoop);
    };

    const baseXLoop = animate(baseX, baseAuroraAnimation.x, baseAuroraTransition);
    const baseYLoop = animate(baseY, baseAuroraAnimation.y, baseAuroraTransition);
    const delayedXLoop = animate(delayedX, delayedAuroraAnimation.x, delayedAuroraTransition);
    const delayedYLoop = animate(delayedY, delayedAuroraAnimation.y, delayedAuroraTransition);
    const haloXLoop = animate(haloX, haloAnimation.x, haloTransition);
    const haloYLoop = animate(haloY, haloAnimation.y, haloTransition);
    const leafXLoop = animate(leafX, leafAnimation.x, leafTransition);
    const leafYLoop = animate(leafY, leafAnimation.y, leafTransition);
    const leafRotateLoop = animate(leafRotate, leafAnimation.rotate, leafTransition);

    controls.push(
      baseXLoop,
      baseYLoop,
      delayedXLoop,
      delayedYLoop,
      haloXLoop,
      haloYLoop,
      leafXLoop,
      leafYLoop,
      leafRotateLoop,
    );

    startBase();
    startDelayed();
    startHalo();
    startLeaf();

    return () => {
      isActive = false;
      controls.forEach((control) => control.stop());
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [
    baseOpacity,
    baseScale,
    baseX,
    baseY,
    delayedOpacity,
    delayedScale,
    delayedX,
    delayedY,
    haloOpacity,
    haloScale,
    haloX,
    haloY,
    leafOpacity,
    leafScale,
    leafX,
    leafY,
    leafRotate,
    isLowCapability,
    shouldReduceMotion,
  ]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f7] via-[#f3f1ec] to-[#ece8e0]" />
      {shouldReduceMotion || isLowCapability ? (
        <>
          <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),rgba(255,255,255,0))] opacity-40 blur-[120px]" />
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
            className="absolute left-1/2 top-[18%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0))] blur-[140px]"
            style={{ opacity: baseOpacity, scale: baseScale, x: baseX, y: baseY }}
          />
          <motion.div
            aria-hidden
            className="absolute left-[22%] top-[42%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(183,146,90,0.32),rgba(183,146,90,0))] blur-[120px]"
            style={{
              opacity: delayedOpacity,
              scale: delayedScale,
              x: delayedX,
              y: delayedY,
            }}
          />
          <motion.div
            aria-hidden
            className="absolute right-[14%] top-[26%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(255,247,236,0.32),rgba(255,247,236,0))] blur-[96px]"
            style={{ opacity: haloOpacity, scale: haloScale, x: haloX, y: haloY }}
          />
          <motion.svg
            aria-hidden
            className="absolute left-[12%] top-[18%] h-[300px] w-[300px] text-[#9dbb9f]"
            fill="currentColor"
            viewBox="0 0 120 120"
            style={{
              opacity: leafOpacity,
              scale: leafScale,
              x: leafX,
              y: leafY,
              rotate: leafRotate,
            }}
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
