"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface StartQuestionnaireButtonProps {
  className?: string;
}

const MotionLink = motion.create(Link);

export default function StartQuestionnaireButton({
  className = "",
}: StartQuestionnaireButtonProps) {
  const wrapperClassName = ["w-full", "max-w-sm", className].filter(Boolean).join(" ");
  const shouldReduceMotion = useReducedMotion();

  const baseShimmer =
    "linear-gradient(120deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.9) 100%)";
  const rippleOverlay =
    "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.78) 55%, rgba(255,255,255,0.6) 100%)";

  const interactiveProps = shouldReduceMotion
    ? {}
    : {
        whileHover: {
          backgroundPosition: "100% 50%",
          boxShadow: "0 22px 48px rgba(28, 24, 21, 0.16)",
        },
        whileTap: {
          scale: 0.97,
          backgroundImage: `${rippleOverlay}, ${baseShimmer}`,
          boxShadow: "0 16px 36px rgba(28, 24, 21, 0.18)",
        },
        transition: {
          duration: 0.45,
          ease: [0.22, 0.61, 0.36, 1] as const,
        },
      };

  return (
    <div className={wrapperClassName}>
      <MotionLink
        href="/questionnaire"
        prefetch={false}
        className="glass-chip tap-highlight touch-target touch-feedback flex w-full flex-col items-center gap-3 rounded-3xl px-6 py-5 text-center text-[var(--color-foreground)] transition-colors xs:px-7 xs:py-6 sm:px-8 sm:py-7"
        aria-label="شروع پرسشنامه و رفتن به فرم انتخاب عطر"
        style={{
          backgroundImage: shouldReduceMotion ? undefined : baseShimmer,
          backgroundSize: shouldReduceMotion ? undefined : "220% 220%",
          backgroundPosition: shouldReduceMotion ? undefined : "0% 50%",
        }}
        {...interactiveProps}
      >
        <span className="flex flex-col gap-1">
          <span className="text-lg font-semibold sm:text-xl">شروع پرسشنامه</span>
          <span className="text-sm font-normal text-[var(--color-foreground-muted)] sm:text-base">
            چند پاسخ کوتاه و نتیجه فوری
          </span>
        </span>
        <span className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--color-accent-strong)] sm:text-base">
          <span>شروع</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12h12m0 0-4-4m4 4-4 4"
            />
          </svg>
        </span>
      </MotionLink>
    </div>
  );
}

