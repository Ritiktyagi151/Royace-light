'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeWishlistItem } from '@/store/slices/wishlistSlice';
import { addToCartThunk } from '@/store/slices/cartSlice';
import { addToast, openCartDrawer } from '@/store/slices/uiSlice';
import { getAssetUrl } from '@/lib/urls';
import { AccountShell } from '@/components/account/AccountShell';

const PER_PAGE_OPTIONS = [10, 20, 50];

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const items = useAppSelector((state) => state.wishlist.items);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = useMemo(
    () => items.slice((currentPage - 1) * perPage, currentPage * perPage),
    [items, currentPage, perPage],
  );

  const getQuantity = (productId: string) => quantities[productId] || 1;

  const setQuantity = (productId: string, quantity: number) => {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, Number.isFinite(quantity) ? quantity : 1),
    }));
  };

  const addItemToCart = async (item: (typeof items)[number]) => {
    if (!token) return;
    try {
      await dispatch(addToCartThunk({
        token,
        productId: item.productId,
        quantity: getQuantity(item.productId),
      })).unwrap();
      dispatch(addToast({ message: 'Added to cart', type: 'success' }));
      dispatch(openCartDrawer());
    } catch (message) {
      dispatch(addToast({ message: String(message), type: 'error' }));
    }
  };

  const addAllToCart = async () => {
    if (!token || !items.length) return;
    try {
      for (const item of items) {
        await dispatch(addToCartThunk({
          token,
          productId: item.productId,
          quantity: getQuantity(item.productId),
        })).unwrap();
      }
      dispatch(addToast({ message: 'Wishlist added to cart', type: 'success' }));
      dispatch(openCartDrawer());
    } catch (message) {
      dispatch(addToast({ message: String(message), type: 'error' }));
    }
  };

  const updateWishlist = () => {
    dispatch(addToast({ message: 'Wish list updated', type: 'success' }));
  };

  const shareWishlist = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'My Royace Wish List', url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    dispatch(addToast({ message: 'Wishlist link copied', type: 'info' }));
  };

  return (
    <AccountShell title="My Wish List" eyebrow="Saved Pieces">
      <div className="border border-[#e5ded2] bg-white p-[clamp(1rem,3vw,1.5rem)] text-[#312d26]">
        <WishlistToolbar
          count={items.length}
          perPage={perPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
        />

        {!items.length ? (
          <div className="px-6 py-12 text-center">
            <Heart size={36} strokeWidth={1.3} className="mx-auto mb-4 text-[#d65f2a]" />
            <p className="mb-6 text-[#5f5a52]">Your wishlist is empty.</p>
            <Link href="/shop" className={darkButtonClass}>
              Browse Collections
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {visibleItems.map((item) => {
              const href = `/product/${item.slug || item.productId}`;
              const imageUrl = getAssetUrl(item.image);
              return (
                <article key={item.productId} className="border border-[#e4ddd2] bg-white p-3.5 text-center">
                  <Link href={href} className="block no-underline">
                    <div className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#f6f1e8]">
                      {imageUrl && (
                        <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                  </Link>

                  <Link href={href} className="block min-h-12 text-[0.9rem] font-bold leading-[1.45] text-[#8a4b28] no-underline hover:underline">
                    {item.name}
                  </Link>

                  <p className="my-[0.8rem] text-[0.95rem] font-extrabold text-[#d65f2a]">
                    Rs. {(item.price || 0).toLocaleString('en-IN')}
                  </p>

                  <label className="mb-3.5 inline-flex items-center justify-center gap-2 text-[0.78rem] text-[#5f5a52]">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={getQuantity(item.productId)}
                      onChange={(event) => setQuantity(item.productId, Number(event.target.value))}
                      className="h-[34px] w-[52px] rounded-[5px] border border-[#d8d1c4] text-center text-[#312d26]"
                    />
                  </label>

                  <button onClick={() => addItemToCart(item)} className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[7px] border-0 bg-[#d65f2a] text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#bd4f1e]">
                    <ShoppingCart size={15} strokeWidth={2} />
                    ADD TO CART
                  </button>

                  <div className="mt-3 flex justify-center gap-4">
                    <button onClick={() => setQuantity(item.productId, getQuantity(item.productId))} className="cursor-pointer border-0 bg-transparent text-[0.78rem] text-[#5f5a52] underline hover:text-[#312d26]">
                      Edit
                    </button>
                    <button onClick={() => dispatch(removeWishlistItem(item.productId))} className="cursor-pointer border-0 bg-transparent text-[0.78rem] text-[#5f5a52] underline hover:text-[#312d26]">
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
            </div>

            <WishlistPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />

            <WishlistToolbar
              count={items.length}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button onClick={updateWishlist} className={`${darkButtonClass} w-full sm:w-auto`}>Update Wish List</button>
              <button onClick={shareWishlist} className={`${darkButtonClass} w-full sm:w-auto`}>Share Wish List</button>
              <button onClick={addAllToCart} className={`${darkButtonClass} w-full sm:w-auto`}>Add All to Cart</button>
            </div>
          </>
        )}
      </div>
    </AccountShell>
  );
}

function WishlistToolbar({
  count,
  perPage,
  onPerPageChange,
}: {
  count: number;
  perPage: number;
  onPerPageChange: (value: number) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e1d7] pb-3.5 text-[0.82rem]">
      <span className="font-bold text-[#23201b]">{count} Item(s)</span>
      <label className="inline-flex items-center gap-2 text-[#5f5a52]">
        <span>Show</span>
        <select
          value={perPage}
          onChange={(event) => onPerPageChange(Number(event.target.value))}
          className="h-[34px] min-w-[66px] rounded-md border border-[#d8d1c4] bg-white px-2 text-[#312d26]"
        >
          {PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span>per page</span>
      </label>
    </div>
  );
}

function WishlistPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="my-6 flex justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1;
        const active = page === nextPage;
        return (
          <button
            key={nextPage}
            onClick={() => onPageChange(nextPage)}
            className={`h-[34px] w-[34px] cursor-pointer rounded-md border border-[#d8d1c4] font-bold ${
              active ? 'bg-[#1d1b18] text-white' : 'bg-white text-[#312d26] hover:bg-[#f6f1e8]'
            }`}
          >
            {nextPage}
          </button>
        );
      })}
    </div>
  );
}

const darkButtonClass =
  'inline-flex min-h-[38px] cursor-pointer items-center justify-center rounded-[7px] border-0 bg-[#1d1b18] px-4 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-white no-underline transition-colors hover:bg-[#312d26]';
