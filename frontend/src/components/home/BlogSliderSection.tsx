'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { blogPosts } from '@/lib/blog';

export function BlogSliderSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const posts = blogPosts.slice(0, 8);

  const scrollToCard = (index: number) => {
    const nextIndex = (index + posts.length) % posts.length;
    const track = trackRef.current;
    const card = track?.children[nextIndex] as HTMLElement | undefined;

    if (track && card) {
      track.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth',
      });
    }

    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      scrollToCard(activeIndex + 1);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [activeIndex]);

  return (
    <section className="overflow-hidden bg-[#edf4e8] px-4 py-16 text-[#173126] sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 border-b border-[#173126]/12 pb-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#006039]">
              <span className="h-px w-9 bg-[#006039]" />
              Lighting Journal
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Practical ideas for selecting, installing, and maintaining decorative lighting.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="hidden border border-[#006039]/25 px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white sm:inline-flex"
            >
              View all
            </Link>
            <button
              type="button"
              aria-label="Previous blog"
              onClick={() => scrollToCard(activeIndex - 1)}
              className="inline-flex size-11 items-center justify-center border border-[#173126]/15 bg-white text-[#173126] transition hover:border-[#006039] hover:text-[#006039]"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next blog"
              onClick={() => scrollToCard(activeIndex + 1)}
              className="inline-flex size-11 items-center justify-center border border-[#173126]/15 bg-white text-[#173126] transition hover:border-[#006039] hover:text-[#006039]"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group min-w-[86%] snap-start overflow-hidden border border-[#173126]/10 bg-white shadow-[0_18px_50px_rgba(23,49,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(23,49,38,0.12)] sm:min-w-[48%] lg:min-w-[31.7%] xl:min-w-[24%]"
            >
              <article className="h-full">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f5efe6]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 86vw, (max-width: 1024px) 48vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex min-h-[260px] flex-col p-5">
                  <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#006039]">
                    {post.category}
                  </p>
                  <h3 className="text-xl font-semibold leading-snug text-[#173126]">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[0.8rem] leading-6 text-[#173126]/64">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-3 pt-6 text-[0.58rem] uppercase tracking-[0.12em] text-[#173126]/48">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} /> {post.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} /> {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {posts.map((post, index) => (
              <button
                key={post.slug}
                type="button"
                aria-label={`Go to blog ${index + 1}`}
                onClick={() => scrollToCard(index)}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-9 bg-[#006039]' : 'w-4 bg-[#173126]/18'
                }`}
              />
            ))}
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#006039] sm:hidden"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
