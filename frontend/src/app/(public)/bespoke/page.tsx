import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ClipboardCheck, DraftingCompass, Gem, Ruler, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bespoke Lighting | Royace Lighting',
  description:
    'Commission bespoke chandeliers, pendant lights, wall lights, and decorative lighting with Royace Lighting for homes, hotels, villas, and interior projects.',
};

const process = [
  {
    step: '01',
    title: 'Brief',
    description:
      'Share room dimensions, ceiling height, drawings, photos, preferred style, finish direction, city, timeline, and budget range.',
    Icon: ClipboardCheck,
  },
  {
    step: '02',
    title: 'Design Direction',
    description:
      'We refine scale, silhouette, material language, colour temperature, and installation requirements for the site.',
    Icon: DraftingCompass,
  },
  {
    step: '03',
    title: 'Making',
    description:
      'The approved piece moves through sourcing, fabrication, finishing, quality checks, packing, and dispatch planning.',
    Icon: Wrench,
  },
];

const capabilities = [
  'Custom chandeliers for foyers, staircases, living rooms, and double-height spaces',
  'Pendant clusters for dining, kitchen islands, bedrooms, lounges, and hospitality zones',
  'Wall lights, ceiling lights, and decorative accents matched to project finishes',
  'Finish coordination across brass, gold, black, bronze, glass, crystal, and textured details',
];

export default function BespokePage() {
  return (
    <main className="bg-obsidian text-ivory">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-28 sm:pt-32 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(29,18,11,0.78),rgba(5,4,3,0.9)_45%,rgba(0,61,43,0.62))]" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-gold-light">
              Bespoke Lighting
            </p>
            <h1 className="font-serif text-5xl leading-[1.02] text-ivory sm:text-6xl lg:text-7xl">
              Custom lighting for spaces that need their own signature.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-cream/75 sm:text-lg">
              Commission chandeliers, pendant arrangements, wall lights, and
              decorative fixtures built around your room, project mood, material
              palette, and installation realities.
            </p>
            <Link
              href="/contact-us"
              className="mt-10 inline-flex items-center gap-2 border border-gold bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-obsidian transition hover:bg-gold-light"
            >
              Start A Bespoke Enquiry
              <ArrowUpRight size={15} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-ivory/10 bg-charcoal-2 p-8 sm:p-10">
            <Ruler className="mb-8 text-gold-light" size={32} strokeWidth={1.4} />
            <h2 className="font-serif text-4xl leading-tight text-ivory">
              Made to fit the site, not just the catalogue.
            </h2>
            <p className="mt-5 text-sm leading-7 text-cream/68">
              Bespoke work is useful when ceiling height, room scale, project finishes,
              electrical points, or visual intent demand something more exact than a
              ready design.
            </p>
          </div>

          <div className="grid gap-4">
            {capabilities.map((item) => (
              <div key={item} className="flex gap-4 border border-ivory/10 bg-charcoal p-5">
                <Gem className="mt-1 shrink-0 text-gold" size={18} strokeWidth={1.5} />
                <p className="text-sm leading-7 text-cream/72">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-20 text-obsidian lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold-deep">
              Process
            </p>
            <h2 className="font-serif text-4xl leading-tight text-forest sm:text-5xl">
              A clear path from idea to installed presence.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {process.map(({ step, title, description, Icon }) => (
              <article key={title} className="border border-forest/15 bg-white p-7">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-serif text-4xl text-gold-deep">{step}</span>
                  <Icon className="text-forest" size={28} strokeWidth={1.4} />
                </div>
                <h3 className="font-serif text-3xl text-obsidian">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-charcoal/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 border border-ivory/10 bg-forest p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
              Project Ready
            </p>
            <h2 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl">
              Send drawings, site photos, or references. We will help shape the next step.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-cream/72">
              For faster review, include dimensions, ceiling height, installation city,
              finish preferences, quantity, and target delivery timeline.
            </p>
          </div>
          <Link
            href="/contact-us"
            className="inline-flex w-fit items-center gap-2 border border-gold bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-obsidian transition hover:bg-gold-light"
          >
            Contact Royace
            <ArrowUpRight size={15} strokeWidth={1.6} />
          </Link>
        </div>
      </section>
    </main>
  );
}
