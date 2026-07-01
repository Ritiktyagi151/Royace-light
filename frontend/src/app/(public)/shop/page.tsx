import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { renderShopPage } from './ShopRoutePage';
import { buildShopPath, type ShopUrlParams } from '@/lib/shopUrls';

export const metadata: Metadata = {
  title: 'Collections — Royace Lighting',
  description: 'Browse our full collection of handcrafted luxury chandeliers, pendants, sconces, and table lamps.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopUrlParams>;
}) {
  const params = await searchParams;
  if (Object.values(params).some(Boolean)) {
    redirect(buildShopPath(params));
  }
  return renderShopPage(params);
}
