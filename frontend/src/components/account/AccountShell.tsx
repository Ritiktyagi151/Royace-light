'use client';

import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const SIDEBAR_ITEMS = [
  { label: 'My Account', href: '/profile' },
  { label: 'My Orders', href: '/my-orders' },
  { label: 'My Wish List', href: '/wishlist' },
  { label: 'Address Book', href: '/address-book' },
  { label: 'Account Information', href: '/account-information' },
  { label: 'My Product Reviews', href: '/product-reviews' },
  { label: 'Newsletter Subscriptions', href: '/newsletter-subscriptions' },
  { label: 'My Social Accounts', href: '/social-accounts' },
];

export function AccountShell({
  title,
  eyebrow = 'Customer Dashboard',
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const savedToken = localStorage.getItem('nc_token');
    if (!token && !savedToken) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [token, pathname, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <main
      className="min-h-[calc(100vh_-_100px)] bg-[linear-gradient(180deg,var(--forest-2),var(--charcoal)_52%,var(--coffee))] px-6 py-16 pb-20"
    >
      <div className="mx-auto max-w-7xl">
        <p className="overline-text mb-3.5">{eyebrow}</p>
        <h1 className="mb-8 font-serif text-[clamp(2rem,4vw,3.6rem)] font-light italic text-[var(--ivory)]">
          {title}
        </h1>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
          <aside className="border border-[rgba(0,96,57,0.26)] bg-[linear-gradient(180deg,rgba(6,47,36,0.74),rgba(15,12,8,0.82))] py-1">
            <nav aria-label="Account navigation">
              {SIDEBAR_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block border-b border-b-[rgba(250,247,240,0.08)] py-[0.95rem] pl-[1.1rem] pr-4 text-[0.72rem] uppercase tracking-[0.08em] no-underline transition-colors ${
                      active
                        ? 'border-l-[3px] border-l-[var(--gold-light)] font-bold text-[var(--ivory)]'
                        : 'border-l-[3px] border-l-transparent font-medium text-[rgba(250,247,240,0.56)] hover:text-[rgba(250,247,240,0.85)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full cursor-pointer items-center gap-2 border-0 border-l-[3px] border-t border-l-transparent border-t-[rgba(250,247,240,0.08)] bg-transparent py-[0.95rem] pl-[1.1rem] pr-4 text-left text-[0.72rem] uppercase tracking-[0.08em] text-[rgba(239,160,160,0.8)] transition-colors hover:text-[#fca5a5]"
              >
                <LogOut size={14} strokeWidth={1.6} />
                Logout
              </button>
            </nav>
          </aside>

          <section>{children}</section>
        </div>
      </div>
    </main>
  );
}

export function AccountPlaceholder({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className={accountStyles.card}>
      <h2 className={accountStyles.sectionTitle}>{title}</h2>
      <p className={accountStyles.mutedText}>{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={`btn-outline mt-6 ${accountStyles.smallButton}`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export const accountStyles = {
  card: 'border border-[rgba(0,96,57,0.26)] bg-[linear-gradient(180deg,rgba(6,47,36,0.68),rgba(15,12,8,0.78))] p-[clamp(1.35rem,3vw,2rem)] shadow-[0_26px_70px_rgba(8,6,4,0.28)]',
  twoColumn: 'grid gap-8 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]',
  sectionTitle: 'mb-4 font-sans text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[var(--ivory)]',
  subTitle: 'mb-3 font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[rgba(250,247,240,0.78)]',
  copyBlock: 'mb-5 text-[0.82rem] leading-[1.85] tracking-[0.04em] text-[rgba(250,247,240,0.68)]',
  mutedText: 'text-[0.78rem] leading-[1.8] tracking-[0.04em] text-[rgba(250,247,240,0.48)]',
  buttonRow: 'flex flex-wrap gap-2.5',
  smallButton: 'rounded-md px-[0.9rem] py-[0.65rem] text-[0.58rem]',
  addressHeader: 'mb-6 flex items-center justify-between gap-4 border-b border-[rgba(250,247,240,0.1)] pb-4',
  manageLink: 'text-[0.68rem] tracking-[0.08em] text-[var(--gold-light)] no-underline hover:underline',
};
