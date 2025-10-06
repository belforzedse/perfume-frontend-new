"use client";
import Image from "next/image";
import Link from "next/link";
import TapIndicator from "@/components/TapIndicator";
import KioskFrame from "@/components/KioskFrame";

export default function HomePage() {
  return (
    <KioskFrame>
      <div className="relative flex h-full w-full items-center justify-center px-4 sm:px-6">
        <div className="glass-card relative flex w-full max-w-xs flex-col items-center gap-6 xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl sm:gap-8 md:gap-10 lg:gap-12 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 text-center animate-blur-in">
          <div className="animate-scale-in w-full max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-[450px]">
            <Image
              src="/logo.webp"
              alt="لوگوی فروشگاه"
              width={600}
              height={600}
              priority
              className="w-full h-auto rounded-xl sm:rounded-2xl animate-blur-in animate-delay-1"
            />
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 text-center animate-fade-in-up animate-delay-2">
            <h1 className="m-0 text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.9rem] font-semibold leading-tight">
              امضای عطری شما، یک لمس فاصله دارد
            </h1>
            <p className="m-0 max-w-xl text-xs xs:text-sm sm:text-base text-muted px-2">
              پرسشنامه را کامل کنید تا مجموعه‌ای از عطرهای منتخب ویژه سلیقه‌تان را ببینید.
            </p>
          </div>

          <div className="relative animate-fade-in-up animate-delay-3">
            <Link
              href="/questionnaire"
              className="btn tap-highlight touch-target touch-feedback z-10 px-6 py-4 text-base xs:px-7 xs:py-4 sm:px-8 sm:py-5 md:px-10 md:py-6 lg:px-12 sm:text-lg font-medium"
            >
              شروع پرسشنامه
            </Link>
            <TapIndicator
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in animate-delay-4"
              size={180}
            />
          </div>
        </div>
      </div>
    </KioskFrame>
  );
}

