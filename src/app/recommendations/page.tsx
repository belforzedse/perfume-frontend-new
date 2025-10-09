"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import KioskFrame from "@/components/KioskFrame";
import { getPerfumes, toPersianNumbers } from "@/lib/api";
import {
  parseAnswers,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire";
import { rankPerfumes, type RankedPerfume } from "@/lib/perfume-matcher";

const formatNumber = (value: number) => toPersianNumbers(String(value));

type CompactMode = "normal" | "tight" | "ultra";

const StateMessage = ({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryAction,
}: {
  title: string;
  description?: string;
  actionHref: string;
  actionLabel: string;
  secondaryAction?: ReactNode;
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 text-center">
    <div className="space-y-2 sm:space-y-3 rounded-2xl sm:rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-[32px] max-w-md">
      <p className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">{title}</p>
      {description && <p className="m-0 text-xs sm:text-sm text-muted">{description}</p>}
      <div className="flex flex-col items-center gap-2">
        <Link href={actionHref} className="btn tap-highlight touch-target touch-feedback text-sm sm:text-base">
          {actionLabel}
        </Link>
        {secondaryAction}
      </div>
    </div>
  </div>
);

const MatchCard = ({
  perfume,
  order,
  compact = "normal",
}: {
  perfume: RankedPerfume;
  order: number;
  compact?: CompactMode;
}) => {
  const title = perfume.nameFa && perfume.nameFa.trim().length > 0 ? perfume.nameFa : perfume.nameEn;
  const detailLine = [perfume.collection, perfume.family]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .join(" • ");

  const imageHeight =
    compact === "ultra"
      ? "min(18vh, 120px)"
      : compact === "tight"
        ? "min(22vh, 150px)"
        : "min(26vh, 180px)";
  const brand = perfume.brand?.trim();
  const englishName = perfume.nameEn?.trim();

  return (
    <article className="glass-card flex h-full flex-col gap-3 sm:gap-4 md:gap-5 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-right transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
      <header className="flex items-center justify-between text-muted">
        <span className="rounded-full border border-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 text-[10px] sm:text-xs font-medium text-[var(--color-foreground)] bg-white/5">
          {formatNumber(order)}
        </span>
        <span className="text-xs sm:text-sm font-semibold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-1 rounded-lg">
          {formatNumber(perfume.matchPercentage)}٪
        </span>
      </header>

      {perfume.image && (
        <div className="flex flex-grow items-center justify-center group">
          <div
            className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
            style={{ height: imageHeight }}
          >
            <Image
              src={perfume.image}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={order <= 3}
              loading={order <= 3 ? "eager" : "lazy"}
              quality={85}
            />
          </div>
        </div>
      )}

      <div className="space-y-1 sm:space-y-1.5 md:space-y-2 text-right">
        {brand && (
          <p className="m-0 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted line-clamp-1">
            {brand}
          </p>
        )}
        <h3
          className={`m-0 font-semibold text-[var(--color-foreground)] ${compact === "ultra" ? "text-base sm:text-lg" : "text-lg sm:text-xl md:text-2xl"} line-clamp-1`}
        >
          {title}
        </h3>
        {compact !== "ultra" && englishName && (
          <p className="m-0 text-[10px] sm:text-xs text-subtle line-clamp-1">{englishName}</p>
        )}
        {compact === "normal" && detailLine && (
          <p className="m-0 text-[10px] sm:text-xs text-muted line-clamp-1">{detailLine}</p>
        )}
        {perfume.reasons.length > 0 && compact !== "ultra" && (
          <ul className="m-0 list-disc space-y-1 pr-4 text-[10px] text-muted sm:text-xs">
            {perfume.reasons.slice(0, compact === "tight" ? 1 : 2).map((reason) => (
              <li key={reason} className="leading-5">
                {reason}
              </li>
            ))}
          </ul>
        )}
        {typeof perfume.confidence === "number" && perfume.confidence > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[9px] text-muted sm:text-[10px]">
              <span>اطمینان سیستم</span>
              <span className="font-medium text-[var(--color-foreground)]">
                {formatNumber(Math.round(perfume.confidence))}٪
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/40">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]/80"
                style={{ width: `${perfume.confidence}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const answersParam = searchParams.get("answers");
  const [recommendations, setRecommendations] = useState<RankedPerfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compact, setCompact] = useState<CompactMode>("normal");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const updateCompact = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      // Mobile devices
      if (width < 768) {
        if (height < 700) setCompact("ultra");
        else if (height < 850) setCompact("tight");
        else setCompact("normal");
      } else {
        // Desktop/tablet
        if (height < 740) setCompact("ultra");
        else if (height < 900) setCompact("tight");
        else setCompact("normal");
      }
    };
    updateCompact();
    window.addEventListener("resize", updateCompact);
    return () => window.removeEventListener("resize", updateCompact);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!answersParam) {
      setAnswers(null);
      setRecommendations([]);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const parsedAnswers = parseAnswers(answersParam);
    if (!parsedAnswers) {
      setAnswers(null);
      setRecommendations([]);
      setError("پاسخ‌ها معتبر نیستند. لطفاً پرسشنامه را مجدداً تکمیل کنید.");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setAnswers(parsedAnswers);
    setLoading(true);
    setError(null);

    const fetchRecommendations = async () => {
      try {
        const allPerfumes = await getPerfumes();
        if (cancelled) return;
        const ranked = rankPerfumes(allPerfumes, parsedAnswers).slice(0, 6);
        setRecommendations(ranked);
      } catch (err) {
        if (cancelled) return;
        console.error("Error generating recommendations:", err);
        setRecommendations([]);
        setError("در تهیه پیشنهادها خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      cancelled = true;
    };
  }, [answersParam, refreshToken]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center px-2 py-4 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <div className="glass-card relative flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl px-3 py-3 shadow-soft sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-7 lg:py-7 lg:rounded-[36px]">
          <div className="flex h-full flex-col gap-4">
            <header className="flex items-center justify-between text-right">
              <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-semibold text-[var(--color-foreground)]">
                در حال آماده‌سازی پیشنهادها...
              </h1>
              <div className="loader-orbit" role="status" aria-label="در حال بارگذاری" />
            </header>
            <div className="flex-1 overflow-hidden rounded-2xl bg-white/45 px-3 py-3 sm:px-4 sm:py-4">
              <div
                className="grid h-full w-full gap-3 overflow-y-auto pr-1 sm:gap-3.5 md:gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-full min-h-[190px] sm:min-h-[210px]">
                    <div className="glass-card flex h-full flex-col gap-4 rounded-2xl px-4 py-4 sm:rounded-3xl sm:px-5 sm:py-5 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-12 rounded-full bg-white/30 sm:h-7 sm:w-16" />
                        <div className="h-5 w-12 rounded bg-white/30 sm:h-6" />
                      </div>
                      <div className="flex flex-1 items-center justify-center">
                        <div className="h-[120px] w-full rounded-2xl bg-white/25 sm:h-[150px] md:h-[180px]" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-white/30" />
                        <div className="h-3 w-1/2 rounded bg-white/25" />
                        <div className="h-3 w-2/3 rounded bg-white/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <StateMessage
        title="مشکلی پیش آمد."
        description={error}
        actionHref="/questionnaire"
        actionLabel="بازگشت به پرسشنامه"
        secondaryAction={
          <button
            type="button"
            onClick={() => setRefreshToken((token) => token + 1)}
            className="btn-ghost tap-highlight touch-target touch-feedback"
          >
            تلاش مجدد
          </button>
        }
      />
    );
  }

  if (!answers) {
    return (
      <StateMessage
        title="پاسخی ثبت نشد."
        description="برای دریافت پیشنهادها، پرسشنامه را تکمیل کنید."
        actionHref="/questionnaire"
        actionLabel="شروع پرسشنامه"
      />
    );
  }

  const topMatch = recommendations.length > 0 ? recommendations[0] : null;
  const answeredCount = Object.values(answers).filter((values) => values.length > 0).length;

  return (
    <div className="flex h-full w-full items-center justify-center px-2 py-4 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      <div className="glass-card relative flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl px-3 py-3 shadow-soft sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-7 lg:py-7 lg:rounded-[36px]">
        <div className="flex h-full flex-col gap-4 overflow-hidden">
          <header className="flex flex-col gap-3 text-right lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="m-0 text-xl xs:text-2xl sm:text-3xl font-semibold text-[var(--color-foreground)]">
                پیشنهادهای شما
              </h1>
              <p className="m-0 text-xs text-muted sm:text-sm">
                {recommendations.length > 0
                  ? `${formatNumber(recommendations.length)} رایحه بر اساس ${formatNumber(answeredCount)} پاسخ شما انتخاب شد.`
                  : "نتیجه‌ای یافت نشد. می‌توانید پرسشنامه را بازنگری کنید."}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/questionnaire"
                className="btn-ghost tap-highlight touch-target touch-feedback text-sm sm:text-base"
              >
                بازنگری پرسشنامه
              </Link>
              <Link href="/" className="btn tap-highlight touch-target touch-feedback text-sm sm:text-base">
                بازگشت به صفحه اصلی
              </Link>
            </div>
          </header>

          <div className="flex h-full flex-col gap-4 overflow-hidden lg:flex-row-reverse lg:items-stretch lg:gap-6">
            <aside className="flex w-full flex-shrink-0 flex-col gap-4 rounded-2xl bg-white/55 px-4 py-4 text-right shadow-inner sm:px-5 sm:py-5 lg:w-[280px] xl:w-[320px]">
              {topMatch ? (
                <>
                  <p className="m-0 text-xs font-semibold text-[var(--color-accent)] sm:text-sm">بهترین هماهنگی</p>
                  <p className="m-0 text-base font-semibold text-[var(--color-foreground)] sm:text-lg">
                    {topMatch.nameFa && topMatch.nameFa.trim().length > 0
                      ? topMatch.nameFa
                      : topMatch.nameEn}
                  </p>
                  <p className="m-0 text-xs text-muted sm:text-sm">
                    درصد تطابق: {formatNumber(topMatch.matchPercentage)}٪ | اطمینان سیستم: {formatNumber(Math.round(topMatch.confidence ?? 0))}٪
                  </p>
                  {(topMatch.collection || topMatch.family) && (
                    <p className="m-0 text-[11px] text-muted">
                      {[topMatch.collection, topMatch.family].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  {topMatch.reasons.length > 0 && (
                    <ul className="m-0 list-disc space-y-1 pr-4 text-[11px] text-muted sm:text-xs">
                      {topMatch.reasons.slice(0, 2).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="m-0 text-sm text-muted">
                  برای دریافت پیشنهادها، پرسشنامه را دوباره تکمیل کنید.
                </p>
              )}
              <div className="rounded-2xl border border-white/40 bg-white/65 px-4 py-3 text-[11px] text-muted sm:text-xs">
                <p className="m-0 text-[var(--color-foreground)] font-semibold">چطور ادامه دهیم؟</p>
                <p className="m-0">
                  نمونه‌های برتر را در فروشگاه لمس کنید یا شناسه پیشنهاد را به مشاور فروش اعلام کنید تا جزئیات بیشتری ارائه شود.
                </p>
              </div>
            </aside>

            <section className="flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-2xl bg-white/45 px-3 py-3 shadow-inner sm:px-4 sm:py-4">
              {recommendations.length > 0 && (
                <div className="mb-2 flex items-center justify-between text-[11px] text-muted sm:text-xs">
                  <span>برای ذخیره یا اشتراک‌گذاری، کارت هر عطر را لمس کنید.</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-muted">
                    تطابق میانگین: {formatNumber(Math.round(
                      recommendations.reduce((sum, item) => sum + item.matchPercentage, 0) /
                        recommendations.length
                    ))}٪
                  </span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto pr-1">
                <div
                  className="grid w-full gap-3 sm:gap-3.5 md:gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))" }}
                >
                  {recommendations.length > 0 ? (
                    recommendations.map((perfume, index) => (
                      <div
                        key={perfume.id}
                        className="h-full min-h-[200px]"
                        style={{ animation: `fade-in-up 0.5s ease-out ${index * 0.1}s both` }}
                      >
                        <MatchCard perfume={perfume} order={index + 1} compact={compact} />
                      </div>
                    ))
                  ) : (
                    <div className="glass-surface col-span-full flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-6 text-xs text-muted sm:text-sm">
                      <p className="m-0">مورد مناسبی پیدا نشد. لطفاً پاسخ‌ها را تغییر دهید.</p>
                      <Link href="/questionnaire" className="btn-ghost tap-highlight touch-target touch-feedback text-sm transition-all duration-200 hover:bg-white/10">
                        بازنگری پرسشنامه
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <KioskFrame>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="loader-orbit" role="status" aria-label="در حال بارگذاری" />
          </div>
        }
      >
        <RecommendationsContent />
      </Suspense>
    </KioskFrame>
  );
}
