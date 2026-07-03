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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Home size={20} color="#fff" />
        </div>
        <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>StayMate</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)' }}>Completing sign in…</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
