'use client';

import { ArrowRight } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

export function NewsletterSection() {
  return (
    <SectionReveal direction="left" className="bg-[#f5efe6] px-4 py-16 text-[#241913] sm:px-6 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 border border-[#241913]/10 bg-white p-6 shadow-[0_28px_90px_rgba(36,25,19,0.09)] sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Private Previews
          </span>
          <h2 className="mt-5 max-w-3xl font-serif text-[clamp(2.1rem,5vw,4.4rem)] font-light italic leading-[0.98]">
            Receive the first look at new collections.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#241913]/60">
            Invitations to limited releases, installation stories, and atelier previews. No noise,
            only the pieces worth studying.
          </p>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <input
            type="email"
            placeholder="Email address"
            aria-label="Email address"
            className="min-h-12 flex-1 border border-[#241913]/15 bg-[#f5efe6] px-4 text-sm outline-none transition placeholder:text-[#241913]/35 focus:border-[#006039]"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#006039] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#0b7a4d]"
          >
            Subscribe <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </SectionReveal>
  );
}
