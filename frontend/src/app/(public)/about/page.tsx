import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Hammer,
  Lightbulb,
  PackageCheck,
  Ruler,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Royace Lighting',
  description:
    'Learn about Royace Lighting, a luxury decorative lighting brand crafting chandeliers, pendant lights, wall lights, and bespoke lighting for refined interiors.',
};

const values = [
  {
    title: 'Craft-Led Detail',
    description:
      'Every piece is considered through proportion, finish, glow, and installation practicality before it reaches a home or project site.',
    Icon: Hammer,
  },
  {
    title: 'Material Honesty',
    description:
      'We focus on metal, glass, crystal, texture, and warm light quality that feel composed in real interiors, not only in catalogues.',
    Icon: BadgeCheck,
  },
  {
    title: 'Room-First Design',
    description:
      'Scale, ceiling height, furniture layout, and mood guide each recommendation so the lighting belongs to the room.',
    Icon: Lightbulb,
  },
];

const stats = [
  { value: 'Premium', label: 'Decorative Lighting' },
  { value: 'Custom', label: 'Made-to-Order Pieces' },
  { value: 'Project', label: 'Selection Support' },
];

const process = [
  {
    step: '01',
    title: 'Understand the space',
    description:
      'We begin with room size, ceiling height, furniture placement, finish palette, and the mood you want the light to create.',
    Icon: Ruler,
  },
  {
    step: '02',
    title: 'Recommend with clarity',
    description:
      'Our team helps shortlist chandeliers, pendants, wall lights, and ceiling lights that balance beauty with practical installation.',
    Icon: Lightbulb,
  },
  {
    step: '03',
    title: 'Coordinate the finish',
    description:
      'We guide metal tones, glass, crystal, textures, and warm light temperature so every detail feels settled in the interior.',
    Icon: Sparkles,
  },
  {
    step: '04',
    title: 'Support delivery',
    description:
      'For selected products and custom requests, we keep the process organised from confirmation to dispatch and project coordination.',
    Icon: PackageCheck,
  },
];

const strengths = [
  'Curated designs for homes, villas, hotels, boutiques, restaurants, and premium offices.',
  'Statement chandeliers, pendant lights, wall lights, ceiling lights, and bespoke decorative pieces.',
  'Guidance for scale, finish, placement, warm light tone, and overall room balance.',
  'A refined product language built around luxury, durability, and timeless interior appeal.',
];

export default function AboutPage() {
  return (
    <main className="bg-white text-emerald-950">
      <section className="relative isolate flex min-h-[520px] overflow-hidden bg-[#f3fbf4] px-6 pb-12 pt-28 sm:pt-32 lg:min-h-[560px] lg:px-10 lg:pb-16">
        <div className="absolute inset-0 -z-20 bg-[url('/images/green-texture.png')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.76)_47%,rgba(220,252,231,0.62)_100%)]" />
        <div className="absolute bottom-0 left-0 -z-10 h-44 w-full bg-[linear-gradient(0deg,#ffffff,rgba(255,255,255,0))]" />

        <div className="mx-auto grid w-full max-w-7xl items-end gap-8 self-end lg:grid-cols-[1.05fr_0.72fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
              About Royace
            </p>
            <h1 className="max-w-4xl font-serif text-[clamp(2.35rem,5.5vw,4.8rem)] leading-[1.02] text-emerald-950">
              Lighting made for refined, memorable rooms.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-900/72 sm:text-base">
              Royace Lighting creates decorative lighting for homes, villas, hotels,
              boutiques, and interior projects where the fixture is part of the
              architecture of the room. Our work blends premium materials, balanced
              proportions, warm illumination, and dependable project guidance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-none border border-emerald-700 bg-emerald-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-emerald-800"
              >
                Explore Collections
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <Link
                href="/bespoke"
                className="inline-flex items-center gap-2 rounded-none border border-emerald-200 bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-900 transition hover:border-emerald-500 hover:text-emerald-700"
              >
                Bespoke Work
              </Link>
            </div>
          </div>

          <div className="hidden border border-emerald-100 bg-white/85 p-4 shadow-[0_24px_70px_rgba(6,95,70,0.12)] backdrop-blur lg:block">
            <div className="relative h-[300px] overflow-hidden bg-emerald-50">
              <div className="absolute inset-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-70" />
              <div className="absolute inset-0 bg-white/38" />
              <img
                src="/images/royace%20logo_page-0001.jpg"
                alt="Royace Lighting brand mark"
                className="relative h-full w-full object-contain p-8"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Our Approach
            </p>
            <h2 className="font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
              We design around atmosphere, proportion, and longevity.
            </h2>
            <p className="mt-5 text-sm leading-7 text-emerald-900/65">
              Every Royace recommendation is shaped by the room first. We look at
              how a fixture will sit in the interior during the day, how it will glow
              at night, and how the finish will age with the rest of the space.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="border border-emerald-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(236,253,245,0.76)),url('/images/green-texture.png')] bg-cover bg-center p-6"
              >
                <Icon className="mb-6 text-emerald-600" size={26} strokeWidth={1.4} />
                <h3 className="font-serif text-2xl text-emerald-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-emerald-900/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-emerald-100 bg-[#f3fbf5] px-6 py-16 text-emerald-950 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[url('/images/green-texture.png')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-white/58" />
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="border-l border-emerald-300 pl-6">
              <p className="font-serif text-4xl text-emerald-800">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-950/60">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#ffffff,#f6fdf8)] px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
              How We Work
            </p>
            <h2 className="font-serif text-4xl leading-tight text-emerald-950 sm:text-5xl">
              A thoughtful process from first idea to final glow.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {process.map(({ step, title, description, Icon }) => (
              <article
                key={title}
                className="border border-emerald-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(240,253,244,0.8)),url('/images/green-texture.png')] bg-cover bg-center p-6 shadow-[0_16px_45px_rgba(6,95,70,0.08)]"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-serif text-3xl text-emerald-200">{step}</span>
                  <Icon className="text-emerald-600" size={25} strokeWidth={1.4} />
                </div>
                <h3 className="font-serif text-2xl text-emerald-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-emerald-900/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#eefbf3] px-6 py-20 lg:px-10">
        <div className="absolute inset-0 -z-20 bg-[url('/images/green-texture.png')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(236,253,245,0.82),rgba(255,255,255,0.9)_54%,rgba(240,253,244,0.78))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(6,95,70,0.09)] sm:p-10">
            <Sparkles className="mb-8 text-emerald-600" size={30} strokeWidth={1.4} />
            <h2 className="font-serif text-4xl leading-tight text-emerald-950">
              For designers, homeowners, and project teams.
            </h2>
            <p className="mt-5 text-base leading-8 text-emerald-900/70">
              From statement chandeliers to quiet wall lights, our work is guided by
              the way people will actually live under the light. We help with product
              selection, scale checks, finish direction, and custom requests where a
              standard piece is not enough.
            </p>
            <Link
              href="/contact-us"
              className="mt-8 inline-flex w-fit items-center gap-2 border border-emerald-700 bg-emerald-700 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-emerald-800"
            >
              Talk To Us
              <ArrowUpRight size={15} strokeWidth={1.6} />
            </Link>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {strengths.map((item) => (
              <div key={item} className="flex gap-4 border border-emerald-100 bg-white/80 p-5">
                <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={20} strokeWidth={1.6} />
                <p className="text-sm leading-7 text-emerald-900/70">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
