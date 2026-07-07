'use client';

import { ArrowRight } from 'lucide-react';
import { SectionReveal } from './SectionReveal';

export function NewsletterSection() {
  return (
    <div  className="bg-[#f5efe6] px-4 py-16 text-[#241913] sm:px-6 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-w-7xl">
        {/* ---- Actual card ---- */}
        <div className="relative z-10 grid gap-8 overflow-hidden border border-[#241913]/10 bg-[#f5efe6] p-6 shadow-[0_28px_90px_rgba(36,25,19,0.09)] sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-70 mix-blend-multiply" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[#f5efe6]/62" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
              <span className="h-px w-9 bg-[#006039]" />
              Private Previews
            </span>
            <h2 className="mt-5 max-w-3xl text-[clamp(2rem,8vw,3.75rem)] font-semibold leading-[1.04]">
              Receive the first look at new collections.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#241913]/60">
              Invitations to limited releases, installation stories, and atelier previews. No noise,
              only the pieces worth studying.
            </p>
          </div>
          <form className="relative z-10 flex min-w-0 flex-col gap-3 sm:flex-row lg:justify-end">
            <input
              type="email"
              placeholder="Email address"
              aria-label="Email address"
              className="min-h-12 min-w-0 flex-1 border border-[#241913]/15 bg-[#f5efe6] px-4 text-base outline-none transition placeholder:text-[#241913]/35 focus:border-[#006039] sm:text-sm"
            />
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#006039] px-6 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#0b7a4d]"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* ---- Mirror reflection (visual only, non-interactive) ---- */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-full z-0 hidden h-[45%] select-none overflow-hidden md:block"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 85%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 85%)',
          }}
        >
          <div
            className="relative grid gap-8 overflow-hidden border border-[#241913]/10 bg-[#f5efe6] p-6 opacity-60 blur-[1px] sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:items-center"
            style={{ transform: 'scaleY(-1)' }}
          >
            <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-70 mix-blend-multiply" />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[#f5efe6]/62" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
                <span className="h-px w-9 bg-[#006039]" />
                Private Previews
              </span>
              <h2 className="mt-5 max-w-3xl text-[clamp(2rem,8vw,3.75rem)] font-semibold leading-[1.04]">
                Receive the first look at new collections.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#241913]/60">
                Invitations to limited releases, installation stories, and atelier previews. No noise,
                only the pieces worth studying.
              </p>
            </div>
            <div className="relative z-10 flex flex-col gap-3 sm:flex-row lg:justify-end">
              <div className="min-h-12 flex-1 border border-[#241913]/15 bg-[#f5efe6] px-4" />
              <div className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#006039] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white">
                Subscribe <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* subtle sheen over the reflection to sell the "glass floor" look */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f5efe6]/0 via-[#f5efe6]/40 to-[#f5efe6]" />
        </div>
      </div>
    </div>
  );
}
