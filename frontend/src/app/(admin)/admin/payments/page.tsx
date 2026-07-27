'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CreditCard, Package, ShoppingBag, WalletCards } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { adminApi } from '@/lib/adminApi';

const formatCurrency = (amount: number | string | undefined) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const QUERY_OPTIONS = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export default function AdminPaymentsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/orders/admin/stats', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const paymentSummary = {
    totalAmount: statsData?.payment?.totalAmount || 0,
    paidAmount: statsData?.payment?.paidAmount || 0,
    dueAmount: statsData?.payment?.dueAmount || 0,
    onlinePaidAmount: statsData?.payment?.onlinePaidAmount || 0,
    codDueAmount: statsData?.payment?.codDueAmount || 0,
    paidOrders: statsData?.payment?.paidOrders || 0,
    dueOrders: statsData?.payment?.dueOrders || 0,
  };

  const paidPercent = paymentSummary.totalAmount
    ? Math.min(100, Math.round((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100))
    : 0;

  const paymentBreakdownData = [
    { name: 'Online Paid', value: Number(paymentSummary.onlinePaidAmount || 0), color: '#16a34a' },
    { name: 'COD Due', value: Number(paymentSummary.codDueAmount || 0), color: '#f59e0b' },
    {
      name: 'Other Due',
      value: Math.max(0, Number(paymentSummary.dueAmount || 0) - Number(paymentSummary.codDueAmount || 0)),
      color: '#dc2626',
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-900/10 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf2_100%)] px-5 py-4 shadow-[0_12px_34px_rgba(6,47,36,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Dashboard</h2>
          <p className="mt-0.5 text-sm text-gray-500">Paid, due, and billable order amount overview.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <WalletCards size={14} />
          Payment overview
        </div>
      </div>

      <section className="admin-card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Collections Summary</h3>
          <p className="mt-0.5 text-sm text-gray-500">Active billable orders, excluding cancelled and returned orders.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Billable Amount', value: formatCurrency(paymentSummary.totalAmount), helper: 'Active orders only', icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
            { label: 'Paid Amount', value: formatCurrency(paymentSummary.paidAmount), helper: `${paymentSummary.paidOrders} paid order(s)`, icon: CreditCard, color: 'bg-green-50 text-green-700' },
            { label: 'Amount Due', value: formatCurrency(paymentSummary.dueAmount), helper: `${paymentSummary.dueOrders} pending payment(s)`, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
            { label: 'COD Due', value: formatCurrency(paymentSummary.codDueAmount), helper: 'Cash collection pending', icon: Package, color: 'bg-amber-50 text-amber-700' },
          ].map(({ label, value, helper, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">{isLoading ? '...' : value}</p>
                  <p className="mt-1 text-xs text-gray-500">{helper}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 border-t border-gray-100 px-5 py-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-gray-700">Payment collection</span>
              <span className="font-semibold text-gray-900">{paidPercent}% paid</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-red-100">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPercent}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-gray-500">
              <span>Online paid: {formatCurrency(paymentSummary.onlinePaidAmount)}</span>
              <span>Due: {formatCurrency(paymentSummary.dueAmount)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Payment split</p>
            {paymentBreakdownData.length ? (
              <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={paymentBreakdownData} dataKey="value" innerRadius={38} outerRadius={60} paddingAngle={3}>
                      {paymentBreakdownData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5">
                  {paymentBreakdownData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">No payment data</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
