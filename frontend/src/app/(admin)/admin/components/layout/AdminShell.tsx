'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag,
  Percent,
  ChevronLeft, ChevronRight, LogOut, Menu, X, Settings,
  BarChart3, Bell, Monitor, Moon, Sun, MessageSquare, Megaphone, Search, Clock, Mail,
} from 'lucide-react';
import { useAdminSelector, useAdminDispatch, adminLogout } from '@/store/admin/store';
import { adminApi } from '@/lib/adminApi';
import { AdminLogin } from '../auth/AdminLogin';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Orders',
    items: [
      { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/admin/products', icon: Package, label: 'Products' },
      { href: '/admin/categories', icon: Tag, label: 'Categories' },
      { href: '/admin/coupons', icon: Percent, label: 'Coupons' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { href: '/admin/users', icon: Users, label: 'Customers' },
      { href: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);
const SEEN_ORDER_COUNT_KEY = 'royace_admin_seen_order_count';
const SEEN_CUSTOMER_COUNT_KEY = 'royace_admin_seen_customer_count';
const SEEN_ENQUIRY_COUNT_KEY = 'royace_admin_seen_enquiry_count';
const THEME_MODE_KEY = 'royace_theme_mode';
const LAST_LOGIN_KEY = 'royace_admin_last_login_at';
type ThemeMode = 'system' | 'light' | 'dark';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: LucideIcon }[] = [
  { mode: 'system', label: 'System', Icon: Monitor },
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
];

const formatLastLogin = (value: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AdminShell({ children }: { children: ReactNode }) {
  const { token, admin, bootstrapped } = useAdminSelector((s) => s.adminAuth);
  const dispatch = useAdminDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [bellOpen, setBellOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastLoginAt, setLastLoginAt] = useState('');
  const [seenCounts, setSeenCounts] = useState<{ orders: number | null; customers: number | null; enquiries: number | null }>({
    orders: null,
    customers: null,
    enquiries: null,
  });

  const canFetchBadges = Boolean(token && admin);
  const { data: orderStats } = useQuery({
    queryKey: ['admin-shell-order-badges'],
    enabled: canFetchBadges,
    queryFn: async () => {
      const res = await adminApi.get('/orders/admin/stats');
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: customerData } = useQuery({
    queryKey: ['admin-shell-customer-badges'],
    enabled: canFetchBadges,
    queryFn: async () => {
      const res = await adminApi.get('/users?role=user&page=1&limit=1');
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: enquiryStats } = useQuery({
    queryKey: ['admin-shell-enquiry-badges'],
    enabled: canFetchBadges,
    queryFn: async () => {
      const res = await adminApi.get('/enquiries/admin/stats');
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['admin-shell-recent-orders'],
    enabled: canFetchBadges,
    queryFn: async () => {
      const res = await adminApi.get('/orders/admin/all?page=1&limit=5');
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const trimmedSearch = globalSearch.trim();
  const { data: globalSearchData, isFetching: isSearching } = useQuery({
    queryKey: ['admin-global-search', trimmedSearch],
    enabled: canFetchBadges && trimmedSearch.length >= 2,
    queryFn: async ({ signal }) => {
      const encoded = encodeURIComponent(trimmedSearch);
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        adminApi.get(`/orders/admin/all?page=1&limit=4&search=${encoded}`, { signal }),
        adminApi.get(`/products/admin/all?page=1&limit=4&search=${encoded}`, { signal }),
        adminApi.get(`/users?role=user&page=1&limit=4&search=${encoded}`, { signal }),
      ]);
      return {
        orders: ordersRes.data.data?.orders || [],
        products: productsRes.data.data?.products || [],
        customers: customersRes.data.data?.users || [],
      };
    },
  });

  const orderTotal = Number(orderStats?.total || 0);
  const customerTotal = Number(customerData?.total || 0);
  const enquiryTotal = Number(enquiryStats?.total || 0);
  const unreadEnquiries = Number(enquiryStats?.unread || 0);
  const hasOrderTotal = typeof orderStats?.total !== 'undefined';
  const hasCustomerTotal = typeof customerData?.total !== 'undefined';
  const hasEnquiryTotal = typeof enquiryStats?.total !== 'undefined';

  useEffect(() => {
    if (!canFetchBadges) return;

    setSeenCounts((current) => {
      let nextOrders = current.orders;
      let nextCustomers = current.customers;
      let nextEnquiries = current.enquiries;

      if (hasOrderTotal) {
        const storedOrders = localStorage.getItem(SEEN_ORDER_COUNT_KEY);
        nextOrders = storedOrders === null ? orderTotal : Number(storedOrders || 0);
        if (storedOrders === null) localStorage.setItem(SEEN_ORDER_COUNT_KEY, String(orderTotal));
      }

      if (hasCustomerTotal) {
        const storedCustomers = localStorage.getItem(SEEN_CUSTOMER_COUNT_KEY);
        nextCustomers = storedCustomers === null ? customerTotal : Number(storedCustomers || 0);
        if (storedCustomers === null) localStorage.setItem(SEEN_CUSTOMER_COUNT_KEY, String(customerTotal));
      }

      if (hasEnquiryTotal) {
        const storedEnquiries = localStorage.getItem(SEEN_ENQUIRY_COUNT_KEY);
        nextEnquiries = storedEnquiries === null ? enquiryTotal : Number(storedEnquiries || 0);
        if (storedEnquiries === null) localStorage.setItem(SEEN_ENQUIRY_COUNT_KEY, String(enquiryTotal));
      }

      if (current.orders === nextOrders && current.customers === nextCustomers && current.enquiries === nextEnquiries) return current;
      return { orders: nextOrders, customers: nextCustomers, enquiries: nextEnquiries };
    });
  }, [canFetchBadges, hasOrderTotal, hasCustomerTotal, hasEnquiryTotal, orderTotal, customerTotal, enquiryTotal]);

  useEffect(() => {
    if (!canFetchBadges) return;

    if (pathname.startsWith('/admin/orders') && hasOrderTotal) {
      localStorage.setItem(SEEN_ORDER_COUNT_KEY, String(orderTotal));
      setSeenCounts((current) => ({ ...current, orders: orderTotal }));
    }

    if (pathname.startsWith('/admin/users') && hasCustomerTotal) {
      localStorage.setItem(SEEN_CUSTOMER_COUNT_KEY, String(customerTotal));
      setSeenCounts((current) => ({ ...current, customers: customerTotal }));
    }

    if (pathname.startsWith('/admin/enquiries') && hasEnquiryTotal) {
      localStorage.setItem(SEEN_ENQUIRY_COUNT_KEY, String(enquiryTotal));
      setSeenCounts((current) => ({ ...current, enquiries: enquiryTotal }));
    }
  }, [canFetchBadges, pathname, hasOrderTotal, hasCustomerTotal, hasEnquiryTotal, orderTotal, customerTotal, enquiryTotal]);

  const newOrders = Math.max(0, orderTotal - (seenCounts.orders ?? orderTotal));
  const newCustomers = Math.max(0, customerTotal - (seenCounts.customers ?? customerTotal));
  const newEnquiries = Math.max(unreadEnquiries, enquiryTotal - (seenCounts.enquiries ?? enquiryTotal));
  const totalNewItems = newOrders + newCustomers + newEnquiries;
  const recentOrders = recentOrdersData?.orders || [];
  const searchResults = globalSearchData || { orders: [], products: [], customers: [] };
  const totalSearchResults = searchResults.orders.length + searchResults.products.length + searchResults.customers.length;
  const getBadgeCount = (href: string) => {
    if (href === '/admin/orders') return newOrders;
    if (href === '/admin/users') return newCustomers;
    if (href === '/admin/enquiries') return newEnquiries;
    return 0;
  };
  const currentTheme = THEME_OPTIONS.find((option) => option.mode === themeMode) || THEME_OPTIONS[0];
  const ThemeIcon = currentTheme.Icon;

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      const isDark = mode === 'dark' || (
        mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.dataset.theme = mode;
    };

    const savedMode = (localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) || 'system';
    const nextMode = THEME_OPTIONS.some((option) => option.mode === savedMode) ? savedMode : 'system';
    setThemeMode(nextMode);
    applyTheme(nextMode);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      const latestMode = (localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) || 'system';
      if (latestMode === 'system') applyTheme('system');
    };
    media.addEventListener('change', handleSystemChange);

    return () => media.removeEventListener('change', handleSystemChange);
  }, []);

  useEffect(() => {
    const storedLastLogin = localStorage.getItem(LAST_LOGIN_KEY);
    if (storedLastLogin) {
      setLastLoginAt(storedLastLogin);
      return;
    }

    const sessionLogin = new Date().toISOString();
    localStorage.setItem(LAST_LOGIN_KEY, sessionLogin);
    setLastLoginAt(sessionLogin);
  }, []);

  const changeTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
    const isDark = mode === 'dark' || (
      mode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = mode;
  };

  const goToSearchResult = (href: string) => {
    setSearchOpen(false);
    setGlobalSearch('');
    router.push(href);
  };

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500">
        Checking admin access...
      </div>
    );
  }

  if (!token || !admin) {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push('/admin');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">NC</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm">Royace Lighting</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>
            )}
            {section.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              const badgeCount = getBadgeCount(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && label}
                  {badgeCount > 0 && (
                    <span className={`${collapsed ? 'absolute right-1.5 top-1.5 h-2.5 min-w-2.5 p-0' : 'ml-auto min-w-5 px-1.5 py-0.5'} rounded-full bg-red-500 text-center text-[10px] font-bold leading-4 text-white`}>
                      {!collapsed && (badgeCount > 99 ? '99+' : badgeCount)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-gray-100 space-y-1`}>
        <Link href="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Settings size={18} />
          {!collapsed && 'Settings'}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-r border-gray-100 bg-white transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-white border border-gray-200 rounded-r-lg p-1 shadow-sm hover:bg-gray-50 transition-colors"
          style={{ left: collapsed ? 56 : 224 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 shrink-0 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1 text-gray-600" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="hidden font-semibold text-gray-900 text-base dark:text-white sm:block">
              {NAV_ITEMS.find((n) => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </h1>

            <div className="relative flex-1 sm:ml-3 lg:max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={globalSearch}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search orders, products, customers..."
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:bg-gray-900"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearch('');
                    setSearchOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              {searchOpen && trimmedSearch.length >= 2 && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Global Search</p>
                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">
                      {isSearching ? 'Searching...' : `${totalSearchResults} result(s) found`}
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {[
                      { title: 'Orders', href: '/admin/orders', items: searchResults.orders, Icon: ShoppingBag, render: (item: any) => `#${String(item._id).slice(-8).toUpperCase()} - ${item.userId?.name || 'Customer'} - Rs. ${Number(item.amount || 0).toLocaleString('en-IN')}` },
                      { title: 'Products', href: '/admin/products', items: searchResults.products, Icon: Package, render: (item: any) => `${item.name || 'Product'} - ${item.sku || 'No SKU'}` },
                      { title: 'Customers', href: '/admin/users', items: searchResults.customers, Icon: Users, render: (item: any) => `${item.name || 'Customer'} - ${item.email || ''}` },
                    ].map(({ title, href, items, Icon, render }) => (
                      <div key={title} className="py-1">
                        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
                        {items.map((item: any) => (
                          <button
                            key={`${title}-${item._id}`}
                            type="button"
                            onClick={() => goToSearchResult(href)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              <Icon size={15} />
                            </span>
                            <span className="min-w-0 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                              {render(item)}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {!isSearching && totalSearchResults === 0 && (
                      <p className="px-3 py-8 text-center text-sm text-gray-400">No matching records</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400 xl:flex">
              <Clock size={14} />
              <span>Last login: {formatLastLogin(lastLoginAt)}</span>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                title={`Theme: ${currentTheme.label}`}
              >
                <ThemeIcon size={16} />
                <span className="hidden lg:inline">{currentTheme.label}</span>
              </button>
              <div className="invisible absolute right-0 top-full z-20 mt-2 w-36 rounded-lg border border-gray-100 bg-white p-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-900">
                {THEME_OPTIONS.map(({ mode, label, Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => changeTheme(mode)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      themeMode === mode
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href="/admin/enquiries"
              className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Open enquiries"
            >
              <Mail size={18} />
              {newEnquiries > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
                  {newEnquiries > 99 ? '99+' : newEnquiries}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((open) => !open)}
                className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Open notifications"
              >
                <Bell size={18} />
                {newOrders > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {newOrders > 99 ? '99+' : newOrders}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
                    <p className="text-xs text-gray-500">
                      {newOrders} new order(s), {newCustomers} customer(s), {newEnquiries} enquiry item(s)
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {recentOrders.map((order: any) => (
                      <Link
                        key={order._id}
                        href="/admin/orders"
                        onClick={() => setBellOpen(false)}
                        className="block rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                              #{String(order._id).slice(-8).toUpperCase()}
                            </p>
                            <p className="truncate text-xs text-gray-500">{order.userId?.name || 'Customer'} - {order.status}</p>
                          </div>
                          <p className="shrink-0 text-xs font-bold text-gray-900 dark:text-white">
                            Rs. {Number(order.amount || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Link>
                    ))}
                    {!recentOrders.length && (
                      <p className="px-3 py-8 text-center text-sm text-gray-400">No recent orders</p>
                    )}
                  </div>
                  <Link
                    href="/admin/orders"
                    onClick={() => setBellOpen(false)}
                    className="block border-t border-gray-100 px-4 py-3 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    View all orders
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{admin?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
