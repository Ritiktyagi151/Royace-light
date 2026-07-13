'use client';

import { useEffect, useState } from 'react';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNewsletterPreferenceAPI, updateNewsletterPreferenceAPI } from '@/lib/api';
import { addToast } from '@/store/slices/uiSlice';

export default function NewsletterSubscriptionsPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const [preference, setPreference] = useState<{ email: string; isActive: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchNewsletterPreferenceAPI(token)
      .then(setPreference)
      .catch(() => setPreference(null))
      .finally(() => setLoading(false));
  }, [token]);

  const togglePreference = async () => {
    if (!token || !preference) return;
    setSaving(true);
    try {
      const next = await updateNewsletterPreferenceAPI(token, !preference.isActive);
      setPreference({ email: next.email, isActive: next.isActive });
      dispatch(addToast({
        message: next.isActive ? 'Newsletter subscription activated' : 'Newsletter subscription paused',
        type: 'success',
      }));
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Unable to update newsletter preference', type: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell title="Newsletter Subscriptions">
      <div className={accountStyles.card}>
        <h2 className={accountStyles.sectionTitle}>Newsletter Preferences</h2>
        {loading ? (
          <p className={accountStyles.mutedText}>Loading newsletter preferences...</p>
        ) : (
          <>
            <p className={accountStyles.mutedText}>
              Email: {preference?.email || '-'}<br />
              Status: {preference?.isActive ? 'Subscribed' : 'Not subscribed'}
            </p>
            <button
              onClick={togglePreference}
              disabled={saving || !preference}
              className={`btn-primary mt-6 ${accountStyles.smallButton}`}
            >
              {saving ? 'Updating...' : preference?.isActive ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </>
        )}
      </div>
    </AccountShell>
  );
}
