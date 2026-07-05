import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Home, CheckCircle, Search, Sparkles, Star } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function TenantRegister() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: authRegister, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const onSubmit = async (data) => {
    const res = await authRegister({ ...data, role: 'tenant' });
    if (res.success) {
      setDone(true);
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  const perks = [
    'AI-powered listing matches',
    'Browse verified properties',
    'Direct chat with owners',
    'Save favourite listings',
    'Free forever for tenants',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font)' }}>
      {/* ── Left Brand Panel ─────────────────────────────────── */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(8,176,148,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(76,92,231,0.1)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', marginBottom: 'var(--space-12)' }}>
          <img src="/logo.jpg" alt="StayMate" style={{ height: '48px', objectFit: 'contain', borderRadius: '4px' }} />
        </Link>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(8,176,148,0.25)', border: '1px solid rgba(8,176,148,0.4)', borderRadius: 'var(--radius-full)', padding: '4px 14px', marginBottom: '1rem', alignSelf: 'flex-start' }}>
          <Search size={14} color="var(--secondary)" />
          <span style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.8rem' }}>Tenant Portal</span>
        </div>

        <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Find your perfect<br />
          <span style={{ background: 'linear-gradient(90deg, var(--secondary), #a7f3d0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>home today</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6 }}>
          Let AI match you with the best listings based on your unique preferences and lifestyle.
        </p>

        <ul style={{ listStyle: 'none', margin: '1.5rem 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {perks.map((perk) => (
            <li key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={16} color="var(--secondary)" />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{perk}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {[1, 2, 3, 4].map((i) => <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />)}
            <Star size={14} fill="none" color="#F59E0B" />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
            Loved by <strong style={{ color: '#fff' }}>15,000+</strong> happy tenants
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
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={36} color="var(--success-dark)" />
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>Check your email!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We've sent a verification link to your email. Click it to activate your account.
              </p>
              <Link to="/tenant/login" className="btn btn-secondary btn-full">Go to Login</Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                  <Sparkles size={18} color="var(--secondary)" />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--secondary)', fontWeight: 600 }}>Tenant Registration</span>
                </div>
                <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.4rem' }}>Create your account</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  Already have an account?{' '}
                  <Link to="/tenant/login" style={{ color: 'var(--secondary)', fontWeight: 600 }}>Sign in</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    className={`input${errors.name ? ' error' : ''}`}
                    placeholder="Jane Doe"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                  />
                  {errors.name && <span className="input-error">{errors.name.message}</span>}
                </div>

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
                  className="btn btn-secondary btn-full btn-lg"
                  disabled={isLoading}
                  style={{ marginTop: '0.5rem' }}
                >
                  {isLoading ? 'Creating Account…' : (<>Create Tenant Account <ArrowRight size={16} /></>)}
                </button>
              </form>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '1.25rem' }}>
                Are you a property owner?{' '}
                <Link to="/owner/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register as owner</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
