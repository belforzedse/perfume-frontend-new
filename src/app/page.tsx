"use client";

import Image from "next/image";
import StartQuestionnaireButton from "@/components/StartQuestionnaireButton";
import KioskFrame from "@/components/KioskFrame";

import type { ReactNode } from "react";

type QuickFact = {
  icon: ReactNode;
  title: string;
  description: string;
};

const quickFacts: QuickFact[] = [
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-hidden="true"
        className="h-7 w-7 text-[var(--color-accent-strong)]"
      >
        <circle
          cx="16"
          cy="16"
          r="11"
          fill="rgba(255, 255, 255, 0.55)"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16 9.5v6.3l4.2 2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="1.4" fill="currentColor" />
      </svg>
    ),
    title: "۳ دقیقه تا نتیجه",
    description: "پرسشنامه‌ای کوتاه، مناسب لمس و آماده در لحظه.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-hidden="true"
        className="h-7 w-7 text-[var(--color-foreground)]"
      >
        <path
          d="M16 4l1.6 5.4c.3 1 1.2 1.7 2.2 1.8l5.6.5-4.3 3.4c-.8.6-1.1 1.7-.8 2.7l1.6 5.4-4.6-3c-.9-.6-2-.6-2.8 0l-4.6 3 1.6-5.4c.3-1-.1-2.1-.8-2.7L6.6 11.7l5.6-.5c1-.1 1.9-.8 2.2-1.8L16 4z"
          fill="rgba(255,255,255,0.6)"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="8" r="1.8" fill="rgba(255,255,255,0.6)" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
        <circle cx="24" cy="23.5" r="1.2" fill="rgba(255,255,255,0.45)" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
      </svg>
    ),
    title: "تجربه هدایت‌شده",
    description: "هر گام با توضیحی روشن همراه است.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-hidden="true"
        className="h-7 w-7 text-[var(--color-accent-strong)]"
      >
        <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.5)" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="16" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
        <circle cx="16" cy="16" r="2.8" fill="currentColor" opacity="0.85" />
        <path d="M16 6v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M26 16h-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M16 26v-3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
        <path d="M6 16h3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
    title: "پیشنهادهای دقیق",
    description: "پیشنهادها بر اساس پاسخ‌های شخصی شماست.",
  },
];

export default function HomePage() {
  return (
    <KioskFrame>
      <main className="flex w-full justify-center px-4 py-6 sm:px-6 lg:px-10">
        <article className="glass-card relative w-full overflow-hidden rounded-[32px] border border-white/55 shadow-soft backdrop-blur-xl transition-[box-shadow,transform] duration-700 ease-[cubic-bezier(0.18,0.67,0.31,0.99)] lg:w-[1080px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.18),transparent_58%),radial-gradient(circle_at_80%_85%,rgba(235,214,187,0.2),transparent_70%)]" aria-hidden />
          <div className="relative grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:p-11">
            <section className="flex min-w-0 flex-col gap-10 text-right lg:pr-10">
              <header className="space-y-5 text-right">
                <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/45 bg-white/65 px-5 py-1.5 text-sm font-medium text-[var(--color-foreground-muted)] tracking-tight shadow-sm backdrop-blur">
                  پرسشنامه عطری گندم
                </span>
                <div className="space-y-4">
                  <h1 className="m-0 text-[2.15rem] font-semibold leading-[1.12] text-[var(--color-foreground)] xs:text-[2.35rem] sm:text-[2.7rem] lg:text-[2.85rem]">
                    سلیقه عطری خود را کشف کنید
                  </h1>
                  <p className="m-0 max-w-lg text-sm text-muted sm:text-base">
                    تجربه‌ای شفاف و سریع برای انتخاب رایحه‌ای که با حال‌وهوای شما هماهنگ است.
                  </p>
                </div>
              </header>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <StartQuestionnaireButton className="sm:flex-1 transition-transform duration-300 ease-out hover:-translate-y-0.5" />
                <div className="flex flex-1 flex-col gap-1 rounded-3xl border border-white/40 bg-white/55 px-5 py-4 text-xs text-muted shadow-sm backdrop-blur sm:max-w-xs sm:text-sm">
                  <p className="m-0 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
                    ادامه در کیوسک؟
                  </p>
                  <p className="m-0 leading-relaxed">
                    از اینجا شروع کنید و در فضای حضوری بدون وقفه ادامه دهید.
                  </p>
                </div>
              </div>

              <ul className="grid gap-3 sm:grid-cols-3" role="list">
                {quickFacts.map((fact) => (
                  <li
                    key={fact.title}
                    className="group relative flex flex-col gap-2 rounded-3xl border border-white/40 bg-white/60 px-4 py-4 text-right backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.18,0.67,0.31,0.99)] hover:-translate-y-1.5 hover:border-white/70 hover:bg-white/75 hover:shadow-[0_24px_60px_rgba(28,24,21,0.12)]"
                  >
                    <span
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/70 text-[var(--color-accent-strong)] shadow-inner backdrop-blur transition-transform duration-500 ease-out group-hover:scale-105"
                      aria-hidden
                    >
                      {fact.icon}
                    </span>
                    <p className="m-0 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
                      {fact.title}
                    </p>
                    <p className="m-0 text-xs leading-relaxed text-muted sm:text-sm">{fact.description}</p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="flex items-center justify-center">
              <figure
                className="relative flex w-full max-w-[320px] flex-col items-center gap-5 overflow-hidden rounded-[32px] border border-white/45 bg-[rgba(255,255,255,0.55)] px-7 py-8 text-center shadow-[0_24px_70px_rgba(28,24,21,0.12)] backdrop-blur-xl"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(235,255,255,0.28), transparent 60%), radial-gradient(circle at 80% 80%, rgba(183,146,90,0.18), transparent 72%)",
                }}
              >
                <Image
                  src="/logo.webp"
                  alt="لوگوی فروشگاه"
                  width={480}
                  height={480}
                  priority
                  className="w-full max-w-[200px] rounded-[26px] border border-white/55 bg-white/80 p-5 object-contain shadow-[0_16px_42px_rgba(28,24,21,0.08)] transition-transform duration-500 ease-out hover:scale-[1.03]"
                />
                <figcaption className="m-0 max-w-xs text-xs text-muted sm:text-sm">
                  همین تجربه در کیوسک‌های گندم نیز در دسترس است؛ فقط از مربی فروش بخواهید.
                </figcaption>
              </figure>
            </aside>
          </div>
        </article>
      </main>
    </KioskFrame>
  );
}
