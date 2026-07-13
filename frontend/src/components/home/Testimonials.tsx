'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'The finish quality was neat and consistent. The chandelier suited our foyer exactly as the team had suggested.',
    author: 'Ankit Verma',
    role: 'Homeowner, Gurugram',
  },
  {
    quote:
      'Royace understood the design intent and helped us choose fixtures that matched the project palette without delays.',
    author: 'Priya Nair',
    role: 'Interior Designer, Bengaluru',
  },
  {
    quote:
      'The product consistency across batches was strong, which made it easier for us to use Royace across multiple sites.',
    author: 'Rohit Malhotra',
    role: 'Project Head, Malhotra Constructions',
  },
  {
    quote:
      'The team reviewed the site requirement properly before finalising the material and size. The process felt professional.',
    author: 'Sneha Kapoor',
    role: 'Architect, Studio Kapoor',
  },
  {
    quote:
      'The dispatch timeline was clearly communicated and followed. That reliability matters a lot on larger projects.',
    author: 'Vikram Singh',
    role: 'Site Supervisor, VS Infra',
  },
  {
    quote:
      'Our clients noticed the finish quality immediately. Royace has become a dependable recommendation for decorative lighting.',
    author: 'Anjali Deshmukh',
    role: 'Interior Consultant, Pune',
  },
  {
    quote:
      'From packaging to site handling, everything was managed carefully. The products reached in good condition.',
    author: 'Karan Mehta',
    role: 'Contractor, Mehta Builders',
  },
  {
    quote: 'The collection has enough variety for different rooms, so we did not have to compromise on design direction.',
    author: 'Neha Joshi',
    role: 'Homeowner, Ahmedabad',
  },
  {
    quote:
      'The after-sales response was quick and helpful. Product quality and support both were handled well.',
    author: 'Arjun Rao',
    role: 'Facility Manager, Rao Estates',
  },
];

const CARDS_PER_VIEW = {
  mobile: 1,
  desktop: 3,
};

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(CARDS_PER_VIEW.desktop);

  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(window.innerWidth < 768 ? CARDS_PER_VIEW.mobile : CARDS_PER_VIEW.desktop);
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  const next = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((p) => (p <= 0 ? maxIndex : p - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  useEffect(() => {
    setIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const visibleTestimonials = testimonials.slice(index, index + cardsPerView);
  if (visibleTestimonials.length < cardsPerView) {
    visibleTestimonials.push(...testimonials.slice(0, cardsPerView - visibleTestimonials.length));
  }

  return (
    <div className="relative isolate overflow-hidden bg-[#dfe8d8] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-24">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-35 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#dfe8d8]/70" />

      <div className="relative z-10 mx-auto mb-10 flex max-w-7xl flex-col gap-6 border-b border-[#173126]/12 pb-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#006039]">
            <span className="h-px w-9 bg-[#006039]" />
            Customer Feedback
          </span>
          <h2 className="mt-5 text-3xl font-semibold leading-[1.02] text-[#173126]">
            Trusted by homeowners, designers, and project teams.
          </h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-[#173126]/64">
          Real feedback from customers who choose Royace for finish quality, scale guidance, dispatch reliability, and site support.
        </p>
      </div>

      <div
        className="relative z-10 mx-auto max-w-7xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
            >
              {visibleTestimonials.map((item, i) => (
                <figure
                  key={`${item.author}-${i}`}
                  className="group relative flex min-h-[340px] flex-col overflow-hidden border border-[#006039]/14 bg-white/88 p-7 shadow-[0_22px_60px_rgba(23,49,38,0.1)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-[#006039]/35"
                >
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center border border-[#006039]/18 bg-[#006039]/6 text-[#006039]">
                      <Quote size={18} strokeWidth={1.7} />
                    </span>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-[3.1rem] font-semibold leading-none text-[#006039]/85">
                        {String(((index + i) % testimonials.length) + 1).padStart(2, '0')}
                      </span>
                      <div className="flex gap-1 text-[#c7a45a]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} size={13} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <blockquote className="mt-9 text-[1.35rem] font-medium leading-snug text-[#173126]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto border-t border-[#173126]/10 pt-6">
                    <strong className="block text-sm font-bold uppercase tracking-[0.12em] text-[#173126]">
                      {item.author}
                    </strong>
                    <span className="mt-2 block text-[0.66rem] uppercase tracking-[0.18em] text-[#006039]/70">
                      {item.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            aria-label="Previous testimonials"
            className="flex h-11 w-11 items-center justify-center border border-[#006039]/25 text-[#006039] transition hover:bg-[#006039] hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  dotIndex === index ? 'w-6 bg-[#006039]' : 'w-1.5 bg-[#006039]/25'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonials"
            className="flex h-11 w-11 items-center justify-center border border-[#006039]/25 text-[#006039] transition hover:bg-[#006039] hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}