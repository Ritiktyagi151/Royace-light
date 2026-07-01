'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from './SectionReveal';
import { categoryHref, type PublicCategory } from '@/lib/publicCategories';

type FeaturedProductsProps = {
  collections: PublicCategory[];
};

export function FeaturedProducts({ collections }: FeaturedProductsProps) {
  if (!collections.length) {
    return (
      <SectionReveal direction="left" className="bg-[#f5efe6] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center border border-[#173126]/10 bg-white px-6 py-14 text-center shadow-[0_24px_70px_rgba(23,49,38,0.08)]">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            Signature Collections
          </span>
          <h2 className="mt-5 font-serif text-[clamp(2rem,5vw,4rem)] font-light italic leading-tight">
            Private collection previews are being prepared.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#173126]/60">
            Explore the full catalogue while the featured edit is refreshed.
          </p>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-2 bg-[#006039] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#0b7a4d]">
            Shop collections <ArrowRight size={14} />
          </Link>
        </div>
      </SectionReveal>
    );
  }

  return (
    <SectionReveal direction="left" className="bg-[#f5efe6] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 border-b border-[#173126]/12 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
              <span className="h-px w-9 bg-[#006039]" />
              Signature Collections
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,5vw,4.5rem)] font-light italic leading-[0.98]">
              Curated lighting collections for refined interiors.
            </h2>
          </div>
          <Link href="/shop" className="inline-flex w-fit items-center gap-2 border border-[#006039]/25 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white">
            View all collections <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <motion.div
        className="mx-auto grid max-w-8xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.12 }}
      >
        {collections.map((collection, index) => (
          <motion.div key={collection._id || collection.slug} variants={index % 2 === 0 ? cardReveal : cardRevealRight}>
            <Link
              href={categoryHref(collection)}
              className="group relative flex min-h-[420px] overflow-hidden border border-[#173126]/10 bg-white text-white shadow-[0_24px_70px_rgba(23,49,38,0.12)] outline-none transition duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#006039]/40"
            >
              {collection.image ? (
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[#1d261f]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/88 via-[#173126]/38 to-[#2a4336]/10" />
              <div className="absolute left-0 top-0 p-5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#e4c77c]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="relative z-10 mt-auto w-full p-5 sm:p-6">
                <span className="mb-3 block text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#e4c77c]">
                  Collection
                </span>
                <h3 className="font-serif text-[clamp(1.85rem,4vw,3.2rem)] font-light italic leading-none text-white">
                  {collection.name}
                </h3>
                <p className="mt-4 overflow-hidden text-sm leading-6 text-white/65 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {collection.description}
                </p>
                <strong className="mt-6 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white transition group-hover:text-[#e4c77c]">
                  View Collection
                  <ArrowRight size={14} strokeWidth={1.7} className="transition group-hover:translate-x-1" />
                </strong>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
