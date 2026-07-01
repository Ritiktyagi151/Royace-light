'use client';

import { motion } from 'framer-motion';
import { reasons } from './home-data';
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from './SectionReveal';

export function WhyChooseUs() {
  return (
    <SectionReveal direction="left" className="bg-[#f5efe6] px-4 py-16 text-[#241913] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto mb-10 max-w-7xl">
        <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
          <span className="h-px w-9 bg-[#006039]" />
          Why Royace
        </span>
        <h2 className="mt-5 max-w-4xl font-serif text-[clamp(2.1rem,5vw,4.5rem)] font-light italic leading-[0.98]">
          A quieter, more exacting way to buy luxury lighting.
        </h2>
      </div>

      <motion.div
        className="mx-auto grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        {reasons.map(({ icon: Icon, title, desc }, index) => (
          <motion.div key={title} variants={index % 2 === 0 ? cardReveal : cardRevealRight}>
            <div className="group min-h-[250px] border border-[#241913]/10 bg-white p-7 shadow-[0_22px_60px_rgba(36,25,19,0.08)] transition hover:-translate-y-1 hover:border-[#006039]/35">
              <span className="flex h-12 w-12 items-center justify-center border border-[#006039]/20 bg-[#006039]/5 text-[#006039] transition group-hover:bg-[#006039] group-hover:text-white">
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <h3 className="mt-7 font-serif text-3xl font-light italic leading-tight">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#241913]/60">
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
