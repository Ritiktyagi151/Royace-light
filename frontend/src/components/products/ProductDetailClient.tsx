'use client';

import { useMemo, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ChevronRight,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
  X,
  Maximize2,
  Headphones,
  MessageCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCartThunk } from '../../store/slices/cartSlice';
import { openAuthModal, openCartDrawer, addToast } from '../../store/slices/uiSlice';
import { getAssetUrl } from '@/lib/urls';
import { selectIsWishlisted, toggleWishlistItem } from '@/store/slices/wishlistSlice';
import { buildShopPath } from '@/lib/shopUrls';
import { SITE_CONTACT } from '@/lib/contact';

interface ProductDetailClientProps {
  product: any;
}

const DELIVERY_HIGHLIGHTS = [
  { icon: Truck, title: 'Safe Delivery', desc: 'Careful packing and dispatch support' },
  { icon: Shield, title: 'Quality Checked', desc: 'Finish and fitting reviewed before dispatch' },
  { icon: RotateCcw, title: 'Return Support', desc: 'Returns as per product and policy terms' },
];

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const wishlisted = useAppSelector(selectIsWishlisted(product._id));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>(['details']);

  const productImages = useMemo(() => {
    const orderedAssets = product.imageAssets?.length
      ? [...product.imageAssets].sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))
      : [];
    const primaryAsset = orderedAssets.find((asset: any) => asset.isPrimary);

    return orderedAssets.length
      ? [
          ...(primaryAsset ? [primaryAsset] : []),
          ...orderedAssets.filter((asset: any) => asset !== primaryAsset),
        ]
          .map((asset: any) => asset.webpUrl || asset.url)
          .filter(Boolean)
      : [...new Set([product.primaryImage, ...(product.images || []), product.image].filter(Boolean))];
  }, [product.imageAssets, product.image, product.images, product.primaryImage]);
  const getImageUrl = (img?: string) => getAssetUrl(img);

  const [selectedImage, setSelectedImage] = useState(product.primaryImage || productImages[0] || '');
  const imageUrl = getImageUrl(selectedImage);
  const swipeState = useRef({
    startX: 0,
    startY: 0,
    pointerId: null as number | null,
    swiped: false,
  });
  const categoryLabel = typeof product.category === 'object'
    ? product.category?.name || product.category?.slug || ''
    : product.category;
  const categoryHref = typeof product.category === 'object'
    ? product.category?.slug || product.category?._id || ''
    : product.category;
  const whatsappHref = `https://wa.me/${SITE_CONTACT.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi Royace Lighting, I want to enquire about ${product.name}.`,
  )}`;

  const discount =
    product.retailPrice > product.sellingPrice
      ? Math.round(((product.retailPrice - product.sellingPrice) / product.retailPrice) * 100)
      : 0;

  const handleAddToCart = async () => {
    if (!token) { dispatch(openAuthModal('login')); return; }
    setAdding(true);
    try {
      await dispatch(
        addToCartThunk({ token, productId: product._id, quantity, color: selectedColor }),
      ).unwrap();
      setAdded(true);
      dispatch(addToast({ message: 'Added to cart', type: 'success' }));
      dispatch(openCartDrawer());
      setTimeout(() => setAdded(false), 2500);
    } catch (message) {
      dispatch(addToast({ message: String(message), type: 'error' }));
    } finally {
      setAdding(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch(addToast({ message: 'Link copied to clipboard', type: 'info' }));
  };

  const handleWishlistToggle = () => {
    const wishlistItem = {
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: productImages[0],
      price: product.sellingPrice,
    };
    if (!token) {
      localStorage.setItem('royace_pending_wishlist', JSON.stringify(wishlistItem));
      router.push('/login');
      return;
    }
    dispatch(toggleWishlistItem(wishlistItem));
    dispatch(addToast({
      message: wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      type: 'success',
    }));
  };

  const selectedImageIndex = productImages.findIndex((img: string) => img === selectedImage);
  const activeImageIndex = selectedImageIndex >= 0 ? selectedImageIndex : 0;

  const selectImageByOffset = (offset: number) => {
    if (productImages.length < 2) return;
    const nextIndex = (activeImageIndex + offset + productImages.length) % productImages.length;
    setSelectedImage(productImages[nextIndex]);
  };
  const handleImagePointerDown = (e: PointerEvent<HTMLElement>) => {
    if (productImages.length < 2) return;
    swipeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
      swiped: false,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const handleImagePointerUp = (e: PointerEvent<HTMLElement>) => {
    if (swipeState.current.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - swipeState.current.startX;
    const deltaY = e.clientY - swipeState.current.startY;
    const isHorizontalSwipe = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (isHorizontalSwipe) {
      swipeState.current.swiped = true;
      selectImageByOffset(deltaX < 0 ? 1 : -1);
    }

    e.currentTarget.releasePointerCapture?.(e.pointerId);
    swipeState.current.pointerId = null;
  };
  const handleImagePointerCancel = (e: PointerEvent<HTMLElement>) => {
    if (swipeState.current.pointerId === e.pointerId) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
      swipeState.current.pointerId = null;
    }
  };
  const handleMainImageClick = () => {
    if (swipeState.current.swiped) {
      swipeState.current.swiped = false;
      return;
    }
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    swipeState.current.swiped = false;
    setLightboxOpen(false);
  };
  const handleLightboxImageClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    swipeState.current.swiped = false;
  };

  const dimensionParts = [
    product.dimension?.height,
    product.dimension?.width,
    product.dimension?.depth,
  ].filter(Boolean);
  const dimensionValue = dimensionParts.length
    ? dimensionParts.join(' x ')
    : product.dimension?.raw || product.size || '';
  const materials = product.material?.length ? product.material : product.materialUsed || [];
  const hidden = Array.isArray(product.hiddenFields) ? product.hiddenFields : [];
  const hasNonZeroNumber = (value: unknown) =>
    value !== undefined && value !== null && value !== '' && Number(value) !== 0;

  const specDetails = [
    product.sku && !hidden.includes('sku') && { label: 'SKU', value: product.sku },
    product.series && !hidden.includes('series') && { label: 'Series', value: product.series },
    { label: 'Category', value: categoryLabel },
    !hidden.includes('finish') && product.finish && { label: 'Finish', value: product.finish },
    !hidden.includes('lightSource') && product.lightSource && { label: 'Light Source', value: product.lightSource },
    !hidden.includes('watt') && hasNonZeroNumber(product.watt) && {
      label: 'Watt',
      value: `${product.watt} W`,
    },
    !hidden.includes('inputVoltage') && product.inputVoltage && { label: 'Input Voltage', value: product.inputVoltage },
    !hidden.includes('lmPerW') && hasNonZeroNumber(product.lmPerW) && {
      label: 'LM/W',
      value: product.lmPerW,
    },
    !hidden.includes('fluxLumin') && hasNonZeroNumber(product.fluxLumin) && {
      label: 'Flux Lumin',
      value: product.fluxLumin,
    },
    !hidden.includes('ra') && hasNonZeroNumber(product.ra) && {
      label: 'RA',
      value: product.ra,
    },
    !hidden.includes('chipBrand') && product.chipBrand && { label: 'Chip Brand', value: product.chipBrand },
    !hidden.includes('pf') && hasNonZeroNumber(product.pf) && {
      label: 'PF',
      value: product.pf,
    },
    !hidden.includes('cutSize') && product.cutSize && { label: 'Cut Size', value: product.cutSize },
    !hidden.includes('beamAngle') && hasNonZeroNumber(product.beamAngle) && {
      label: 'Beam Angle',
      value: `${product.beamAngle}°`,
    },
    !hidden.includes('ipRate') && product.ipRate && { label: 'IP Rate', value: product.ipRate },
    !hidden.includes('weight') && hasNonZeroNumber(product.weight) && { label: 'Weight', value: `${product.weight} g` },
    !hidden.includes('dimension') && dimensionValue && {
      label: 'Dimensions',
      value: dimensionValue,
    },
    !hidden.includes('material') && materials.length > 0 && {
      label: 'Materials',
      value: materials.join(', '),
    },
    !hidden.includes('remark') && product.remark && { label: 'Remark', value: product.remark },
  ].filter(Boolean);

  const accordions = [
    {
      id: 'details',
      label: 'Product Details & Specifications',
      content: {
        description: product.description,
        specs: specDetails,
      },
    },
    {
      id: 'delivery',
      label: 'Delivery & Installation',
      content: 'Delivery and installation support depends on product type, city serviceability, site readiness, and written confirmation. Our team can guide packing, dispatch, and installation coordination where applicable.',
    },
    {
      id: 'returns',
      label: 'Returns & Warranty',
      content: 'Royace products are checked for finish and workmanship before dispatch. Returns and replacements are handled as per product condition, delivery status, and policy terms. Custom orders are made to requirement and are not returnable unless approved under policy.',
    },
  ];

  return (
    <div className="product-detail-page min-h-screen bg-[#f7f1e8] text-[#173126]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: categoryLabel, href: buildShopPath({ category: categoryHref }) },
            { label: product.name, href: null },
          ].map((crumb, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {crumb.href ? (
                <Link href={crumb.href} className="breadcrumb-item">
                  {crumb.label}
                </Link>
              ) : (
                <span className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#173126]/55">
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <span className="breadcrumb-sep">›</span>}
            </span>
          ))}
        </nav>
      </div>

      {/* Main product section */}
      <div
        className="product-detail-layout mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-10 lg:px-8 lg:py-12"
      >
        {/* Gallery */}
        <div className="space-y-3 lg:sticky lg:top-24">
          {/* Main image */}
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden border border-[#173126]/10 bg-white shadow-[0_24px_70px_rgba(23,49,38,0.1)]"
            style={{
                cursor: productImages.length > 1 ? 'grab' : 'zoom-in',
                touchAction: 'pan-y',
                userSelect: 'none',
              }}
            onClick={handleMainImageClick}
            onPointerDown={handleImagePointerDown}
            onPointerUp={handleImagePointerUp}
            onPointerCancel={handleImagePointerCancel}
          >
            {selectedImage ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                draggable={false}
                className="object-cover transition duration-700"
                onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                💡
              </div>
            )}

            {discount > 0 && (
              <span
                className="badge-gold"
                style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}
              >
                −{discount}%
              </span>
            )}

            <button
              style={{
                position: 'absolute',
                bottom: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid rgba(23,49,38,0.12)',
                backdropFilter: 'blur(8px)',
                color: '#173126',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            >
              <Maximize2 size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(productImages.length, 5)}, minmax(0, 1fr))` }}>
              {productImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      overflow: 'hidden',
                      background: '#fff',
                      border: `2px solid ${selectedImage === img ? '#006039' : 'rgba(23,49,38,0.12)'}`,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease, opacity 0.2s ease',
                      padding: 0,
                    }}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover', opacity: selectedImage === img ? 1 : 0.55, transition: 'opacity 0.2s ease' }}
                  />
                </button>
              ))}
            </div>
          )}

          <div className="relative overflow-hidden border border-[#173126]/10 bg-white p-5 shadow-[0_18px_50px_rgba(23,49,38,0.08)]">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-45 mix-blend-multiply" />
            <div className="absolute inset-0 z-0 bg-white/70" />
            <div className="relative z-10">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#006039]">
                Product Snapshot
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  categoryLabel && { label: 'Category', value: categoryLabel },
                  !hidden.includes('finish') && product.finish && { label: 'Finish', value: product.finish },
                  !hidden.includes('dimension') && dimensionValue && { label: 'Size', value: dimensionValue },
                ]
                  .filter(Boolean)
                  .map((item: any) => (
                    <div key={item.label} className="border border-[#173126]/10 bg-white/68 p-3">
                      <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#173126]/45">
                        {item.label}
                      </span>
                      <strong className="mt-1 block text-sm font-semibold leading-5 text-[#173126]">
                        {item.value}
                      </strong>
                    </div>
                  ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[#173126]/62">
                Need finish, size, or installation guidance? Share this product with our team for quick support.
              </p>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div className="product-info-panel relative overflow-hidden border border-[#173126]/10 bg-white p-5 shadow-[0_24px_70px_rgba(23,49,38,0.1)] sm:p-7 lg:sticky lg:top-24 lg:p-8">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/green-texture.png')] bg-cover bg-center opacity-55 mix-blend-multiply" />
          <div className="absolute inset-0 z-0 bg-white/62" />
          <div className="relative z-10">
          {/* Category */}
          <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#006039]">{categoryLabel}</p>

          {/* Name */}
          <h1
            className="text-[clamp(2rem,4vw,3.25rem)] font-medium leading-tight text-[#173126]"
          >
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span
              className="text-3xl font-semibold text-[#006039]"
            >
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.retailPrice > product.sellingPrice && (
              <>
                <span className="text-sm text-[#173126]/42 line-through">₹{product.retailPrice.toLocaleString('en-IN')}</span>
                <span
                  className="bg-[#006039]/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#006039]"
                >
                  Save ₹{(product.retailPrice - product.sellingPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-sm leading-7 text-[#173126]/68">
              {product.description}
            </p>
          )}

          <div className="my-7 h-px w-full bg-[#173126]/10" />

          {/* Color selector */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p
                className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#173126]/55"
              >
                Finish: <span className="text-[#006039]">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="color-swatch"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#006039' : 'rgba(23,49,38,0.18)',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-7">
            <p
              className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#173126]/55"
            >
              Quantity
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex overflow-hidden border border-[#173126]/14 bg-[#f7f1e8]">
                <button
                  className="flex h-11 w-11 items-center justify-center text-lg text-[#173126] transition hover:bg-[#006039] hover:text-white"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="flex h-11 w-14 items-center justify-center border-x border-[#173126]/14 text-sm font-semibold text-[#173126]">
                  {quantity}
                </span>
                <button
                  className="flex h-11 w-11 items-center justify-center text-lg text-[#173126] transition hover:bg-[#006039] hover:text-white"
                  onClick={() => setQuantity((q) => Math.min(product.totalQuantity, q + 1))}
                >
                  +
                </button>
              </div>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#173126]/50">
                {product.totalQuantity} in stock
              </span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="product-cta-row mb-7 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.totalQuantity === 0}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#006039] px-5 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#0b7a4d] disabled:cursor-not-allowed disabled:bg-[#173126]/12 disabled:text-[#173126]/35"
            >
              {added ? <Check size={15} /> : <ShoppingBag size={15} strokeWidth={2} />}
              {product.totalQuantity === 0
                ? 'Out of Stock'
                : added
                ? 'Added to Cart'
                : adding
                ? 'Adding...'
                : 'Add to Cart'}
            </button>
            <button
              className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#173126]/14 bg-[#f7f1e8] transition hover:border-[#006039]/40 hover:bg-[#006039]/8"
              onClick={handleWishlistToggle}
              style={{
                color: wishlisted ? '#ef4444' : 'rgba(23,49,38,0.62)',
                borderColor: wishlisted ? 'rgba(239,68,68,0.45)' : 'rgba(23,49,38,0.14)',
              }}
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                style={{ fill: wishlisted ? '#ef4444' : 'none', transition: 'fill 0.2s ease' }}
              />
            </button>
            <button className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#173126]/14 bg-[#f7f1e8] text-[#173126]/65 transition hover:border-[#006039]/40 hover:bg-[#006039]/8 hover:text-[#006039]" onClick={handleShare}>
              <Share2 size={15} strokeWidth={1.5} />
            </button>
          </div>

          <div className="mb-7 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/contact-us?product=${encodeURIComponent(product.name)}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#006039]/25 bg-white/72 px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#006039] transition hover:border-[#006039] hover:bg-[#006039] hover:text-white"
            >
              <MessageCircle size={15} strokeWidth={1.7} />
              Enquiry
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#173126]/14 bg-[#f7f1e8]/86 px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#173126] transition hover:border-[#006039]/40 hover:bg-[#006039]/8 hover:text-[#006039]"
            >
              <Headphones size={15} strokeWidth={1.7} />
              Support
            </a>
          </div>

          {/* Delivery highlights */}
          <div
            className="mb-7 grid gap-3 sm:grid-cols-3"
          >
            {DELIVERY_HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-[#173126]/10 bg-[#f7f1e8] p-4">
                <Icon size={18} className="mb-3 text-[#006039]" strokeWidth={1.7} />
                <div>
                  <p
                    className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#173126]"
                  >
                    {title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#173126]/58">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className="divide-y divide-[#173126]/10 border-y border-[#173126]/10">
            {accordions.map((acc) => (
              <div key={acc.id}>
                <button
                  className="flex w-full items-center justify-between py-5 text-left text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[#173126] transition hover:text-[#006039]"
                  onClick={() =>
                    setOpenAccordions((open) =>
                      open.includes(acc.id)
                        ? open.filter((id) => id !== acc.id)
                        : [...open, acc.id],
                    )
                  }
                >
                  {acc.label}
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: openAccordions.includes(acc.id) ? 'rotate(180deg)' : 'rotate(0)',
                      color: openAccordions.includes(acc.id) ? '#006039' : 'rgba(23,49,38,0.45)',
                    }}
                  />
                </button>
                {openAccordions.includes(acc.id) && (
                  <div
                    style={{
                      paddingBottom: '1.5rem',
                      animation: 'fadeUp 0.3s ease forwards',
                    }}
                  >
                    {acc.id === 'details' ? (
                      <div className="pb-5">
                        {(acc.content as { description?: string; specs: any[] }).description && (
                          <p className="mb-5 text-sm font-normal leading-7 text-[#173126]/66">
                            {(acc.content as { description?: string; specs: any[] }).description}
                          </p>
                        )}
                        <div className="grid gap-2">
                          {(acc.content as { description?: string; specs: any[] }).specs.map((detail: any) => (
                            <div
                              key={detail.label}
                              className="grid gap-1 border-b border-[#173126]/8 py-3 sm:grid-cols-[140px_1fr]"
                            >
                              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#173126]/45">
                                {detail.label}
                              </span>
                              <span className="text-sm capitalize leading-6 text-[#173126]/76">
                                {detail.value}
                              </span>
                            </div>
                          ))}
                          {product.tags?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {product.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="bg-[#006039]/8 px-3 py-1 text-[0.62rem] font-semibold lowercase tracking-[0.06em] text-[#006039]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p
                        className="pb-5 text-sm font-normal leading-7 text-[#173126]/66"
                      >
                        {acc.content as string}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3,32,22,0.96)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.25s ease forwards',
          }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'none',
              border: '1px solid rgba(250,247,240,0.15)',
              color: 'rgba(250,247,240,0.6)',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
          <div
            style={{
              position: 'relative',
              width: '80vmin',
              height: '80vmin',
              cursor: productImages.length > 1 ? 'grab' : 'default',
              touchAction: 'pan-y',
              userSelect: 'none',
            }}
            onClick={handleLightboxImageClick}
            onPointerDown={handleImagePointerDown}
            onPointerUp={handleImagePointerUp}
            onPointerCancel={handleImagePointerCancel}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              draggable={false}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
