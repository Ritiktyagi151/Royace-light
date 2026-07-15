'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { adminApi } from '@/lib/adminApi';

const STATUSES = ['', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
const ORDER_VIEWS = [
  { key: 'all', label: 'All Orders', status: '' },
  { key: 'placed', label: 'Placed', status: 'Placed' },
  { key: 'processing', label: 'Processing', status: 'Processing' },
  { key: 'shipped', label: 'Shipped', status: 'Shipped' },
  { key: 'delivered', label: 'Delivered', status: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled', status: 'Cancelled' },
  { key: 'returned', label: 'Returned', status: 'Returned' },
  { key: 'returns', label: 'Return Requests', status: '', returnRequested: true },
  { key: 'deleted', label: 'Deleted Orders', status: '', deleted: true },
];
const ORDERS_PER_PAGE = 10;
const KNOWN_ORDER_IDS_KEY = 'royace_admin_known_order_ids';
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

const STATUS_ROW_STYLES: Record<string, string> = {
  Placed: 'bg-blue-200/80 hover:bg-blue-200',
  Confirmed: 'bg-indigo-200/80 hover:bg-indigo-200',
  Processing: 'bg-yellow-200/85 hover:bg-yellow-200',
  Shipped: 'bg-orange-200/80 hover:bg-orange-200',
  'Out for Delivery': 'bg-purple-200/80 hover:bg-purple-200',
  Delivered: 'bg-green-200/85 hover:bg-green-200',
  Cancelled: 'bg-red-200/85 hover:bg-red-200',
  Returned: 'bg-gray-300/85 hover:bg-gray-300',
};

const STATUS_ROW_UPDATING_STYLES: Record<string, string> = {
  Placed: 'ring-1 ring-inset ring-blue-200',
  Confirmed: 'ring-1 ring-inset ring-indigo-200',
  Processing: 'ring-1 ring-inset ring-yellow-200',
  Shipped: 'ring-1 ring-inset ring-orange-200',
  'Out for Delivery': 'ring-1 ring-inset ring-purple-200',
  Delivered: 'ring-1 ring-inset ring-green-200',
  Cancelled: 'ring-1 ring-inset ring-red-200',
  Returned: 'ring-1 ring-inset ring-gray-200',
};

const formatCurrency = (amount: number | string | undefined) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const getOrderDate = (order: any) => new Date(order.orderDate || order.createdAt);

const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const getOrderShortId = (order: any) => `#${String(order?._id || '').slice(-8).toUpperCase()}`;

const getItemImage = (item: any) => item?.image || item?.product?.image || item?.productId?.image || '';

const resolvePublicImage = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http') || typeof window === 'undefined') return src;
  return src.startsWith('/') ? `${window.location.origin}${src}` : `${window.location.origin}/${src}`;
};

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
  const [orderView, setOrderView] = useState('all');
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
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [exporting, setExporting] = useState(false);

  const buildOrderParams = (overrides: Record<string, string> = {}) => {
    const selectedView = ORDER_VIEWS.find((view) => view.key === orderView);
    const status = selectedView?.status || filterStatus;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ORDERS_PER_PAGE),
      ...overrides,
    });
    if (status) params.set('status', status);
    if (selectedView?.deleted) params.set('deleted', 'true');
    if (selectedView?.returnRequested) params.set('returnRequested', 'true');
    if (search.trim()) params.set('search', search.trim());
    if (dateFrom) params.set('fromDate', dateFrom);
    if (dateTo) params.set('toDate', dateTo);
    params.set('_ts', String(Date.now()));
    return params;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, orderView, filterStatus, search, dateFrom, dateTo],
    queryFn: async ({ signal }) => {
      const params = buildOrderParams();
      const res = await adminApi.get(`/orders/admin/all?${params}`, { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
    refetchInterval: 30_000,
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

  const restoreOrder = useMutation({
    mutationFn: (orderId: string) => adminApi.patch(`/orders/admin/${orderId}/restore`),
    onSuccess: (_response, orderId) => {
      if (selectedOrderId === orderId) setSelectedOrderId(null);
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.removeQueries({ queryKey: ['admin-order-detail', orderId] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to restore order.');
    },
  });

  const permanentlyDeleteOrder = useMutation({
    mutationFn: (orderId: string) => adminApi.delete(`/orders/admin/${orderId}/permanent`),
    onSuccess: (_response, orderId) => {
      if (selectedOrderId === orderId) setSelectedOrderId(null);
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      queryClient.removeQueries({ queryKey: ['admin-order-detail', orderId] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to permanently delete order.');
    },
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async () => {
      try {
        return await adminApi.patch('/orders/admin/bulk/status', {
          orderIds: selectedOrderIds,
          status: bulkStatus,
        });
      } catch (error: any) {
        if (error?.response?.status !== 404) throw error;
        await Promise.all(selectedOrderIds.map((orderId) =>
          adminApi.patch(`/orders/admin/${orderId}/status`, { status: bulkStatus }),
        ));
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      setSelectedOrderIds([]);
      setBulkStatus('');
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to update selected orders.');
    },
  });

  const bulkDeleteOrders = useMutation({
    mutationFn: async () => {
      try {
        return await adminApi.patch('/orders/admin/bulk/delete', { orderIds: selectedOrderIds });
      } catch (error: any) {
        if (error?.response?.status !== 404) throw error;
        await Promise.all(selectedOrderIds.map((orderId) => adminApi.delete(`/orders/admin/${orderId}`)));
        return { data: { success: true } };
      }
    },
    onSuccess: () => {
      setSelectedOrderIds([]);
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
    },
    onError: (error: any) => {
      setStatusError(error?.response?.data?.message || 'Unable to delete selected orders.');
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;
  const currentPage = data?.page || page;
  const allVisibleSelected = orders.length > 0 && orders.every((order: any) => selectedOrderIds.includes(order._id));
  const currentPagePaymentSummary = orders.reduce((acc: any, order: any) => {
    if (order?.isDeleted || ['Cancelled', 'Returned'].includes(order?.status)) return acc;
    const amount = Number(order?.amount || 0);
    acc.totalAmount += amount;
    if (order?.payment) {
      acc.paidAmount += amount;
      acc.paidOrders += 1;
      if (order.paymentMethod === 'online' || order.paymentMethod === 'razorpay') {
        acc.onlinePaidAmount += amount;
      }
    } else {
      acc.dueAmount += amount;
      acc.dueOrders += 1;
      if (!order.paymentMethod || order.paymentMethod === 'cod') {
        acc.codDueAmount += amount;
      }
    }
    return acc;
  }, {
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    onlinePaidAmount: 0,
    codDueAmount: 0,
    paidOrders: 0,
    dueOrders: 0,
  });
  const hasStatsPayment = Boolean(statsData?.payment && Number(statsData.payment.totalAmount || 0) > 0);
  const summary = {
    totalOrders: statsData?.total || 0,
    totalRevenue: hasStatsPayment ? statsData?.payment?.paidAmount || 0 : currentPagePaymentSummary.paidAmount,
    pendingOrders: statsData?.pending || 0,
    todaysOrders: statsData?.todaysOrders || 0,
    deletedOrders: statsData?.deleted || 0,
  };
  const paymentSummary = hasStatsPayment ? {
    totalAmount: statsData?.payment?.totalAmount || 0,
    paidAmount: statsData?.payment?.paidAmount || 0,
    dueAmount: statsData?.payment?.dueAmount || 0,
    onlinePaidAmount: statsData?.payment?.onlinePaidAmount || 0,
    codDueAmount: statsData?.payment?.codDueAmount || 0,
    paidOrders: statsData?.payment?.paidOrders || 0,
    dueOrders: statsData?.payment?.dueOrders || 0,
  } : currentPagePaymentSummary;
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

  const resetPage = () => setPage(1);
  const activeOrderView = ORDER_VIEWS.find((view) => view.key === orderView) || ORDER_VIEWS[0];
  const isDeletedView = Boolean(activeOrderView.deleted);

  useEffect(() => {
    if (isLoading || isDeletedView || !orders.length) return;

    const visibleIds = orders.map((order: any) => order._id).filter(Boolean);
    const storedIds = localStorage.getItem(KNOWN_ORDER_IDS_KEY);
    if (!storedIds) {
      localStorage.setItem(KNOWN_ORDER_IDS_KEY, JSON.stringify(visibleIds));
      return;
    }

    let knownIds: string[] = [];
    try {
      knownIds = JSON.parse(storedIds);
    } catch {
      knownIds = [];
    }

    const incomingIds = visibleIds.filter((id: string) => !knownIds.includes(id));
    if (incomingIds.length) {
      setNewOrderIds((current) => [...new Set([...incomingIds, ...current])]);
      localStorage.setItem(KNOWN_ORDER_IDS_KEY, JSON.stringify([...new Set([...incomingIds, ...knownIds])].slice(0, 500)));
    }
  }, [isLoading, isDeletedView, orders]);

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setNewOrderIds((current) => current.filter((id) => id !== orderId));
  };

  const handleOrderViewChange = (viewKey: string) => {
    const nextView = ORDER_VIEWS.find((view) => view.key === viewKey) || ORDER_VIEWS[0];
    setOrderView(nextView.key);
    setFilterStatus(nextView.status);
    setPage(1);
  };
  const updateOrderForm = (field: keyof typeof emptyOrderForm, value: string | boolean) => {
    setOrderForm((current) => ({ ...current, [field]: value }));
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedOrderIds((current) => {
      const visibleIds = orders.map((order: any) => order._id);
      if (visibleIds.every((id: string) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return [...new Set([...current, ...visibleIds])];
    });
  };

  const fetchFilteredOrdersForExport = async () => {
    const params = buildOrderParams({ page: '1', limit: '1000' });
    const res = await adminApi.get(`/orders/admin/all?${params}`);
    return res.data.data?.orders || [];
  };

  const downloadBlob = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportOrders = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      const exportOrdersList = await fetchFilteredOrdersForExport();
      const rows = exportOrdersList.map((order: any) => ({
        orderId: getOrderShortId(order),
        customer: order.userId?.name || 'Customer',
        email: order.userId?.email || '',
        phone: order.address?.phone || '',
        items: order.items?.length || 0,
        amount: Number(order.amount || 0),
        payment: order.payment ? 'Paid' : 'Due',
        paymentMethod: order.paymentMethod || '',
        status: order.status || '',
        date: getOrderDate(order).toLocaleDateString('en-IN'),
      }));

      if (format === 'csv') {
        const header = ['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Amount', 'Payment', 'Payment Method', 'Status', 'Date'];
        const csv = [
          header.map(csvEscape).join(','),
          ...rows.map((row: any) => Object.values(row).map(csvEscape).join(',')),
        ].join('\n');
        downloadBlob(csv, `orders-${Date.now()}.csv`, 'text/csv;charset=utf-8;');
        return;
      }

      const tableRows = rows.map((row: any) => `
        <tr>${Object.values(row).map((value) => `<td>${String(value ?? '')}</td>`).join('')}</tr>
      `).join('');
      const html = `
        <html><head><meta charset="utf-8" /></head><body>
          <table border="1">
            <thead><tr>${['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Amount', 'Payment', 'Payment Method', 'Status', 'Date'].map((h) => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body></html>
      `;
      downloadBlob(html, `orders-${Date.now()}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
    } finally {
      setExporting(false);
    }
  };

  const openInvoice = (order: any) => {
    const subtotal = Number(order.subtotal || order.amount || 0);
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const taxable = Math.max(0, subtotal - tax);
    const items = (order.items || []).map((item: any) => `
      <tr>
        <td>${getItemImage(item) ? `<img src="${resolvePublicImage(getItemImage(item))}" style="width:42px;height:42px;object-fit:cover;border-radius:6px" />` : ''}</td>
        <td>${item.name || '-'}</td>
        <td>${item.quantity || 0}</td>
        <td>Rs. ${Number(item.price || 0).toLocaleString('en-IN')}</td>
        <td>Rs. ${Number((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice ${getOrderShortId(order)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 18px; margin-bottom: 24px; }
            .logo { height: 52px; }
            h1 { margin: 0; font-size: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 18px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f3f4f6; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 18px 0; }
            .summary { margin-left: auto; width: 320px; }
            .summary div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            @media print { button { display: none; } body { padding: 20px; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:10px 14px;margin-bottom:16px">Download / Print PDF</button>
          <div class="top">
            <div>
              <img class="logo" src="/royace-logo.png" />
              <p>Royace Lighting</p>
            </div>
            <div>
              <h1>Tax Invoice</h1>
              <p><strong>Invoice:</strong> ${getOrderShortId(order)}</p>
              <p><strong>Date:</strong> ${getOrderDate(order).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          <div class="grid">
            <div>
              <h3>Bill To</h3>
              <p>${order.userId?.name || 'Customer'}<br/>${order.userId?.email || ''}<br/>${order.address?.phone || ''}</p>
            </div>
            <div>
              <h3>Ship To</h3>
              <p>${order.address?.addressLineOne || ''}<br/>${order.address?.addressLineTwo || ''}<br/>${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pinCode || ''}</p>
            </div>
          </div>
          <table>
            <thead><tr><th>Image</th><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
          <div class="summary">
            <div><span>Taxable Value</span><strong>Rs. ${taxable.toLocaleString('en-IN')}</strong></div>
            <div><span>GST 18%</span><strong>Rs. ${tax.toLocaleString('en-IN')}</strong></div>
            <div><span>Delivery</span><strong>Rs. ${Number(order.deliveryFees || 0).toLocaleString('en-IN')}</strong></div>
            <div><span>Grand Total</span><strong>Rs. ${Number(order.amount || 0).toLocaleString('en-IN')}</strong></div>
            <div><span>Payment</span><strong>${order.payment ? 'Paid' : 'Due'}</strong></div>
          </div>
        </body>
      </html>
    `;
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow?.document.write(invoiceHtml);
    invoiceWindow?.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500">{total} matching orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => exportOrders('csv')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => exportOrders('excel')}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button
            type="button"
            onClick={() => setShowAddOrder(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <Plus size={16} /> Add Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total Orders', value: summary.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), icon: CreditCard, color: 'bg-green-50 text-green-600' },
          { label: 'Pending Orders', value: summary.pendingOrders, icon: Package, color: 'bg-yellow-50 text-yellow-700' },
          { label: "Today's Orders", value: summary.todaysOrders, icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Deleted Orders', value: summary.deletedOrders, icon: Trash2, color: 'bg-red-50 text-red-600' },
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

      <section className="admin-card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-gray-900">Payment Dashboard</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Paid, due, and billable order amount overview.
            {!hasStatsPayment && orders.length > 0 && ' Showing current page until payment stats refresh.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Billable Amount', value: formatCurrency(paymentSummary.totalAmount), helper: 'Active orders only', icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
            { label: 'Paid Amount', value: formatCurrency(paymentSummary.paidAmount), helper: `${paymentSummary.paidOrders} paid order(s)`, icon: CreditCard, color: 'bg-green-50 text-green-700' },
            { label: 'Amount Due', value: formatCurrency(paymentSummary.dueAmount), helper: `${paymentSummary.dueOrders} pending payment(s)`, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
            { label: 'COD Due', value: formatCurrency(paymentSummary.codDueAmount), helper: 'Cash collection pending', icon: Package, color: 'bg-amber-50 text-amber-700' },
          ].map(({ label, value, helper, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
                  <p className="mt-1 text-xs text-gray-500">{helper}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 border-t border-gray-100 px-5 py-4 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-gray-700">Payment collection</span>
              <span className="font-semibold text-gray-900">{paidPercent}% paid</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-red-100">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${paidPercent}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-3 text-xs text-gray-500">
              <span>Online paid: {formatCurrency(paymentSummary.onlinePaidAmount)}</span>
              <span>Due: {formatCurrency(paymentSummary.dueAmount)}</span>
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Payment split</p>
            {paymentBreakdownData.length ? (
              <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={paymentBreakdownData} dataKey="value" innerRadius={34} outerRadius={55} paddingAngle={3}>
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 lg:flex lg:items-center">
            <select
              value={orderView}
              onChange={(e) => handleOrderViewChange(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {ORDER_VIEWS.map((view) => (
                <option key={view.key} value={view.key}>{view.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { if (!isDeletedView) setOrderView('all'); setFilterStatus(e.target.value); resetPage(); }}
              disabled={orderView !== 'all' && !isDeletedView}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
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

        {selectedOrderIds.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-gray-800">{selectedOrderIds.length} order(s) selected</p>
            <div className="flex flex-wrap gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Bulk status</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
              <button
                type="button"
                disabled={!bulkStatus || bulkUpdateStatus.isPending}
                onClick={() => bulkUpdateStatus.mutate()}
                className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-wait disabled:opacity-50"
              >
                Apply Status
              </button>
              <button
                type="button"
                disabled={bulkDeleteOrders.isPending}
                onClick={() => {
                  if (window.confirm('Move selected orders to Deleted Orders?')) bulkDeleteOrders.mutate();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
              >
                <Trash2 size={15} /> Bulk Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Select all visible orders"
                  />
                </th>
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
                    {Array.from({ length: 10 }).map((__, j) => (
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
                  const isNewOrder = newOrderIds.includes(order._id);

                  return (
                  <tr
                    key={order._id}
                    className={`table-row cursor-pointer border-b border-gray-50 transition-colors ${
                      STATUS_ROW_STYLES[displayedStatus] || ''
                    } ${
                      isStatusUpdating ? STATUS_ROW_UPDATING_STYLES[displayedStatus] || 'ring-1 ring-inset ring-gray-200' : ''
                    } ${
                      isNewOrder ? 'ring-2 ring-inset ring-emerald-500/70' : ''
                    }`}
                    onClick={() => openOrderDetail(order._id)}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order._id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="h-4 w-4 rounded border-gray-300"
                        aria-label={`Select order ${getOrderShortId(order)}`}
                      />
                    </td>
                    <td className="px-5 py-4 text-sm font-medium font-mono text-gray-800">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetail(order._id);
                          }}
                          className="w-fit font-mono font-semibold text-gray-900 underline-offset-2 hover:underline"
                        >
                          {getOrderShortId(order)}
                        </button>
                        {isNewOrder && (
                          <span className="w-fit rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                            New Order
                          </span>
                        )}
                      </div>
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
                      {!order.payment && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          Due {formatCurrency(order.amount)}
                        </p>
                      )}
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
                        {isDeletedView ? (
                          <>
                            <button
                              type="button"
                              disabled={restoreOrder.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                restoreOrder.mutate(order._id);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-green-100 px-2.5 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50 disabled:cursor-wait disabled:opacity-50"
                            >
                              <RotateCcw size={13} /> Restore
                            </button>
                            <button
                              type="button"
                              disabled={permanentlyDeleteOrder.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Permanently delete this order? This cannot be undone.')) {
                                  permanentlyDeleteOrder.mutate(order._id);
                                }
                              }}
                              className="rounded-lg border border-red-100 p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                              aria-label="Permanently delete order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInvoice(order);
                              }}
                              className="rounded-lg border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50"
                              aria-label="Download invoice"
                              title="Download invoice"
                            >
                              <FileText size={14} />
                            </button>
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
                                if (window.confirm('Move this order to Deleted Orders?')) {
                                  deleteOrder.mutate(order._id);
                                }
                              }}
                              className="rounded-lg border border-red-100 p-2 text-red-500 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                              aria-label="Delete order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
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
                  <td colSpan={10} className="px-5 py-14 text-center">
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
                        <div className="flex min-w-0 gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
                            {getItemImage(item) ? (
                              <img src={getItemImage(item)} alt={item.name || 'Order item'} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">Price: {formatCurrency(item.price)} | Qty: {item.quantity || 0}</p>
                            {item.productId && <p className="truncate text-xs text-gray-400">Product: {String(item.productId?._id || item.productId)}</p>}
                          {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                          </div>
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
                      <p><span className="font-medium text-gray-800">Due:</span> {selectedOrder.payment ? formatCurrency(0) : formatCurrency(selectedOrder.amount)}</p>
                      {selectedOrder.paymentId && <p><span className="font-medium text-gray-800">Payment ID:</span> {selectedOrder.paymentId}</p>}
                      {selectedOrder.razorpayOrderId && <p><span className="font-medium text-gray-800">Razorpay Order ID:</span> {selectedOrder.razorpayOrderId}</p>}
                      <div className="mt-3 rounded-md border border-gray-200 bg-white px-3 py-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Payment history</p>
                        <p className="mt-1 text-gray-700">
                          {selectedOrder.payment ? 'Payment captured' : 'Payment pending'} on {getOrderDate(selectedOrder).toLocaleString('en-IN')}
                        </p>
                      </div>
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

                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <FileText size={14} /> Order Notes
                    </p>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      {selectedOrder.notes || selectedOrder.orderNotes || selectedOrder.note || 'No order notes added.'}
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
