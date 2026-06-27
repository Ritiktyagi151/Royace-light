'use client';

import { AccountPlaceholder, AccountShell } from '@/components/account/AccountShell';

export default function ProductReviewsPage() {
  return (
    <AccountShell title="My Product Reviews">
      <AccountPlaceholder
        title="Product Reviews"
        description="Your submitted product reviews will appear here."
        actionHref="/shop"
        actionLabel="Browse Products"
      />
    </AccountShell>
  );
}
