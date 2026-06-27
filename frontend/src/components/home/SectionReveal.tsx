'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

type SectionRevealProps = HTMLMotionProps<'section'> & {
  delay?: number;
};

export function SectionReveal({ children, delay = 0, ...props }: SectionRevealProps) {
  const premiumEase = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.section
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
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
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: premiumEase },
  },
};
