"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { durations, useFadeScaleVariants } from "@/lib/motion";

interface IdleTimerProps {
  timeoutMs: number;
  onIdle?: () => void;
  isActive: boolean;
}

export default function IdleTimer({ timeoutMs, onIdle, isActive }: IdleTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutMs);
  const [isVisible, setIsVisible] = useState(false);
  const timerVariants = useFadeScaleVariants({ y: 16, scale: 0.92, blur: 12, duration: durations.moderate });

  // Reset when component mounts or timeoutMs changes
  useEffect(() => {
    setTimeRemaining(timeoutMs);
    setIsVisible(false);
  }, [timeoutMs]);

  useEffect(() => {
    if (!isActive || timeoutMs === 0) {
      setIsVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = Math.max(0, prev - 1000);

        // Show widget in last 30 seconds
        if (next <= 30000 && next > 0) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }

        if (next <= 0 && onIdle) {
          onIdle();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutMs, isActive, onIdle]);

  if (!isVisible || !isActive || timeoutMs === 0) return null;

  const seconds = Math.max(0, Math.ceil(timeRemaining / 1000));
  const progress = (timeRemaining / timeoutMs) * 100;

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-50"
      variants={timerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <div className="glass-surface rounded-2xl px-4 py-3 shadow-lg backdrop-blur-xl border border-white/30 flex items-center justify-center">
        {/* Circular Progress */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300/30"
            />
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 15.5}`}
              strokeDashoffset={`${2 * Math.PI * 15.5 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${
                seconds <= 10 ? 'text-red-500' : seconds <= 20 ? 'text-orange-500' : 'text-[var(--color-accent)]'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute text-xs font-semibold ${
            seconds <= 10 ? 'text-red-600' : 'text-[var(--color-foreground-muted)]'
          }`}>
            {seconds}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
