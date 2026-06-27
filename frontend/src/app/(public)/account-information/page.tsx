'use client';

import { AccountPlaceholder, AccountShell } from '@/components/account/AccountShell';

export default function AccountInformationPage() {
  return (
    <AccountShell title="Account Information">
      <AccountPlaceholder
        title="Edit Account Details"
        description="Update your contact information, password, and account preferences from here."
        actionHref="/profile"
        actionLabel="Back to Account"
      />
    </AccountShell>
  );
}
