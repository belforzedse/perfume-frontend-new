"use client";

import Image from "next/image";
import StartQuestionnaireButton from "@/components/StartQuestionnaireButton";
import KioskFrame from "@/components/KioskFrame";

export default function HomePage() {
  return (
    <KioskFrame>
      <main className="flex w-full justify-center px-4 py-6 sm:px-6 lg:px-10">
        <article className="glass-card relative flex w-full max-w-3xl flex-col items-center gap-8 overflow-hidden rounded-[32px] border border-white/55 bg-white/70 px-8 py-10 text-center shadow-soft backdrop-blur-xl sm:gap-10 sm:px-10 sm:py-12 lg:max-w-4xl">
          <Image
            src="/logo.webp"
            alt="لوگوی فروشگاه"
            width={320}
            height={320}
            priority
            className="w-full max-w-[180px] rounded-[26px] border border-white/55 bg-white/80 p-5 object-contain shadow-[0_16px_42px_rgba(28,24,21,0.08)]"
          />
          <section className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
            <header className="space-y-5">
              <span className="inline-flex items-center justify-center rounded-full border border-white/45 bg-white/65 px-5 py-1.5 text-sm font-medium text-[var(--color-foreground-muted)] tracking-tight shadow-sm backdrop-blur">
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
            </header>
          </section>

          <StartQuestionnaireButton className="max-w-xs" />
        </article>
      </main>
    </KioskFrame>
  );
}
