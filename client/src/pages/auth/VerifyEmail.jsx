import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token found.');
      return;
    }

    const doVerify = async () => {
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus('success');
        toast.success('Email verified successfully!');
        const user = useAuthStore.getState().user;
        setTimeout(() => {
          if (user?.role === 'owner') navigate('/owner/dashboard');
          else if (user?.role === 'tenant') navigate('/tenant/dashboard');
          else navigate('/');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(res.message || 'Verification failed. The link may have expired.');
        toast.error(res.message || 'Verification failed');
      }
    };

    doVerify();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--bg) 0%, var(--primary-light) 100%)',
        fontFamily: 'var(--font)',
        padding: '2rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '3rem 2.5rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>StayMate</span>
        </div>

        {status === 'verifying' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Verifying Email</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait while we verify your email address…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} color="var(--success-dark)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your email has been verified. Redirecting you to your dashboard…
            </p>
            <div style={{ width: '100%', height: 4, background: 'var(--bg-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', animation: 'progress-bar 2s linear forwards', borderRadius: 'var(--radius-full)' }} />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <XCircle size={36} color="var(--danger)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => navigate('/owner/login')} className="btn btn-primary btn-full">
                Go to Owner Login
              </button>
              <button onClick={() => navigate('/tenant/login')} className="btn btn-outline btn-full">
                Go to Tenant Login
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress-bar { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
      `}</style>
    </div>
  );
}
