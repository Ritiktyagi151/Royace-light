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
import { SectionReveal, cardReveal, cardRevealRight, staggerContainer } from './SectionReveal';

// ---- Data (inline — move back to home-data.ts if you prefer) ----
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
    title: 'Quality, verified.',
    desc: 'Har batch multiple quality checkpoints se guzarta hai — finish, weight, aur consistency, sab kuch ship hone se pehle test hota hai.',
    stat: '100%',
    statLabel: 'batch inspected',
  },
  {
    icon: Factory,
    title: 'Scale that delivers.',
    desc: 'In-house production capacity itni strong hai ki bade residential aur commercial projects bhi bina delay ke fulfil ho jaate hain.',
    stat: '50K+',
    statLabel: 'units / month',
  },
  {
    icon: Ruler,
    title: 'Precision by design.',
    desc: 'Design se lekar installation tak, har piece exact specifications ke mutabik banaya jaata hai — koi guesswork nahi.',
    stat: '±0.2mm',
    statLabel: 'tolerance',
  },
  {
    icon: Truck,
    title: 'On-time, every time.',
    desc: 'Logistics network pan-India delivery ko predictable banata hai, chahe project ka scale kuch bhi ho.',
    stat: '98%',
    statLabel: 'on-time dispatch',
  },
  {
    icon: Sparkles,
    title: 'Finish that lasts.',
    desc: 'Premium materials aur curated finishes jo sirf achhe dikhte nahi — time ke saath apni chamak bhi bacha kar rakhte hain.',
    stat: '10 Yr',
    statLabel: 'finish warranty',
  },
  {
    icon: HeartHandshake,
    title: 'Support that stays.',
    desc: 'Sale ke baad bhi hum saath hain — installation guidance se lekar after-sales query tak, dedicated support team available.',
    stat: '24/7',
    statLabel: 'client support',
  },
];

export function WhyChooseUs() {
  return (
    <div
      
      className="relative overflow-hidden bg-[#dfe8d8] px-4 py-16 text-[#1c3324] sm:px-6 lg:px-10 lg:py-24"
    >
      {/* soft decorative glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#a9cf9a]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#c9e3bd]/50 blur-3xl" />

      <div className="relative mx-auto mb-12 flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Why Royace
          </span>
          <h2 className="mt-5 max-w-4xl font-serif text-4xl font-light italic leading-[0.98] text-[#1c3324]">
            A quieter, more exacting way to buy luxury lighting.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#1c3324]/65">
          Har fixture ke peeche ek disciplined process hai — design, material, aur delivery, sab kuch is liye banaya gaya hai ki aapko sirf result dikhe, complexity nahi.
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
              {/* index tag */}
              <span className="absolute right-6 top-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#006039]/30">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#006039]/20 bg-[#eaf3e4] text-[#006039] transition duration-300 group-hover:bg-[#006039] group-hover:text-white">
                <Icon size={20} strokeWidth={1.6} />
              </span>

              <h3 className="mt-7 font-serif text-2xl font-light italic leading-tight text-[#1c3324] lg:text-3xl">
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