'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Users, IndianRupee, Clock, CheckCircle, Truck, TrendingUp } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const QUERY_OPTIONS = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export default function AdminDashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/orders/admin/stats', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/orders/admin/all?limit=5', { signal });
      return res.data.data.orders;
    },
    ...QUERY_OPTIONS,
  });

  const { data: productsData } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/products/admin/all?limit=1', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: customersData } = useQuery({
    queryKey: ['admin-customers-count'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/users?role=user&page=1&limit=1', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['admin-low-stock-products'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/products/admin/low-stock?threshold=4&limit=5', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: topSellingData } = useQuery({
    queryKey: ['admin-top-selling-products'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/products/admin/top-selling?limit=5', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const stats = [
    { label: 'Total Revenue', value: `Rs. ${(statsData?.revenue || 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Total Orders', value: statsData?.total || 0, icon: ShoppingBag, color: 'bg-sky-50 text-sky-700' },
    { label: 'Total Customers', value: customersData?.total || 0, icon: Users, color: 'bg-teal-50 text-teal-700' },
    { label: 'Products', value: productsData?.total || 0, icon: Package, color: 'bg-violet-50 text-violet-700' },
    { label: 'Delivered', value: statsData?.delivered || 0, icon: CheckCircle, color: 'bg-amber-50 text-amber-700' },
  ];

  const orderStatusData = statsData
    ? [
        { name: 'Placed', count: statsData.placed, fill: '#3b82f6' },
        { name: 'Confirmed', count: statsData.confirmed, fill: '#6366f1' },
        { name: 'Shipped', count: statsData.shipped, fill: '#f59e0b' },
        { name: 'Delivered', count: statsData.delivered, fill: '#22c55e' },
        { name: 'Cancelled', count: statsData.cancelled, fill: '#ef4444' },
      ]
    : [];

  const STATUS_STYLES: Record<string, string> = {
    Placed: 'bg-blue-50 text-blue-700',
    Confirmed: 'bg-indigo-50 text-indigo-700',
    Processing: 'bg-yellow-50 text-yellow-700',
    Shipped: 'bg-orange-50 text-orange-700',
    'Out for Delivery': 'bg-purple-50 text-purple-700',
    Delivered: 'bg-green-50 text-green-700',
    Cancelled: 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-900/10 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf2_100%)] px-5 py-4 shadow-[0_12px_34px_rgba(6,47,36,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-0.5 text-sm text-gray-500">Welcome back! Here's what's happening.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live overview
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`rounded-lg p-3 ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status chart */}
        <div className="admin-card p-5 sm:p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {orderStatusData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>  
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent orders */}
        <div className="admin-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs font-semibold text-gray-500 hover:text-gray-900">View all</a>
          </div>
          <div className="space-y-3">
            {recentOrders?.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{String(order._id).slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.userId?.name || 'Customer'} - {order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Rs. {order.amount}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {!recentOrders?.length && (
              <p className="text-sm text-gray-400 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Low Stock Products</h3>
            <span className="text-xs text-gray-400">Quantity below 5</span>
          </div>
          <div className="space-y-3">
            {lowStockData?.products?.map((product: any) => (
              <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">{product.totalQuantity || 0}</p>
              </div>
            ))}
            {!lowStockData?.products?.length && (
              <p className="text-sm text-gray-400 text-center py-8">All products well stocked</p>
            )}
          </div>
        </div>

        <div className="admin-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Top 5 Selling Products</h3>
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div className="space-y-3">
            {topSellingData?.products?.map((product: any, index: number) => (
              <div key={product._id || index} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{product.soldQuantity || 0} sold</p>
                  <p className="text-xs text-gray-500">Rs. {Number(product.revenue || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            {!topSellingData?.products?.length && (
              <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { icon: Clock, label: 'Pending (Placed)', value: statsData?.placed || 0, color: 'text-blue-500' },
          { icon: Truck, label: 'In Transit', value: (statsData?.confirmed || 0) + (statsData?.shipped || 0), color: 'text-orange-500' },
          { icon: CheckCircle, label: 'Delivered', value: statsData?.delivered || 0, color: 'text-green-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="admin-card flex items-center gap-4 p-5">
            <Icon size={28} className={color} />
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
