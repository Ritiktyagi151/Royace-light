'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppSelector } from '@/store/hooks';
import { fetchOrdersAPI } from '@/lib/api';

export default function ProfilePage() {
  const { token, user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchOrdersAPI(token)
      .then((data) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]));
  }, [token]);

  const latestAddress = useMemo(() => {
    const latestOrder = orders.find((order) => order.address || order.shippingAddress);
    return latestOrder?.address || latestOrder?.shippingAddress;
  }, [orders]);

  const latestPaymentOrder = useMemo(() => orders[0], [orders]);

  return (
    <AccountShell title="My Account">
      <div className="flex flex-col gap-5">
        <div id="account-information" className={accountStyles.card}>
          <div className={accountStyles.twoColumn}>
            <section>
              <h2 className={accountStyles.sectionTitle}>Contact Information</h2>
              <div className={accountStyles.copyBlock}>
                <p>{user?.name || 'Royace Customer'}</p>
                <p>{user?.email || '-'}</p>
                <p>{user?.phone || 'Phone not added'}</p>
                <p>Status: {user?.isActive === false ? 'Suspended' : 'Active'}</p>
              </div>
              <div className={accountStyles.buttonRow}>
                <Link href="/account-information" className={`btn-outline ${accountStyles.smallButton}`}>Edit Account</Link>
                <Link href="/account-information" className={`btn-outline ${accountStyles.smallButton}`}>Change Password</Link>
              </div>
            </section>

            <section id="newsletters">
              <h2 className={accountStyles.sectionTitle}>Newsletter</h2>
              <p className={accountStyles.mutedText}>
                Manage collection updates, project ideas, and lighting tips from your newsletter preferences.
              </p>
              <Link href="/newsletter-subscriptions" className={`btn-outline mt-5 ${accountStyles.smallButton}`}>Manage Newsletter</Link>
            </section>
          </div>
        </div>

        <div id="address-book" className={accountStyles.card}>
          <div className={accountStyles.addressHeader}>
            <h2 className={`${accountStyles.sectionTitle} mb-0`}>Address Book</h2>
            <Link href="/address-book" className={accountStyles.manageLink}>
              Manage Addresses
            </Link>
          </div>

          <div className={accountStyles.twoColumn}>
            <section>
              <h3 className={accountStyles.subTitle}>Default Shipping Address</h3>
              {latestAddress ? (
                <p className={accountStyles.mutedText}>
                  {latestAddress.fullName || user?.name || 'Customer'} · {latestAddress.phone || '-'}<br />
                  {latestAddress.addressLineOne || latestAddress.addressLine1}
                  {latestAddress.addressLineTwo || latestAddress.addressLine2 ? `, ${latestAddress.addressLineTwo || latestAddress.addressLine2}` : ''}<br />
                  {latestAddress.city}, {latestAddress.state} - {latestAddress.pinCode || latestAddress.pincode}
                </p>
              ) : (
                <p className={accountStyles.mutedText}>You have not set a default shipping address.</p>
              )}
            </section>

            <section>
              <h3 className={accountStyles.subTitle}>Account Source</h3>
              <p className={accountStyles.mutedText}>
                Profile data is synced from your customer record. Address data is derived from your latest checkout orders.
              </p>
            </section>
          </div>
        </div>

        <div id="payment-details" className={accountStyles.card}>
          <div className={accountStyles.addressHeader}>
            <h2 className={`${accountStyles.sectionTitle} mb-0`}>Payment Details</h2>
            <Link href="/payment-details" className={accountStyles.manageLink}>
              View Payments
            </Link>
          </div>

          {latestPaymentOrder ? (
            <div className={accountStyles.twoColumn}>
              <section>
                <h3 className={accountStyles.subTitle}>Latest Payment</h3>
                <p className={accountStyles.mutedText}>
                  Order #{String(latestPaymentOrder._id).slice(-8).toUpperCase()}<br />
                  Method: {latestPaymentOrder.paymentMethod === 'online' || latestPaymentOrder.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}<br />
                  Status: {latestPaymentOrder.payment ? 'Paid' : 'Pending'}<br />
                  Amount: Rs. {Number(latestPaymentOrder.amount || latestPaymentOrder.totalAmount || 0).toLocaleString('en-IN')}
                </p>
              </section>

              <section>
                <h3 className={accountStyles.subTitle}>Transaction Reference</h3>
                <p className={accountStyles.mutedText}>
                  Payment ID: {latestPaymentOrder.paymentId || '-'}<br />
                  Razorpay Order ID: {latestPaymentOrder.razorpayOrderId || '-'}
                </p>
              </section>
            </div>
          ) : (
            <p className={accountStyles.mutedText}>Payment details will appear here after your first order.</p>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
