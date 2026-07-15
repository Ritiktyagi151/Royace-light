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
            Featured collections are being updated.
          </h2> 
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#173126]/60">
            You can still browse the complete range of decorative lighting collections.
          </p>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-2 bg-[#006039] px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#0b7a4d]">
            Browse Collections <ArrowRight size={14} />
          </Link>
        </div>
      </SectionReveal>
    );
  }

  return (
    <div  className="bg-[#f5efe6] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-8xl">
        <div className="mb-10 flex flex-col gap-6 border-b border-[#173126]/12 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
              <span className="h-px w-9 bg-[#006039]" />
              Featured Collections
            </span>
            <h2
              className="mt-5 text-3xl  leading-[1.04]"
            
            >
              Decorative lighting collections for homes, villas, hotels, and commercial projects.
            </h2>
          </div>
          <Link href="/shop" className="inline-flex w-fit items-center gap-2 border border-[#006039]/25 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white">
            View All Collections <ArrowRight size={14} />
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
              className="group flex h-full min-h-[420px] flex-col overflow-hidden border border-[#173126]/12 bg-white text-[#173126] shadow-[0_18px_50px_rgba(23,49,38,0.1)] outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(23,49,38,0.16)] focus-visible:ring-2 focus-visible:ring-[#006039]/40"
            >
              <div className="relative min-h-[245px] overflow-hidden bg-[#173126]">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#10241b]/45 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 bg-[#f5efe6]/92 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <span className="mb-3 block text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#006039]">
                  Collection
                </span>
                <h3 className="text-2xl leading-tight text-[#173126]">
                  {collection.name}
                </h3>
                <p className="mt-4 overflow-hidden text-sm leading-6 text-[#173126]/68 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {collection.description}
                </p>
                <strong className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition group-hover:text-[#0b7a4d]">
                  View Collection
                  <ArrowRight size={14} strokeWidth={1.7} className="transition group-hover:translate-x-1" />
                </strong>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
