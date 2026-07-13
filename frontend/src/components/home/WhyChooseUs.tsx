'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ShieldCheck,
  Factory,
  Ruler,
  Truck,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { cardReveal, cardRevealRight, staggerContainer } from './SectionReveal';

type Reason = {
  icon: LucideIcon;
  title: string;
  desc: string;
  stat: string;
  statLabel: string;
};

const reasons: Reason[] = [
  {
    icon: ShieldCheck,
    title: 'Checked quality',
    desc: 'Every order is reviewed for finish, fitting, wiring readiness, and packing before dispatch from our facility.',
    stat: '100%',
    statLabel: 'checked orders',
  },
  {
    icon: Factory,
    title: 'Project capability',
    desc: 'We support single-home requirements as well as larger residential, hospitality, and commercial lighting projects.',
    stat: '50+',
    statLabel: 'cities served',
  },
  {
    icon: Ruler,
    title: 'Correct sizing',
    desc: 'Our team helps match fixture size, drop height, and placement with the room layout and ceiling conditions.',
    stat: 'Site',
    statLabel: 'based planning',
  },
  {
    icon: Truck,
    title: 'Reliable dispatch',
    desc: 'Packing and dispatch are planned carefully so delicate lighting reaches the site in a safe and organised manner.',
    stat: '98%',
    statLabel: 'planned dispatch',
  },
  {
    icon: Sparkles,
    title: 'Finish guidance',
    desc: 'We help coordinate brass, gold, black, bronze, crystal, and glass finishes with the interior palette.',
    stat: 'Many',
    statLabel: 'finish options',
  },
  {
    icon: HeartHandshake,
    title: 'Support after order',
    desc: 'From product queries to installation guidance and after-sales support, our team remains reachable.',
    stat: 'After',
    statLabel: 'sales support',
  },
];

export function WhyChooseUs() {
  return (
    <div className="relative overflow-hidden bg-[#dfe8d8] px-4 py-16 text-[#1c3324] sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#a9cf9a]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#c9e3bd]/50 blur-3xl" />

      <div className="relative mx-auto mb-12 flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Why Choose Royace
          </span>
          <h2 className="mt-5 max-w-4xl font-serif text-3xl font-light italic leading-[0.98] text-[#1c3324]">
            A simpler, more dependable way to buy premium decorative lighting.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#1c3324]/65">
          Every fixture is backed by a clear process: selection, finish guidance, quality check, packing, dispatch, and practical installation support.
        </p>
      </div>

      <motion.div
        className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
      >
        {reasons.map(({ icon: Icon, title, desc, stat, statLabel }, index) => (
          <motion.div key={title} variants={index % 2 === 0 ? cardReveal : cardRevealRight}>
            <div className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-sm border border-[#006039]/12 bg-white p-7 shadow-[0_22px_60px_rgba(28,51,36,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#006039]/40 hover:shadow-[0_28px_70px_rgba(28,51,36,0.14)]">
              <span className="absolute right-6 top-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#006039]/30">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#006039]/20 bg-[#eaf3e4] text-[#006039] transition duration-300 group-hover:bg-[#006039] group-hover:text-white">
                <Icon size={20} strokeWidth={1.6} />
              </span>

              <h3 className="mt-7 font-serif text-xl font-light italic leading-tight text-[#1c3324] lg:text-3xl">
                {title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#1c3324]/60">{desc}</p>

              <div className="mt-auto flex items-baseline gap-2 border-t border-[#006039]/10 pt-5">
                <span className="font-serif text-2xl font-medium text-[#006039]">{stat}</span>
                <span className="text-[0.64rem] uppercase tracking-[0.18em] text-[#1c3324]/45">
                  {statLabel}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}