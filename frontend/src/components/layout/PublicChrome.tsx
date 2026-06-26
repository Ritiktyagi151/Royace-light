'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Toaster } from '@/components/ui/Toaster';
import { PageTransition } from '@/components/layout/PageTransition';

export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMaintenanceHome = pathname === '/';

  return (
    <div className="public-site">
      {!isMaintenanceHome && <Navbar />}
      <PageTransition noTopPadding={isMaintenanceHome}>{children}</PageTransition>
      {!isMaintenanceHome && <Footer />}
      <CartDrawer />
      <AuthModal />
      <Toaster />
    </div>
  );
}
