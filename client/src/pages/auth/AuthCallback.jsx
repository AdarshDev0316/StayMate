import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Home } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken) {
      navigate('/');
      return;
    }

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    // Fetch user and redirect
    useAuthStore.getState().fetchMe().then(() => {
      const user = useAuthStore.getState().user;
      if (user?.role === 'owner') navigate('/owner/dashboard', { replace: true });
      else if (user?.role === 'tenant') navigate('/tenant/dashboard', { replace: true });
      else navigate('/', { replace: true });
    }).catch(() => {
      navigate('/', { replace: true });
    });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--dark) 0%, #1a1040 100%)',
        fontFamily: 'var(--font)',
        gap: '1.5rem',
      }}
    >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', marginBottom: 'var(--space-8)' }}>
          <img src="/logo.jpg" alt="StayMate" style={{ height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
        </Link>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Completing sign in…</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
