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
    <article className="glass-card flex h-full flex-col gap-3 sm:gap-4 md:gap-5 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 text-right">
      <header className="flex items-center justify-between text-muted">
        <span className="rounded-full border border-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 text-[10px] sm:text-xs font-medium text-[var(--color-foreground)]">
          {formatNumber(order)}
        </span>
        <span className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">
          {formatNumber(perfume.matchPercentage)}٪
        </span>
      </header>

      {perfume.image && (
        <div className="flex flex-grow items-center justify-center">
          <div
            className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm"
            style={{ height: imageHeight }}
          >
            <Image
              src={perfume.image}
              alt={title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority
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
      if (height < 740) setCompact("ultra");
      else if (height < 900) setCompact("tight");
      else setCompact("normal");
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
      <div className="flex h-full items-center justify-center">
        <div className="loader-orbit" role="status" aria-label="در حال بارگذاری" />
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

  return (
    <div className="flex h-full w-full items-center justify-center px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      <div className="glass-card relative flex h-[95vh] sm:h-[92vh] w-full max-w-full sm:max-w-[98vw] md:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[1400px] flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 rounded-2xl sm:rounded-3xl lg:rounded-[32px] px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5 lg:px-6 lg:py-6">
        <header className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 sm:gap-3">
          <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-semibold text-[var(--color-foreground)]">پیشنهادهای شما</h1>
          {recommendations.length > 0 && (
            <span className="text-[10px] xs:text-xs sm:text-xs text-muted">
              {formatNumber(recommendations.length)} مورد بر اساس ترجیحات شما تنظیم شد.
            </span>
          )}
        </header>

        <section className="grid flex-1 grid-cols-2 grid-rows-3 sm:grid-cols-3 sm:grid-rows-2 auto-rows-fr gap-2 sm:gap-2.5 md:gap-3 lg:gap-3 xl:gap-4 overflow-y-auto">
          {recommendations.length > 0 ? (
            recommendations.map((perfume, index) => (
              <div
                key={perfume.id}
                className="h-full min-h-[180px] sm:min-h-[200px]"
              >
                <MatchCard perfume={perfume} order={index + 1} compact={compact} />
              </div>
            ))
          ) : (
            <div className="glass-surface col-span-full flex h-full flex-col items-center justify-center gap-3 rounded-2xl sm:rounded-3xl text-xs sm:text-sm text-muted p-4">
              <p className="m-0">مورد مناسبی پیدا نشد. لطفاً پاسخ‌ها را تغییر دهید.</p>
              <Link href="/questionnaire" className="btn-ghost tap-highlight touch-target touch-feedback text-sm">
                بازنگری پرسشنامه
              </Link>
            </div>
          )}
        </section>
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
