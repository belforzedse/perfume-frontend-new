"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toPersianNumbers } from "@/lib/api";
import { useRouter } from "next/navigation";
import KioskFrame from "@/components/KioskFrame";
import {
  QUESTION_FLOW,
  QuestionnaireAnswers,
  QuestionDefinition,
  TOTAL_QUESTIONS,
  createInitialAnswers,
  serializeAnswers,
} from "@/lib/questionnaire";

const BTN_BASE =
  "question-option text-base sm:text-lg font-semibold animate-fade-in-up transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,255,255,0.45)] tap-highlight touch-target touch-feedback";

const formatNumber = (value: number) => toPersianNumbers(String(value));

const toggleSelection = (
  previous: QuestionnaireAnswers,
  question: QuestionDefinition,
  value: string
): { next: QuestionnaireAnswers; limited: boolean } => {
  const key = question.key;
  const currentValues = previous[key];
  const isSelected = currentValues.includes(value);

  if (question.type === "single") {
    return {
      next: { ...previous, [key]: isSelected ? [] : [value] },
      limited: false,
    };
  }

  if (
    !isSelected &&
    typeof question.maxSelections === "number" &&
    currentValues.length >= question.maxSelections
  ) {
    return { next: previous, limited: true };
  }

  const nextValues = isSelected
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];

  return {
    next: { ...previous, [key]: nextValues },
    limited: false,
  };
};

const buildHelperText = (
  question: QuestionDefinition,
  selectedCount: number,
  limitReached: boolean,
  limitMessage: string | null
) => {
  if (limitMessage) return limitMessage;

  if (question.type === "multiple" && question.maxSelections) {
    const limit = formatNumber(question.maxSelections);
    if (selectedCount === 0) {
      return question.optional
        ? `می‌توانید حداکثر ${limit} مورد را به صورت اختیاری انتخاب کنید.`
        : `برای ادامه بین ۱ تا ${limit} گزینه انتخاب کنید.`;
    }
    const selected = formatNumber(selectedCount);
    return limitReached
      ? `حداکثر ${limit} مورد انتخاب شده است.`
      : `انتخاب شده: ${selected} از ${limit}`;
  }

  if (selectedCount === 0) {
    return question.optional
      ? "این سوال اختیاری است."
      : "برای ادامه لطفاً یک گزینه را انتخاب کنید.";
  }

  return "آماده ادامه هستید.";
};

export default function Questionnaire() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => createInitialAnswers());
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const headingId = "questionnaire-heading";
  const helperId = "questionnaire-helper";

  const questions = QUESTION_FLOW;
  const currentQuestion = questions[currentStep];
  const totalQuestions = questions.length;

  useEffect(() => {
    setLimitMessage(null);
    if (autoAdvanceTimerRef.current) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, [currentQuestion]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, []);

  const next = useCallback(
    (overrideAnswers?: QuestionnaireAnswers) => {
      const answersToUse = overrideAnswers ?? answers;
      if (currentStep < totalQuestions - 1) {
        setCurrentStep((s) => Math.min(s + 1, totalQuestions - 1));
      } else {
        const qs = new URLSearchParams({ answers: serializeAnswers(answersToUse) });
        router.push(`/recommendations?${qs.toString()}`);
      }
    },
    [answers, currentStep, router, totalQuestions]
  );

  const toggle = useCallback(
    (value: string) => {
      if (autoAdvanceTimerRef.current) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }

      let shouldAutoAdvance = false;
      let updatedAnswersSnapshot: QuestionnaireAnswers | null = null;

      setAnswers((prev) => {
        const wasSelected = prev[currentQuestion.key].includes(value);
        const { next: updatedAnswers, limited } = toggleSelection(prev, currentQuestion, value);
        if (limited) {
          if (currentQuestion.maxSelections) {
            const limit = formatNumber(currentQuestion.maxSelections);
            setLimitMessage(`حداکثر ${limit} انتخاب مجاز است.`);
          }
          return prev;
        }

        setLimitMessage(null);
        updatedAnswersSnapshot = updatedAnswers;

        const selectionCount = updatedAnswers[currentQuestion.key].length;
        const maxSelections =
          typeof currentQuestion.maxSelections === "number"
            ? currentQuestion.maxSelections
            : null;
        const reachedMax = maxSelections !== null && selectionCount === maxSelections;

        shouldAutoAdvance =
          !wasSelected &&
          ((currentQuestion.type === "single" && !currentQuestion.optional && selectionCount > 0) || reachedMax);

        return updatedAnswers;
      });

      if (shouldAutoAdvance && updatedAnswersSnapshot) {
        autoAdvanceTimerRef.current = window.setTimeout(() => {
          autoAdvanceTimerRef.current = null;
          next(updatedAnswersSnapshot!);
        }, 250);
      }
    },
    [currentQuestion, next]
  );

  const back = () => currentStep > 0 && setCurrentStep((s) => s - 1);

  const selectedCount = answers[currentQuestion.key].length;
  const limitReached = Boolean(
    currentQuestion.maxSelections && selectedCount >= currentQuestion.maxSelections
  );

  const canProceed = currentQuestion.optional || selectedCount > 0;

  const helperText = buildHelperText(
    currentQuestion,
    selectedCount,
    limitReached,
    limitMessage
  );

  const progress = Math.round(((currentStep + 1) / TOTAL_QUESTIONS) * 100);

  return (
    <KioskFrame>
      <main
        aria-labelledby={headingId}
        className="page-main flex h-full w-full items-center justify-center px-2 py-4 sm:px-3 md:px-4 lg:px-6 xl:px-8"
      >
        <div className="glass-card page-panel flex h-full max-h-[94vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-[28px] p-4 shadow-soft sm:p-6 md:p-8">
          <header className="space-y-2 text-right">
            <p className="m-0 text-[11px] text-muted sm:text-xs" aria-live="polite">
              سوال {formatNumber(currentStep + 1)} از {formatNumber(TOTAL_QUESTIONS)}
            </p>
            <h1
              id={headingId}
              className="m-0 text-xl font-semibold leading-tight text-[var(--color-foreground)] xs:text-2xl md:text-[1.85rem]"
            >
              {currentQuestion.title}
            </h1>
            {currentQuestion.description && (
              <p className="m-0 text-xs text-muted sm:text-sm">{currentQuestion.description}</p>
            )}
          </header>

          <div className="space-y-3 text-right">
            <div className="h-2 w-full rounded-full bg-soft" role="presentation">
              <div
                className="h-2 rounded-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
                aria-hidden
              />
            </div>
            <p id={helperId} className="m-0 text-[11px] text-muted sm:text-xs" aria-live="polite">
              {helperText}
            </p>
          </div>

          <section className="flex flex-1 flex-col overflow-hidden text-right" aria-describedby={helperId}>
            <div className="mb-2 hidden text-xs font-medium text-muted lg:block">گزینه‌های خود را لمس کنید</div>
            <div className="flex-1 overflow-y-auto pr-1">
              <div
                className="grid w-full gap-2.5 sm:gap-3 md:gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))" }}
              >
                {currentQuestion.options.map((option) => {
                  const values = answers[currentQuestion.key];
                  const isSelected = values.includes(option.value);
                  const disabled =
                    !isSelected &&
                    typeof currentQuestion.maxSelections === "number" &&
                    values.length >= currentQuestion.maxSelections;
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggle(option.value)}
                      disabled={disabled}
                      aria-pressed={isSelected}
                      className={`${BTN_BASE} ${
                        isSelected ? "question-option--selected" : "question-option--default"
                      } ${disabled ? "question-option--disabled" : ""} min-h-[56px] text-sm sm:min-h-[60px] sm:text-base md:min-h-[68px] md:text-lg`}
                    >
                      <span className="flex-1 text-right">{option.label}</span>
                      {currentQuestion.type === "multiple" && isSelected && (
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[0.7rem] text-muted">انتخاب شده</span>
                      )}
                    </button>
                  );
                })}
                {currentQuestion.options.length === 0 && (
                  <div className="glass-surface col-span-full flex h-full items-center justify-center rounded-2xl p-6 text-xs text-muted sm:text-sm">
                    گزینه‌ای یافت نشد.
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-2 text-right xs:grid-cols-2">
            <button
              onClick={back}
              disabled={currentStep === 0}
              className="btn-ghost tap-highlight touch-target touch-feedback text-sm sm:text-base"
            >
              بازگشت
            </button>
            <button
              onClick={() => next()}
              disabled={!canProceed}
              className="btn tap-highlight touch-target touch-feedback text-sm sm:text-base disabled:cursor-not-allowed"
            >
              {currentStep === totalQuestions - 1 ? "مشاهده پیشنهادها" : "بعدی"}
            </button>
          </div>
        </div>
      </main>
    </KioskFrame>
  );
}

