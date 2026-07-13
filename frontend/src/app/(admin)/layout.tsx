'use client';

import '../admin.css';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminStore, adminLogout, finishAdminBootstrap, setAdminAuth, setAdminToken, useAdminDispatch } from '@/store/admin/store';
import { AdminShell } from './admin/components/layout/AdminShell';
import { adminApi } from '@/lib/adminApi';

const queryClient = new QueryClient();

function AdminAuthBootstrap() {
  const dispatch = useAdminDispatch();

  useEffect(() => {
    const token = localStorage.getItem('nc_admin_token');
    if (token) {
      dispatch(setAdminToken(token));
      adminApi.defaults.headers.common.Authorization = `Bearer ${token}`;
      adminApi.get('/auth/profile')
        .then((res) => {
          const profile = res.data.data;
          if (profile?.role === 'admin') {
            dispatch(setAdminAuth({
              token,
              admin: {
                _id: profile._id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
              },
            }));
          } else {
            dispatch(adminLogout());
          }
        })
        .catch(() => dispatch(adminLogout()));
    } else {
      dispatch(finishAdminBootstrap());
    }
  }, [dispatch]);

  return null;
}

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={adminStore}>
      <QueryClientProvider client={queryClient}>
        <AdminAuthBootstrap />
        <div className="admin-panel">
          <AdminShell>{children}</AdminShell>
        </div>
      </QueryClientProvider>
    </Provider>
  );
}
