import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Home, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function OwnerRegister() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: authRegister, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('Connecting to server... (This may take up to 50s if the free server is waking up)', { duration: 50000 });
    const res = await authRegister({ ...data, role: 'owner' });
    toast.dismiss(loadingToast);
    if (res.success) {
      setDone(true);
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const perks = [
    'List unlimited properties',
    'AI-powered tenant matching',
    'In-app messaging',
    'Interest & booking tracking',
    'Verified badge on listings',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)' }}>
      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, var(--dark) 0%, #1a1040 50%, var(--dark-2) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(76,92,231,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(8,176,148,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', marginBottom: 'var(--space-12)' }}>
          <img src="/logo.jpg" alt="StayMate" style={{ height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
        </Link>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(76,92,231,0.2)', border: '1px solid rgba(76,92,231,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 14px', marginBottom: '1rem' }}>
            <Building2 size={14} color="var(--primary)" />
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>Property Owner</span>
          </div>
          <h1 style={{ color: 'var(--dark)', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Grow your rental<br />
            <span style={{ background: 'linear-gradient(90deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>business today</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Join thousands of property owners who trust StayMate to connect with quality tenants.
          </p>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {perks.map((perk) => (
            <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={16} color="var(--secondary)" />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{perk}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['#4C5CE7', '#08B094', '#F59E0B'].map((c, i) => (
              <div key={c} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.3)', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Join <strong style={{ color: 'var(--dark)' }}>2,400+</strong> property owners
          </span>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--text)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          {done ? (
            // ── Success State ──
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={36} color="var(--success-dark)" />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Check your email!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We've sent a verification link to your email address. Click it to activate your account.
              </p>
              <Link to="/owner/login" className="btn btn-primary btn-full">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.4rem' }}>Create account</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Already have an account?{' '}
                  <Link to="/owner/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Name */}
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    className={`input${errors.name ? ' error' : ''}`}
                    placeholder="John Smith"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                  />
                  {errors.name && <span className="input-error">{errors.name.message}</span>}
                </div>

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
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                      })}
                    />
                  </div>
                  {errors.email && <span className="input-error">{errors.email.message}</span>}
                </div>

                {/* Phone */}
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    className={`input${errors.phone ? ' error' : ''}`}
                    type="tel"
                    placeholder="+91 9876543210"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                  {errors.phone && <span className="input-error">{errors.phone.message}</span>}
                </div>

                {/* Password */}
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      className={`input${errors.password ? ' error' : ''}`}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      style={{ paddingRight: '2.75rem' }}
                      {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="input-error">{errors.password.message}</span>}
                </div>

                {/* Confirm Password */}
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      className={`input${errors.confirmPassword ? ' error' : ''}`}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      style={{ paddingRight: '2.75rem' }}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (v) => v === watch('password') || 'Passwords do not match',
                      })}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', display: 'flex', alignItems: 'center' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="input-error">{errors.confirmPassword.message}</span>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={isLoading}
                  style={{ marginTop: '0.5rem' }}
                >
                  {isLoading ? 'Creating Account…' : (
                    <>Create Owner Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '1.25rem' }}>
                Are you a tenant?{' '}
                <Link to="/tenant/register" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Register as tenant</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
