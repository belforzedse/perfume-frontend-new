"use client";

import Image from "next/image";
import StartQuestionnaireButton from "@/components/StartQuestionnaireButton";
import KioskFrame from "@/components/KioskFrame";

const quickFacts = [
  {
    icon: "🕒",
    title: "۳ دقیقه تا نتیجه",
    description:
      "پرسشنامه کوتاه و لمسی است؛ برای استفاده در کیوسک و موبایل بهینه شده است.",
  },
  {
    icon: "✨",
    title: "تجربه هدایت‌شده",
    description:
      "در هر گام، با توضیحات شفاف می‌دانید چه چیزی انتخاب می‌کنید و چرا مهم است.",
  },
  {
    icon: "🎯",
    title: "پیشنهادهای دقیق",
    description:
      "بر اساس پاسخ‌های شما، رایحه‌هایی با بالاترین سازگاری معرفی می‌شود.",
  },
];

export default function HomePage() {
  return (
    <KioskFrame>
      <div className="flex h-full w-full items-center justify-center">
        <div className="glass-card relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl shadow-soft lg:rounded-[36px]">
          <div className="relative grid flex-1 grid-cols-1 gap-6 overflow-auto px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:gap-8 lg:px-10 lg:py-10">
            <section className="order-2 flex flex-col justify-center gap-6 text-right lg:order-1 lg:pr-4">
              <div className="flex flex-col gap-3 text-right">
                <span className="inline-flex w-fit items-center justify-center rounded-full border border-white/60 bg-white/70 px-4 py-1 text-[0.8rem] font-medium text-muted shadow-sm backdrop-blur">
                  کشف رایحه هماهنگ با حال‌وهوایتان
                </span>
                <h1 className="m-0 text-2xl font-semibold leading-tight text-[var(--color-foreground)] xs:text-3xl sm:text-4xl lg:text-[2.9rem]">
                  امضای عطری شما، یک لمس فاصله دارد
                </h1>
                <p className="m-0 max-w-xl text-sm text-muted sm:text-base">
                  این تجربه برای لمس سریع در کیوسک و استفاده راحت در موبایل طراحی شده است. با تکمیل چند سوال هدفمند، بلافاصله مجموعه‌ای از عطرهای منتخب مطابق سلیقه‌تان دریافت کنید.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <StartQuestionnaireButton className="sm:flex-1" />
                <div className="rounded-2xl border border-white/50 bg-white/60 px-4 py-3 text-xs text-muted shadow-sm sm:w-52 sm:text-sm">
                  <p className="m-0 font-semibold text-[var(--color-foreground)]">در مسیر تجربه حضوری؟</p>
                  <p className="m-0">پرسشنامه را اینجا شروع کنید و ادامه را در کیوسک یا موبایل کامل کنید.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {quickFacts.map((fact) => (
                  <div
                    key={fact.title}
                    className="glass-surface flex items-start gap-3 rounded-2xl px-4 py-3 text-right transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <span className="text-xl" aria-hidden>
                      {fact.icon}
                    </span>
                    <div className="space-y-1">
                      <p className="m-0 text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
                        {fact.title}
                      </p>
                      <p className="m-0 text-xs text-muted sm:text-sm">{fact.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="order-1 relative flex min-h-[200px] items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/60 via-white/20 to-transparent p-6 text-center shadow-inner sm:min-h-[320px] lg:order-2 lg:p-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]"
                aria-hidden
              />
              <div className="relative flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="flex max-w-xs flex-col items-center gap-3 text-right">
                  <Image
                    src="/logo.webp"
                    alt="لوگوی فروشگاه"
                    width={640}
                    height={640}
                    priority
                    className="w-full max-w-[280px] rounded-3xl object-contain drop-shadow-2xl sm:max-w-[320px] lg:max-w-[360px]"
                  />
                  <div className="glass-surface w-full rounded-2xl px-4 py-3 text-xs text-muted sm:text-sm">
                    <p className="m-0 text-[var(--color-foreground)]">
                      در کنار هر دستگاه کیوسک، همین تجربه قابل دسترس است؛ برای راهنمایی حضوری کافی است مربی فروش را خبر کنید.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </KioskFrame>
  );
}
