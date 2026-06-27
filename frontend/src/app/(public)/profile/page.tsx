'use client';

import Link from 'next/link';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const savedUser = readSavedUser();
  const displayName = user?.name || savedUser?.name || 'Royace Customer';
  const displayEmail = user?.email || savedUser?.email || 'customer@example.com';

  return (
    <AccountShell title="My Account">
      <div className="flex flex-col gap-5">
            <div id="account-information" className={accountStyles.card}>
              <div className={accountStyles.twoColumn}>
                <section>
                  <h2 className={accountStyles.sectionTitle}>Contact Information</h2>
                  <div className={accountStyles.copyBlock}>
                    <p>{displayName}</p>
                    <p>{displayEmail}</p>
                  </div>
                  <div className={accountStyles.buttonRow}>
                    <Link href="/account-information" className={`btn-outline ${accountStyles.smallButton}`}>Change Password</Link>
                    <Link href="/account-information" className={`btn-outline ${accountStyles.smallButton}`}>Edit</Link>
                  </div>
                </section>

                <section id="newsletters">
                  <h2 className={accountStyles.sectionTitle}>Newsletters</h2>
                  <p className={accountStyles.mutedText}>You aren't subscribed to our newsletter.</p>
                  <Link href="/newsletter-subscriptions" className={`btn-outline mt-5 ${accountStyles.smallButton}`}>Edit</Link>
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
                  <h3 className={accountStyles.subTitle}>Default Billing Address</h3>
                  <p className={accountStyles.mutedText}>You have not set a default billing address.</p>
                  <Link href="/address-book" className={`btn-outline mt-5 ${accountStyles.smallButton}`}>
                    Edit Address
                  </Link>
                </section>

                <section>
                  <h3 className={accountStyles.subTitle}>Default Shipping Address</h3>
                  <p className={accountStyles.mutedText}>You have not set a default shipping address.</p>
                  <Link href="/address-book" className={`btn-outline mt-5 ${accountStyles.smallButton}`}>
                    Edit Address
                  </Link>
                </section>
              </div>
            </div>
      </div>
    </AccountShell>
  );
}

function readSavedUser() {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('nc_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved) as { name?: string; email?: string };
  } catch {
    return null;
  }
}
