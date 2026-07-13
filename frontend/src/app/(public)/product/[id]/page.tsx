import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PUBLIC_API_URL } from '@/lib/publicCategories';
import { buildShopPath } from '@/lib/shopUrls';

async function getProduct(id: string) {
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/products/${id}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

async function getRelated(category: string | undefined, excludeId: string) {
  if (!category) return [];
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/products?category=${encodeURIComponent(category)}&limit=4`,
      { cache: 'no-store' },
    );
    const data = await res.json();
    return (data.data?.products || data.products || []).filter((p: any) => p._id !== excludeId);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product — Royace Lighting' };
  return {
    title: `${product.name} — Royace Lighting`,
    description: product.description?.substring(0, 160) || `${product.name} — Handcrafted luxury lighting by Royace.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const categoryRef = typeof product.category === 'object'
    ? product.category?.slug || product.category?._id
    : product.category;
  const related = await getRelated(categoryRef, product._id || id);

  return (
    <div>
      <ProductDetailClient product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <section
          className="relative overflow-hidden border-t border-[#173126]/10 bg-[#f7f1e8] px-4 py-16 text-[#173126] sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-70 mix-blend-multiply" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">You May Also Like</p>
                <h2 className="text-3xl font-medium leading-tight text-[#173126] sm:text-4xl">
                  Related Pieces
                </h2>
              </div>
              <Link
                href={buildShopPath({ category: categoryRef })}
                className="inline-flex items-center gap-2 border border-[#006039]/25 px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.slice(0, 4).map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
