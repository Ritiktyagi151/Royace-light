import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock } from 'lucide-react';
import { blogPosts, getBlogPost, getRelatedBlogPosts } from '@/lib/blog';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Article - Royace Lighting',
    };
  }

  return {
    title: `${post.title} - Royace Lighting`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  const relatedPosts = getRelatedBlogPosts(post.slug);

  return (
    <main className="bg-[#fffaf2] text-[#173126]">
      <section className="relative min-h-[450px] overflow-hidden pt-[132px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,38,29,0.86),rgba(18,38,29,0.56),rgba(18,38,29,0.22))]" />
        <div className="relative mx-auto flex min-h-[318px] max-w-7xl flex-col justify-end px-5 pb-12 text-[#faf7f0] sm:px-6 lg:px-10">
          <Link
            href="/blog"
            className="mb-6 inline-flex w-fit items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#e4c77c] transition hover:text-white"
          >
            <ArrowLeft size={14} /> Back to journal
          </Link>
          <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#e4c77c]">
            {post.category}
          </p>
          <h1 className="max-w-4xl text-[clamp(2.1rem,5.6vw,4.8rem)] font-semibold leading-[1.02]">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-4 text-[0.68rem] uppercase tracking-[0.14em] text-white/72">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} /> {post.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock size={14} /> {post.readTime}
            </span>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-6 lg:px-10 lg:py-18">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="bg-white p-6 shadow-[0_20px_70px_rgba(23,49,38,0.08)] sm:p-9 lg:p-12">
            <p className="text-lg leading-8 text-[#173126]/72 sm:text-xl">
              {post.excerpt}
            </p>

            <div className="my-9 border-y border-[#173126]/10 bg-[#edf4e8] p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#006039]">
                Key Takeaways
              </p>
              <div className="mt-5 grid gap-4">
                {post.takeaways.map((item) => (
                  <div key={item} className="flex gap-3 text-sm leading-6 text-[#173126]/76">
                    <span className="mt-1 inline-flex size-6 shrink-0 items-center justify-center border border-[#006039]/25 text-[#006039]">
                      <Check size={14} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              {post.content.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-semibold text-[#173126] sm:text-3xl">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-7 text-[#173126]/70 sm:text-base sm:leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#173126]/12 bg-[#edf4e8] p-6">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">
                Need Expert Help?
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[#173126]">
                Plan your lighting with Royace.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#173126]/68">
                Share your room size, ceiling height, and preferred finish. Our team will help you select or customize the right piece.
              </p>
              <Link
                href="/contact-us"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#006039] px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#0b7a4d]"
              >
                Contact us <ArrowRight size={14} />
              </Link>
            </div>

            <div className="border border-[#173126]/12 bg-white p-6">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">
                Explore
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/shop" className="text-sm font-semibold text-[#173126] transition hover:text-[#006039]">
                  Shop Chandeliers
                </Link>
                <Link href="/bespoke" className="text-sm font-semibold text-[#173126] transition hover:text-[#006039]">
                  Bespoke Lighting
                </Link>
                <Link href="/contact-us" className="text-sm font-semibold text-[#173126] transition hover:text-[#006039]">
                  Book Consultation
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#173126]/10 bg-[#f5efe6] px-5 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#006039]">
                Related Articles
              </p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-semibold text-[#173126]">
                Continue reading
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex w-fit items-center gap-2 border border-[#006039]/25 px-5 py-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white"
            >
              All articles <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-px bg-[#173126]/12 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group bg-white">
                <article>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#fffaf2]">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <p className="mb-3 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#006039]">
                      {relatedPost.category}
                    </p>
                    <h3 className="text-xl font-semibold leading-snug text-[#173126]">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-3 text-[0.78rem] leading-6 text-[#173126]/62">
                      {relatedPost.excerpt}
                    </p>
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
