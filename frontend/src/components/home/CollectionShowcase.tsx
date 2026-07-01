'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { showcaseItems } from './home-data';
import { SectionReveal } from './SectionReveal';

export function CollectionShowcase() {
  return (
    <SectionReveal direction="right" className="relative isolate overflow-hidden bg-[#fffaf2] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/green-texture.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[#fffaf2]/42" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Design Language
          </span>
          <h2 className="mt-5 font-serif text-4xl font-light leading-[0.98]">
            Dark lacquer, warm metal, disciplined proportion.
          </h2>
          <p className="mt-6 text-sm leading-7 text-[#173126]/62">
            Ivory rooms, forest-green accents, and warm metal finishes create premium spaces that feel composed, not loud.
          </p>
          <Link href="/bespoke" className="mt-8 inline-flex items-center gap-2 bg-[#006039] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#0b7a4d]">
            Commission a piece <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {showcaseItems.map((item, index) => (
            <motion.article
              key={item.label}
              className={`group relative min-h-[380px] overflow-hidden border border-[#173126]/10 bg-white shadow-[0_24px_70px_rgba(23,49,38,0.12)] ${index === 1 ? 'sm:mt-14' : ''}`}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/82 via-[#173126]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[#e4c77c]">
                  {item.label}
                </span>
                <h3 className="mt-3 font-serif text-3xl font-light leading-tight text-white">
                  {item.title}
                </h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
