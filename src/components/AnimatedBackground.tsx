"use client";

import {
  AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { memo, useEffect } from "react";

type AuroraAnimationKeyframes = {
  opacity: number[];
  scale: number[];
  x: string[];
  y: string[];
};

const baseAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.18, 0.28, 0.22],
  scale: [0.98, 1.05, 1.01],
  x: ["-12%", "4%", "-6%"],
  y: ["-6%", "8%", "2%"],
};

const baseAuroraTransition = {
  duration: 28,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "mirror" as const,
  times: [0, 0.5, 1],
};

const delayedAuroraAnimation: AuroraAnimationKeyframes = {
  opacity: [0.255, 0.28, 0.22, 0.28, 0.18, 0.255],
  scale: [1.0325, 1.05, 1.01, 1.05, 0.98, 1.0325],
  x: ["0%", "4%", "-6%", "4%", "-12%", "0%"],
  y: ["4.5%", "8%", "2%", "8%", "-6%", "4.5%"],
};

const delayedAuroraTransition = {
  duration: 64,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
  times: [0, 0.0625, 0.3125, 0.5625, 0.8125, 1],
};

const haloAnimation: AuroraAnimationKeyframes = {
  opacity: [0.2354, 0.3, 0.2, 0.3, 0.18, 0.2354],
  scale: [1.0662, 1.12, 1.04, 1.12, 1.02, 1.0662],
  x: ["-1.85%", "-4%", "6%", "-4%", "0%", "-1.85%"],
  y: ["-2.77%", "-6%", "4%", "-6%", "0%", "-2.77%"],
};

const haloTransition = {
  duration: 52,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
  times: [0, 0.1346, 0.3846, 0.6346, 0.8846, 1],
};


const AnimatedBackground = memo(function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();

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

  useEffect(() => {
    if (shouldReduceMotion) {
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

    const baseXLoop = animate(baseX, baseAuroraAnimation.x, baseAuroraTransition);
    const baseYLoop = animate(baseY, baseAuroraAnimation.y, baseAuroraTransition);
    const delayedXLoop = animate(delayedX, delayedAuroraAnimation.x, delayedAuroraTransition);
    const delayedYLoop = animate(delayedY, delayedAuroraAnimation.y, delayedAuroraTransition);
    const haloXLoop = animate(haloX, haloAnimation.x, haloTransition);
    const haloYLoop = animate(haloY, haloAnimation.y, haloTransition);

    controls.push(
      baseXLoop,
      baseYLoop,
      delayedXLoop,
      delayedYLoop,
      haloXLoop,
      haloYLoop,
    );

    startBase();
    startDelayed();
    startHalo();

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
    shouldReduceMotion,
  ]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f7] via-[#f3f1ec] to-[#ece8e0]" />
      {shouldReduceMotion ? (
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),rgba(255,255,255,0))] opacity-40 blur-[120px]" />
      ) : (
        <>
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0))] blur-[160px]"
            style={{ opacity: baseOpacity, scale: baseScale, x: baseX, y: baseY }}
          />
          <motion.div
            aria-hidden
            className="absolute left-[22%] top-[42%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(183,146,90,0.32),rgba(183,146,90,0))] blur-[140px]"
            style={{
              opacity: delayedOpacity,
              scale: delayedScale,
              x: delayedX,
              y: delayedY,
            }}
          />
          <motion.div
            aria-hidden
            className="absolute right-[14%] top-[26%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,247,236,0.32),rgba(255,247,236,0))] blur-[110px]"
            style={{ opacity: haloOpacity, scale: haloScale, x: haloX, y: haloY }}
          />
        </>
      )}
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
