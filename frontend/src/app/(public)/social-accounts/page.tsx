'use client';

import { AccountPlaceholder, AccountShell } from '@/components/account/AccountShell';

export default function SocialAccountsPage() {
  return (
    <AccountShell title="My Social Accounts">
      <AccountPlaceholder
        title="Linked Social Accounts"
        description="No social accounts are currently linked to this customer account."
        actionHref="/profile"
        actionLabel="Back to Account"
      />
    </AccountShell>
  );
}
