'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { storyPillars } from './home-data';
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from './SectionReveal';

export function BrandStoryRedesign() {
  return (
    <SectionReveal direction="left" className="relative isolate overflow-hidden bg-[#fffaf2] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/green-texture.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-70 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[#fffaf2]/58" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="order-2 flex flex-col justify-center border border-[#173126]/10 bg-white/90 p-6 shadow-[0_24px_70px_rgba(23,49,38,0.08)] backdrop-blur-sm sm:p-9 lg:order-1 lg:p-12">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            The House
          </span>
          <h2 className="mt-5 max-w-xl text-[clamp(2rem,4.5vw,4.25rem)] font-semibold leading-[1.02] text-[#173126]">
            Built like jewellery. Installed like architecture.
          </h2>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#173126]/66">
            Royace creates lighting for rooms where every surface has been considered, specified alongside the architecture rather than chosen after it.
          </p>

          <motion.div
            className="mt-9 grid gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.25 }}
          >
            {storyPillars.map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                className="group grid grid-cols-[42px_1fr] gap-4 border-t border-[#173126]/10 pt-4"
                key={title}
                variants={index % 2 === 0 ? cardReveal : cardRevealRight}
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center border border-[#006039]/20 bg-[#006039]/5 text-[#006039] transition group-hover:bg-[#006039] group-hover:text-white"
                >
                  <Icon size={17} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#173126]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-6 text-[#173126]/58">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-9 flex flex-col gap-4 border-t border-[#173126]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-[0.72rem] font-medium uppercase leading-6 tracking-[0.16em] text-[#173126]/52">
              Private consultation, material review, delivery, and installation handled end to end.
            </p>
            <Link
              href="/about"
              className="group inline-flex w-fit items-center gap-2 bg-[#006039] px-5 py-3 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0b7a4d]"
            >
              Visit the atelier
              <ArrowRight
                size={14}
                strokeWidth={1.75}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <motion.div
          className="order-1 grid min-h-[520px] grid-cols-[0.9fr_1fr] gap-3 lg:order-2"
          whileHover={{ y: -6 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative hidden overflow-hidden border border-[#173126]/10 bg-white shadow-[0_20px_60px_rgba(23,49,38,0.1)] sm:block">
            <Image
              src="https://images.unsplash.com/photo-1561780648-dc38ba20699b?auto=format&fit=crop&w=900&q=85"
              alt="Royace chandelier craft detail"
              fill
              sizes="(max-width: 1024px) 40vw, 24vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,38,29,0.04),rgba(18,38,29,0.45))]" />
          </div>

          <div className="relative col-span-2 overflow-hidden border border-[#173126]/10 bg-white shadow-[0_24px_70px_rgba(23,49,38,0.12)] sm:col-span-1">
            <Image
              src="https://images.unsplash.com/photo-1572955034096-233ea61a78d8?auto=format&fit=crop&w=1200&q=85"
              alt="Royace statement chandelier installation"
              fill
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/78 via-[#173126]/12 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#e4c77c]">
                Atelier Standard
              </span>
              <p className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">
                Measured, finished, and installed for the room.
              </p>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-3 border border-[#173126]/10 bg-white/92 shadow-[0_18px_50px_rgba(23,49,38,0.08)]">
            {[
              { value: '12+', label: 'Years' },
              { value: '840+', label: 'Pieces' },
              { value: '18', label: 'States' },
            ].map((item) => (
              <div key={item.label} className="border-r border-[#173126]/10 px-4 py-5 text-center last:border-r-0">
                <strong className="block text-2xl font-semibold text-[#006039]">{item.value}</strong>
                <span className="mt-1 block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#173126]/48">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
