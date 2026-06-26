import { Metadata } from 'next';
import MaintenancePage from '@/components/maintanance/Maintanance';

export const metadata: Metadata = {
  title: 'Royace Lighting - Maintenance',
  description: 'Royace Lighting is currently under maintenance.',
};

export default function PublicHomePage() {
  return <MaintenancePage />;
}
