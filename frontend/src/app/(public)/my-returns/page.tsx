'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Package, RotateCcw, XCircle } from 'lucide-react';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppSelector } from '@/store/hooks';
import { fetchOrdersAPI, requestReturnAPI } from '@/lib/api';

const getOrderTotal = (order: any) =>
  Number(order.amount || order.totalAmount || order.items?.reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) || 0);

const getStatusMeta = (status?: string) => {
  if (status === 'Requested') return { label: 'Pending Review', icon: Clock, className: 'border-amber-200 bg-amber-500/10 text-amber-100' };
  if (status === 'Approved') return { label: 'Approved', icon: CheckCircle, className: 'border-emerald-200 bg-emerald-500/10 text-emerald-100' };
  if (status === 'Rejected') return { label: 'Rejected', icon: XCircle, className: 'border-red-200 bg-red-500/10 text-red-100' };
  return { label: 'Eligible', icon: RotateCcw, className: 'border-[rgba(228,199,124,0.32)] bg-[rgba(228,199,124,0.08)] text-[var(--gold-light)]' };
};

export default function MyReturnsPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reasonByOrderId, setReasonByOrderId] = useState<Record<string, string>>({});
  const [detailsByOrderId, setDetailsByOrderId] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [errorByOrderId, setErrorByOrderId] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchOrdersAPI(token)
      .then((data) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  const returnOrders = useMemo(() => (
    orders.filter((order) => {
      const status = String(order.status || '').toLowerCase();
      return status === 'delivered' || status === 'returned' || Boolean(order.returnRequest);
    })
  ), [orders]);

  const submitReturn = async (orderId: string) => {
    if (!token || submittingId) return;
    const reason = reasonByOrderId[orderId]?.trim();
    const details = detailsByOrderId[orderId]?.trim();

    if (!reason) {
      setErrorByOrderId((current) => ({ ...current, [orderId]: 'Please enter a return reason.' }));
      return;
    }

    try {
      setSubmittingId(orderId);
      setErrorByOrderId((current) => ({ ...current, [orderId]: '' }));
      const updatedOrder = await requestReturnAPI(token, orderId, { reason, details });
      setOrders((current) => current.map((order) => (order._id === orderId ? updatedOrder : order)));
      setReasonByOrderId((current) => ({ ...current, [orderId]: '' }));
      setDetailsByOrderId((current) => ({ ...current, [orderId]: '' }));
    } catch (error: any) {
      setErrorByOrderId((current) => ({
        ...current,
        [orderId]: error?.response?.data?.message || 'Unable to submit return request.',
      }));
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <AccountShell title="My Returns" eyebrow="Customer Dashboard">
      {loading ? (
        <div className={accountStyles.card}>
          <p className={accountStyles.mutedText}>Loading return details...</p>
        </div>
      ) : returnOrders.length === 0 ? (
        <div className={accountStyles.card}>
          <div className="mb-5 flex h-14 w-14 items-center justify-center border border-[rgba(228,199,124,0.2)] text-[var(--gold-light)]">
            <Package size={22} strokeWidth={1.5} />
          </div>
          <h2 className={accountStyles.sectionTitle}>No Return Eligible Orders</h2>
          <p className={accountStyles.mutedText}>
            Delivered orders will appear here when they become eligible for return requests.
          </p>
          <Link href="/my-orders" className={`btn-outline mt-6 ${accountStyles.smallButton}`}>
            View Orders <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {returnOrders.map((order) => {
            const returnRequest = order.returnRequest;
            const status = String(order.status || '').toLowerCase();
            const canRequestReturn = status === 'delivered' && returnRequest?.status !== 'Requested' && returnRequest?.status !== 'Approved';
            const meta = getStatusMeta(returnRequest?.status || (status === 'returned' ? 'Approved' : undefined));
            const StatusIcon = meta.icon;
            const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <section key={order._id} className={accountStyles.card}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(250,247,240,0.08)] pb-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(228,199,124,0.24)] bg-[rgba(0,96,57,0.14)] text-[var(--gold-light)]">
                      <StatusIcon size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--ivory)]">
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[0.68rem] tracking-[0.06em] text-[rgba(250,247,240,0.44)]">
                        {orderDate} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center border px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] ${meta.className}`}>
                      {meta.label}
                    </span>
                    <p className="mt-2 font-serif text-[1.1rem] text-[var(--ivory)]">
                      Rs. {getOrderTotal(order).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {returnRequest && (
                  <div className="mt-5 border border-[rgba(228,199,124,0.16)] bg-[rgba(0,96,57,0.12)] p-4">
                    <h2 className={accountStyles.sectionTitle}>Return Request</h2>
                    <p className={accountStyles.mutedText}>
                      Status: {returnRequest.status}<br />
                      Reason: {returnRequest.reason || '-'}
                      {returnRequest.details ? <><br />Details: {returnRequest.details}</> : null}
                      {returnRequest.adminNote ? <><br />Admin note: {returnRequest.adminNote}</> : null}
                    </p>
                  </div>
                )}

                {canRequestReturn && (
                  <div className="mt-5 grid gap-3">
                    <h2 className={accountStyles.sectionTitle}>Request Return</h2>
                    <input
                      value={reasonByOrderId[order._id] || ''}
                      onChange={(event) => setReasonByOrderId((current) => ({ ...current, [order._id]: event.target.value }))}
                      placeholder="Return reason"
                      className="border border-[rgba(228,199,124,0.18)] bg-[rgba(250,247,240,0.04)] px-4 py-3 text-[0.78rem] tracking-[0.04em] text-[var(--ivory)] outline-none placeholder:text-[rgba(250,247,240,0.32)]"
                    />
                    <textarea
                      value={detailsByOrderId[order._id] || ''}
                      onChange={(event) => setDetailsByOrderId((current) => ({ ...current, [order._id]: event.target.value }))}
                      placeholder="Additional details (optional)"
                      rows={4}
                      className="resize-y border border-[rgba(228,199,124,0.18)] bg-[rgba(250,247,240,0.04)] px-4 py-3 text-[0.78rem] tracking-[0.04em] text-[var(--ivory)] outline-none placeholder:text-[rgba(250,247,240,0.32)]"
                    />
                    {errorByOrderId[order._id] && (
                      <p className="text-[0.72rem] text-red-200">{errorByOrderId[order._id]}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => submitReturn(order._id)}
                      disabled={submittingId === order._id}
                      className={`btn-primary w-fit ${accountStyles.smallButton}`}
                    >
                      {submittingId === order._id ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
