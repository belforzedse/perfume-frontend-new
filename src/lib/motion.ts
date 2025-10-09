import { useMemo, type DependencyList } from "react";
import { type Transition, type Variants, useReducedMotion } from "framer-motion";

export const easings = {
  luxury: [0.19, 0.76, 0.32, 1] as const,
  soft: [0.22, 0.61, 0.36, 1] as const,
};

export const durations = {
  quick: 0.55,
  moderate: 0.78,
  relaxed: 0.9,
};

export const transitions = {
  page: {
    duration: durations.relaxed,
    ease: easings.luxury,
  } satisfies Transition,
  surface: {
    duration: durations.moderate,
    ease: easings.luxury,
  } satisfies Transition,
  gentleSpring: {
    type: "spring",
    stiffness: 160,
    damping: 24,
    mass: 1.05,
    restDelta: 0.001,
    restSpeed: 0.001,
  } satisfies Transition,
};

const NOOP_TRANSITION: Transition = { duration: 0 };

const NOOP_LIST_VARIANTS: Variants = {
  hidden: {},
  show: {},
  exit: {},
};

const NOOP_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1, filter: "none" },
  show: { opacity: 1, y: 0, scale: 1, filter: "none", transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, scale: 1, filter: "none", transition: { duration: 0 } },
};

export const useMotionPreference = useReducedMotion;

export function useMotionSafeTransition<T extends Transition>(
  factory: () => T,
  deps: DependencyList = []
): Transition {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(
    () => (shouldReduceMotion ? NOOP_TRANSITION : factory()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldReduceMotion, ...deps]
  );
}

export function useStaggeredListVariants({
  delayChildren = 0.16,
  staggerChildren = 0.08,
  direction = "forward",
}: {
  delayChildren?: number;
  staggerChildren?: number;
  direction?: "forward" | "reverse";
} = {}): Variants {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(
    () =>
      shouldReduceMotion
        ? NOOP_LIST_VARIANTS
        : ({
            hidden: {},
            show: {
              transition: {
                delayChildren,
                staggerChildren,
                staggerDirection: direction === "reverse" ? -1 : 1,
              },
            },
            exit: {
              transition: {
                staggerChildren,
                staggerDirection: direction === "reverse" ? 1 : -1,
              },
            },
          } satisfies Variants),
    [shouldReduceMotion, delayChildren, staggerChildren, direction]
  );
}

export function useFadeScaleVariants({
  y = 22,
  scale = 0.97,
  blur = 10,
  duration = durations.moderate,
  delay = 0,
  ease = easings.luxury,
  exitY = -16,
}: {
  y?: number;
  scale?: number;
  blur?: number;
  duration?: number;
  delay?: number;
  ease?: Transition["ease"];
  exitY?: number;
} = {}): Variants {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(
    () =>
      shouldReduceMotion
        ? NOOP_ITEM_VARIANTS
        : ({
            hidden: {
              opacity: 0,
              y,
              scale,
              filter: `blur(${blur}px)` as const,
            },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              transition: {
                duration,
                ease,
                delay,
              },
            },
            exit: {
              opacity: 0,
              y: exitY,
              scale: 0.985,
              filter: `blur(${Math.max(blur - 2, 2)}px)` as const,
              transition: {
                duration: Math.max(duration * 0.75, 0.2),
                ease,
              },
            },
          } satisfies Variants),
    [shouldReduceMotion, y, scale, blur, duration, delay, ease, exitY]
  );
}
