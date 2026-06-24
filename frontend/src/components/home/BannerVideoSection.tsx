import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function BannerVideoSection() {
  return (
    <section className="bg-obsidian px-6 py-16 text-ivory lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="flex min-h-[420px] flex-col justify-between bg-forest p-8 sm:p-10">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-gold-light">
              New Arrival Showcase
            </p>
            <h2 className="max-w-xl font-serif text-4xl leading-tight text-ivory sm:text-5xl">
              Statement chandeliers and warm decorative light for refined rooms.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-cream/75">
              Explore lighting pieces shaped around scale, finish, glow, and the
              mood of the room. Built for homes, villas, hotels, and curated
              interior projects.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-gold bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-obsidian transition hover:bg-gold-light"
            >
              Shop Collection
              <ArrowRight size={15} strokeWidth={1.6} />
            </Link>
            <Link
              href="/bespoke"
              className="inline-flex items-center gap-2 border border-ivory/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ivory transition hover:border-gold hover:text-gold-light"
            >
              Bespoke
            </Link>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden border border-ivory/10 bg-charcoal shadow-luxury">
          <video
            className="h-full min-h-[420px] w-full object-cover"
            src="/videos/hero-video.mp4"
            poster="/images/royace-logo.png"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/65 via-transparent to-transparent" />
          <div className="pointer-events-none absolute bottom-6 left-6 flex items-center gap-3 text-ivory">
            <span className="flex h-11 w-11 items-center justify-center border border-gold/50 bg-obsidian/55 backdrop-blur">
              <Play size={16} fill="currentColor" strokeWidth={1.5} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cream/80">
              Royace Video
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
