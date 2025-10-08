"use client";
import Image from "next/image";
import StartQuestionnaireButton from "@/components/StartQuestionnaireButton";
import KioskFrame from "@/components/KioskFrame";

export default function HomePage() {
  return (
    <KioskFrame>
      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-6">
        <div className="glass-card relative flex w-full max-w-xs flex-col gap-6 rounded-2xl p-6 text-center shadow-soft xs:max-w-sm sm:max-w-md sm:gap-7 sm:rounded-3xl sm:p-8 md:max-w-lg md:gap-8 md:p-10 lg:max-w-2xl lg:gap-10 lg:rounded-[32px] lg:p-12 xl:max-w-3xl xl:gap-12 xl:p-14 max-h-[92vh] overflow-y-auto">
          <div className="w-full max-w-[200px] self-center transition-transform duration-300 hover:scale-105 sm:max-w-[260px] md:max-w-[340px] lg:max-w-[420px]">
            <Image
              src="/logo.webp"
              alt="لوگوی فروشگاه"
              width={600}
              height={600}
              priority
              className="h-auto w-full rounded-xl sm:rounded-2xl"
            />
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center rounded-full border border-white/60 bg-white/50 px-3 py-1 text-[0.75rem] font-medium text-muted shadow-sm backdrop-blur">
              کشف رایحه هماهنگ با حال‌وهوایتان
            </span>
            <h1 className="m-0 text-xl font-semibold leading-tight xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.9rem]">
              امضای عطری شما، یک لمس فاصله دارد
            </h1>
            <p className="m-0 max-w-xl px-2 text-xs text-muted xs:text-sm sm:text-base">
              پرسشنامه تعاملی را کامل کنید تا در چند دقیقه مجموعه‌ای از عطرهای منتخب و توضیحات کاربردی مخصوص سلیقه‌تان را ببینید.
            </p>
          </div>

          <StartQuestionnaireButton />

          <p className="m-0 text-[0.75rem] text-muted sm:text-sm">
            زمان کم دارید؟ تنها ۳ دقیقه طول می‌کشد و می‌توانید بعداً بازگردید و انتخاب را کامل کنید.
          </p>
        </div>
      </div>
    </KioskFrame>
  );
}

