'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { storyPillars } from './home-data';
import { cardReveal, cardRevealRight, staggerContainer } from './SectionReveal';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1561780648-dc38ba20699b?auto=format&fit=crop&w=900&q=85',
    alt: 'Royace chandelier craft detail',
  },
  {
    src: '/images/homepage-img/light.webp',
    alt: 'Royace pendant lighting close-up',
  },
  {
    src: '/images/homepage-img/light2.jfif',
    alt: 'Royace fixture in a living space',
  },
  {
    src: '/images/homepage-img/light3.jfif',
    alt: 'Royace statement chandelier installation',
  },
];

const processSteps = ['Select', 'Scale', 'Finish', 'Install'];

const storyStats = [
  { value: '15+', label: 'Years' },
  { value: '840+', label: 'Custom pieces' },
  { value: '50+', label: 'Cities' },
];

export function BrandStoryRedesign() {
  return (
    <section className="relative isolate h-[80vh] max-h-[80vh] overflow-hidden bg-[#fffaf2] px-4 py-4 text-[#173126] sm:px-6 sm:py-5 lg:px-10 lg:py-6">
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/images/green-texture.png"
          alt="texture image background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[#fffaf2]/42" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#006039]/24 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c7a45a]/30 to-transparent" />

      <div className="relative z-10 mx-auto grid h-full max-w-7xl gap-4 md:grid-cols-[0.82fr_1.18fr] md:items-center lg:grid-cols-[1.02fr_0.98fr] lg:gap-7">
        <div className="relative hidden h-full md:block">
          <motion.div
            className="group absolute inset-x-0 top-0 h-[66%] overflow-hidden border border-[#173126]/10 bg-white shadow-[0_32px_90px_rgba(23,49,38,0.14)] sm:left-0 sm:right-[18%]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,38,29,0.04),rgba(18,38,29,0.56))]" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-[#e4c77c]">
                Royace Craft
              </span>
             
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-[76px] right-0 grid w-[48%] gap-3 lg:w-[42%]"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            {galleryImages.slice(1, 3).map((img, index) => (
              <motion.div
                key={img.src}
                variants={index % 2 === 0 ? cardReveal : cardRevealRight}
                className="group relative min-h-[118px] overflow-hidden border border-white/70 bg-white shadow-[0_22px_70px_rgba(23,49,38,0.16)] sm:min-h-[150px] lg:min-h-[clamp(112px,16vh,150px)]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 22vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#173126]/10" />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 right-[30%] border border-[#173126]/10 bg-white/94 p-3 shadow-[0_18px_50px_rgba(23,49,38,0.1)] backdrop-blur lg:right-[34%] lg:p-4"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="grid grid-cols-3 divide-x divide-[#173126]/10">
              {storyStats.map((item) => (
                <div key={item.label} className="px-3 text-center first:pl-0 last:pr-0">
                  <strong className="block text-xl font-semibold leading-none text-[#006039] sm:text-2xl">
                    {item.value}
                  </strong>
                  <span className="mt-2 block text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[#173126]/50">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative h-full overflow-hidden border border-[#173126]/10 bg-white/88 p-4 shadow-[0_24px_80px_rgba(23,49,38,0.08)] backdrop-blur-sm sm:p-5 lg:max-h-full lg:p-6">
          <div className="absolute inset-0 opacity-20 md:hidden">
            <Image
              src={galleryImages[0].src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#fffaf2]/70" />
          </div>
          <div className="relative z-10 flex h-full min-h-0 flex-col justify-start">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-3 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[#006039] sm:text-[0.64rem] sm:tracking-[0.26em]">
                <span className="h-px w-8 bg-[#006039]" />
                About Royace
              </span>
              <Link
                href="/about"
                className="group hidden shrink-0 items-center justify-center gap-2 bg-[#006039] px-4 py-2 text-center text-[0.58rem] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#0b7a4d] sm:inline-flex"
              >
                Story
                <ArrowRight
                  size={13}
                  strokeWidth={1.75}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <h2
              className="mt-4 max-w-2xl text-2xl font- text-[#173126] sm:mt-3 md:text-3xl xl:text-4xl"
             
            >
              Decorative lighting planned for Indian homes and projects.
            </h2>

            <p className="mt-2 max-w-2xl overflow-hidden text-[0.82rem] leading-5 text-[#173126]/66 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-[0.84rem] sm:leading-5">
              Royace designs and curates chandeliers, pendants, wall lights, and decorative fixtures for spaces where lighting must look beautiful and work practically on site.
            </p>

            <div className="mt-3 hidden grid-cols-2 border border-[#173126]/10 bg-[#fffaf2]/80 sm:grid sm:grid-cols-4">
              {processSteps.map((step, index) => (
                <div
                  key={step}
                  className="border-b border-r border-[#173126]/10 px-3 py-2.5 last:border-r-0 even:border-r-0 sm:border-b-0 sm:even:border-r sm:last:border-r-0"
                >
                  <span className="block text-[0.54rem] font-semibold uppercase tracking-[0.16em] text-[#006039]/70">
                    0{index + 1}
                  </span>
                  <strong className="mt-1.5 block text-[0.78rem] font-semibold text-[#173126]">{step}</strong>
                </div>
              ))}
            </div>

            <motion.div
              className="mt-3 grid min-h-0 gap-2 sm:gap-2.5 lg:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.25 }}
            >
              {storyPillars.map(({ icon: Icon, title, desc }, index) => (
                <motion.div
                  className="group grid grid-cols-[34px_1fr] gap-2.5 border-t border-[#173126]/10 pt-2.5 sm:grid-cols-[36px_1fr] sm:gap-3 lg:block lg:min-h-[118px] lg:border lg:border-[#173126]/10 lg:bg-[#fffaf2]/45 lg:p-3"
                  key={title}
                  variants={index % 2 === 0 ? cardReveal : cardRevealRight}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center border border-[#006039]/20 bg-[#006039]/5 text-[#006039] transition group-hover:bg-[#006039] group-hover:text-white"
                  >
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <div className="lg:mt-3">
                    <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-[#173126] sm:text-[0.74rem] lg:text-[0.68rem]">
                      {title}
                    </h3>
                    <p className="mt-1 hidden overflow-hidden text-[0.76rem] leading-4 text-[#173126]/58 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:[display:-webkit-box] lg:text-[0.72rem] lg:[-webkit-line-clamp:2] xl:[-webkit-line-clamp:3]">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-3 flex flex-col gap-3 border-t border-[#173126]/10 pt-3 sm:hidden">
              <Link
                href="/about"
                className="group inline-flex w-full items-center justify-center gap-2 bg-[#006039] px-4 py-2.5 text-center text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#0b7a4d] sm:w-fit"
              >
                Know Our Story
                <ArrowRight
                  size={14}
                  strokeWidth={1.75}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}