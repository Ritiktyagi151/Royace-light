'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, RotateCcw, Search, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'product', label: 'Products' },
  { value: 'category', label: 'Categories' },
  { value: 'coupon', label: 'Coupons' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'enquiry', label: 'Enquiries' },
  { value: 'user', label: 'Users' },
];

const formatDate = (value?: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminTrashPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [entityType, setEntityType] = useState('');
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (entityType) params.set('entityType', entityType);
    if (search.trim()) params.set('search', search.trim());
    return params.toString();
  }, [entityType, limit, page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-trash', queryString],
    queryFn: async () => {
      const res = await adminApi.get(`/deleted-items/admin/all?${queryString}`);
      return res.data.data;
    },
  });

  const refreshTrash = () => qc.invalidateQueries({ queryKey: ['admin-trash'] });

  const restoreItem = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/deleted-items/admin/${id}/restore`),
    onSuccess: (res) => {
      setStatusMessage(res.data?.message || 'Item restored successfully.');
      refreshTrash();
    },
    onError: (error: any) => {
      setStatusMessage(error?.response?.data?.message || 'Unable to restore item.');
    },
  });

  const permanentlyDeleteItem = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/deleted-items/admin/${id}/permanent`),
    onSuccess: (res) => {
      setStatusMessage(res.data?.message || 'Item permanently removed.');
      refreshTrash();
    },
    onError: (error: any) => {
      setStatusMessage(error?.response?.data?.message || 'Unable to permanently remove item.');
    },
  });

  const items = data?.items || [];
  const total = Number(data?.total || 0);
  const pages = Number(data?.pages || 1);
  const busy = restoreItem.isPending || permanentlyDeleteItem.isPending;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Trash</h2>
          <p className="text-sm text-gray-500">Restore accidentally deleted admin records.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search trash..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-emerald-700/35 focus:ring-4 focus:ring-emerald-900/5 sm:w-64"
            />
          </div>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700/35 focus:ring-4 focus:ring-emerald-900/5"
          >
            {ENTITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusMessage}
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Item', 'Type', 'Deleted By', 'Deleted At', 'Actions'].map((heading) => (
                <th key={heading} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : items.map((item: any) => (
              <tr key={item._id} className="table-row border-b border-gray-50">
                <td className="px-5 py-4">
                  <p className="max-w-xs truncate text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="mt-1 font-mono text-xs text-gray-400">{item.entityId}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">
                    {item.entityType}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {item.deletedBy?.name || item.deletedBy?.role || 'Admin'}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{formatDate(item.deletedAt || item.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => restoreItem.mutate(item._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Restore"
                    >
                      {restoreItem.isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      Restore
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (window.confirm('Permanently remove this item from trash? This cannot be undone.')) {
                          permanentlyDeleteItem.mutate(item._id);
                        }
                      }}
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Permanent delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && !items.length && (
          <p className="py-16 text-center text-sm text-gray-400">Trash is empty</p>
        )}
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            pages={pages}
            total={total}
            pageSize={limit}
            itemLabel="deleted items"
            onPageChange={(nextPage) => setPage(nextPage)}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
