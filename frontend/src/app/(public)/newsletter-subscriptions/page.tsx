'use client';

import { AccountPlaceholder, AccountShell } from '@/components/account/AccountShell';

export default function NewsletterSubscriptionsPage() {
  return (
    <AccountShell title="Newsletter Subscriptions">
      <AccountPlaceholder
        title="Newsletter Preferences"
        description="You aren't subscribed to our newsletter."
        actionHref="/profile"
        actionLabel="Back to Account"
      />
    </AccountShell>
  );
}
