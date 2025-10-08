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
    <div className={`relative w-full max-w-xs sm:max-w-sm ${className}`}>
      <Link
        href="/questionnaire"
        prefetch={false}
        className="btn tap-highlight touch-target touch-feedback z-10 w-full px-6 py-4 text-base font-medium transition-all duration-300 hover:scale-105 active:scale-95 xs:px-7 xs:py-4 sm:text-lg md:px-10 md:py-6 lg:px-12"
        aria-label="شروع پرسشنامه و رفتن به فرم انتخاب عطر"
      >
        شروع پرسشنامه
      </Link>
      <TapIndicator
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        size={180}
      />
    </div>
  );
}

