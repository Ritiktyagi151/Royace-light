"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cardReveal, cardRevealRight, SectionReveal, staggerContainer } from "./SectionReveal";
import { buildShopPath } from "@/lib/shopUrls";

const promoTiles = [
  {
    title: "Lamps",
    kicker: "Table & Floor Statements",
    href: buildShopPath({ category: "table-lamps" }),
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80",
    sale: true,
    className: "lg:row-span-2", // Column 1: Full Height
  },
  {
    title: "Chandeliers",
    kicker: "Crystal & Vintage Centrepieces",
    href: buildShopPath({ category: "chandeliers" }),
    image:
      "https://images.unsplash.com/photo-1572955034096-233ea61a78d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Pendants",
    kicker: "Hanging Silhouettes",
    href: buildShopPath({ category: "pendants" }),
    image:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80",
    className: "lg:row-span-2", // Column 3: Full Height 👍
  },
  {
    title: "Outdoor",
    kicker: "Gates, Walls & Gardens",
    href: buildShopPath({ category: "outdoor" }),
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", // Column 2 ke bottom me auto-fit ho jayega
  },
];

export default function HomePromoMosaic() {
  return (
    <div className="bg-[#f5efe6] p-3 md:p-4">
      <motion.div
        className="grid auto-rows-[320px] gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[270px_270px]"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.18 }}
      >
        {promoTiles.map((tile) => (
          <motion.div
            key={tile.title}
            variants={promoTiles.indexOf(tile) % 2 === 0 ? cardReveal : cardRevealRight}
            className={tile.className || ""}
          >
            <Link
              href={tile.href}
              className="group relative block h-full overflow-hidden"
            >
              {/* Image */}
              <Image
                src={tile.image}
                alt={tile.title}
                fill
                sizes="(max-width:1024px) 100vw, 33vw"
                className="object-cover transition-all duration-700 group-hover:scale-105"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#12261d]/78 via-[#173126]/25 to-transparent" />

              {/* Sale Content */}
              {tile.sale && (
                <div className="absolute left-5 top-8 z-10 sm:left-8 sm:top-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white">
                    Dazzling Bulb
                  </p>

                  <h2 className="mt-5 font-serif text-[clamp(3.5rem,18vw,90px)] italic leading-none text-[#e0c58f]">
                    Sale
                  </h2>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="rotate-180 [writing-mode:vertical-rl] text-xs uppercase tracking-[0.2em] text-white/70">
                      Up To
                    </span>

                    <span className="font-serif text-[clamp(2.6rem,13vw,60px)] leading-none text-white">
                      60%
                    </span>

                    <span className="mb-1 font-serif text-[clamp(2rem,10vw,48px)] leading-none text-white">
                      OFF
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Content */}
              <div className="absolute bottom-5 left-5 z-10 sm:bottom-7 sm:left-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#d8bf82]">
                  {tile.kicker}
                </p>

                <h3 className="mt-2 font-serif text-[clamp(1.75rem,7vw,42px)] font-normal leading-none text-white">
                  {tile.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
