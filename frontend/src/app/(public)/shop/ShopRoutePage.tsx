import { ShopClient } from '@/components/shop/ShopClient';
import { fetchPublicCategories, PUBLIC_API_URL } from '@/lib/publicCategories';
import type { ShopUrlParams } from '@/lib/shopUrls';

async function getProducts(params: ShopUrlParams) {
  try {
    const query = new URLSearchParams();
    const category = params.category || params.collection;
    if (category) query.set('category', category);
    if (params.project) query.set('project', params.project);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy.replace('_asc', '').replace('_desc', ''));
    if (params.sortBy?.includes('_asc')) query.set('order', 'asc');
    if (params.sortBy?.includes('_desc')) query.set('order', 'desc');
    if (params.minPrice) query.set('minPrice', params.minPrice);
    if (params.maxPrice) query.set('maxPrice', params.maxPrice);
    query.set('page', '1');
    query.set('limit', '10000');

    const res = await fetch(
      `${PUBLIC_API_URL}/products?${query.toString()}`,
      { cache: 'no-store' },
    );
    const data = await res.json();
    return {
      products: data.data?.products || data.products || [],
      total: data.data?.total || data.total || 0,
    };
  } catch {
    return { products: [], total: 0 };
  }
}

export async function renderShopPage(params: ShopUrlParams = {}) {
  const [initialData, categories] = await Promise.all([
    getProducts(params),
    fetchPublicCategories({ next: { revalidate: 60 } }),
  ]);

  return <ShopClient initialData={initialData} searchParams={params} categories={categories} />;
}
