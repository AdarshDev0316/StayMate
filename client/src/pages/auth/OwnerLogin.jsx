import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Home, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function OwnerLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);

  const onSubmit = async ({ email, password }) => {
    const loadingToast = toast.loading('Connecting to server... (This may take up to 50s if the free server is waking up)', { duration: 50000 });
    const res = await login(email, password);
    toast.dismiss(loadingToast);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/owner/dashboard');
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)' }}>
      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, var(--dark) 0%, #1a1040 55%, var(--dark-2) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(76,92,231,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(8,176,148,0.1)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', marginBottom: 'var(--space-12)' }}>
          <img src="/logo.jpg" alt="StayMate" style={{ height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
        </Link>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(76,92,231,0.2)', border: '1px solid rgba(76,92,231,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', marginBottom: '1.25rem', alignSelf: 'flex-start' }}>
          <Building2 size={14} color="var(--primary)" />
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Property Owner Portal</span>
        </div>

        <h1 style={{ color: 'var(--dark)', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Welcome back,<br />
          <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>property owner!</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Sign in to manage your listings, review tenant interests, and grow your rental portfolio.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[{ label: 'Listings Active', val: '12K+' }, { label: 'Tenants Matched', val: '48K+' }, { label: 'Success Rate', val: '94%' }].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--dark)' }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 600 }}>Owner Login</span>
            </div>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.4rem' }}>Sign in to your account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Don't have an account?{' '}
              <Link to="/owner/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon"><Mail size={16} /></span>
                <input
                  className={`input${errors.email ? ' error' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
                  })}
                />
              </div>
              {errors.email && <span className="input-error">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <span className="input-icon"><Lock size={16} /></span>
                <input
                  className={`input${errors.password ? ' error' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  style={{ paddingRight: '2.75rem' }}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="input-error">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing in…' : (<>Sign In <ArrowRight size={16} /></>)}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '1.5rem 0' }}>or</div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            Looking for a place to stay?{' '}
            <Link to="/tenant/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Tenant login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
