'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IndianRupee, Package, ShoppingBag, Store, Users } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const COLORS = ['#2563eb', '#4f46e5', '#f59e0b', '#8b5cf6', '#16a34a', '#dc2626'];

export default function AdminAnalyticsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-analytics-order-stats'],
    queryFn: async () => {
      const res = await adminApi.get('/orders/admin/stats');
      return res.data.data;
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-analytics-products'],
    queryFn: async () => {
      const res = await adminApi.get('/products/admin/all?limit=1');
      return res.data.data;
    },
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-analytics-users'],
    queryFn: async () => {
      const res = await adminApi.get('/users?role=user&page=1&limit=1');
      return res.data.data;
    },
  });

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['admin-analytics-vendors'],
    queryFn: async () => {
      const res = await adminApi.get('/users?role=vendor&page=1&limit=1');
      return res.data.data;
    },
  });

  const statusData = [
    { name: 'Placed', value: statsData?.placed || 0 },
    { name: 'Confirmed', value: statsData?.confirmed || 0 },
    { name: 'Shipped', value: statsData?.shipped || 0 },
    { name: 'Delivered', value: statsData?.delivered || 0 },
    { name: 'Cancelled', value: statsData?.cancelled || 0 },
  ];

  const overview = [
    {
      label: 'Revenue',
      value: `Rs. ${Number(statsData?.revenue || 0).toLocaleString('en-IN')}`,
      Icon: IndianRupee,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Orders',
      value: statsData?.total || 0,
      Icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Products',
      value: productsData?.total || 0,
      Icon: Package,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Customers',
      value: usersData?.total || 0,
      Icon: Users,
      color: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Vendors',
      value: vendorsData?.total || 0,
      Icon: Store,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  const loading = statsLoading || productsLoading || usersLoading || vendorsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-0.5 text-sm text-gray-500">Track orders, revenue, products, users, and vendors.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {overview.map(({ label, value, Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
              </div>
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-card p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Fulfilment Mix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData.filter((item) => item.value > 0)}
                dataKey="value"
                nameKey="name"
                outerRadius={105}
                label
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
