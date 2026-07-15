'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';

const EMPTY_FORM = {
  text: '',
  link: '',
  sortOrder: '0',
  isActive: true,
};

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-announcements', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await adminApi.get(`/announcements/admin/all?${params}`);
      return res.data.data;
    },
  });

  const saveAnnouncement = useMutation({
    mutationFn: () => {
      const payload = {
        text: form.text.trim(),
        link: form.link.trim() || undefined,
        sortOrder: Number(form.sortOrder || 0),
        isActive: form.isActive,
      };

      if (editing) return adminApi.put(`/announcements/${editing._id}`, payload);
      return adminApi.post('/announcements', payload);
    },
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Unable to save announcement.');
    },
  });

  const toggleAnnouncement = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/announcements/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/announcements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (announcement: any) => {
    setEditing(announcement);
    setForm({
      text: announcement.text || '',
      link: announcement.link || '',
      sortOrder: String(announcement.sortOrder || 0),
      isActive: Boolean(announcement.isActive),
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setError('');
  };

  const announcements = data?.announcements || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
          <p className="text-sm text-gray-500">Manage the sliding text shown above the website navbar.</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-admin inline-flex items-center gap-2">
          <Plus size={16} /> Add Announcement
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Text', 'Link', 'Sort', 'Status', 'Created', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-3 w-24 animate-pulse rounded bg-gray-100" /></td>
                    ))}
                  </tr>
                ))
              ) : announcements.length ? announcements.map((announcement: any) => (
                <tr key={announcement._id} className="table-row">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                        <Megaphone size={17} />
                      </div>
                      <p className="max-w-md text-sm font-semibold text-gray-900">{announcement.text}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{announcement.link || '-'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{announcement.sortOrder || 0}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => toggleAnnouncement.mutate(announcement._id)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        announcement.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {announcement.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(announcement)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this announcement?')) deleteAnnouncement.mutate(announcement._id);
                        }}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-gray-400">No announcements found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && data?.total > 0 && (
          <Pagination
            page={data.page || page}
            pages={data.pages || 1}
            total={data.total}
            pageSize={limit}
            itemLabel="announcements"
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">{editing ? 'Edit Announcement' : 'Add Announcement'}</h3>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveAnnouncement.mutate();
              }}
              className="space-y-4 p-5"
            >
              {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Text</span>
                <input
                  required
                  value={form.text}
                  onChange={(e) => setForm((current) => ({ ...current, text: e.target.value }))}
                  placeholder="Free installation on selected luxury orders"
                  className="admin-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Link</span>
                <input
                  value={form.link}
                  onChange={(e) => setForm((current) => ({ ...current, link: e.target.value }))}
                  placeholder="/shop or https://..."
                  className="admin-input"
                />
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">Sort Order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((current) => ({ ...current, sortOrder: e.target.value }))}
                    className="admin-input"
                  />
                </label>
                <label className="flex items-center gap-2 pt-7 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saveAnnouncement.isPending} className="btn-admin disabled:cursor-wait disabled:opacity-60">
                  {saveAnnouncement.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
