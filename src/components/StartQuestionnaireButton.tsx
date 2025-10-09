"use client";

import Link from "next/link";
import TapIndicator from "@/components/TapIndicator";

interface StartQuestionnaireButtonProps {
  className?: string;
}

export default function StartQuestionnaireButton({
  className = "",
}: StartQuestionnaireButtonProps) {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Link
        href="/questionnaire"
        prefetch={false}
        className="btn tap-highlight touch-target touch-feedback z-10 flex w-full flex-col gap-1.5 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 xs:px-7 xs:py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-lg md:px-10 md:py-6 lg:px-12"
        aria-label="شروع پرسشنامه و رفتن به فرم انتخاب عطر"
      >
        <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span>شروع پرسشنامه</span>
          <span className="text-xs font-normal text-white/90 sm:text-sm">
            پاسخ دهید و پیشنهاد اختصاصی دریافت کنید
          </span>
        </span>
        <span className="flex items-center gap-2 text-sm sm:text-base">
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
      <TapIndicator
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        size={180}
      />
    </div>
  );
}

