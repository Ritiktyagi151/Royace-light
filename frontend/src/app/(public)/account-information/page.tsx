'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AccountShell, accountStyles } from '@/components/account/AccountShell';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changePasswordAPI, updateProfileAPI } from '@/lib/api';
import { addToast } from '@/store/slices/uiSlice';
import { fetchProfileThunk } from '@/store/slices/authSlice';

export default function AccountInformationPage() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    try {
      await updateProfileAPI(token, profile);
      await dispatch(fetchProfileThunk());
      dispatch(addToast({ message: 'Account information updated', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Unable to update profile', type: 'error' }));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSavingPassword(true);
    try {
      await changePasswordAPI(token, password);
      setPassword({ currentPassword: '', newPassword: '' });
      dispatch(addToast({ message: 'Password changed successfully', type: 'success' }));
    } catch (err: any) {
      dispatch(addToast({ message: err.response?.data?.message || 'Unable to change password', type: 'error' }));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AccountShell title="Account Information">
      <div className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={saveProfile} className={accountStyles.card}>
          <h2 className={accountStyles.sectionTitle}>Contact Information</h2>
          <div className="space-y-4">
            <Field label="Full Name" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} />
            <Field label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
            <Field label="Phone" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
          </div>
          <button className={`btn-primary mt-6 ${accountStyles.smallButton}`} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <form onSubmit={savePassword} className={accountStyles.card}>
          <h2 className={accountStyles.sectionTitle}>Change Password</h2>
          <div className="space-y-4">
            <Field label="Current Password" type="password" value={password.currentPassword} onChange={(value) => setPassword({ ...password, currentPassword: value })} />
            <Field label="New Password" type="password" value={password.newPassword} onChange={(value) => setPassword({ ...password, newPassword: value })} />
          </div>
          <button className={`btn-primary mt-6 ${accountStyles.smallButton}`} disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </AccountShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.58rem] uppercase tracking-[0.22em] text-[rgba(250,247,240,0.4)]">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-luxury"
      />
    </label>
  );
}
