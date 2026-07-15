'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Mail, MessageSquare, Search, Trash2, Users } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  closed: 'Closed',
};

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-purple-50 text-purple-700',
  closed: 'bg-green-50 text-green-700',
};

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'enquiries' | 'newsletter'>('enquiries');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [tab, status, search]);

  const { data: stats } = useQuery({
    queryKey: ['admin-enquiry-stats'],
    queryFn: async () => {
      const res = await adminApi.get('/enquiries/admin/stats');
      return res.data.data;
    },
  });

  const { data: enquiryData, isLoading: enquiriesLoading } = useQuery({
    queryKey: ['admin-enquiries', page, limit, status, search],
    enabled: tab === 'enquiries',
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      const res = await adminApi.get(`/enquiries/admin/all?${params}`);
      return res.data.data;
    },
  });

  const { data: newsletterData, isLoading: newsletterLoading } = useQuery({
    queryKey: ['admin-newsletter-subscribers', page, limit],
    enabled: tab === 'newsletter',
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await adminApi.get(`/newsletter/admin/all?${params}`);
      return res.data.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      adminApi.patch(`/enquiries/admin/${id}/status`, { status: nextStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shell-enquiry-badges'] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/enquiries/admin/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shell-enquiry-badges'] });
    },
  });

  const deleteEnquiry = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/enquiries/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-enquiry-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shell-enquiry-badges'] });
    },
  });

  const enquiries = enquiryData?.enquiries || [];
  const subscribers = newsletterData?.subscribers || [];
  const total = tab === 'enquiries' ? enquiryData?.total || 0 : newsletterData?.total || 0;
  const pages = tab === 'enquiries' ? enquiryData?.pages || 1 : newsletterData?.pages || 1;
  const currentPage = tab === 'enquiries' ? enquiryData?.page || page : newsletterData?.page || page;
  const isLoading = tab === 'enquiries' ? enquiriesLoading : newsletterLoading;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enquiries</h2>
          <p className="text-sm text-gray-500">Contact messages and newsletter leads from the website.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Enquiries', value: stats?.total || 0, icon: MessageSquare, color: 'bg-blue-50 text-blue-700' },
          { label: 'Unread', value: stats?.unread || 0, icon: Mail, color: 'bg-red-50 text-red-700' },
          { label: 'In Progress', value: stats?.inProgress || 0, icon: Users, color: 'bg-purple-50 text-purple-700' },
          { label: 'Closed', value: stats?.closed || 0, icon: CheckCircle2, color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { key: 'enquiries', label: 'Contact Enquiries' },
              { key: 'newsletter', label: 'Newsletter' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key as typeof tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  tab === item.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center">
            {tab === 'enquiries' && (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search enquiries..."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 lg:w-64"
                />
              </div>
            )}
            {tab === 'enquiries' && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {tab === 'enquiries' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Customer', 'Subject', 'Message', 'Source', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-3 w-24 animate-pulse rounded bg-gray-100" /></td>
                      ))}
                    </tr>
                  ))
                ) : enquiries.length ? enquiries.map((enquiry: any) => (
                  <tr key={enquiry._id} className={`table-row ${!enquiry.isRead ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">{enquiry.name}</p>
                      <p className="text-xs text-gray-500">{enquiry.email}</p>
                      <p className="text-xs text-gray-500">{enquiry.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{enquiry.subject}</p>
                      {enquiry.product && <p className="text-xs text-gray-500">Product: {enquiry.product}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-sm text-sm text-gray-600 line-clamp-3">{enquiry.message}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{enquiry.source || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[enquiry.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[enquiry.status] || enquiry.status}
                      </span>
                      {!enquiry.isRead && <span className="ml-2 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Unread</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={enquiry.status}
                          onChange={(e) => updateStatus.mutate({ id: enquiry._id, nextStatus: e.target.value })}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                          {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {!enquiry.isRead && (
                          <button
                            type="button"
                            onClick={() => markRead.mutate(enquiry._id)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                          >
                            Read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this enquiry?')) deleteEnquiry.mutate(enquiry._id);
                          }}
                          className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          aria-label="Delete enquiry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-gray-400">No enquiries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {['Email', 'Source', 'Status', 'Subscribed', 'Unsubscribed'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-4"><div className="h-3 w-24 animate-pulse rounded bg-gray-100" /></td>
                      ))}
                    </tr>
                  ))
                ) : subscribers.length ? subscribers.map((subscriber: any) => (
                  <tr key={subscriber._id} className="table-row">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{subscriber.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{subscriber.source || '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subscriber.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {subscriber.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString('en-IN') : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {subscriber.unsubscribedAt ? new Date(subscriber.unsubscribedAt).toLocaleDateString('en-IN') : '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-gray-400">No subscribers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > 0 && (
          <Pagination
            page={currentPage}
            pages={pages}
            total={total}
            pageSize={limit}
            itemLabel={tab === 'enquiries' ? 'enquiries' : 'subscribers'}
            onPageChange={setPage}
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
