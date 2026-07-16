'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { showcaseItems } from './home-data';
import { SectionReveal } from './SectionReveal';

export function CollectionShowcase() {
  return (
    <div  className="relative isolate overflow-hidden bg-[#fffaf2] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
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
            Design Approach
          </span>
          <h2 className="mt-5 font-serif text-4xl font-light italic leading-[0.98]">
            Warm finishes, balanced scale, and practical installation planning.
          </h2>
          <p className="mt-6 text-sm leading-7 text-[#173126]/62">
            We help choose lighting that suits Indian room sizes, ceiling heights, interior finishes, and the way the space is used every day.
          </p>
          <Link href="/bespoke" className="mt-8 inline-flex items-center gap-2 bg-[#006039] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#0b7a4d]">
            Start a Custom Enquiry <ArrowRight size={14} />
          </Link>
        </div>

        {/* ---- Redesigned image grid: framed, editorial cards ---- */}
        <div className="grid gap-5 sm:grid-cols-2">
          {showcaseItems.map((item, index) => (
            <motion.article
              key={item.label}
              className={`group relative ${index === 1 ? 'sm:mt-14' : ''}`}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* outer frame */}
              <div className="relative border border-[#173126]/12 bg-white p-2.5 shadow-[0_24px_70px_rgba(23,49,38,0.1)] transition-colors duration-500 group-hover:border-[#e4c77c]/60">
                {/* corner marks */}
                <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-[#006039]/40" />
                <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-[#006039]/40" />
                <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-[#006039]/40" />
                <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[#006039]/40" />

                {/* image */}
                <div className="relative h-[360px] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover grayscale-[15%] transition duration-700 ease-out group-hover:scale-[1.06] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#12261d]/10 via-transparent to-[#12261d]/70" />

                  {/* view icon, revealed on hover */}
                  <span className="absolute right-3 top-3 flex h-9 w-9 -translate-y-2 items-center justify-center border border-white/50 bg-[#12261d]/40 text-white opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight size={15} strokeWidth={1.7} />
                  </span>

          
                 

                  {/* label */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-[#e4c77c]">
                      {item.label}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl font-light leading-tight text-white">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
