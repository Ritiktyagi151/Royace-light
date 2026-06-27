'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { storyPillars } from './home-data';
import { cardReveal, SectionReveal, staggerContainer } from './SectionReveal';

export function BrandStory() {
  return (
    <SectionReveal className="luxury-section">
      <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] items-stretch overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950">
        {/* ---------- Copy column ---------- */}
        <div className="flex flex-col justify-center gap-0 px-6 py-10 sm:px-10 sm:py-14 order-2 md:order-1">
          <div className="mb-2">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
              The House
            </span>
            <h2 className="mt-2 max-w-[22ch] text-2xl sm:text-3xl font-medium leading-[1.25] text-neutral-900 dark:text-white">
              Built like jewellery. Installed like architecture.
            </h2>
          </div>

          {/* Pull-quote */}
          <blockquote className="my-6 max-w-[32ch] border-l border-neutral-300 dark:border-neutral-700 pl-4 font-serif italic text-lg leading-relaxed text-neutral-900 dark:text-neutral-100">
            Deep green lacquer, coffee-brown shadow, restrained gold —
            a shopping experience that feels collected, private, precise.
          </blockquote>

          <p className="mb-8 max-w-[38ch] text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Royace creates lighting for rooms where every surface has been
            considered, specified alongside the architecture rather than
            chosen after it.
          </p>

          {/* Pillar list with icon badges */}
          <motion.div
            className="mb-9 flex flex-col gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.25 }}
          >
            {storyPillars.map(({ icon: Icon, title, desc }) => (
              <motion.div
                className="group flex items-start gap-3.5"
                key={title}
                variants={cardReveal}
              >
                <span
                  aria-hidden="true"
                  className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-emerald-100 dark:bg-neutral-800 dark:text-white dark:group-hover:bg-emerald-900/40"
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="mb-0.5 text-sm font-medium text-neutral-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <Link
            href="/about"
            className="group inline-flex w-fit items-center gap-1.5 border-b border-neutral-400 pb-1 text-sm font-medium text-neutral-900 transition-all duration-300 hover:gap-2.5 hover:border-neutral-900 dark:border-neutral-600 dark:text-white dark:hover:border-white"
          >
            Visit the atelier
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {/* ---------- Image column ---------- */}
        <motion.div
          className="relative order-1 md:order-2 min-h-[320px] md:min-h-[460px] cursor-pointer overflow-hidden"
          whileHover={{ scale: 0.985 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="https://images.unsplash.com/photo-1561780648-dc38ba20699b"
            alt="Royace atelier chandelier craft"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]"
          />

          {/* Duotone overlay — tints photo toward green/brown palette.
              Remove this div if you want the plain photo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-multiply bg-[linear-gradient(160deg,rgba(27,43,31,0.35)_0%,rgba(58,41,30,0.15)_55%,rgba(58,41,30,0)_100%)]"
          />

          <span className="absolute bottom-5 left-5 z-10 rounded-md bg-white px-3.5 py-2 text-[11px] uppercase tracking-[0.06em] text-neutral-600">
            No. 04 — finishing room
          </span>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
