import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  price?: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    hydrateWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload;
    },
    toggleWishlistItem(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.some((item) => item.productId === action.payload.productId);
      state.items = exists
        ? state.items.filter((item) => item.productId !== action.payload.productId)
        : [action.payload, ...state.items];
    },
    addWishlistItem(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.some((item) => item.productId === action.payload.productId);
      if (!exists) state.items = [action.payload, ...state.items];
    },
    removeWishlistItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
  },
});

export const {
  hydrateWishlist,
  toggleWishlistItem,
  addWishlistItem,
  removeWishlistItem,
} = wishlistSlice.actions;

export const selectWishlistCount = (state: { wishlist: WishlistState }) =>
  state.wishlist.items.length;

export const selectIsWishlisted = (productId?: string) => (state: { wishlist: WishlistState }) =>
  Boolean(productId && state.wishlist.items.some((item) => item.productId === productId));

export default wishlistSlice.reducer;
