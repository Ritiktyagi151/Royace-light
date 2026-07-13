'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const STATUSES = ['', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
const ORDERS_PER_PAGE = 10;
const QUERY_OPTIONS = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

const STATUS_STYLES: Record<string, string> = {
  Placed: 'bg-blue-50 text-blue-700 border-blue-200',
  Confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-orange-50 text-orange-700 border-orange-200',
  'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Returned: 'bg-gray-100 text-gray-600 border-gray-200',
};

const formatCurrency = (amount: number | string | undefined) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const getOrderDate = (order: any) => new Date(order.orderDate || order.createdAt);

const getValidStatusOptions = (status: string) => {
  const transitions: Record<string, string[]> = {
    Placed: ['Confirmed', 'Cancelled'],
    Confirmed: ['Processing', 'Cancelled'],
    Processing: ['Shipped', 'Cancelled'],
    Shipped: ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    Delivered: ['Returned'],
    Cancelled: [],
    Returned: [],
  };

  return [status, ...(transitions[status] || [])].filter(Boolean);
};

const emptyOrderForm = {
  customerEmail: '',
  itemName: '',
  itemPrice: '',
  itemQuantity: '1',
  deliveryFees: '0',
  paymentMethod: 'cod',
  payment: false,
  status: 'Placed',
  paymentId: '',
  razorpayOrderId: '',
  fullName: '',
  phone: '',
  addressLineOne: '',
  addressLineTwo: '',
  city: '',
  state: '',
  pinCode: '',
  country: 'India',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');
  const [pendingStatusByOrderId, setPendingStatusByOrderId] = useState<Record<string, string>>({});
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, filterStatus, search, dateFrom, dateTo],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ORDERS_PER_PAGE),
      });
      if (filterStatus) params.set('status', filterStatus);
      if (search.trim()) params.set('search', search.trim());
      if (dateFrom) params.set('fromDate', dateFrom);
      if (dateTo) params.set('toDate', dateTo);
      params.set('_ts', String(Date.now()));
      const res = await adminApi.get(`/orders/admin/all?${params}`, { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: statsData } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get(`/orders/admin/stats?_ts=${Date.now()}`, { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const { data: selectedOrder, isLoading: isOrderDetailLoading } = useQuery({
    queryKey: ['admin-order-detail', selectedOrderId],
    enabled: Boolean(selectedOrderId),
    queryFn: async ({ signal }) => {
      const res = await adminApi.get(`/orders/${selectedOrderId}?_ts=${Date.now()}`, { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      const payload = { status };
      return adminApi.request({
        method: 'PATCH',
        url: `/orders/admin/${orderId}/status`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onMutate: async ({ orderId, status }) => {
      setStatusError('');
      setPendingStatusByOrderId((current) => ({ ...current, [orderId]: status }));
      await queryClient.cancelQueries({ queryKey: ['admin-orders'] });
      await queryClient.cancelQueries({ queryKey: ['admin-order-detail', orderId] });

      const previousOrders = queryClient.getQueriesData({ queryKey: ['admin-orders'] });
      const previousOrderDetail = queryClient.getQueryData(['admin-order-detail', orderId]);

      queryClient.setQueriesData({ queryKey: ['admin-orders'] }, (old: any) => {
        if (!old?.orders) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order._id === orderId ? { ...order, status } : order,
          ),
        };
      });

      queryClient.setQueryData(['admin-order-detail', orderId], (old: any) =>
        old ? { ...old, status } : old,
      );

      return { previousOrders, previousOrderDetail };
    },
    onSuccess: (response, variables) => {
      const updatedOrder = response?.data?.data;
      const nextStatus = updatedOrder?.status || variables.status;
      const nextOrderId = updatedOrder?._id || variables.orderId;

      const applyStatusUpdate = (old: any) => {
        if (!old?.orders) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order._id === nextOrderId ? { ...order, ...updatedOrder, status: nextStatus } : order,
          ),
        };
      };

      queryClient.setQueriesData({ queryKey: ['admin-orders'] }, applyStatusUpdate);
      queryClient.setQueryData(['admin-order-detail', nextOrderId], (old: any) =>
        old ? { ...old, ...updatedOrder, status: nextStatus } : updatedOrder || old,
      );

      if (updatedOrder?._id) {
        queryClient.setQueryData(['admin-order-detail', updatedOrder._id], updatedOrder);
      }

      setPendingStatusByOrderId((current) => {
        const next = { ...current };
        delete next[variables.orderId];
        return next;
      });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail'] });
    },
    onError: (error: any, variables, context) => {
      setPendingStatusByOrderId((current) => {
        const next = { ...current };
        delete next[variables.orderId];
        return next;
      });

      context?.previousOrders?.forEach(([queryKey, data]: any) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(['admin-order-detail', variables.orderId], context?.previousOrderDetail);

      const message = error?.response?.status === 401
        ? 'Please login with a real admin account before changing order status.'
        : error?.response?.data?.message || 'Unable to update order status. Please try again.';
      setStatusError(message);
    },
  });

  const reviewReturn = useMutation({
    mutationFn: ({ orderId, decision }: { orderId: string; decision: 'approved' | 'rejected' }) =>
      adminApi.patch(`/orders/admin/${orderId}/return-request`, { decision }),
    onSuccess: (response, variables) => {
      const updatedOrder = response?.data?.data;
      const orderId = updatedOrder?._id || variables.orderId;

      queryClient.setQueriesData({ queryKey: ['admin-orders'] }, (old: any) => {
        if (!old?.orders) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order._id === orderId ? { ...order, ...updatedOrder } : order,
          ),
        };
      });
      queryClient.setQueryData(['admin-order-detail', orderId], (old: any) =>
        old ? { ...old, ...updatedOrder } : updatedOrder || old,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to review return request.');
    },
  });

  const createOrder = useMutation({
    mutationFn: () => {
      const payload = {
        customerEmail: orderForm.customerEmail,
        items: [{
          name: orderForm.itemName,
          price: Number(orderForm.itemPrice),
          quantity: Number(orderForm.itemQuantity),
        }],
        deliveryFees: Number(orderForm.deliveryFees || 0),
        paymentMethod: orderForm.paymentMethod,
        payment: orderForm.payment,
        status: orderForm.status,
        paymentId: orderForm.paymentId || undefined,
        razorpayOrderId: orderForm.razorpayOrderId || undefined,
        address: {
          fullName: orderForm.fullName,
          phone: orderForm.phone,
          addressLineOne: orderForm.addressLineOne,
          addressLineTwo: orderForm.addressLineTwo || undefined,
          city: orderForm.city,
          state: orderForm.state,
          pinCode: orderForm.pinCode,
          country: orderForm.country || 'India',
        },
      };
      return adminApi.post('/orders/admin', payload);
    },
    onSuccess: () => {
      setShowAddOrder(false);
      setOrderForm(emptyOrderForm);
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to create order.');
    },
  });

  const deleteOrder = useMutation({
    mutationFn: (orderId: string) => adminApi.delete(`/orders/admin/${orderId}`),
    onSuccess: (_response, orderId) => {
      if (selectedOrderId === orderId) setSelectedOrderId(null);
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.removeQueries({ queryKey: ['admin-order-detail', orderId] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to delete order.');
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;
  const currentPage = data?.page || page;
  const summary = {
    totalOrders: statsData?.total || 0,
    totalRevenue: statsData?.revenue || 0,
    pendingOrders: statsData?.pending || 0,
    todaysOrders: statsData?.todaysOrders || 0,
  };

  const resetPage = () => setPage(1);
  const updateOrderForm = (field: keyof typeof emptyOrderForm, value: string | boolean) => {
    setOrderForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{total} matching orders</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddOrder(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          <Plus size={16} /> Add Order
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Orders', value: summary.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: CreditCard, color: 'bg-green-50 text-green-600' },
          { label: 'Pending Orders', value: summary.pendingOrders, icon: Package, color: 'bg-yellow-50 text-yellow-700' },
          { label: "Today's Orders", value: summary.todaysOrders, icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="admin-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {statusError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {statusError}
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              placeholder="Search order ID, customer, or email"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); resetPage(); }}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900"
              aria-label="Start date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); resetPage(); }}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900"
              aria-label="End date"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Date', 'Status', 'Delivery', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length ? (
                orders.map((order: any) => {
                  const displayedStatus = pendingStatusByOrderId[order._id] || order.status;
                  const isStatusUpdating = Boolean(pendingStatusByOrderId[order._id]);

                  return (
                  <tr
                    key={order._id}
                    className="table-row cursor-pointer border-b border-gray-50"
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <td className="px-5 py-4 text-sm font-medium font-mono text-gray-800">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.userId?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.userId?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.items?.length || 0} item(s)</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${order.payment ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
                        {order.payment ? 'Paid Online' : 'COD'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {getOrderDate(order).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[displayedStatus] || 'border-gray-200 bg-gray-100 text-gray-600'}`}>
                        {displayedStatus}
                      </span>
                      {order.returnRequest?.status === 'Requested' && (
                        <span className="mt-1 block w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Return requested
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {order.delivery?.waybill ? (
                        <a
                          href={order.delivery.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          <Truck size={13} /> {order.delivery.waybill}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={displayedStatus}
                          disabled={isStatusUpdating}
                          onChange={(e) => {
                            e.stopPropagation();
                            const nextStatus = e.target.value;
                            if (nextStatus !== displayedStatus) {
                              updateStatus.mutate({ orderId: order._id, status: nextStatus });
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="cursor-pointer rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:cursor-wait disabled:opacity-60"
                        >
                          {getValidStatusOptions(displayedStatus).map((s, index) => (
                            <option key={s} value={s} disabled={index === 0}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={deleteOrder.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this order permanently?')) {
                              deleteOrder.mutate(order._id);
                            }
                          }}
                          className="rounded-lg border border-red-100 p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                          aria-label="Delete order"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isStatusUpdating && (
                          <Loader2 className="inline animate-spin text-gray-400" size={14} />
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                        <Search size={20} />
                      </div>
                      <p className="font-medium text-gray-900">No orders found</p>
                      <p className="mt-1 text-sm text-gray-400">Try changing the search, status, or date range.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > ORDERS_PER_PAGE && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-{Math.min(currentPage * ORDERS_PER_PAGE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Order</p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">Add Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddOrder(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrder.mutate();
              }}
              className="max-h-[calc(90vh-76px)] overflow-y-auto p-5"
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <section>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</p>
                  <div className="space-y-3">
                    <input required type="email" value={orderForm.customerEmail} onChange={(e) => updateOrderForm('customerEmail', e.target.value)} placeholder="Customer email" className="admin-input" />
                    <input required value={orderForm.fullName} onChange={(e) => updateOrderForm('fullName', e.target.value)} placeholder="Customer name" className="admin-input" />
                    <input required value={orderForm.phone} onChange={(e) => updateOrderForm('phone', e.target.value)} placeholder="Phone" className="admin-input" />
                  </div>
                </section>

                <section>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Item</p>
                  <div className="space-y-3">
                    <input required value={orderForm.itemName} onChange={(e) => updateOrderForm('itemName', e.target.value)} placeholder="Item name" className="admin-input" />
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="number" min="0" step="0.01" value={orderForm.itemPrice} onChange={(e) => updateOrderForm('itemPrice', e.target.value)} placeholder="Price" className="admin-input" />
                      <input required type="number" min="1" step="1" value={orderForm.itemQuantity} onChange={(e) => updateOrderForm('itemQuantity', e.target.value)} placeholder="Qty" className="admin-input" />
                    </div>
                    <input type="number" min="0" step="0.01" value={orderForm.deliveryFees} onChange={(e) => updateOrderForm('deliveryFees', e.target.value)} placeholder="Delivery fees" className="admin-input" />
                  </div>
                </section>

                <section>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Address</p>
                  <div className="space-y-3">
                    <input required value={orderForm.addressLineOne} onChange={(e) => updateOrderForm('addressLineOne', e.target.value)} placeholder="Address line 1" className="admin-input" />
                    <input value={orderForm.addressLineTwo} onChange={(e) => updateOrderForm('addressLineTwo', e.target.value)} placeholder="Address line 2" className="admin-input" />
                    <div className="grid grid-cols-2 gap-3">
                      <input required value={orderForm.city} onChange={(e) => updateOrderForm('city', e.target.value)} placeholder="City" className="admin-input" />
                      <input required value={orderForm.state} onChange={(e) => updateOrderForm('state', e.target.value)} placeholder="State" className="admin-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input required value={orderForm.pinCode} onChange={(e) => updateOrderForm('pinCode', e.target.value)} placeholder="Pin code" className="admin-input" />
                      <input required value={orderForm.country} onChange={(e) => updateOrderForm('country', e.target.value)} placeholder="Country" className="admin-input" />
                    </div>
                  </div>
                </section>

                <section>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Payment & Status</p>
                  <div className="space-y-3">
                    <select value={orderForm.paymentMethod} onChange={(e) => updateOrderForm('paymentMethod', e.target.value)} className="admin-input">
                      <option value="cod">Cash on Delivery</option>
                      <option value="online">Online Payment</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                    <select value={orderForm.status} onChange={(e) => updateOrderForm('status', e.target.value)} className="admin-input">
                      {STATUSES.filter(Boolean).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={orderForm.payment}
                        onChange={(e) => updateOrderForm('payment', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      Mark payment as paid
                    </label>
                    <input value={orderForm.paymentId} onChange={(e) => updateOrderForm('paymentId', e.target.value)} placeholder="Payment ID (optional)" className="admin-input" />
                    <input value={orderForm.razorpayOrderId} onChange={(e) => updateOrderForm('razorpayOrderId', e.target.value)} placeholder="Razorpay Order ID (optional)" className="admin-input" />
                  </div>
                </section>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddOrder(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {createOrder.isPending && <Loader2 className="animate-spin" size={16} />}
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order Details</p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">
                  #{String(selectedOrder?._id || selectedOrderId).slice(-8).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-76px)] overflow-y-auto p-5">
              {isOrderDetailLoading || !selectedOrder ? (
                <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Loading order details...
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div>
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <Package size={14} /> Order Items
                  </p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">x{item.quantity}</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <CreditCard size={14} /> Payment Details
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      <p><span className="font-medium text-gray-800">Method:</span> {selectedOrder.paymentMethod === 'online' || selectedOrder.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
                      <p><span className="font-medium text-gray-800">Status:</span> {selectedOrder.payment ? 'Paid' : 'Pending'}</p>
                      <p><span className="font-medium text-gray-800">Amount:</span> {formatCurrency(selectedOrder.amount)}</p>
                      {selectedOrder.paymentId && <p><span className="font-medium text-gray-800">Payment ID:</span> {selectedOrder.paymentId}</p>}
                      {selectedOrder.razorpayOrderId && <p><span className="font-medium text-gray-800">Razorpay Order ID:</span> {selectedOrder.razorpayOrderId}</p>}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <MapPin size={14} /> Customer Address
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{selectedOrder.userId?.name || 'Customer'}</p>
                      <p>{selectedOrder.userId?.email}</p>
                      <div className="mt-3 space-y-1">
                        <p>{selectedOrder.address?.addressLineOne}</p>
                        {selectedOrder.address?.addressLineTwo && <p>{selectedOrder.address.addressLineTwo}</p>}
                        <p>{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pinCode}</p>
                        <p className="font-medium text-gray-800">Phone: {selectedOrder.address?.phone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.delivery?.waybill && (
                    <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm">
                      <p className="mb-1 font-semibold text-blue-800">Delhivery Shipment</p>
                      <p className="text-blue-600">AWB: {selectedOrder.delivery.waybill}</p>
                      <a
                        href={selectedOrder.delivery.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                      >
                        <ExternalLink size={12} /> Track on Delhivery
                      </a>
                    </div>
                  )}

                  {selectedOrder.returnRequest && (
                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm">
                      <p className="mb-2 font-semibold text-amber-900">Return Request</p>
                      <div className="space-y-1 text-amber-800">
                        <p><span className="font-medium">Status:</span> {selectedOrder.returnRequest.status}</p>
                        <p><span className="font-medium">Reason:</span> {selectedOrder.returnRequest.reason || '-'}</p>
                        {selectedOrder.returnRequest.details && (
                          <p><span className="font-medium">Details:</span> {selectedOrder.returnRequest.details}</p>
                        )}
                        {selectedOrder.returnRequest.adminNote && (
                          <p><span className="font-medium">Admin note:</span> {selectedOrder.returnRequest.adminNote}</p>
                        )}
                      </div>
                      {selectedOrder.returnRequest.status === 'Requested' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={reviewReturn.isPending}
                            onClick={() => reviewReturn.mutate({ orderId: selectedOrder._id, decision: 'approved' })}
                            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
                          >
                            Approve Return
                          </button>
                          <button
                            type="button"
                            disabled={reviewReturn.isPending}
                            onClick={() => reviewReturn.mutate({ orderId: selectedOrder._id, decision: 'rejected' })}
                            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-wait disabled:opacity-60"
                          >
                            Reject
                          </button>
                          {reviewReturn.isPending && <Loader2 className="animate-spin text-amber-700" size={16} />}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
