import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

interface AdminAuthState {
  token: string | null;
  admin: { _id: string; name: string; email: string; role: string } | null;
  bootstrapped: boolean;
}

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    token: null,
    admin: null,
    bootstrapped: false,
  } as AdminAuthState,
  reducers: {
    finishAdminBootstrap(state) {
      state.bootstrapped = true;
    },
    setAdminToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setAdminAuth(state, action: PayloadAction<{ token: string; admin: any }>) {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.bootstrapped = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('nc_admin_token', action.payload.token);
      }
    },
    adminLogout(state) {
      state.token = null;
      state.admin = null;
      state.bootstrapped = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nc_admin_token');
      }
    },
  },
});

export const { finishAdminBootstrap, setAdminAuth, setAdminToken, adminLogout } = adminAuthSlice.actions;

export const adminStore = configureStore({
  reducer: { adminAuth: adminAuthSlice.reducer },
});

export type AdminRootState = ReturnType<typeof adminStore.getState>;
export type AdminDispatch = typeof adminStore.dispatch;

export const useAdminDispatch = () => useDispatch<AdminDispatch>();
export const useAdminSelector: TypedUseSelectorHook<AdminRootState> = useSelector;
