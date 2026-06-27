'use client';

import { AccountPlaceholder, AccountShell } from '@/components/account/AccountShell';

export default function AddressBookPage() {
  return (
    <AccountShell title="Address Book">
      <AccountPlaceholder
        title="Manage Addresses"
        description="You have not added any saved billing or shipping addresses yet."
        actionHref="/profile"
        actionLabel="Back to Account"
      />
    </AccountShell>
  );
}
