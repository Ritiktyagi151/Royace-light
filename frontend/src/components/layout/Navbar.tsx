'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Search, ShoppingCart, Truck, User, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { openAuthModal } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import { openCartDrawer } from '../../store/slices/uiSlice';
import { selectWishlistCount } from '@/store/slices/wishlistSlice';
import { useMemo, useState, useEffect, useRef } from 'react';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { categoryHref, FALLBACK_CATEGORIES } from '@/lib/publicCategories';
import { SITE_CONTACT } from '@/lib/contact';
import { buildShopPath } from '@/lib/shopUrls';

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Collections', href: '#', hasMega: true },
  { label: 'Bespoke', href: '/bespoke' },
  { label: 'Blog', href: '/blog' },
  
  { label: 'Contact', href: '/contact-us' },
];

const actionButtonClass =
  'relative hidden h-11 items-center gap-1.5 border-0 bg-transparent px-1 text-[0.78rem] font-medium tracking-normal text-[#faf7f0e0] transition hover:text-[var(--gold)] lg:inline-flex';

const tollFreeLinkClass =
  'hidden h-11 shrink-0 items-center gap-2 border border-[#e4c77c33] bg-white/[0.03] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)] no-underline transition hover:border-[var(--gold)] hover:bg-[var(--green-muted)] xl:inline-flex';

const countBadgeClass =
  'absolute -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e4c77c73] bg-[linear-gradient(135deg,var(--rolex-green),var(--forest))] text-[0.5rem] font-bold text-[var(--ivory)]';

const navLinkClass =
  'relative text-[0.6rem] font-normal uppercase tracking-[0.2em] text-[#faf7f0a6] no-underline transition hover:text-[var(--ivory)] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[linear-gradient(90deg,var(--gold),var(--rolex-green))] after:transition-all after:duration-300 hover:after:w-full xl:tracking-[0.24em]';

const iconButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center border border-[#faf7f01a] bg-[#faf7f00a] text-[#faf7f099] transition-all duration-200 hover:border-[var(--green-border)] hover:bg-[var(--green-muted)] hover:text-[var(--gold-light)]';

const outlineButtonClass =
  'inline-flex items-center gap-2 border border-[#c7a45a66] bg-transparent font-medium uppercase tracking-[0.18em] text-[var(--gold-light)] transition-all duration-300 hover:border-[#e4c77c9e] hover:bg-[var(--green-muted)] hover:text-[var(--gold-light)] hover:shadow-[0_0_30px_rgba(0,96,57,0.22)]';

const primaryButtonClass =
  'inline-flex items-center gap-2 overflow-hidden border border-[var(--gold)] bg-[var(--gold)] font-medium uppercase tracking-[0.18em] text-[var(--obsidian)] transition-all duration-300 hover:bg-[linear-gradient(135deg,var(--gold-light),var(--gold-deep))] hover:shadow-[var(--glow-gold-sm)]';

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { data: fetchedCategories } = usePublicCategories();

  const collectionItems = useMemo(() => {
    const source = fetchedCategories?.length ? fetchedCategories : FALLBACK_CATEGORIES;
    return source.map((category) => ({
      label: category.name,
      href: categoryHref(category),
      desc: category.description || 'Explore curated decorative lighting.',
      image: category.image,
    }));
  }, [fetchedCategories]);

  const browseItems = collectionItems.slice(0, 6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      {/* Announcement bar */}
      <div className="overflow-hidden border-b border-[#e4c77c3d] bg-[linear-gradient(90deg,var(--forest),var(--rolex-green),var(--forest))] py-2 text-[0.58rem] font-medium uppercase leading-none tracking-[0.3em] text-transparent">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] items-center gap-10 whitespace-nowrap text-[var(--ivory)] leading-[1.4] hover:[animation-play-state:paused]">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-10 px-5">
              <span>Complimentary White-Glove Installation</span>
              <span aria-hidden="true" className="text-[var(--gold-light)]">·</span>
              <span>Orders Above ₹1,50,000</span>
              <span aria-hidden="true" className="text-[var(--gold-light)]">·</span>
              <span>Luxury Chandeliers And Bespoke Lighting</span>
              <span aria-hidden="true" className="text-[var(--gold-light)]">·</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={`border-b transition-all duration-500 ${
          scrolled
            ? 'border-[#00603947] bg-[#032016eb] backdrop-blur-[20px] saturate-150'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex h-[72px] items-center gap-4 lg:gap-6">

            <Link
              href="/"
              className="flex shrink-0 items-center leading-none no-underline"
            >
              <Image
                src="/images/royace-logo.png"
                alt="Royace Lighting"
                width={156}
                height={48}
                priority
                className="block h-auto w-[clamp(118px,11vw,154px)]"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">
              {NAV_LINKS.map((link) =>
                link.hasMega ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <button className={`${navLinkClass} flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0`}>
                      {link.label}
                      <ChevronDown
                        size={10}
                        className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>

                    {/* Mega Menu */}
                    <div
                      className={`absolute left-1/2 top-full mt-6 grid max-h-[calc(100vh-150px)] w-[min(840px,calc(100vw-3rem))] -translate-x-1/2 grid-cols-[repeat(auto-fit,minmax(138px,1fr))] gap-4 overflow-y-auto border border-[#00603947] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] p-8 shadow-[0_40px_80px_rgba(8,32,23,0.42)] backdrop-blur-3xl transition-all duration-200 ${
                        megaOpen
                          ? 'visible translate-y-0 opacity-100'
                          : 'invisible -translate-y-2 opacity-0'
                      }`}
                    >
                      {collectionItems.map((col) => (
                        <Link
                          key={col.href}
                          href={col.href}
                          className="group no-underline"
                          onClick={() => setMegaOpen(false)}
                        >
                          <div className="relative mb-2.5 aspect-[4/3] overflow-hidden bg-[var(--ivory)]">
                            <img
                              src={col.image}
                              alt={col.label}
                              className="h-full w-full object-cover brightness-75 transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <p className="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[var(--ivory)]">
                            {col.label}
                          </p>
                          <p className="text-[0.58rem] tracking-[0.1em] text-[#faf7f059]">
                            {col.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClass}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 xl:gap-2">

              {/* Search */}
              <button
                className={iconButtonClass}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>

              <Link href={SITE_CONTACT.phoneHref} className={tollFreeLinkClass}>
                <Phone size={15} strokeWidth={1.8} />
                <span>Toll Free</span>
                <span className="tracking-[0.08em]">{SITE_CONTACT.phone.replace('+91 ', '')}</span>
              </Link>

              {/* Wishlist */}
              <button
                onClick={() => {
                  router.push(token ? '/wishlist' : '/login');
                }}
                aria-label="Wishlist"
                className={actionButtonClass}
              >
                <Heart size={20} strokeWidth={1.9} />
                <span className="hidden xl:inline">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className={`${countBadgeClass} -right-2`}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className={actionButtonClass}
                onClick={() => dispatch(openCartDrawer())}
                aria-label="Cart"
              >
                <ShoppingCart size={20} strokeWidth={1.9} />
                <span className="hidden xl:inline">Cart</span>
                {cartCount > 0 && (
                  <span className={`${countBadgeClass} -right-[7px]`}>
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="hidden h-11 items-center gap-1.5 border-0 bg-transparent px-1 text-[0.78rem] font-medium tracking-normal text-[#faf7f0e0] transition hover:text-[var(--gold)] 2xl:inline-flex"
                onClick={() => {
                  router.push(token ? '/my-orders' : '/login');
                }}
                aria-label="Track Your Order"
              >
                <Truck size={20} strokeWidth={1.9} />
                <span>Track Your Order</span>
              </button>

              <button
                className={`${iconButtonClass} relative sm:hidden`}
                onClick={() => dispatch(openCartDrawer())}
                aria-label="Cart"
              >
                <ShoppingCart size={16} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className={`${countBadgeClass} right-1.5 top-1.5`}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth */}
              {token ? (
                <div className="group relative hidden md:block">
                  <button className={`${iconButtonClass} w-auto gap-1.5 px-3`}>
                    <User size={14} strokeWidth={1.5} />
                    <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[#faf7f099]">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>
                  <div
                    className="invisible absolute right-0 top-full mt-2 w-48 border border-[#00603940] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] opacity-0 shadow-[0_24px_48px_rgba(8,32,23,0.38)] backdrop-blur-[20px] transition-all duration-200 group-hover:visible group-hover:opacity-100"
                  >
                    {[
                      { label: 'My Orders', href: '/my-orders' },
                      { label: 'Profile', href: '/profile' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block border-b border-[#faf7f00f] px-5 py-3.5 text-[0.62rem] uppercase tracking-[0.2em] text-[#faf7f080] no-underline transition hover:text-[var(--gold)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => dispatch(logout())}
                      className="block w-full cursor-pointer border-0 bg-transparent px-5 py-3.5 text-left text-[0.62rem] uppercase tracking-[0.2em] text-[#dc6464b3] transition hover:text-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className={`${outlineButtonClass} ml-1 hidden px-4 py-2 text-[0.56rem] lg:inline-flex xl:px-5 xl:text-[0.58rem]`}
                >
                  Sign In
                </button>
              )}

              {/* Mobile hamburger */}
              <button
                className={`${iconButtonClass} lg:hidden`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-[fadeUp_0.3s_ease_forwards] border-t border-[#0060393d] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] px-6 pb-8 pt-6">
            {[
              ...collectionItems.map((item) => ({ label: item.label, href: item.href })),
              { label: 'Bespoke', href: '/bespoke' },
              { label: 'Blog', href: '/blog' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact-us' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block border-b border-[#faf7f00d] py-3.5 text-[0.65rem] uppercase tracking-[0.25em] text-[#faf7f08c] no-underline transition hover:text-[var(--gold)]"
              >
                {link.label}
              </Link>
            ))}
            {!token && (
              <button
                onClick={() => { dispatch(openAuthModal('login')); setMobileOpen(false); }}
                className={`${primaryButtonClass} mt-6 flex w-full justify-center px-6 py-3 text-[0.6rem]`}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] animate-[fadeIn_0.25s_ease_forwards] bg-[#032016bd] backdrop-blur"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="animate-[scaleIn_0.25s_ease_forwards] absolute left-1/2 top-[100px] w-full max-w-[640px] -translate-x-1/2 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border border-[#0060394d] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] p-6 shadow-[0_40px_80px_rgba(8,32,23,0.46)] backdrop-blur-3xl">
              <div className="flex items-center gap-4">
                <Search size={16} className="shrink-0 text-[var(--gold-light)]" />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQ.trim()) {
                      window.location.href = buildShopPath({ search: searchQ.trim() });
                      setSearchOpen(false);
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  placeholder="Search lighting collections..."
                  className="flex-1 border-0 bg-transparent text-base font-light tracking-[0.04em] text-[var(--ivory)] outline-none placeholder:text-[#faf7f04d]"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="cursor-pointer border-0 bg-transparent text-[#faf7f04d] transition hover:text-[var(--gold)]"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#faf7f00f] pt-4">
                <span className="mr-1 text-[0.55rem] uppercase tracking-[0.2em] text-[#faf7f040]">
                  Browse:
                </span>
                {browseItems.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setSearchOpen(false)}
                    className="border border-[#faf7f014] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-[#faf7f066] no-underline transition hover:border-[#0060394d] hover:text-[var(--gold)]"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
