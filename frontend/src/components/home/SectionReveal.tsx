'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

type SectionRevealProps = HTMLMotionProps<'section'> & {
  delay?: number;
  direction?: 'left' | 'right';
};

export function SectionReveal({ children, delay = 0, direction = 'left', ...props }: SectionRevealProps) {
  const premiumEase = [0.16, 1, 0.3, 1] as const;
  const offset = direction === 'left' ? -48 : 48;

  return (
    <motion.section
      initial={{ opacity: 0, x: offset }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.18, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.8, ease: premiumEase, delay }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

const premiumEase = [0.16, 1, 0.3, 1] as const;

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.98 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.65, ease: premiumEase },
  },
};

export const cardRevealRight: Variants = {
  hidden: { opacity: 0, x: 30, scale: 0.98 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.65, ease: premiumEase },
  },
};
