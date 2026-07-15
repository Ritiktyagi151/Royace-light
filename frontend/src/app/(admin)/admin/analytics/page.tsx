'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { IndianRupee, Package, ShoppingBag, Users } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const COLORS = ['#2563eb', '#4f46e5', '#f59e0b', '#8b5cf6', '#16a34a', '#dc2626'];

export default function AdminAnalyticsPage() {
  const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [trendFrom, setTrendFrom] = useState('');
  const [trendTo, setTrendTo] = useState('');

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

  const { data: revenueTrendData, isLoading: revenueTrendLoading } = useQuery({
    queryKey: ['admin-revenue-trend', trendPeriod, trendFrom, trendTo],
    queryFn: async () => {
      const params = new URLSearchParams({ period: trendPeriod });
      if (trendFrom) params.set('fromDate', trendFrom);
      if (trendTo) params.set('toDate', trendTo);
      const res = await adminApi.get(`/orders/admin/revenue-trend?${params}`);
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
  ];

  const loading = statsLoading || productsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-0.5 text-sm text-gray-500">Track orders, revenue, products, and customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="admin-card p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
            <p className="mt-0.5 text-sm text-gray-500">Paid order revenue by selected period.</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input
              type="date"
              value={trendFrom}
              onChange={(e) => setTrendFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900"
              aria-label="Revenue trend start date"
            />
            <input
              type="date"
              value={trendTo}
              onChange={(e) => setTrendTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900"
              aria-label="Revenue trend end date"
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={revenueTrendData?.data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === 'revenue' ? `Rs. ${Number(value || 0).toLocaleString('en-IN')}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders',
              ]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
        {revenueTrendLoading && <p className="mt-2 text-sm text-gray-400">Loading trend...</p>}
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
