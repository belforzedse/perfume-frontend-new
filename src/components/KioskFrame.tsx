"use client";

import React, { startTransition, useEffect, useRef, useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import IdleTimer from "@/components/IdleTimer";

const QUESTIONNAIRE_TIMEOUT_MS = 30_000; // 30 seconds
const RECOMMENDATIONS_TIMEOUT_MS = 120_000; // 2 minutes
const NON_INTERACTIVE_KEYS = new Set([
  "Shift",
  "Meta",
  "Control",
  "Alt",
  "CapsLock",
  "NumLock",
  "ScrollLock",
  "Dead",
]);

export default function KioskFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const idleTimerRef = useRef<number | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const isHome = pathname === "/";
  const isQuestionnaire = pathname === "/questionnaire";
  const isRecommendations = pathname === "/recommendations";

  // Determine timeout based on current page
  const IDLE_TIMEOUT_MS = useMemo(() => {
    if (isHome) return 0; // No timeout on home
    if (isQuestionnaire) return QUESTIONNAIRE_TIMEOUT_MS;
    if (isRecommendations) return RECOMMENDATIONS_TIMEOUT_MS;
    return 120_000; // Default 2 minutes for other pages
  }, [isHome, isQuestionnaire, isRecommendations]);

  useEffect(() => {
    if (typeof window === "undefined" || isHome || IDLE_TIMEOUT_MS === 0) {
      return;
    }

    const goHome = () => {
      if (pathname === "/") return;

      const navigate = () => {
        try {
          router.replace("/");
        } catch (error) {
          console.error("Idle redirect failed via router.replace, falling back", error);
          window.location.replace("/");
        }
      };

      if (typeof startTransition === "function") {
        startTransition(navigate);
      } else {
        navigate();
      }
    };

    const resetTimer = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(goHome, IDLE_TIMEOUT_MS);
      // Reset the timer widget by changing key
      setTimerKey((prev) => prev + 1);
    };

    const rootElement = document.querySelector(".kiosk-root");
    let lastInteractionTimestamp = 0;
    const MIN_RESET_INTERVAL_MS = 250;

    const scheduleReset = () => {
      const now = Date.now();
      if (now - lastInteractionTimestamp < MIN_RESET_INTERVAL_MS) {
        return;
      }
      lastInteractionTimestamp = now;
      resetTimer();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        resetTimer();
      }
    };

    const isWithinRoot = (target: EventTarget | null): target is Node => {
      if (!(target instanceof Node)) {
        return false;
      }
      if (!rootElement) {
        return false;
      }
      return rootElement.contains(target);
    };

    const handlePointerActivity = (event: PointerEvent) => {
      if (!event.isTrusted || !isWithinRoot(event.target)) {
        return;
      }
      scheduleReset();
    };

    const handleWheel = (event: WheelEvent) => {
      if (!event.isTrusted || !isWithinRoot(event.target)) {
        return;
      }
      scheduleReset();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.isTrusted || !isWithinRoot(event.target)) {
        return;
      }

      if (NON_INTERACTIVE_KEYS.has(event.key)) {
        return;
      }

      scheduleReset();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!event.isTrusted || !isWithinRoot(event.target)) {
        return;
      }
      scheduleReset();
    };

    window.addEventListener("pointerdown", handlePointerActivity, { passive: true });
    window.addEventListener("pointermove", handlePointerActivity, { passive: true });
    window.addEventListener("pointerup", handlePointerActivity, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("focusin", handleFocusIn);

    resetTimer();

    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      window.removeEventListener("pointerdown", handlePointerActivity);
      window.removeEventListener("pointermove", handlePointerActivity);
      window.removeEventListener("pointerup", handlePointerActivity);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [router, pathname, isHome, IDLE_TIMEOUT_MS]);

  return (
    <div className="kiosk-root">
      <AnimatedBackground />
      {!isHome && IDLE_TIMEOUT_MS > 0 && (
        <IdleTimer
          key={timerKey}
          timeoutMs={IDLE_TIMEOUT_MS}
          isActive={true}
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={shouldReduceMotion ? "static" : pathname}
          className={`kiosk-frame ${className}`}
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 22, scale: 0.988, filter: "blur(6px)" }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: -16, scale: 0.99, filter: "blur(6px)" }
          }
          transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

