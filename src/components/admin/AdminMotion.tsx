"use client";

import { useMemo } from "react";
import { useReducedMotion, type Transition, type Variants } from "framer-motion";

export const adminEase = [0.16, 1, 0.3, 1] as const;

export const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: adminEase,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: adminEase,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.3,
      ease: adminEase,
    },
  },
};

export const statusBannerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: adminEase,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.25,
      ease: adminEase,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const disabledSectionVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

const disabledVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
  exit: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

const disabledStaggerVariants: Variants = {
  hidden: {},
  visible: {},
};

const defaultHoverTransition: Transition = {
  duration: 0.45,
  ease: adminEase,
};

export function useAdminMotionVariants() {
  const shouldReduce = useReducedMotion();

  return useMemo(() => {
    if (shouldReduce) {
      return {
        section: disabledSectionVariants,
        listItem: disabledVariants,
        status: disabledVariants,
        stagger: disabledStaggerVariants,
        transition: { duration: 0 },
        ease: adminEase,
        shouldReduce,
      } as const;
    }

    return {
      section: sectionVariants,
      listItem: listItemVariants,
      status: statusBannerVariants,
      stagger: staggerContainerVariants,
      transition: defaultHoverTransition,
      ease: adminEase,
      shouldReduce,
    } as const;
  }, [shouldReduce]);
}
