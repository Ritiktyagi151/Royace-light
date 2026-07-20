'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Search, Trash2, UserCheck, Users, UserX, X } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import Pagination from '@/components/Pagination';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  role: 'user',
  isActive: true,
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('user');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await adminApi.get(`/users?${params.toString()}`);
      return res.data.data;
    },
  });

  const users = Array.isArray(data) ? data : data?.users || [];
  const total = !Array.isArray(data) ? data?.total : users.length;
  const title = roleFilter === 'user' ? 'Customers' : 'Admins';
  const isAdminTab = roleFilter === 'admin';
  const cannotDeleteOnlyAdmin = isAdminTab && Number(total || 0) <= 1;

  const invalidateUsers = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  const toggleActive = useMutation({
    mutationFn: (id: string) => adminApi.patch(`/users/${id}/toggle-active`),
    onSuccess: invalidateUsers,
    onError: (error: any) => alert(error.response?.data?.message || 'Unable to update status'),
  });

  const saveUser = useMutation({
    mutationFn: (payload: typeof emptyForm) => {
      const body: any = {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        address: payload.address.trim(),
        role: payload.role,
        isActive: payload.isActive,
      };
      if (payload.password.trim()) body.password = payload.password.trim();
      if (!editingUser) body.password = payload.password.trim();
      return editingUser ? adminApi.put(`/users/${editingUser._id}`, body) : adminApi.post('/users', body);
    },
    onSuccess: () => {
      invalidateUsers();
      closeModal();
    },
    onError: (error: any) => setFormError(error.response?.data?.message || 'Unable to save user'),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/users/${id}`),
    onSuccess: invalidateUsers,
    onError: (error: any) => alert(error.response?.data?.message || 'Unable to delete user'),
  });

  const openAdd = () => {
    setEditingUser(null);
    setForm({ ...emptyForm, role: roleFilter || 'user' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setFormError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser && !form.password.trim()) {
      setFormError('Password is required for new users');
      return;
    }
    saveUser.mutate(form);
  };

  const handleDelete = (user: any) => {
    if (user.role === 'admin' && cannotDeleteOnlyAdmin) {
      alert('Last admin cannot be deleted. Add another admin first.');
      return;
    }
    if (confirm(`Delete ${user.name || user.email}?`)) deleteUser.mutate(user._id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm">
            {roleFilter === 'user'
              ? `${total || 0} total registered customers`
              : `${total || 0} total admins`}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${isAdminTab ? 'admins' : 'customers'}...`}
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 w-full sm:w-52"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['user', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  roleFilter === r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r === 'user' ? 'Customers' : 'Admins'}
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="btn-admin flex items-center justify-center gap-2">
            <Plus size={16} /> Add {isAdminTab ? 'Admin' : 'Customer'}
          </button>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[1040px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : users.map((user: any) => {
                  const isOnlyAdmin = user.role === 'admin' && cannotDeleteOnlyAdmin;
                  return (
                    <tr key={user._id} className="table-row">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{user.phone || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {user.role === 'user' ? 'customer' : user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleActive.mutate(user._id)}
                            disabled={toggleActive.isPending || isOnlyAdmin}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Suspend' : 'Activate'}
                          >
                            {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                          <button onClick={() => openEdit(user)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={deleteUser.isPending || isOnlyAdmin}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isOnlyAdmin ? 'Add another admin before deleting this admin' : 'Delete'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {!isLoading && !users.length && (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No {isAdminTab ? 'admins' : 'customers'} found</p>
          </div>
        )}
        {!isLoading && !Array.isArray(data) && data?.pages > 1 && (
          <Pagination
            page={page}
            pages={data.pages}
            total={total}
            pageSize={limit}
            itemLabel={isAdminTab ? 'admins' : 'customers'}
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
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">{editingUser ? 'Edit' : 'Add'} {form.role === 'admin' ? 'Admin' : 'Customer'}</h3>
              <button onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {formError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="Full name" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-input" placeholder="Email" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="admin-input" placeholder="Phone" />
                <input
                  required={!editingUser}
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="admin-input"
                  placeholder={editingUser ? 'New password (optional)' : 'Password'}
                />
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="admin-input">
                  <option value="user">Customer</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  Active account
                </label>
              </div>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="admin-input min-h-24" placeholder="Address" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saveUser.isPending} className="btn-admin flex items-center gap-2 disabled:cursor-wait disabled:opacity-60">
                  {saveUser.isPending && <Loader2 size={15} className="animate-spin" />}
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
