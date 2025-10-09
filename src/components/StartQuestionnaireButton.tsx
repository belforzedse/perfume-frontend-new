"use client";

import Link from "next/link";

interface StartQuestionnaireButtonProps {
  className?: string;
}

export default function StartQuestionnaireButton({
  className = "",
}: StartQuestionnaireButtonProps) {
  const wrapperClassName = ["w-full", "max-w-sm", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClassName}>
      <Link
        href="/questionnaire"
        prefetch={false}
        className="glass-chip tap-highlight touch-target touch-feedback flex w-full flex-col items-center gap-3 rounded-3xl px-6 py-5 text-center text-[var(--color-foreground)] transition-colors xs:px-7 xs:py-6 sm:px-8 sm:py-7"
        aria-label="شروع پرسشنامه و رفتن به فرم انتخاب عطر"
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
      </Link>
    </div>
  );
}

