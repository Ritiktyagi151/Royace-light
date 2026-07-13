import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Royace Lighting - Luxury Chandeliers & Handcrafted Lighting',
  description:
    'Bespoke chandeliers and luxury lighting for extraordinary interiors.',
  icons: {
    icon: [
      { url: '/royace-logo.png', type: 'image/png' },
    ],
    shortcut: '/royace-logo.png',
    apple: '/royace-logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Roboto:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/royace-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/royace-logo.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
