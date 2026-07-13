'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, Package } from 'lucide-react';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppSelector } from '@/store/hooks';
import { fetchOrdersAPI } from '@/lib/api';

const formatCurrency = (amount: number | string | undefined) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const getPaymentLabel = (order: any) => {
  if (order.paymentMethod === 'online' || order.paymentMethod === 'razorpay') return 'Online Payment';
  return 'Cash on Delivery';
};

const getOrderDate = (order: any) =>
  new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function PaymentDetailsPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totals = useMemo(() => {
    return orders.reduce(
      (summary, order) => {
        const amount = Number(order.amount || order.totalAmount || 0);
        summary.totalPaid += order.payment ? amount : 0;
        summary.pendingAmount += order.payment ? 0 : amount;
        summary.online += order.paymentMethod === 'online' || order.paymentMethod === 'razorpay' ? 1 : 0;
        summary.cod += order.paymentMethod === 'cod' || !order.paymentMethod ? 1 : 0;
        return summary;
      },
      { totalPaid: 0, pendingAmount: 0, online: 0, cod: 0 },
    );
  }, [orders]);

  return (
    <AccountShell title="Payment Details" eyebrow="Customer Dashboard">
      {loading ? (
        <div className={accountStyles.card}>
          <p className={accountStyles.mutedText}>Loading payment details...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={accountStyles.card}>
          <div className="mb-5 flex h-14 w-14 items-center justify-center border border-[rgba(228,199,124,0.2)] text-[var(--gold-light)]">
            <Package size={22} strokeWidth={1.5} />
          </div>
          <h2 className={accountStyles.sectionTitle}>No Payment History</h2>
          <p className={accountStyles.mutedText}>
            Your order payment details will appear here after checkout.
          </p>
          <Link href="/shop" className={`btn-outline mt-6 ${accountStyles.smallButton}`}>
            Explore Collections <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          <div className={accountStyles.card}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className={accountStyles.subTitle}>Paid Amount</p>
                <p className="font-serif text-[1.6rem] text-[var(--ivory)]">{formatCurrency(totals.totalPaid)}</p>
              </div>
              <div>
                <p className={accountStyles.subTitle}>Pending / COD</p>
                <p className="font-serif text-[1.6rem] text-[var(--ivory)]">{formatCurrency(totals.pendingAmount)}</p>
              </div>
              <div>
                <p className={accountStyles.subTitle}>Online Orders</p>
                <p className="font-serif text-[1.6rem] text-[var(--ivory)]">{totals.online}</p>
              </div>
              <div>
                <p className={accountStyles.subTitle}>COD Orders</p>
                <p className="font-serif text-[1.6rem] text-[var(--ivory)]">{totals.cod}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {orders.map((order) => (
              <section key={order._id} className={accountStyles.card}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(250,247,240,0.08)] pb-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(228,199,124,0.24)] bg-[rgba(0,96,57,0.14)] text-[var(--gold-light)]">
                      <CreditCard size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--ivory)]">
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </p>
                      <p className="text-[0.68rem] tracking-[0.06em] text-[rgba(250,247,240,0.44)]">
                        {getOrderDate(order)} · {getPaymentLabel(order)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex border px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] ${
                    order.payment
                      ? 'border-emerald-200 bg-emerald-500/10 text-emerald-100'
                      : 'border-amber-200 bg-amber-500/10 text-amber-100'
                  }`}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h2 className={accountStyles.sectionTitle}>Payment Summary</h2>
                    <p className={accountStyles.mutedText}>
                      Method: {getPaymentLabel(order)}<br />
                      Status: {order.payment ? 'Paid' : 'Pending'}<br />
                      {order.subtotal ? <>Subtotal: {formatCurrency(order.subtotal)}<br /></> : null}
                      {order.discountAmount ? <>Discount: -{formatCurrency(order.discountAmount)}{order.coupon?.code ? ` (${order.coupon.code})` : ''}<br /></> : null}
                      Amount: {formatCurrency(order.amount || order.totalAmount)}
                    </p>
                  </div>

                  <div>
                    <h2 className={accountStyles.sectionTitle}>Transaction Details</h2>
                    <p className={accountStyles.mutedText}>
                      Payment ID: {order.paymentId || '-'}<br />
                      Razorpay Order ID: {order.razorpayOrderId || '-'}<br />
                      Order Status: {order.status || 'Placed'}
                    </p>
                    <Link href="/my-orders" className={accountStyles.manageLink}>
                      View full order
                    </Link>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </AccountShell>
  );
}
