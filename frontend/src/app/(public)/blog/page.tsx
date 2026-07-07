import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lighting Journal — Royace Lighting',
  description: 'Explore Royace Lighting guides, design notes, and expert ideas for luxury chandeliers and bespoke lighting.',
};

const featuredPost = {
  slug: 'choose-right-chandelier-size-luxury-living-room',
  title: 'How to Choose the Right Chandelier Size for a Luxury Living Room',
  excerpt:
    'A practical guide to scale, ceiling height, finish, and light layering for statement spaces.',
  category: 'Design Guide',
  date: 'June 18, 2026',
  readTime: '6 min read',
  image:
    'https://images.unsplash.com/photo-1572955034096-233ea61a78d8?auto=format&fit=crop&w=1600&q=85',
};

const posts = [
  {
    slug: 'warm-white-vs-neutral-white-home-lighting',
    title: 'Warm White vs Neutral White: What Works Best at Home',
    excerpt:
      'Understand color temperature and how it changes the mood of dining rooms, bedrooms, and foyers.',
    category: 'Lighting Basics',
    date: 'June 10, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'bespoke-lighting-villas-installation-planning',
    title: 'Bespoke Lighting for Villas: What to Plan Before Installation',
    excerpt:
      'From slab points to ceiling reinforcement, these details keep custom lighting projects smooth.',
    category: 'Bespoke',
    date: 'May 28, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'maintaining-crystal-chandeliers-shine',
    title: 'Maintaining Crystal Chandeliers Without Losing Their Shine',
    excerpt:
      'Simple care routines for preserving brilliance, finish quality, and fixture longevity.',
    category: 'Care',
    date: 'May 16, 2026',
    readTime: '3 min read',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'layered-lighting-ideas-dining-rooms',
    title: 'Layered Lighting Ideas for Dining Rooms',
    excerpt:
      'Combine chandeliers, wall lights, and accent lamps to create depth without visual clutter.',
    category: 'Inspiration',
    date: 'April 30, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'foyer-chandelier-ideas-grand-entrance',
    title: 'Foyer Chandelier Ideas for a Grand Entrance',
    excerpt:
      'Create a strong first impression with the right chandelier scale, drop, and finish for entrance areas.',
    category: 'Inspiration',
    date: 'April 18, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'hotel-lobby-lighting-lessons-for-homes',
    title: 'Hotel Lobby Lighting Lessons You Can Use at Home',
    excerpt:
      'Borrow hospitality lighting principles to make home interiors feel warmer, layered, and more luxurious.',
    category: 'Luxury Design',
    date: 'April 7, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=1200&q=85',
  },
  {
    slug: 'choosing-wall-lights-for-bedroom-ambience',
    title: 'Choosing Wall Lights for Bedroom Ambience',
    excerpt:
      'Use wall lights to frame bedsides, soften corners, and add hotel-style comfort without clutter.',
    category: 'Bedroom Lighting',
    date: 'March 24, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85',
  },
];

export default function BlogPage() {
  return (
    <main className="bg-[#f5efe6] text-[#173126]">
      <section className="relative min-h-[450px] overflow-hidden pt-[132px]">
        <Image
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1800&q=85"
          alt="Luxury interior lighting journal"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,38,29,0.86),rgba(18,38,29,0.48),rgba(18,38,29,0.18))]" />
        <div className="relative mx-auto flex min-h-[318px] max-w-7xl flex-col justify-end px-5 pb-14 text-[#faf7f0] sm:px-6 lg:px-10">
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#e4c77c]">
            Royace Journal
          </p>
          <h1 className="max-w-3xl font-serif text-[clamp(2.4rem,6vw,5rem)] font-light italic leading-[0.96]">
            Ideas for beautifully lit spaces.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72">
            Expert lighting guides, styling inspiration, and care notes for chandeliers, wall lights, pendants, and bespoke projects.
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 border-b border-[#173126]/15 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#006039]">
                Featured Article
              </p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.4rem)] font-light italic text-[#173126]">
                Latest lighting insight
              </h2>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex w-fit items-center gap-2 border border-[#006039]/25 px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white"
            >
              Ask an expert <ArrowRight size={14} />
            </Link>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid overflow-hidden border border-[#173126]/12 bg-white shadow-[0_24px_70px_rgba(23,49,38,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(23,49,38,0.12)] lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="relative min-h-[320px] lg:min-h-[520px]">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
              <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#006039]">
                {featuredPost.category}
              </p>
              <h3 className="font-serif text-[clamp(1.9rem,4vw,3.25rem)] font-light italic leading-tight text-[#173126]">
                {featuredPost.title}
              </h3>
              <p className="mt-5 text-sm leading-7 text-[#173126]/68">
                {featuredPost.excerpt}
              </p>
              <div className="mt-7 flex flex-wrap gap-4 text-[0.68rem] uppercase tracking-[0.14em] text-[#173126]/52">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={14} /> {featuredPost.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={14} /> {featuredPost.readTime}
                </span>
              </div>
              <span className="mt-8 inline-flex w-fit items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#006039]">
                Read article <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-t border-[#173126]/10 bg-[#fffaf2] px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#006039]">
              More From The Journal
            </p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.25rem)] font-light italic text-[#173126]">
              Guides, care notes, and inspiration
            </h2>
          </div>

          <div className="grid gap-px bg-[#173126]/12 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white">
                <article>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f5efe6]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#006039]">
                    {post.category}
                  </p>
                  <h3 className="font-serif text-xl font-light italic leading-snug text-[#173126]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-[0.78rem] leading-6 text-[#173126]/62">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-[0.58rem] uppercase tracking-[0.14em] text-[#173126]/45">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
