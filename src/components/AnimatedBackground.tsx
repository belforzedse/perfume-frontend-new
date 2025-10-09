"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

const AnimatedBackground = memo(function AnimatedBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f9f7] via-[#f3f1ec] to-[#ece8e0]" />
      {shouldReduceMotion ? (
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),rgba(255,255,255,0))] opacity-40 blur-[120px]" />
      ) : (
        <>
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(255,255,255,0))] blur-[160px] animate-aurora-layer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute left-[22%] top-[42%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(183,146,90,0.32),rgba(183,146,90,0))] blur-[140px] animate-aurora-layer-delayed"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute right-[14%] top-[26%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,247,236,0.32),rgba(255,247,236,0))] blur-[110px] animate-halo-layer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
        </>
      )}
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
