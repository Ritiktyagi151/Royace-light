'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppSelector } from '@/store/hooks';
import { fetchOrdersAPI } from '@/lib/api';

export default function AddressBookPage() {
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

  const addresses = useMemo(() => {
    const unique = new Map<string, any>();
    orders.forEach((order) => {
      const address = order.address || order.shippingAddress;
      if (!address) return;
      const key = [
        address.addressLineOne || address.addressLine1,
        address.addressLineTwo || address.addressLine2,
        address.city,
        address.state,
        address.pinCode || address.pincode,
        address.phone,
      ].filter(Boolean).join('|');
      if (!unique.has(key)) unique.set(key, { ...address, orderDate: order.orderDate || order.createdAt });
    });
    return Array.from(unique.values());
  }, [orders]);

  return (
    <AccountShell title="Address Book">
      <div className={accountStyles.card}>
        <div className={accountStyles.addressHeader}>
          <h2 className={`${accountStyles.sectionTitle} mb-0`}>Saved From Orders</h2>
          <Link href="/checkout" className={accountStyles.manageLink}>Add address at checkout</Link>
        </div>

        {loading ? (
          <p className={accountStyles.mutedText}>Loading addresses...</p>
        ) : addresses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address, index) => (
              <div key={index} className="border border-[rgba(250,247,240,0.08)] bg-[rgba(6,47,36,0.28)] p-5">
                <h3 className={accountStyles.subTitle}>{index === 0 ? 'Default Shipping Address' : `Address ${index + 1}`}</h3>
                <p className={accountStyles.mutedText}>
                  {address.fullName || 'Customer'} · {address.phone || '-'}<br />
                  {address.addressLineOne || address.addressLine1}
                  {address.addressLineTwo || address.addressLine2 ? `, ${address.addressLineTwo || address.addressLine2}` : ''}<br />
                  {address.city}, {address.state} - {address.pinCode || address.pincode}<br />
                  {address.country || 'India'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className={accountStyles.mutedText}>You have not added any saved billing or shipping addresses yet.</p>
            <Link href="/checkout" className={`btn-outline mt-6 ${accountStyles.smallButton}`}>
              Add Address During Checkout
            </Link>
          </div>
        )}
      </div>
    </AccountShell>
  );
}
