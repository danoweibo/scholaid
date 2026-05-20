import type { Variants, Transition } from "motion/react";

export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: easeOutExpo },
  }),
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const springModal: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 22,
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: springModal },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.18 } },
};
