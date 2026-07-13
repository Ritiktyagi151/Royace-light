'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from './SectionReveal';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';

export function FeaturedCategories() {
  const { data: fetchedCategories } = usePublicCategories();
  const categories = useMemo(
    () => (fetchedCategories?.length ? fetchedCategories : FALLBACK_CATEGORIES),
    [fetchedCategories],
  );
  const featuredCategories = useMemo(() => categories.slice(0, 4), [categories]);

  return (
    <SectionReveal direction="right" className="relative overflow-hidden bg-[#fffaf2] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-[#173126]/12 pb-8 md:flex-row md:items-end md:justify-between lg:mb-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
              <span className="h-px w-9 bg-[#006039]" />
              Shop By Category
            </span>
            <h2 className="mt-5 font-serif text-[clamp(2.1rem,5vw,4.7rem)] font-light italic leading-[0.98] text-[#173126]">
              Choose lighting by room, mood, and scale.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#173126]/62">
            Browse practical collections for homes, villas, hotels, offices, and commercial interiors across India.
          </p>
        </div>
      </div>

      <motion.div
        className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.2 }}
      >
        {featuredCategories.map((category, index) => (
          <motion.div
            key={category.slug}
            variants={index % 2 === 0 ? cardReveal : cardRevealRight}
            className={index === 0 ? 'lg:col-span-2' : ''}
          >
            <Link
              href={categoryHref(category)}
              className="group relative flex min-h-[320px] overflow-hidden border border-[#173126]/10 bg-white text-white shadow-[0_24px_70px_rgba(23,49,38,0.12)] outline-none transition duration-300 hover:-translate-y-1 hover:border-[#006039]/35 focus-visible:border-[#006039] focus-visible:ring-2 focus-visible:ring-[#006039]/30 sm:min-h-[380px] lg:min-h-[410px]"
            >
              <Image
                src={category.image || FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].image || ''}
                alt={category.name}
                fill
                sizes={index === 0 ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/88 via-[#173126]/38 to-[#2a4336]/12" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#e4c77c]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#173126]/45 text-lg backdrop-blur transition group-hover:border-[#e4c77c]/50 group-hover:bg-[#006039]/50">
                  {category.emoji || 'L'}
                </span>
              </div>

              <div className="relative z-10 mt-auto flex w-full flex-col justify-end p-5 sm:p-6">
                <span className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#e4c77c]">
                  Collection
                </span>
                <h3 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-none text-white">
                  {category.name}
                </h3>
                <p className="mt-4 max-w-lg overflow-hidden text-sm leading-6 text-white/65 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {category.description}
                </p>
                <strong className="mt-6 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition group-hover:text-[#e4c77c]">
                  Explore
                  <ArrowRight size={14} strokeWidth={1.6} className="transition group-hover:translate-x-1" />
                </strong>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </SectionReveal>
  );
}
