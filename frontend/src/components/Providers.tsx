'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store/store';
import { useAppDispatch } from '@/store/hooks';
import { setToken } from '@/store/slices/authSlice';
import { hydrateWishlist } from '@/store/slices/wishlistSlice';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('nc_token');
    if (token) {
      dispatch(setToken(token));
    }
    const savedWishlist = localStorage.getItem('royace_wishlist');
    if (savedWishlist) {
      try {
        dispatch(hydrateWishlist(JSON.parse(savedWishlist)));
      } catch {
        localStorage.removeItem('royace_wishlist');
      }
    }
  }, [dispatch]);

  return null;
}

function WishlistPersistence() {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      localStorage.setItem('royace_wishlist', JSON.stringify(store.getState().wishlist.items));
    });
    return unsubscribe;
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        <WishlistPersistence />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
