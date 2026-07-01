'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { testimonials } from './home-data';
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from './SectionReveal';

export function Testimonials() {
  return (
    <SectionReveal direction="right" className="relative isolate overflow-hidden bg-[#dfe8d8] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-35 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#dfe8d8]/70" />

      <div className="relative z-10 mx-auto mb-10 flex max-w-7xl flex-col gap-6 border-b border-[#173126]/12 pb-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Patron Notes
          </span>
          <h2 className="mt-5 text-[clamp(2.1rem,5vw,4.5rem)] font-semibold leading-[1.02] text-[#173126]">
            Trusted by homes where every detail matters.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#173126]/64">
          Real feedback from patrons, designers, and project teams who choose Royace for finish, scale, and installation confidence.
        </p>
      </div>

      <motion.div
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        {testimonials.map((item, index) => (
          <motion.figure
            className="group relative flex min-h-[340px] flex-col overflow-hidden border border-[#006039]/14 bg-white/88 p-7 shadow-[0_22px_60px_rgba(23,49,38,0.1)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#006039]/35"
            key={item.author}
            variants={index % 2 === 0 ? cardReveal : cardRevealRight}
          >
            <div className="absolute right-5 top-5 text-[4rem] font-semibold leading-none text-[#006039]/8">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center border border-[#006039]/18 bg-[#006039]/6 text-[#006039]">
                <Quote size={18} strokeWidth={1.7} />
              </span>
              <div className="flex gap-1 text-[#c7a45a]">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={13} fill="currentColor" />
                ))}
              </div>
            </div>
            <blockquote className="mt-9 text-[1.35rem] font-medium leading-snug text-[#173126]">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto border-t border-[#173126]/10 pt-6">
              <strong className="block text-sm font-bold uppercase tracking-[0.12em] text-[#173126]">
                {item.author}
              </strong>
              <span className="mt-2 block text-[0.66rem] uppercase tracking-[0.18em] text-[#006039]/70">
                {item.role}
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
