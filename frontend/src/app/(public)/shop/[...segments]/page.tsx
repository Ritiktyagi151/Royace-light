import type { Metadata } from 'next';
import { parseShopSegments } from '@/lib/shopUrls';
import { renderShopPage } from '../ShopRoutePage';

export const metadata: Metadata = {
  title: 'Collections — Royace Lighting',
  description: 'Browse handcrafted luxury chandeliers, pendants, sconces, and table lamps.',
};

export default async function ShopSegmentsPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  return renderShopPage(parseShopSegments(segments));
}
