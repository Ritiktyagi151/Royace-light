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
import { api } from '@/lib/api';
import { getAssetUrl } from '@/lib/urls';

type SearchProduct = {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  productId?: string;
  code?: string;
  sellingPrice?: number;
  image?: string;
  images?: string[];
  primaryImage?: string;
  imageAssets?: { url?: string; webpUrl?: string; isPrimary?: boolean; order?: number }[];
};

type SearchOrder = {
  _id: string;
  status?: string;
  amount?: number;
  totalAmount?: number;
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt?: string;
  orderDate?: string;
  delivery?: { waybill?: string; trackingUrl?: string; courierName?: string };
  items?: { name?: string; productId?: string; sku?: string; quantity?: number }[];
};

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
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([]);
  const [searchOrders, setSearchOrders] = useState<SearchOrder[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
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

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQ('');
    setSearchProducts([]);
    setSearchOrders([]);
  };

  const submitSearch = () => {
    const query = searchQ.trim();
    if (!query) return;
    router.push(buildShopPath({ search: query }));
    closeSearch();
  };

  const productImage = (product: SearchProduct) => {
    const assets = product.imageAssets?.length
      ? [...product.imageAssets].sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [];
    const primaryAsset = assets.find((asset) => asset.isPrimary);
    const assetImage = primaryAsset?.webpUrl || primaryAsset?.url || assets[0]?.webpUrl || assets[0]?.url;
    return getAssetUrl(assetImage || product.primaryImage || product.images?.[0] || product.image);
  };

  const matchesOrder = (order: SearchOrder, query: string) => {
    const needle = query.toLowerCase();
    const values = [
      order._id,
      String(order._id || '').slice(-8),
      order.status,
      order.paymentId,
      order.razorpayOrderId,
      order.delivery?.waybill,
      order.delivery?.courierName,
      ...(order.items || []).flatMap((item) => [item.name, item.productId, item.sku]),
    ];

    return values.some((value) => String(value || '').toLowerCase().includes(needle));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const query = searchQ.trim();

    if (!searchOpen || query.length < 2) {
      setSearchProducts([]);
      setSearchOrders([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);

      try {
        const [productResponse, orderResponse] = await Promise.allSettled([
          api.get('/products', { params: { search: query, limit: 6 } }),
          token ? api.get('/orders/my-orders') : Promise.resolve({ data: { data: [] } }),
        ]);

        if (cancelled) return;

        if (productResponse.status === 'fulfilled') {
          const productPayload = productResponse.value.data?.data || productResponse.value.data;
          setSearchProducts(productPayload?.products || productPayload || []);
        } else {
          setSearchProducts([]);
        }

        if (orderResponse.status === 'fulfilled') {
          const orderPayload = orderResponse.value.data?.data || orderResponse.value.data;
          const rawOrders = orderPayload?.orders || orderPayload || [];
          setSearchOrders(Array.isArray(rawOrders) ? rawOrders.filter((order) => matchesOrder(order, query)).slice(0, 4) : []);
        } else {
          setSearchOrders([]);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchOpen, searchQ, token]);

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
                src="/royace-logo.png"
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
          <div className="max-h-[calc(100vh-104px)] overflow-y-auto border-t border-[#0060393d] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] px-6 pb-8 pt-6">
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
          onClick={closeSearch}
        >
          <div
            className="absolute left-1/2 top-[88px] w-full max-w-[760px] -translate-x-1/2 px-4 sm:top-[100px] sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border border-[#0060394d] bg-[linear-gradient(180deg,rgba(18,38,29,0.98),rgba(31,58,47,0.96))] p-4 shadow-[0_40px_80px_rgba(8,32,23,0.46)] backdrop-blur-3xl sm:p-6">
              <div className="flex items-center gap-4">
                <Search size={16} className="shrink-0 text-[var(--gold-light)]" />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQ.trim()) {
                      submitSearch();
                    }
                    if (e.key === 'Escape') closeSearch();
                  }}
                  placeholder="Search product name, SKU, code, order id..."
                  className="flex-1 border-0 bg-transparent text-base font-light tracking-[0.04em] text-[var(--ivory)] outline-none placeholder:text-[#faf7f04d]"
                />
                <button
                  type="button"
                  onClick={submitSearch}
                  disabled={!searchQ.trim()}
                  className="hidden border border-[#e4c77c45] px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold-light)] transition hover:border-[var(--gold)] hover:bg-[var(--green-muted)] disabled:pointer-events-none disabled:opacity-40 sm:inline-flex"
                >
                  Search
                </button>
                <button
                  onClick={closeSearch}
                  className="cursor-pointer border-0 bg-transparent text-[#faf7f04d] transition hover:text-[var(--gold)]"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 max-h-[58vh] overflow-y-auto pr-1">
                {searchQ.trim().length >= 2 && (
                  <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#faf7f073]">
                          Products
                        </p>
                        {searchLoading && (
                          <span className="text-[0.55rem] uppercase tracking-[0.18em] text-[#faf7f040]">
                            Searching...
                          </span>
                        )}
                      </div>
                      <div className="grid gap-2">
                        {searchProducts.length > 0 ? (
                          searchProducts.map((product) => {
                            const image = productImage(product);
                            const productCode = product.sku || product.productId || product.code || product.slug;
                            return (
                              <Link
                                key={product._id}
                                href={`/product/${product.slug || product._id}`}
                                onClick={closeSearch}
                                className="grid grid-cols-[64px_1fr] gap-3 border border-[#faf7f012] bg-white/[0.03] p-2 no-underline transition hover:border-[#e4c77c55] hover:bg-white/[0.06]"
                              >
                                <div className="relative h-16 overflow-hidden bg-[#faf7f0]">
                                  {image ? (
                                    <Image
                                      src={image}
                                      alt={product.name}
                                      fill
                                      sizes="64px"
                                      className="object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0 py-1">
                                  <p className="truncate text-sm font-semibold text-[var(--ivory)]">
                                    {product.name}
                                  </p>
                                  {productCode && (
                                    <p className="mt-1 truncate text-[0.58rem] uppercase tracking-[0.16em] text-[var(--gold-light)]">
                                      Code: {productCode}
                                    </p>
                                  )}
                                  {typeof product.sellingPrice === 'number' && (
                                    <p className="mt-1 text-xs text-[#faf7f080]">
                                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          !searchLoading && (
                            <p className="border border-[#faf7f00f] bg-white/[0.02] px-4 py-5 text-sm text-[#faf7f066]">
                              No products found. Press Enter to search full collection.
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#faf7f073]">
                          My Orders
                        </p>
                        {!token && (
                          <button
                            type="button"
                            onClick={() => {
                              closeSearch();
                              dispatch(openAuthModal('login'));
                            }}
                            className="border-0 bg-transparent text-[0.55rem] uppercase tracking-[0.18em] text-[var(--gold-light)]"
                          >
                            Sign in
                          </button>
                        )}
                      </div>

                      <div className="grid gap-2">
                        {token && searchOrders.length > 0 ? (
                          searchOrders.map((order) => {
                            const orderTotal = order.amount || order.totalAmount || 0;
                            const orderDate = order.createdAt || order.orderDate;
                            return (
                              <Link
                                key={order._id}
                                href="/my-orders"
                                onClick={closeSearch}
                                className="block border border-[#faf7f012] bg-white/[0.03] p-3 no-underline transition hover:border-[#e4c77c55] hover:bg-white/[0.06]"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--ivory)]">
                                    Order #{String(order._id).slice(-8).toUpperCase()}
                                  </p>
                                  <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[var(--gold-light)]">
                                    {order.status || 'Placed'}
                                  </span>
                                </div>
                                <p className="mt-2 line-clamp-1 text-xs text-[#faf7f070]">
                                  {(order.items || []).map((item) => item.name).filter(Boolean).join(', ') || order.paymentId || order.delivery?.waybill}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-3 text-[0.56rem] uppercase tracking-[0.13em] text-[#faf7f045]">
                                  {orderTotal ? <span>₹{orderTotal.toLocaleString('en-IN')}</span> : null}
                                  {orderDate ? <span>{new Date(orderDate).toLocaleDateString('en-IN')}</span> : null}
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <p className="border border-[#faf7f00f] bg-white/[0.02] px-4 py-5 text-sm text-[#faf7f066]">
                            {token ? 'No matching orders found.' : 'Sign in to search your orders by order id, product name, payment id, or tracking code.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#faf7f00f] pt-4">
                <span className="mr-1 text-[0.55rem] uppercase tracking-[0.2em] text-[#faf7f040]">
                  Browse:
                </span>
                {browseItems.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={closeSearch}
                    className="border border-[#faf7f014] px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] text-[#faf7f066] no-underline transition hover:border-[#0060394d] hover:text-[var(--gold)]"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
