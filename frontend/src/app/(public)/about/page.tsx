import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Hammer, Lightbulb, Sparkles } from 'lucide-react';

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
  { value: 'Luxury', label: 'Decorative Lighting' },
  { value: 'Custom', label: 'Made-to-Order Pieces' },
  { value: 'India', label: 'Project Support' },
];

export default function AboutPage() {
  return (
    <main className="bg-obsidian text-ivory">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-28 sm:pt-32 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(0,96,57,0.42),rgba(5,4,3,0.88)_46%,rgba(74,22,34,0.36))]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-obsidian to-transparent" />

        <div className="mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-gold-light">
              About Royace
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] text-ivory sm:text-6xl lg:text-7xl">
              Lighting made for rooms with presence.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-cream/75 sm:text-lg">
              Royace Lighting creates decorative lighting for homes, villas, hotels,
              boutiques, and interior projects where the fixture is part of the
              architecture of the room.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-none border border-gold bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-obsidian transition hover:bg-gold-light"
              >
                Explore Collections
                <ArrowUpRight size={15} strokeWidth={1.6} />
              </Link>
              <Link
                href="/bespoke"
                className="inline-flex items-center gap-2 rounded-none border border-ivory/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ivory transition hover:border-gold hover:text-gold-light"
              >
                Bespoke Work
              </Link>
            </div>
          </div>

          <div className="border border-ivory/10 bg-charcoal/80 p-6 shadow-luxury backdrop-blur">
            <div className="aspect-[4/5] overflow-hidden bg-forest">
              <img
                src="/images/royace%20logo_page-0001.jpg"
                alt="Royace Lighting brand mark"
                className="h-full w-full object-contain p-10"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Our Approach
            </p>
            <h2 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl">
              We design around atmosphere, proportion, and longevity.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {values.map(({ title, description, Icon }) => (
              <article key={title} className="border border-ivory/10 bg-charcoal-2 p-6">
                <Icon className="mb-6 text-gold-light" size={26} strokeWidth={1.4} />
                <h3 className="font-serif text-2xl text-ivory">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-cream/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ivory/10 bg-cream px-6 py-16 text-obsidian lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="border-l border-gold/40 pl-6">
              <p className="font-serif text-4xl text-forest">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal/65">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="bg-forest p-8 sm:p-10">
            <Sparkles className="mb-8 text-gold-light" size={30} strokeWidth={1.4} />
            <h2 className="font-serif text-4xl text-ivory">For designers, homeowners, and project teams.</h2>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-base leading-8 text-cream/72">
              From statement chandeliers to quiet wall lights, our work is guided by
              the way people will actually live under the light. We help with product
              selection, scale checks, finish direction, and custom requests where a
              standard piece is not enough.
            </p>
            <Link
              href="/contact-us"
              className="mt-8 inline-flex w-fit items-center gap-2 border border-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-light transition hover:bg-gold hover:text-obsidian"
            >
              Talk To Us
              <ArrowUpRight size={15} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
