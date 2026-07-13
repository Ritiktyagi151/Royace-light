import type { Metadata } from 'next';
import { BespokeClient } from '@/components/bespoke/BespokeClient';

export const metadata: Metadata = {
  title: 'Bespoke Lighting | Royace Lighting',
  description:
    'Share a detailed custom lighting brief for chandeliers, pendant lights, wall lights, and decorative fixtures with Royace Lighting.',
};

export default function BespokePage() {
  return <BespokeClient />;
}
