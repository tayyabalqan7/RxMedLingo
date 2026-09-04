import type { Transition, Variants } from "motion/react";

const defaultTransition: Transition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: defaultTransition,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 24 } },
};

export const pulseAttention = {
  scale: [1, 1.02, 1],
  transition: { duration: 0.5, times: [0, 0.5, 1] },
};
