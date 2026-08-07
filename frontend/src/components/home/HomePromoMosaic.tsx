"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cardReveal, cardRevealRight, staggerContainer } from "./SectionReveal";
import { categoryHref, FALLBACK_CATEGORIES, type PublicCategory } from "@/lib/publicCategories";

const tileLayouts = [
  "lg:row-span-2",
  "",
  "lg:row-span-2",
  "",
];

type HomePromoMosaicProps = {
  categories?: PublicCategory[];
};

function getKicker(category: PublicCategory) {
  if (category.description) return category.description;
  return `Explore ${category.name.toLowerCase()} from Royace.`;
}

export default function HomePromoMosaic({ categories = FALLBACK_CATEGORIES }: HomePromoMosaicProps) {
  const promoTiles = (categories.length ? categories : FALLBACK_CATEGORIES).slice(0, 4);

  return (
    <div className="bg-[#f5efe6] p-3 md:p-4">
      <motion.div
        className="grid auto-rows-[260px] gap-3 sm:auto-rows-[320px] md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[270px_270px]"
        variants={staggerContainer}
        initial="show"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
      >
        {promoTiles.map((tile, index) => (
          <motion.div
            key={tile.slug || tile._id || tile.name}
            variants={index % 2 === 0 ? cardReveal : cardRevealRight}
            className={tileLayouts[index] || ""}
          >
            <Link
              href={categoryHref(tile)}
              className="group relative block h-full overflow-hidden"
            >
              <Image
                src={tile.image || FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].image || ""}
                alt={tile.name}
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="object-cover transition-all duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/78 via-[#173126]/25 to-transparent" />

              {index === 0 && (
                <div className="absolute left-5 top-8 z-10 sm:left-8 sm:top-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white">
                    Royace Collection
                  </p>

                  <h2 className="mt-5 max-w-[9ch] font-serif text-[clamp(2.6rem,12vw,72px)] leading-none text-[#e0c58f]">
                    Featured
                  </h2>

                  <p className="mt-4 max-w-[20rem] text-sm leading-6 text-white/78">
                    Real product categories from the Royace catalogue.
                  </p>
                </div>
              )}

              <div className="absolute bottom-4 left-5 z-10 sm:bottom-7 sm:left-7">
                

                <h3 className="mt-2  text-2xl   leading-none text-white">
                  {tile.name}
                </h3>
                {/* <p className="max-w-md overflow-hidden text-[8px] font-semibold uppercase tracking-[0.28em] text-[#e4dac3]  [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {getKicker(tile)}
                </p> */}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
