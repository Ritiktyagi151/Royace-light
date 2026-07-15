'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Loader2, Percent, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const QUERY_OPTIONS = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

const emptyForm = {
  code: '',
  name: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  scope: 'all',
  categoryIds: '',
  categorySlugs: '',
  productIds: '',
  skus: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async ({ signal }) => {
      const res = await adminApi.get('/coupons/admin/all', { signal });
      return res.data.data;
    },
    ...QUERY_OPTIONS,
  });

  const saveCoupon = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form);
      if (editingId) {
        return adminApi.patch(`/coupons/admin/${editingId}`, payload);
      }
      return adminApi.post('/coupons/admin', payload);
    },
    onSuccess: () => {
      setForm(emptyForm);
      setEditingId(null);
      setError('');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Unable to save coupon.');
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/coupons/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
    onError: (err: any) => setError(err.response?.data?.message || 'Unable to delete coupon.'),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    saveCoupon.mutate();
  };

  const startEdit = (coupon: any) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || '',
      name: coupon.name || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue ?? ''),
      minOrderAmount: String(coupon.minOrderAmount ?? ''),
      maxDiscountAmount: String(coupon.maxDiscountAmount ?? ''),
      usageLimit: String(coupon.usageLimit ?? ''),
      scope: coupon.scope || 'all',
      categoryIds: (coupon.categoryIds || []).join(', '),
      categorySlugs: (coupon.categorySlugs || []).join(', '),
      productIds: (coupon.productIds || []).join(', '),
      skus: (coupon.skus || []).join(', '),
      startsAt: toInputDate(coupon.startsAt),
      expiresAt: toInputDate(coupon.expiresAt),
      isActive: Boolean(coupon.isActive),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
          <p className="text-sm text-gray-500">{coupons.length} discount code(s)</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={submit} className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <Field label="Code">
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="admin-input" placeholder="WELCOME10" />
            </Field>
            <Field label="Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="Welcome Offer" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="admin-input">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </Field>
              <Field label="Value">
                <input required type="number" min="0" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="admin-input" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min Order">
                <input type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="admin-input" />
              </Field>
              <Field label="Max Discount">
                <input type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} className="admin-input" />
              </Field>
            </div>
            <Field label="Usage Limit">
              <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="admin-input" />
            </Field>
            <Field label="Applies To">
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="admin-input">
                <option value="all">All products</option>
                <option value="categories">Specific categories</option>
                <option value="products">Specific products</option>
                <option value="skus">SKU / SKU prefix</option>
              </select>
            </Field>
            {form.scope === 'categories' && (
              <div className="grid grid-cols-1 gap-3">
                <Field label="Category IDs">
                  <textarea value={form.categoryIds} onChange={(e) => setForm({ ...form, categoryIds: e.target.value })} className="admin-input min-h-20" placeholder="Paste category IDs, comma or line separated" />
                </Field>
                <Field label="Category Slugs">
                  <textarea value={form.categorySlugs} onChange={(e) => setForm({ ...form, categorySlugs: e.target.value })} className="admin-input min-h-20" placeholder="chandeliers, wall-lights" />
                </Field>
              </div>
            )}
            {form.scope === 'products' && (
              <Field label="Product IDs">
                <textarea value={form.productIds} onChange={(e) => setForm({ ...form, productIds: e.target.value })} className="admin-input min-h-24" placeholder="Paste product IDs, comma or line separated" />
              </Field>
            )}
            {form.scope === 'skus' && (
              <Field label="SKUs / SKU Prefix">
                <textarea value={form.skus} onChange={(e) => setForm({ ...form, skus: e.target.value.toUpperCase() })} className="admin-input min-h-24" placeholder="RL188093, RL188093-600D" />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts">
                <input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className="admin-input" />
              </Field>
              <Field label="Expires">
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="admin-input" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>

          <button disabled={saveCoupon.isPending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
            {saveCoupon.isPending ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
            {editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>

        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Code', 'Discount', 'Applies To', 'Min Order', 'Usage', 'Validity', 'Status', 'Action'].map((heading) => (
                    <th key={heading} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-50">
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-4"><div className="h-3 w-20 animate-pulse rounded bg-gray-100" /></td>
                      ))}
                    </tr>
                  ))
                ) : coupons.length ? (
                  coupons.map((coupon: any) => (
                    <tr key={coupon._id} className="border-b border-gray-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{coupon.code}</p>
                        <p className="text-xs text-gray-400">{coupon.name}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rs. ${Number(coupon.discountValue || 0).toLocaleString('en-IN')}`}
                        {coupon.maxDiscountAmount ? <p className="text-xs text-gray-400">Max Rs. {coupon.maxDiscountAmount}</p> : null}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        <p className="font-medium capitalize text-gray-800">{getScopeLabel(coupon)}</p>
                        <p className="max-w-[220px] truncate text-xs text-gray-400">{getScopePreview(coupon)}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">Rs. {Number(coupon.minOrderAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{formatDate(coupon.startsAt)} - {formatDate(coupon.expiresAt)}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${coupon.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(coupon)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => deleteCoupon.mutate(coupon._id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                          <Percent size={20} />
                        </div>
                        <p className="font-medium text-gray-900">No coupons yet</p>
                        <p className="mt-1 text-sm text-gray-400">Create a code to start discount campaigns.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function buildPayload(form: typeof emptyForm) {
  return {
    code: form.code,
    name: form.name,
    discountType: form.discountType,
    discountValue: Number(form.discountValue || 0),
    minOrderAmount: Number(form.minOrderAmount || 0),
    maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    scope: form.scope,
    categoryIds: parseList(form.categoryIds),
    categorySlugs: parseList(form.categorySlugs),
    productIds: parseList(form.productIds),
    skus: parseList(form.skus).map((sku) => sku.toUpperCase()),
    startsAt: form.startsAt || undefined,
    expiresAt: form.expiresAt || undefined,
    isActive: form.isActive,
  };
}

function parseList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getScopeLabel(coupon: any) {
  if (!coupon.scope || coupon.scope === 'all') return 'All products';
  if (coupon.scope === 'categories') return 'Categories';
  if (coupon.scope === 'products') return 'Products';
  if (coupon.scope === 'skus') return 'SKU / prefix';
  return coupon.scope;
}

function getScopePreview(coupon: any) {
  if (!coupon.scope || coupon.scope === 'all') return 'Every product';
  const values = [
    ...(coupon.categorySlugs || []),
    ...(coupon.categoryIds || []),
    ...(coupon.productIds || []),
    ...(coupon.skus || []),
  ];
  return values.length ? values.join(', ') : 'Not configured';
}

function toInputDate(value?: string) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  if (!value) return 'Anytime';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
