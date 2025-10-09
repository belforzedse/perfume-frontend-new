"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import StartQuestionnaireButton from "@/components/StartQuestionnaireButton";
import KioskFrame from "@/components/KioskFrame";

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const easing = [0.22, 0.61, 0.36, 1] as const;

  return (
    <KioskFrame>
      <main className="flex w-full justify-center px-4 py-6 sm:px-6 lg:px-10">
        <motion.article
          className="glass-card page-panel relative flex w-full max-w-4xl flex-col items-center text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.985, filter: "blur(8px)" }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, y: -18, scale: 0.99, filter: "blur(6px)" }
          }
          transition={{ duration: 0.55, ease: easing }}
        >
          <Image
            src="/logo.webp"
            alt="لوگوی فروشگاه"
            width={320}
            height={320}
            priority
            className="w-full max-w-[180px] rounded-[26px] border border-white/55 bg-white/80 p-5 object-contain shadow-[0_16px_42px_rgba(28,24,21,0.08)]"
          />
          <section className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
            <motion.header
              className="space-y-5"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: easing, delay: shouldReduceMotion ? 0 : 0.08 }}
            >
              <span className="glass-section inline-flex items-center justify-center rounded-full px-5 py-1.5 text-sm font-medium text-[var(--color-foreground-muted)] tracking-tight">
                پرسشنامه عطری گندم
              </span>
              <div className="space-y-4">
                <h1 className="m-0 text-[2.15rem] font-semibold leading-[1.12] text-[var(--color-foreground)] xs:text-[2.35rem] sm:text-[2.7rem] lg:text-[2.85rem]">
                  سلیقه عطری خود را کشف کنید
                </h1>
                <p className="m-0 max-w-xl text-sm text-muted sm:text-base">
                  تجربه‌ای شفاف و سریع برای انتخاب رایحه‌ای که با حال‌وهوای شما هماهنگ است.
                </p>
              </div>
            </motion.header>
          </section>

          <StartQuestionnaireButton className="max-w-xs" />
        </motion.article>
      </main>
    </KioskFrame>
  );
}
