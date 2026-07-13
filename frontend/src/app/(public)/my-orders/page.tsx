'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, ChevronDown, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchOrdersAPI, requestReturnAPI } from '@/lib/api';
import { getAssetUrl } from '@/lib/urls';
import { AccountShell } from '@/components/account/AccountShell';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any; progress: number }> = {
  placed:     { label: 'Order Placed',  className: 'status-placed',     icon: Clock,          progress: 20  },
  confirmed:  { label: 'Confirmed',     className: 'status-placed',     icon: CheckCircle,    progress: 30  },
  processing: { label: 'Processing',    className: 'status-processing',  icon: AlertCircle,    progress: 40  },
  shipped:    { label: 'In Transit',    className: 'status-shipped',     icon: Truck,          progress: 70  },
  'out for delivery': { label: 'Out for Delivery', className: 'status-shipped', icon: Truck, progress: 85 },
  delivered:  { label: 'Delivered',     className: 'status-delivered',   icon: CheckCircle,    progress: 100 },
  cancelled:  { label: 'Cancelled',     className: 'status-cancelled',   icon: XCircle,        progress: 0   },
  returned:   { label: 'Returned',      className: 'status-cancelled',   icon: XCircle,        progress: 0   },
};

export default function MyOrdersPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [returnReasonByOrderId, setReturnReasonByOrderId] = useState<Record<string, string>>({});
  const [returnDetailsByOrderId, setReturnDetailsByOrderId] = useState<Record<string, string>>({});
  const [returnSubmittingId, setReturnSubmittingId] = useState<string | null>(null);
  const [returnErrorByOrderId, setReturnErrorByOrderId] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchOrdersAPI(token)
      .then((data) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  const submitReturnRequest = async (orderId: string) => {
    if (!token || returnSubmittingId) return;
    const reason = returnReasonByOrderId[orderId]?.trim();
    const details = returnDetailsByOrderId[orderId]?.trim();
    if (!reason) {
      setReturnErrorByOrderId((current) => ({ ...current, [orderId]: 'Please enter a return reason.' }));
      return;
    }

    try {
      setReturnSubmittingId(orderId);
      setReturnErrorByOrderId((current) => ({ ...current, [orderId]: '' }));
      const updatedOrder = await requestReturnAPI(token, orderId, { reason, details });
      setOrders((current) => current.map((order) => (order._id === orderId ? updatedOrder : order)));
      setReturnReasonByOrderId((current) => ({ ...current, [orderId]: '' }));
      setReturnDetailsByOrderId((current) => ({ ...current, [orderId]: '' }));
    } catch (error: any) {
      setReturnErrorByOrderId((current) => ({
        ...current,
        [orderId]: error?.response?.data?.message || 'Unable to submit return request.',
      }));
    } finally {
      setReturnSubmittingId(null);
    }
  };


  if (!token) {
    return (
      <EmptyWrapper>
        <div style={{ width: 80, height: 80, border: '1px solid rgba(0,96,57,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={32} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.6)' }}>
          Sign in to view your orders
        </h2>
        <Link href="/login" className="btn-primary" style={{ fontSize: '0.6rem' }}>
          Sign In
        </Link>
      </EmptyWrapper>
    );
  }

  if (loading) {
    return (
      <AccountShell title="My Orders" eyebrow="Account">
        <div style={{ padding: '0 0 2rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, marginBottom: '1px', background: undefined }} />
          ))}
        </div>
      </AccountShell>
    );
  }

  if (orders.length === 0) {
    return (
      <AccountShell title="My Orders" eyebrow="Account">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '3rem 1rem', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, border: '1px solid rgba(0,96,57,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={32} strokeWidth={1} style={{ color: 'rgba(0,96,57,0.4)' }} />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 300, fontStyle: 'italic', color: 'rgba(250,247,240,0.6)' }}>
          No orders yet
        </h2>
        <p style={{ fontSize: '0.72rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.06em' }}>
          Discover our handcrafted lighting collections
        </p>
        <Link href="/shop" className="btn-primary" style={{ fontSize: '0.6rem' }}>
          Explore Collections <ArrowRight size={14} />
        </Link>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell title="My Orders" eyebrow="Account">
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {orders.map((order, oi) => {
            const statusKey = String(order.status || 'placed').toLowerCase();
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.placed;
            const StatusIcon = status.icon;
            const isDelivered = statusKey === 'delivered';
            const isCancelled = statusKey === 'cancelled' || statusKey === 'returned';
            const isExpanded = expandedOrder === order._id;
            const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            });
            const orderTotal = order.amount || order.totalAmount || order.items?.reduce((s: number, i: any) => s + (i.price || 0) * i.quantity, 0) || 0;
            const isOnlinePayment = order.paymentMethod === 'online' || order.paymentMethod === 'razorpay';
            const deliveryAddress = order.address || order.shippingAddress;
            const returnRequest = order.returnRequest;
            const canRequestReturn = isDelivered && returnRequest?.status !== 'Requested' && returnRequest?.status !== 'Approved';
            const returnError = returnErrorByOrderId[order._id];

            return (
              <div
                key={order._id}
                style={{
                  background: 'linear-gradient(180deg, rgba(6,47,36,0.64), var(--charcoal-2))',
                  border: '1px solid rgba(0,96,57,0.2)',
                  marginBottom: '1px',
                  animation: `fadeUp 0.5s ease ${oi * 0.08}s both`,
                  transition: 'border-color 0.3s ease',
                  borderColor: isExpanded ? 'rgba(228,199,124,0.34)' : 'rgba(0,96,57,0.2)',
                }}
              >
                {/* Order header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '1.5rem',
                    padding: '1.75rem 2rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Status icon */}
                  <div
                    style={{
                      width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDelivered ? 'rgba(0,96,57,0.18)' : isCancelled ? 'rgba(239,68,68,0.1)' : 'rgba(0,96,57,0.12)',
                      border: `1px solid ${isDelivered ? 'rgba(228,199,124,0.34)' : isCancelled ? 'rgba(239,68,68,0.25)' : 'rgba(0,96,57,0.24)'}`,
                    }}
                  >
                    <StatusIcon size={18} strokeWidth={1.5} style={{ color: isDelivered ? 'var(--gold-light)' : isCancelled ? '#fca5a5' : 'var(--gold-light)' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ivory)' }}>
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </span>
                      <span className={`label-text ${status.className}`} style={{ padding: '0.15rem 0.6rem', fontSize: '0.52rem' }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.06em' }}>
                      {orderDate} · {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: 'var(--ivory)', marginBottom: '0.25rem' }}>
                      ₹{orderTotal.toLocaleString('en-IN')}
                    </p>
                    <ChevronDown
                      size={14}
                      strokeWidth={1.5}
                      style={{
                        color: 'rgba(250,247,240,0.3)', transition: 'transform 0.3s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      }}
                    />
                  </div>
                </button>

                {/* Progress bar (not for cancelled) */}
                {!isCancelled && (
                  <div style={{ padding: '0 2rem 1.5rem' }}>
                    <div style={{ height: 2, background: 'rgba(250,247,240,0.06)', borderRadius: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${status.progress}%`,
                          background: isDelivered
                            ? 'linear-gradient(90deg,var(--rolex-green),var(--gold-light))'
                            : 'linear-gradient(90deg,var(--rolex-green),var(--gold-light))',
                          borderRadius: 1,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      {['Placed', 'Processing', 'Shipped', 'Delivered'].map((s, i) => (
                        <span key={s} style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: status.progress > i * 33 ? 'rgba(250,247,240,0.5)' : 'rgba(250,247,240,0.15)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid rgba(250,247,240,0.06)', padding: '1.75rem 2rem', animation: 'fadeUp 0.3s ease forwards' }}>
                    {/* Items */}
                    {order.items?.map((item: any, ii: number) => {
                      const itemImage = item.image || item.product?.image;
                      const imgUrl = getAssetUrl(itemImage);
                      return (
                        <div key={ii} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(250,247,240,0.05)' }}>
                          <div style={{ width: 56, height: 64, background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal-3))', flexShrink: 0, overflow: 'hidden' }}>
                            {itemImage && <img src={imgUrl} alt={item.name || item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--ivory)', marginBottom: '0.2rem' }}>
                              {item.name || item.product?.name || 'Product'}
                            </p>
                            {item.color && <p style={{ fontSize: '0.58rem', color: 'rgba(250,247,240,0.3)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>Finish: {item.color}</p>}
                            <p style={{ fontSize: '0.62rem', color: 'rgba(250,247,240,0.35)', letterSpacing: '0.05em' }}>Qty: {item.quantity}</p>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--ivory)', flexShrink: 0 }}>₹{((item.price || item.product?.sellingPrice || 0) * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      );
                    })}

                    {/* Payment */}
                    <div style={{ marginTop: '0.5rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(250,247,240,0.05)' }}>
                      <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.6rem' }}>
                        Payment Details
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.45)', lineHeight: 1.8, letterSpacing: '0.04em' }}>
                        Method: {isOnlinePayment ? 'Online Payment' : 'Cash on Delivery'}<br />
                        Status: {order.payment ? 'Paid' : 'Pending'}<br />
                        {order.subtotal ? <>Subtotal: ₹{Number(order.subtotal).toLocaleString('en-IN')}<br /></> : null}
                        {order.discountAmount ? <>Discount: -₹{Number(order.discountAmount).toLocaleString('en-IN')}{order.coupon?.code ? ` (${order.coupon.code})` : ''}<br /></> : null}
                        Amount: ₹{orderTotal.toLocaleString('en-IN')}
                        {order.paymentId && (
                          <>
                            <br />
                            Payment ID: {order.paymentId}
                          </>
                        )}
                        {order.razorpayOrderId && (
                          <>
                            <br />
                            Razorpay Order ID: {order.razorpayOrderId}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Address */}
                    {deliveryAddress && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.6rem' }}>
                          Delivery Address
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.4)', lineHeight: 1.7, letterSpacing: '0.04em' }}>
                          {deliveryAddress.fullName || order.userId?.name || 'Customer'} · {deliveryAddress.phone || '-'}<br />
                          {deliveryAddress.addressLineOne || deliveryAddress.addressLine1}{deliveryAddress.addressLineTwo || deliveryAddress.addressLine2 ? ', ' + (deliveryAddress.addressLineTwo || deliveryAddress.addressLine2) : ''}<br />
                          {deliveryAddress.city}, {deliveryAddress.state} — {deliveryAddress.pinCode || deliveryAddress.pincode}
                        </p>
                      </div>
                    )}

                    {isDelivered && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(250,247,240,0.05)' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.6rem' }}>
                          Return Request
                        </p>
                        {returnRequest ? (
                          <div style={{ border: '1px solid rgba(228,199,124,0.18)', background: 'rgba(0,96,57,0.12)', padding: '0.85rem 1rem' }}>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(250,247,240,0.58)', lineHeight: 1.8, letterSpacing: '0.04em' }}>
                              Status: {returnRequest.status}<br />
                              Reason: {returnRequest.reason || '-'}
                              {returnRequest.details ? <><br />Details: {returnRequest.details}</> : null}
                              {returnRequest.adminNote ? <><br />Admin note: {returnRequest.adminNote}</> : null}
                            </p>
                          </div>
                        ) : null}
                        {canRequestReturn && (
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <input
                              value={returnReasonByOrderId[order._id] || ''}
                              onChange={(e) => setReturnReasonByOrderId((current) => ({ ...current, [order._id]: e.target.value }))}
                              placeholder="Return reason"
                              style={{
                                width: '100%',
                                border: '1px solid rgba(228,199,124,0.18)',
                                background: 'rgba(250,247,240,0.04)',
                                color: 'var(--ivory)',
                                padding: '0.8rem 0.9rem',
                                fontSize: '0.72rem',
                                outline: 'none',
                              }}
                            />
                            <textarea
                              value={returnDetailsByOrderId[order._id] || ''}
                              onChange={(e) => setReturnDetailsByOrderId((current) => ({ ...current, [order._id]: e.target.value }))}
                              placeholder="Additional details (optional)"
                              rows={3}
                              style={{
                                width: '100%',
                                resize: 'vertical',
                                border: '1px solid rgba(228,199,124,0.18)',
                                background: 'rgba(250,247,240,0.04)',
                                color: 'var(--ivory)',
                                padding: '0.8rem 0.9rem',
                                fontSize: '0.72rem',
                                outline: 'none',
                              }}
                            />
                            {returnError && <p style={{ color: '#fca5a5', fontSize: '0.68rem' }}>{returnError}</p>}
                            <button
                              type="button"
                              onClick={() => submitReturnRequest(order._id)}
                              disabled={returnSubmittingId === order._id}
                              className="btn-primary"
                              style={{ justifySelf: 'start', fontSize: '0.58rem', opacity: returnSubmittingId === order._id ? 0.65 : 1 }}
                            >
                              {returnSubmittingId === order._id ? 'Submitting...' : 'Request Return'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AccountShell>
  );
}

function PageHeader() {
  return (
    <div
      style={{
        padding: '5rem 1.5rem 3rem',
        background:
          'radial-gradient(circle at 82% 18%, rgba(199,164,90,0.12), transparent 28%), linear-gradient(135deg, var(--forest), var(--charcoal-2) 60%, var(--coffee))',
        borderBottom: '1px solid rgba(0,96,57,0.28)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="overline-text" style={{ marginBottom: '0.875rem' }}>Account</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--ivory)' }}>
          Your Orders
        </h1>
      </div>
    </div>
  );
}

function EmptyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem',
        background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 55%, var(--coffee))',
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}
