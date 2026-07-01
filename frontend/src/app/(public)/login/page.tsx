'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginThunk, registerThunk } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { addWishlistItem, WishlistItem } from '@/store/slices/wishlistSlice';

export default function CustomerLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, loading } = useAppSelector((state) => state.auth);
  const redirectTo = '/wishlist';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('nc_token') : null;
    if (token || savedToken) router.replace(redirectTo);
  }, [token, redirectTo, router]);

  const completeAuthFlow = () => {
    const pending = localStorage.getItem('royace_pending_wishlist');
    if (pending) {
      try {
        dispatch(addWishlistItem(JSON.parse(pending) as WishlistItem));
        dispatch(addToast({ message: 'Added to wishlist', type: 'success' }));
      } catch {
        dispatch(addToast({ message: 'Signed in successfully', type: 'success' }));
      }
      localStorage.removeItem('royace_pending_wishlist');
    } else {
      dispatch(addToast({ message: 'Signed in successfully', type: 'success' }));
    }
    router.replace(redirectTo);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await dispatch(loginThunk({ email: loginEmail, password: loginPassword }));
    if (result.meta.requestStatus === 'fulfilled') {
      completeAuthFlow();
    } else {
      setError(getAuthErrorMessage((result as any).payload, 'Login failed. Please try again.'));
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const result = await dispatch(registerThunk({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    }));
    if (result.meta.requestStatus === 'fulfilled') {
      completeAuthFlow();
    } else {
      setError(getAuthErrorMessage((result as any).payload, 'Registration failed. Please try again.'));
    }
  };

  return (
    <main
      style={{
        background: 'linear-gradient(180deg, var(--forest-2), var(--charcoal) 48%, var(--coffee))',
        minHeight: 'calc(100vh - 100px)',
        padding: '4rem 1.5rem 5rem',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <p className="overline-text" style={{ marginBottom: '0.875rem' }}>Customer Account</p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 3.6rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--ivory)',
            marginBottom: '2.5rem',
          }}
        >
          Sign in to continue.
        </h1>

        {error && (
          <div style={{ padding: '0.9rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.72rem', color: '#fca5a5', letterSpacing: '0.04em' }}>{error}</p>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>Registered Customers</h2>
            <p style={panelTextStyle}>If you have an account, sign in with your email or mobile number.</p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Email / Mobile Number</label>
                <input
                  className="input-luxury"
                  required
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="Email or mobile number"
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-luxury"
                    required
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="Password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <PasswordToggle show={showLoginPassword} onClick={() => setShowLoginPassword(!showLoginPassword)} />
                </div>
              </div>
              <button className="btn-primary" disabled={loading} style={{ justifyContent: 'center', fontSize: '0.62rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <button type="button" style={linkButtonStyle}>
                Forgot Password?
              </button>
            </form>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitleStyle}>New Customers</h2>
            <p style={panelTextStyle}>Create an account to save your wishlist and track your orders.</p>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  className="input-luxury"
                  required
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label style={labelStyle}>Email / Mobile Number</label>
                <input
                  className="input-luxury"
                  required
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="Email or mobile number"
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-luxury"
                    required
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    placeholder="Create password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <PasswordToggle show={showRegisterPassword} onClick={() => setShowRegisterPassword(!showRegisterPassword)} />
                </div>
              </div>
              <button className="btn-outline" disabled={loading} style={{ justifyContent: 'center', fontSize: '0.62rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating Account...' : 'Create an Account'}
              </button>
            </form>
          </section>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/shop" className="btn-outline" style={{ fontSize: '0.58rem' }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

function getAuthErrorMessage(message: unknown, fallback: string) {
  const text = typeof message === 'string' ? message : fallback;
  if (text.toLowerCase().includes('deactivated')) {
    return 'This account is deactivated. Please ask admin to reactivate it or use a different email.';
  }
  if (text.toLowerCase().includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  return text;
}

function PasswordToggle({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '0.875rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'rgba(250,247,240,0.3)',
        display: 'flex',
      }}
    >
      {show ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(6,47,36,0.76), rgba(31,58,47,0.82))',
  border: '1px solid rgba(0,96,57,0.28)',
  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
  boxShadow: '0 28px 70px rgba(8,32,23,0.28)',
};

const panelTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.7rem',
  fontWeight: 300,
  fontStyle: 'italic',
  color: 'var(--ivory)',
  marginBottom: '0.75rem',
};

const panelTextStyle: React.CSSProperties = {
  color: 'rgba(250,247,240,0.46)',
  fontSize: '0.75rem',
  lineHeight: 1.8,
  letterSpacing: '0.04em',
  marginBottom: '1.75rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans',sans-serif",
  fontSize: '0.58rem',
  fontWeight: 400,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(250,247,240,0.4)',
  marginBottom: '0.5rem',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--gold-light)',
  fontSize: '0.65rem',
  letterSpacing: '0.06em',
  alignSelf: 'flex-start',
};
